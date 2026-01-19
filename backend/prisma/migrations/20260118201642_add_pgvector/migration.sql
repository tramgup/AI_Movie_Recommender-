-- This is an empty migration.
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "Movie" ADD COLUMN "embedding" vector(1536);
