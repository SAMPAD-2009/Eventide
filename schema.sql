-- Add subtasks to the todos table
ALTER TABLE public.todos
ADD COLUMN subtasks jsonb DEFAULT '[]'::jsonb;
