-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add the intent_embedding column to the media_intents table
ALTER TABLE media_intents ADD COLUMN IF NOT EXISTS intent_embedding vector(1536); 