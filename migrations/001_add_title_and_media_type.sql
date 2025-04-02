-- Add title and media_type columns to media_intents table
ALTER TABLE media_intents
ADD COLUMN title TEXT NOT NULL DEFAULT '',
ADD COLUMN media_type TEXT NOT NULL DEFAULT 'Photo' CHECK (media_type IN ('Photo', 'Video'));

-- Update existing rows to have a default title based on the intent
UPDATE media_intents
SET title = intent
WHERE title = ''; 