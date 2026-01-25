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
      let streamingProviders = []
      
      try {
        const creditsUrl = `https://api.themoviedb.org/3/movie/${m.id}/credits?api_key=${TMDB_API_KEY}`
        const creditsResp = await fetch(creditsUrl)
        
        if (creditsResp.ok) {
          const creditsData = await creditsResp.json()
          
          // Get top 5 cast members
            cast = creditsData.cast
              .slice(0, 5)
              .map(actor => actor.name) 
          
          // Get director
          const directorInfo = creditsData.crew.find(member => member.job === 'Director')
          
          director = directorInfo ? directorInfo.name : null

        
        await delay(CREDITS_DELAY_MS)
      } 
    } catch (err) {
        console.error(`Failed to fetch credits for ${m.id}:`, err.message)
      }

      // Fetch streaming providers for this movie (US only)
      try {
        const watchProvidersUrl = `https://api.themoviedb.org/3/movie/${m.id}/watch/providers?api_key=${TMDB_API_KEY}`
        const watchProvidersResp = await fetch(watchProvidersUrl)
        
        if (watchProvidersResp.ok) {
          const watchProvidersData = await watchProvidersResp.json()
          const usProviders = watchProvidersData.results?.US
          
          // Get flatrate (streaming) providers
          if (usProviders?.flatrate) {
            streamingProviders = usProviders.flatrate.map(provider => provider.provider_name)
          }
        }
        
        await delay(CREDITS_DELAY_MS)
      } catch (err) {
        console.error(`Failed to fetch watch providers for ${m.id}:`, err.message)
      }

      try {
        await prisma.movie.upsert({
          where: { tmdbId: m.id },
          update: {
            title: m.title,
            description: m.overview || null,
            releaseYear,
            posterUrl,
            genre: genres,
            cast,           
            director,
            streamingProviders,
          },
          create: {
            tmdbId: m.id,
            title: m.title,
            description: m.overview || null,
            releaseYear,
            posterUrl,
            genre: genres,
            cast,           
            director,
            streamingProviders,
          },

        })
      } catch (err) {
        console.error('Upsert failed for', m.id, m.title, err.message)
      }
    }
  }
}

// Run directly: node src/scripts/tmdbIngest.js [pages]
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