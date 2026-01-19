import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import adminMiddleware from '../middleware/adminMiddleware.js'
import { ingestMovies } from '../scripts/tmdbIngest.js'
import { generateEmbeddingsForAllMovies } from '../services/embeddingService.js'

const router = express.Router()

// Trigger TMDB ingestion (protected route - admin only)
router.post('/ingest', async (req, res) => {
  const pages = parseInt(req.body.pages) || 1
  try {
    await ingestMovies({ pages })
    return res.json({ ok: true, pages })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
})

// Generate embeddings for all movies without embeddings (protected route - admin only)
router.post('/generate-embeddings', async (req, res) => {
  try {
    // Start the embedding generation in the background
    generateEmbeddingsForAllMovies()
      .then(() => {
        console.log('Embedding generation completed successfully')
      })
      .catch((error) => {
        console.error('Embedding generation failed:', error)
      })

    return res.json({
      ok: true,
      message: 'Embedding generation started. This may take a while.',
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
})

export default router
