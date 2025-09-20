/*
  # Add Vector Search Support for Tasks

  1. New Features
    - Enable pgvector extension for vector similarity search
    - Add embedding column to tasks table for storing text embeddings
    - Add index for efficient vector similarity queries

  2. Security
    - Maintain existing RLS policies
    - No changes to user permissions

  3. Performance
    - Add vector index for fast similarity searches
    - Optimize for cosine similarity queries
*/

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE tasks ADD COLUMN embedding vector(1536);
  END IF;
END $$;

-- Add index for vector similarity search
CREATE INDEX IF NOT EXISTS tasks_embedding_idx ON tasks 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);