-- Create the labels table
CREATE TABLE labels (
    label_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add the label_id column to the events table
ALTER TABLE events
ADD COLUMN label_id UUID REFERENCES labels(label_id) ON DELETE SET NULL;

-- Add the label_id column to the todos table
ALTER TABLE todos
ADD COLUMN label_id UUID REFERENCES labels(label_id) ON DELETE SET NULL;

-- Enable Row Level Security for the new labels table
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

-- Create policies for the labels table
CREATE POLICY "Users can view their own labels"
ON labels
FOR SELECT
USING (auth.email() = user_email);

CREATE POLICY "Users can insert their own labels"
ON labels
FOR INSERT
WITH CHECK (auth.email() = user_email);

CREATE POLICY "Users can update their own labels"
ON labels
FOR UPDATE
USING (auth.email() = user_email)
WITH CHECK (auth.email() = user_email);

CREATE POLICY "Users can delete their own labels"
ON labels
FOR DELETE
USING (auth.email() = user_email);

-- Add comments to clarify foreign key relationships and RLS policies
COMMENT ON COLUMN events.label_id IS 'Foreign key to the labels table.';
COMMENT ON COLUMN todos.label_id IS 'Foreign key to the labels table.';
COMMENT ON TABLE labels IS 'Stores custom labels for events and todos, with ownership tied to user_email.';
