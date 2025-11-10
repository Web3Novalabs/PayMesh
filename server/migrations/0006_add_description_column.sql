-- Add description column with empty string default
ALTER TABLE crowd_funding 
ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';