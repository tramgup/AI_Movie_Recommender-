import express from 'express'
import prisma from '../prismaClient.js'
import { findSimilarMovies } from '../services/embeddingService.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const take = 20
  const skip = (page - 1) * take

  try {
    const movies = await prisma.movie.findMany({
      skip,
      take,
      orderBy: { title: 'asc' },
    })

    return res.json({ page, movies })
  } catch (err) {
    console.error(err)
    return res.sendStatus(503)
  }
})

/**
 * Find similar movies based on selected movies
 * POST /home/similar
 * Body: { movieIds: ["id1", "id2", ...] (max 5), limit: 10 (optional) }
 */
router.post('/similar', async (req, res) => {
  try {
    const { movieIds, limit = 10 } = req.body

    if (!movieIds || !Array.isArray(movieIds)) {
      return res.status(400).json({
        error: 'movieIds must be an array of movie IDs',
      })
    }

    if (movieIds.length === 0) {
      return res.status(400).json({
        error: 'At least one movie ID is required',
      })
    }

    if (movieIds.length > 5) {
      return res.status(400).json({
        error: 'Maximum 5 movies can be selected',
      })
    }

    const similarMovies = await findSimilarMovies(movieIds, limit)

    return res.json({
      selectedMovieIds: movieIds,
      similarMovies,
    })
  } catch (err) {
    console.error('Error finding similar movies:', err)
    return res.status(500).json({
      error: err.message || 'Failed to find similar movies',
    })
  }
})

export default router
