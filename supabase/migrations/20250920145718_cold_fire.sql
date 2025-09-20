/*
  # Create subtasks table with proper relations

  1. New Tables
    - `subtasks`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `priority` (text, default 'medium')
      - `status` (text, default 'pending')
      - `task_id` (uuid, foreign key to tasks table)
      - `user_id` (uuid, foreign key to users table)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `subtasks` table
    - Add policies for authenticated users to manage their own subtasks

  3. Changes
    - Remove parent_id column from tasks table as we now have a dedicated subtasks table
    - Add indexes for better query performance
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

-- Add constraints for priority and status
ALTER TABLE subtasks ADD CONSTRAINT subtasks_priority_check 
  CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]));

ALTER TABLE subtasks ADD CONSTRAINT subtasks_status_check 
  CHECK (status = ANY (ARRAY['pending'::text, 'in-progress'::text, 'done'::text]));

-- Add foreign key constraints
ALTER TABLE subtasks ADD CONSTRAINT subtasks_task_id_fkey 
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

ALTER TABLE subtasks ADD CONSTRAINT subtasks_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add indexes for better performance
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

-- Remove parent_id column from tasks table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE tasks DROP COLUMN parent_id;
  END IF;
END $$;