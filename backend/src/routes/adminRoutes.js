import express from 'express'
import { adminMiddleware } from '../middleware/authMiddleware.js'
import { ingestMovies } from '../scripts/tmdbIngest.js'

const router = express.Router()

// Trigger TMDB ingestion (protected route - admin only)
router.post('/ingest', adminMiddleware, async (req, res) => {
  const pages = parseInt(req.body.pages) || 1
  try {
    await ingestMovies({ pages })
    return res.json({ ok: true, pages })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
})

export default router
