/*
  # Add Subtasks Support

  1. Changes
    - Add `parent_id` column to tasks table to support subtasks
    - Add foreign key constraint for parent-child relationship
    - Add index for better query performance

  2. Security
    - No changes to existing RLS policies needed
    - Parent-child relationships are automatically secured through user_id
*/

-- Add parent_id column to support subtasks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN parent_id uuid;
  END IF;
END $$;

-- Add foreign key constraint for parent-child relationship
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_parent_id_fkey'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_parent_id_fkey 
    FOREIGN KEY (parent_id) REFERENCES tasks(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS tasks_parent_id_idx ON tasks(parent_id);