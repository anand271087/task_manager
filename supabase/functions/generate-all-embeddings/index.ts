/*
  # Generate All Embeddings Edge Function

  1. Purpose
    - Generates embeddings for all existing tasks that don't have embeddings
    - Batch processes tasks to avoid API rate limits
    - Called manually to populate embeddings for existing data

  2. Security
    - Uses OPENAI_API_KEY environment variable
    - CORS enabled for frontend requests
    - Respects RLS policies

  3. Usage
    - POST request with { "userId": "user-id" }
    - Returns { "processed": number, "errors": number }
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
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "UserId is required" }),
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all tasks without embeddings for this user
    const { data: tasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id, title')
      .eq('user_id', userId)
      .is('embedding', null);

    if (fetchError) {
      throw new Error(`Failed to fetch tasks: ${fetchError.message}`);
    }

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, errors: 0, message: "No tasks need embeddings" }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    let processed = 0;
    let errors = 0;

    // Process tasks in batches to avoid rate limits
    for (const task of tasks) {
      try {
        // Generate embedding for the task text
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: task.title,
          }),
        });

        if (!embeddingResponse.ok) {
          throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0]?.embedding;

        if (!embedding) {
          throw new Error('No embedding received from OpenAI');
        }

        // Update task with embedding
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ embedding })
          .eq('id', task.id);

        if (updateError) {
          throw new Error(`Database update error: ${updateError.message}`);
        }

        processed++;
        
        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error processing task ${task.id}:`, error);
        errors++;
      }
    }

    return new Response(
      JSON.stringify({ 
        processed, 
        errors, 
        message: `Successfully processed ${processed} tasks with ${errors} errors` 
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Error in generate-all-embeddings:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate embeddings' 
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