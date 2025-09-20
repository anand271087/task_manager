/*
  # Add Search Function for Vector Similarity

  1. New Functions
    - search_tasks_by_similarity: Performs vector similarity search on tasks
    - Returns tasks with similarity scores above threshold

  2. Security
    - Function respects RLS policies
    - Only returns tasks belonging to the specified user

  3. Performance
    - Uses vector similarity with cosine distance
    - Limits results for optimal performance
*/

-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION search_tasks_by_similarity(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  user_id uuid
)
RETURNS TABLE (
  id uuid,
  title text,
  priority text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.priority,
    t.status,
    t.created_at,
    t.updated_at,
    1 - (t.embedding <=> query_embedding) AS similarity
  FROM tasks t
  WHERE 
    t.user_id = search_tasks_by_similarity.user_id
    AND t.embedding IS NOT NULL
    AND 1 - (t.embedding <=> query_embedding) > match_threshold
  ORDER BY t.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;