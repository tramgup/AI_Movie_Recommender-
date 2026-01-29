# Movie App

A full-stack movie discovery platform with semantic search powered by AI embeddings. Find similar movies based on their descriptions, cast, and themes using ChatGPT embeddings and vector similarity search.

## Tech Stack

**Frontend:**
- React 18+ + Vite
- JavaScript (ES6+)
- CSS3

**Backend:**
- Node.js + Express
- Prisma ORM
- PostgreSQL with pgvector extension
- OpenAI API (ChatGPT embeddings)
- JWT for authentication

**Infrastructure:**
- Docker & Docker Compose
- pgvector for vector database operations

## Features

- Browse movies and view detailed information
- User authentication (register/login)
- **AI-Powered Similarity Search**: Find similar movies using ChatGPT embeddings
  - Converts movie descriptions, cast, and themes into vector embeddings
  - Uses pgvector for fast similarity matching
- Admin controls for movie data management
- Real-time movie data ingestion from TMDB API
- Streaming provider information

## How AI Embeddings Work

This app uses **ChatGPT embeddings** to power the movie similarity search:

1. **Embedding Generation**: Movie data (title, description, cast, director, genres) is sent to OpenAI's embedding API
2. **Vector Storage**: The generated embeddings are stored in PostgreSQL using the pgvector extension
3. **Similarity Search**: When you search for similar movies, the app converts your query into an embedding and finds the closest matches using vector similarity (cosine distance)

This allows for intelligent, semantic-based movie recommendations beyond simple keyword matching.

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 16+ (for local development)
- OpenAI API key (for embedding generation)

### Setup

1. Clone the repo and navigate to the project:
```bash
cd movie_app
```

2. Start the app with Docker:
```bash
docker compose up
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5003

### First Time Setup

If this is your first time running the app, the database migrations will run automatically. If needed, you can manually run migrations:

```bash
docker compose exec backend npx prisma migrate deploy
```

### Ingesting Movie Data

To populate the database with movies from TMDB:

```bash
docker compose exec backend npm run ingest:tmdb
```

To update "now playing" movies:

```bash
docker compose exec backend npm run ingest:nowplaying
```

To generate ChatGPT embeddings for movie similarity search:

```bash
docker compose exec backend npm run generate:embeddings
```

This command will:
- Fetch all movies from the database
- Send them to OpenAI's embedding API
- Store the vector embeddings in PostgreSQL

## Project Structure

```
movie_app/
├── backend/          # Node.js API server
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Business logic (embeddings, API calls)
│   │   └── scripts/  # Data ingestion & embedding generation
│   └── prisma/       # Database schema & migrations
├── frontend/         # React + Vite application
│   └── src/
│       ├── pages/    # Page components
│       ├── components/ # Reusable UI components
│       └── services/ # API client
└── docker-compose.yaml
```

## Development

For local development without Docker:

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Make sure you have a PostgreSQL database running and set the `DATABASE_URL` and `OPENAI_API_KEY` in your `.env` file.