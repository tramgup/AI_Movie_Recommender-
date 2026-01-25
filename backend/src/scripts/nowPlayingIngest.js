import dotenv from 'dotenv'
import prisma from '../prismaClient.js'

dotenv.config()

const TMDB_API_KEY = process.env.TMDB_API_KEY

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function ingestNowPlayingMovies() {
  if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY missing')

  try {
    // First, reset all movies to not now playing
    await prisma.movie.updateMany({
      data: { isNowPlaying: false },
    })

    const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    console.log('Fetching now playing movies from TMDB...')
    
    const resp = await fetch(url)
    if (!resp.ok) {
      const text = await resp.text()
      throw new Error(`TMDB fetch failed: ${resp.status} ${text}`)
    }
    
    const data = await resp.json()
    const results = data.results || []
    console.log(`Found ${results.length} now playing movies`)

    let createdCount = 0
    let updatedCount = 0

    for (const m of results) {
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
          cast = creditsData.cast
            .slice(0, 5)
            .map(actor => actor.name)
          
          // Get director
          const directorObj = creditsData.crew.find(c => c.job === 'Director')
          director = directorObj ? directorObj.name : null
        }

        await delay(100) // Be respectful with API rate limits
      } catch (err) {
        console.warn(`Could not fetch credits for movie ${m.id}:`, err.message)
      }

      try {
        const existingMovie = await prisma.movie.findUnique({
          where: { tmdbId: m.id },
        })

        if (existingMovie) {
          await prisma.movie.update({
            where: { tmdbId: m.id },
            data: {
              title: m.title,
              description: m.overview,
              genre: genres,
              releaseYear,
              posterUrl,
              cast,
              director,
              isNowPlaying: true,
            },
          })
          updatedCount++
        } else {
          await prisma.movie.create({
            data: {
              tmdbId: m.id,
              title: m.title,
              description: m.overview,
              genre: genres,
              releaseYear,
              posterUrl,
              cast,
              director,
              isNowPlaying: true,
            },
          })
          createdCount++
        }
      } catch (err) {
        console.error(`Error saving movie ${m.id}:`, err.message)
      }
    }

    console.log(`Now playing import complete: ${createdCount} created, ${updatedCount} updated`)
    return { createdCount, updatedCount, totalMovies: results.length }
  } catch (err) {
    console.error('Error fetching now playing movies:', err)
    throw err
  }
}
ingestNowPlayingMovies()