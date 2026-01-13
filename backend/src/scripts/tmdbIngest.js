import dotenv from 'dotenv'
import prisma from '../prismaClient.js'

dotenv.config()

const TMDB_API_KEY = process.env.TMDB_API_KEY
const CREDITS_DELAY_MS = 250 // Add delay between requests to respect rate limits

if (!TMDB_API_KEY) {
  console.error('TMDB_API_KEY not set in environment')
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
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

      // Fetch credits for this movie
      let cast = []
      let director = null
      
      try {
        const creditsUrl = `https://api.themoviedb.org/3/movie/${m.id}/credits?api_key=${TMDB_API_KEY}`
        const creditsResp = await fetch(creditsUrl)
        
        if (creditsResp.ok) {
          const creditsData = await creditsResp.json()
          
          // Get top 5 cast members
          if (creditsData.cast && Array.isArray(creditsData.cast)) {
            cast = creditsData.cast
              .slice(0, 5)
              .map(actor => actor.name)
              .filter(name => name) // Filter out any null names
          }
          
          // Get director
          if (creditsData.crew && Array.isArray(creditsData.crew)) {
            const directorObj = creditsData.crew.find(person => person.job === 'Director')
            director = directorObj ? directorObj.name : null
          }
        } else {
          console.warn(`⚠ Credits fetch returned ${creditsResp.status} for movie ${m.id}`)
        }
        
        // Add delay to respect rate limits
        await delay(CREDITS_DELAY_MS)
      } catch (err) {
        console.error(`Failed to fetch credits for ${m.id}:`, err.message)
      }

      try {
        const updateData = {
          title: m.title,
          description: m.overview || null,
          releaseYear,
          posterUrl,
          genre: genres,
        }
        
        // Only add cast/director if they exist
        if (cast.length > 0) updateData.cast = cast
        if (director) updateData.director = director

        await prisma.movie.upsert({
          where: { tmdbId: m.id },
          update: updateData,
          create: {
            tmdbId: m.id,
            title: m.title,
            description: m.overview || null,
            releaseYear,
            posterUrl,
            genre: genres,
            cast: cast.length > 0 ? cast : [],
            director: director || null,
          },
        })
        console.log(`✓ Ingested: ${m.title}${cast.length > 0 ? ` (${cast.length} cast)` : ''}${director ? ` - Dir: ${director}` : ''}`)
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