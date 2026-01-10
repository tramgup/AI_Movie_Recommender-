import dotenv from 'dotenv'
import prisma from '../prismaClient.js'

dotenv.config()

const TMDB_API_KEY = process.env.TMDB_API_KEY
if (!TMDB_API_KEY) {
  console.error('TMDB_API_KEY not set in environment')
}

export async function ingestMovies({ pages = 1 } = {}) {
  if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY missing')

  for (let page = 1; page <= pages; page++) {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
    console.log(`Fetching TMDB page ${page}...`)
    const resp = await fetch(url)
    if (!resp.ok) {
      const text = await resp.text()
      throw new Error(`TMDB fetch failed: ${resp.status} ${text}`)
    }
    const data = await resp.json()

    for (const m of data.results || []) {
      const genres = (m.genre_ids || []).map(String)
      const releaseYear = m.release_date ? parseInt(m.release_date.slice(0, 4)) : null
      const posterUrl = m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null

      try {
        await prisma.movie.upsert({
          where: { tmdbId: m.id },
          update: {
            title: m.title,
            description: m.overview || null,
            releaseYear,
            posterUrl,
            genre: genres,
          },
          create: {
            tmdbId: m.id,
            title: m.title,
            description: m.overview || null,
            releaseYear,
            posterUrl,
            genre: genres,
          },
        })
      } catch (err) {
        console.error('Upsert failed for', m.id, m.title, err.message)
      }
    }
  }
}

// If run directly: node src/scripts/tmdbIngest.js [pages]
if (process.argv[1] && process.argv[1].endsWith('tmdbIngest.js')) {
  const pages = parseInt(process.argv[2] || '1')
  ingestMovies({ pages })
    .then(() => {
      console.log('Ingestion complete')
      process.exit(0)
    })
    .catch((err) => {
      console.error('Ingestion error', err)
      process.exit(1)
    })
}
