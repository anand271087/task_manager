@@ .. @@
 create or replace function search_tasks_by_similarity(
   query_embedding vector(1536),
-  match_threshold float default 0.7,
+  match_threshold float default 0.5,
   match_count int default 5,
   user_id uuid default null
 )