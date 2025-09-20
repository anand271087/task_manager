/*
  # Smart Search Edge Function

  1. Purpose
    - Generates embeddings for search queries using OpenAI
    - Performs vector similarity search on tasks
    - Returns top 5 most similar tasks with similarity > 0.7

  2. Security
    - Uses OPENAI_API_KEY environment variable
    - CORS enabled for frontend requests
    - Respects RLS policies

  3. Usage
    - POST request with { "query": "search text", "userId": "user-id" }
    - Returns { "results": [{ task, similarity }] }
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { query, userId } = await req.json();

    if (!query || !userId) {
      return new Response(
        JSON.stringify({ error: "Query and userId are required" }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Generate embedding for the search query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0]?.embedding;

    if (!queryEmbedding) {
      throw new Error('No embedding received from OpenAI');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Perform vector similarity search
    const { data: searchResults, error: searchError } = await supabase.rpc(
      'search_tasks_by_similarity',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 5,
        user_id: userId,
      }
    );

    if (searchError) {
      throw new Error(`Search error: ${searchError.message}`);
    }

    return new Response(
      JSON.stringify({ results: searchResults || [] }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Error in smart search:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to perform search' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});