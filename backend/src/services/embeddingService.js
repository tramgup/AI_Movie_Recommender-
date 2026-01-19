import OpenAI from 'openai'
import prisma from '../prismaClient.js'
import { Pool } from 'pg'

// Create a dedicated pg pool for vector queries (Prisma has issues with embedding parameters)
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate embedding for a movie based on its description, cast, and director
 * @param {Object} movie - Movie object with description, cast, director
 * @returns {Promise<number[]>} - Embedding vector
 */
export async function generateMovieEmbedding(movie) {
  // Retry with exponential backoff for transient OpenAI errors (rate limits)
  const textToEmbed = buildEmbeddingText(movie)
  const maxRetries = 5
  let attempt = 0

  while (attempt < maxRetries) {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: textToEmbed,
        encoding_format: 'float',
      })

      return response.data[0].embedding
    } catch (error) {
      attempt += 1
      const isRateLimit = error?.status === 429
      const isServerError = error?.status >= 500

      // If last attempt, rethrow
      if (attempt >= maxRetries) {
        console.error('Error generating embedding (final attempt):', error)
        throw error
      }

      // Backoff strategy: exponential with jitter
      const baseMs = 500 * attempt
      const jitter = Math.floor(Math.random() * 300)
      const waitMs = baseMs + jitter

      // Log and wait before retrying
      console.warn(`Embedding generation attempt ${attempt} failed${isRateLimit ? ' (rate limit)' : ''}, retrying in ${waitMs}ms...`)
      await new Promise((resolve) => setTimeout(resolve, waitMs))
      continue
    }
  }
}

/**
 * Build text representation of a movie for embedding generation
 * Uses description, actors, and director
 */
function buildEmbeddingText(movie) {
  const parts = []

  if (movie.title) parts.push(`Title: ${movie.title}`)
  if (movie.description) parts.push(`Description: ${movie.description}`)
  if (movie.cast && movie.cast.length > 0) {
    parts.push(`Actors: ${movie.cast.join(', ')}`)
  }
  if (movie.director) parts.push(`Director: ${movie.director}`)
  if (movie.genre && movie.genre.length > 0) {
    parts.push(`Genre: ${movie.genre.join(', ')}`)
  }

  return parts.join('\n')
}

/**
 * Generate and store embeddings for all movies
 * Updates existing movies or skips if already embedded
 */
export async function generateEmbeddingsForAllMovies() {
  try {
    // Fetch all movies from database
    const allMovies = await prisma.movie.findMany()

    // Use raw query to find which ones don't have embeddings
    const movieIdsWithoutEmbeddings = await prisma.$queryRaw`
      SELECT id FROM "Movie" WHERE "embedding" IS NULL
    `
    
    const movieIdsSet = new Set(movieIdsWithoutEmbeddings.map((row) => row.id))
    
    // Filter to only movies without embeddings
    const moviesWithoutEmbeddings = allMovies.filter((movie) =>
      movieIdsSet.has(movie.id)
    )

    console.log(`Generating embeddings for ${moviesWithoutEmbeddings.length} movies...`)

    // helper to pace requests
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    for (const movie of moviesWithoutEmbeddings) {
      try {
        const embedding = await generateMovieEmbedding(movie)

        // Store embedding using raw SQL because `embedding` is Unsupported in Prisma schema
        const embLiteral = '[' + embedding.join(',') + ']'
        await prisma.$executeRaw`UPDATE "Movie" SET "embedding" = ${embLiteral}::vector WHERE id = ${movie.id}`

        // small delay between writes/requests to reduce rate limiting
        await sleep(200)

        console.log(`✓ Generated embedding for: ${movie.title}`)
      } catch (error) {
        console.error(`✗ Error embedding "${movie.title}":`, error.message)
      }
    }

    console.log('Embedding generation complete!')
  } catch (error) {
    console.error('Error generating embeddings for all movies:', error)
    throw error
  }
}

/**
 * Find similar movies based on embedding similarity
 * @param {Array<string>} movieIds - Array of movie IDs to base similarity on (up to 5)
 * @param {number} limit - Number of similar movies to return
 * @returns {Promise<Array>} - Array of similar movies with similarity scores
 */
