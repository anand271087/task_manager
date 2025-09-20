/*
  # Create subtasks table

  1. New Tables
    - `subtasks`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `priority` (text, enum: low/medium/high, default: medium)
      - `status` (text, enum: pending/in-progress/done, default: pending)
      - `task_id` (uuid, foreign key to tasks table)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `subtasks` table
    - Add policies for authenticated users to manage their own subtasks

  3. Indexes
    - Index on task_id for efficient subtask queries
    - Index on user_id for user-specific queries
    - Index on status for filtering
    - Index on created_at for ordering
*/

-- Create subtasks table
CREATE TABLE IF NOT EXISTS subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  priority text DEFAULT 'medium'::text,
  status text DEFAULT 'pending'::text,
  task_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraints
ALTER TABLE subtasks 
ADD CONSTRAINT subtasks_priority_check 
CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]));

ALTER TABLE subtasks 
ADD CONSTRAINT subtasks_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'in-progress'::text, 'done'::text]));

-- Add foreign key to tasks table
ALTER TABLE subtasks 
ADD CONSTRAINT subtasks_task_id_fkey 
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

-- Add foreign key to auth.users (Supabase's built-in users table)
ALTER TABLE subtasks 
ADD CONSTRAINT subtasks_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS subtasks_task_id_idx ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS subtasks_user_id_idx ON subtasks(user_id);
CREATE INDEX IF NOT EXISTS subtasks_status_idx ON subtasks(status);
CREATE INDEX IF NOT EXISTS subtasks_created_at_idx ON subtasks(created_at DESC);

-- Enable Row Level Security
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own subtasks"
  ON subtasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subtasks"
  ON subtasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subtasks"
  ON subtasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subtasks"
  ON subtasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);