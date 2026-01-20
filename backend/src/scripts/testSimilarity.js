import prisma from '../prismaClient.js'
import { findSimilarMovies } from '../services/embeddingService.js'

async function testSimilarity() {
  try {
    // Get two random movies to use as seed
    const totalMovies = await prisma.movie.count()
    const randomSkip = Math.floor(Math.random() * (totalMovies - 2))
    
    const seedMovies = await prisma.movie.findMany({
      take: 3,
      skip: randomSkip,
      select: {
        id: true,
        title: true,
      },
    })

    if (seedMovies.length < 2) {
      console.log('Not enough movies with embeddings in database')
      process.exit(1)
    }

    console.log('Using seed movies:', seedMovies)
    console.log()

    // Test similarity search
    const movieIds = seedMovies.map((m) => m.id)
    const similarMovies = await findSimilarMovies(movieIds, 10)

    console.log('Similar movies:')
    similarMovies.forEach((movie, index) => {
      console.log(
        `${index + 1}. ${movie.title} (id: ${movie.id}) — similarity: ${movie.similarity_score}`
      )
    })

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

testSimilarity()
