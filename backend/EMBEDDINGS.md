# Movie Similarity Feature Documentation

## Overview
This feature uses OpenAI embeddings to generate semantic representations of movies based on their description, cast, and director. It allows users to find similar movies based on up to 5 selected movies.

## How It Works

### 1. Embedding Generation
- Each movie's embedding is generated from a combination of:
  - **Title**: Movie name
  - **Description**: Plot summary
  - **Cast**: Top 5 actors
  - **Director**: Director name
  - **Genre**: Movie genres

- Uses OpenAI's `text-embedding-3-small` model (1536 dimensions)
- Stored in PostgreSQL using pgvector extension

### 2. Similarity Search
- Takes up to 5 selected movie IDs
- Calculates the average embedding of selected movies
- Uses PostgreSQL pgvector's cosine distance operator (`<->`)
- Returns movies ranked by similarity score (0-1, where 1 is most similar)

## Setup Instructions

### 1. Update Database Schema
The schema has been updated to include the `embedding` field. Run:
```bash
cd backend
npx prisma migrate deploy
```

### 2. Generate Initial Embeddings
To generate embeddings for all existing movies:
```bash
node src/scripts/generateEmbeddings.js
```

This will:
- Find all movies without embeddings
- Generate embeddings using OpenAI API
- Store them in the database

**Note**: Requires `OPENAI_API_KEY` environment variable

### 3. New Embeddings on Movie Creation
When new movies are added to the database, ensure embeddings are generated. You can:
- Call the embedding service in your movie creation route
- Or use the background script periodically

## API Endpoints

### Find Similar Movies
**Endpoint**: `POST /home/similar`

**Authentication**: Required (authMiddleware)

**Request Body**:
```json
{
  "movieIds": ["movie-id-1", "movie-id-2", "movie-id-3"],
  "limit": 10
}
```

**Parameters**:
- `movieIds` (required): Array of movie IDs (min 1, max 5)
- `limit` (optional): Number of similar movies to return (default: 10)

**Response**:
```json
{
  "selectedMovieIds": ["movie-id-1", "movie-id-2"],
  "similarMovies": [
    {
      "id": "movie-id-3",
      "title": "Movie Title",
      "description": "...",
      "genre": ["Action", "Sci-Fi"],
      "releaseYear": 2023,
      "posterUrl": "...",
      "cast": ["Actor 1", "Actor 2"],
      "director": "Director Name",
      "similarity_score": 0.85
    }
  ]
}
```

## Usage Examples

### Example 1: Find movies similar to one movie
```javascript
const response = await fetch('http://localhost:5003/home/similar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    movieIds: ['action-movie-id'],
    limit: 10
  })
})

const { similarMovies } = await response.json()
```

### Example 2: Find movies similar to multiple movies
```javascript
const response = await fetch('http://localhost:5003/home/similar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    movieIds: [
      'movie-id-1',
      'movie-id-2',
      'movie-id-3'
    ],
    limit: 20
  })
})

const { similarMovies } = await response.json()
console.log('Found similar movies:', similarMovies)
```

## Services

### `embeddingService.js`

#### `generateMovieEmbedding(movie)`
Generates embedding for a single movie.

**Parameters**:
- `movie`: Object with `title`, `description`, `cast`, `director`, `genre`

**Returns**: Promise<number[]> - Embedding vector

#### `generateEmbeddingsForAllMovies()`
Generates and stores embeddings for all movies without embeddings.

#### `findSimilarMovies(movieIds, limit = 10)`
Finds similar movies based on selected movies.

**Parameters**:
- `movieIds`: Array of movie IDs (1-5)
- `limit`: Number of results (default: 10)

**Returns**: Promise<Array> - Array of similar movies with similarity_score

## Performance Notes

- **Embedding Generation**: ~0.5 seconds per movie (depends on OpenAI API)
- **Similarity Search**: ~100ms for 1000+ movies using pgvector index
- Consider adding a pgvector index for better performance:

```sql
CREATE INDEX movie_embedding_idx ON "Movie" USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

## Future Enhancements

1. **Caching**: Cache embeddings and similarity results
2. **Genre Grouping**: Group similar movies by genre before returning
3. **Weighted Embeddings**: Different weights for description vs cast vs director
4. **User Preferences**: Learn from user's rating history to influence recommendations
5. **Real-time Updates**: Generate embeddings asynchronously when movies are added
6. **Vector Index**: Add pgvector indexes for faster similarity searches

## Troubleshooting

### "No OPENAI_API_KEY" Error
Make sure your `.env` file contains:
```
OPENAI_API_KEY=sk-...your-key...
```

### Embedding Generation is Slow
- OpenAI API has rate limits. The script processes one movie at a time.
- For large datasets, consider batching requests or using a queue system.

### "embedding" column doesn't exist
Run migrations:
```bash
npx prisma migrate deploy
```

### Similarity results don't make sense
- Ensure embeddings are generated for the selected movies
- Check that movies have descriptive titles, descriptions, and cast information
- More detailed input = better embeddings
