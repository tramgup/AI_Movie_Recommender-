-- This is an empty migration.
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to Movie table
ALTER TABLE "Movie" ADD COLUMN "embedding" vector(1536);
