/*
  # Add Vector Search Function

  1. Purpose
    - Creates a PostgreSQL function for vector similarity search
    - Searches tasks by embedding similarity using cosine distance
    - Returns tasks with similarity above threshold, ordered by relevance

  2. Security
    - Respects Row Level Security policies
    - Only returns tasks the user has access to

  3. Usage
    - Called by smart-search edge function
    - Takes query embedding, threshold, count, and user_id parameters
*/

-- Create the search function
create or replace function search_tasks_by_similarity(
  query_embedding vector(1536),
  match_threshold float default 0.5,
  match_count int default 5,
  user_id uuid default null
)
returns table (
  id uuid,
  title text,
  priority text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
language sql stable
as $$
  select
    tasks.id,
    tasks.title,
    tasks.priority,
    tasks.status,
    tasks.created_at,
    tasks.updated_at,
    1 - (tasks.embedding <=> query_embedding) as similarity
  from tasks
  where 
    tasks.user_id = search_tasks_by_similarity.user_id
    and tasks.embedding is not null
    and 1 - (tasks.embedding <=> query_embedding) > match_threshold
  order by tasks.embedding <=> query_embedding
  limit match_count;
$$;