CREATE TABLE IF NOT EXISTS media_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intent VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL,
    media_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the order field for faster sorting
CREATE INDEX IF NOT EXISTS idx_media_intents_order ON media_intents("order");

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_media_intents_updated_at
    BEFORE UPDATE ON media_intents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 