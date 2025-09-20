@@ .. @@
 create or replace function search_tasks_by_similarity(
   query_embedding vector(1536),
   match_threshold float,
   match_count int,
   user_id uuid
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
     t.id,
     t.title,
     t.priority,
     t.status,
     t.created_at,
     t.updated_at,
-    1 - (t.embedding <=> query_embedding) as similarity
+    1 - (t.embedding <=> query_embedding) as similarity
   from tasks t
   where t.user_id = search_tasks_by_similarity.user_id
+    and t.embedding is not null
     and 1 - (t.embedding <=> query_embedding) > match_threshold
   order by t.embedding <=> query_embedding
   limit match_count;
 $$;