export async function findSimilarMovies(movieIds, limit = 10) {
  if (!movieIds || movieIds.length === 0) {
    throw new Error('At least one movie ID is required')
  }

  if (movieIds.length > 5) {
    throw new Error('Maximum 5 movies can be selected')
  }

  try {
    // Fetch the selected movies using Prisma (but not embedding since it's Unsupported)
    const selectedMovies = await prisma.movie.findMany({
      where: {
        id: { in: movieIds },
      },
    })

    if (!selectedMovies || selectedMovies.length === 0) {
      throw new Error('Selected movies not found')
    }

    // Fetch embeddings separately with raw SQL, casting vector to text since it's Unsupported
    const idsList = movieIds.map((id) => `'${id}'`).join(',')
    const embeddingsRaw = await prisma.$queryRawUnsafe(`
      SELECT id, embedding::text as embedding FROM "Movie" WHERE id IN (${idsList})
    `)
    
    // Build a map of id -> embedding (parse from text to number array)
    const embeddingMap = {}
    embeddingsRaw.forEach((row) => {
      if (row.embedding) {
        try {
          // embedding is stored as '[num1,num2,...]', parse it
          embeddingMap[row.id] = JSON.parse(row.embedding)
        } catch (e) {
          console.warn(`Failed to parse embedding for ${row.id}:`, e.message)
        }
      }
    })
    
    // Attach embeddings to selectedMovies
    selectedMovies.forEach((movie) => {
      movie.embedding = embeddingMap[movie.id]
    })

    // If any selected movie doesn't have an embedding, generate it
    for (const movie of selectedMovies) {
      if (!movie.embedding) {
        const embedding = await generateMovieEmbedding(movie)
        const embLiteral = '[' + embedding.join(',') + ']'
        await prisma.$executeRaw`UPDATE "Movie" SET "embedding" = ${embLiteral}::vector WHERE id = ${movie.id}`
        // update local object so we can compute average
        movie.embedding = embedding
      }
    }

    // Calculate average embedding from selected movies
    const embeddings = selectedMovies
      .filter((m) => m.embedding)
      .map((m) => m.embedding)

    if (embeddings.length === 0) {
      throw new Error('No valid embeddings found for selected movies')
    }

    const averageEmbedding = calculateAverageEmbedding(embeddings)

    // Use pgvector similarity search with direct pg connection
    // The <-> operator in PostgreSQL pgvector calculates cosine distance
    const avgEmbeddingStr = `[${averageEmbedding.join(',')}]`
    
    try {
      // Fetch results with proper quoting of reserved keywords
      const result = await pgPool.query(
        `SELECT id, title, description, genre, "releaseYear", "posterUrl", "cast", director, (2 - (embedding <-> CAST($1 AS vector))) as similarity_score FROM "Movie" WHERE embedding IS NOT NULL ORDER BY embedding <-> CAST($1 AS vector) ASC LIMIT $2`,
        [avgEmbeddingStr, limit * 3]
      )
      
      // Filter out the input movie IDs and return requested limit
      const allResults = result.rows
      const similarMovies = allResults.filter((m) => !movieIds.includes(m.id)).slice(0, limit)
      return similarMovies
    } catch (pgError) {
      throw pgError
    }
  } catch (error) {
    console.error('Error finding similar movies:', error)
    throw error
  }
}

/**
 * Calculate the average of multiple embeddings
 * @param {Array<number[]>} embeddings - Array of embedding vectors
 * @returns {number[]} - Average embedding vector
 */
function calculateAverageEmbedding(embeddings) {
  const dimension = embeddings[0].length
  const average = new Array(dimension).fill(0)

  for (const embedding of embeddings) {
    for (let i = 0; i < dimension; i++) {
      average[i] += embedding[i]
    }
  }

  return average.map((val) => val / embeddings.length)
}

export default {
  generateMovieEmbedding,
  generateEmbeddingsForAllMovies,
  findSimilarMovies,
}
