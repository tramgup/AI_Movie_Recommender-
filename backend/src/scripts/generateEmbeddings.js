import { generateEmbeddingsForAllMovies } from '../services/embeddingService.js'

console.log('Starting embedding generation process...')

generateEmbeddingsForAllMovies()
  .then(() => {
    console.log('All embeddings generated successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed to generate embeddings:', error)
    process.exit(1)
  })
