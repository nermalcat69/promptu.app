-- Migration to add downvotes functionality
-- Run this SQL script on your PostgreSQL database

-- 1. Add downvotes column to prompt table
ALTER TABLE prompt ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;

-- 2. Create downvote table
CREATE TABLE IF NOT EXISTS downvote (
    id TEXT PRIMARY KEY,
    prompt_id TEXT NOT NULL REFERENCES prompt(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL,
    UNIQUE(prompt_id, user_id) -- Prevent duplicate downvotes from same user
);

-- 3. Add unique constraint to upvote table if not exists
ALTER TABLE upvote ADD CONSTRAINT IF NOT EXISTS upvote_prompt_user_unique UNIQUE(prompt_id, user_id);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_downvote_prompt_id ON downvote(prompt_id);
CREATE INDEX IF NOT EXISTS idx_downvote_user_id ON downvote(user_id);
CREATE INDEX IF NOT EXISTS idx_downvote_created_at ON downvote(created_at);

-- 5. Update existing prompts to have 0 downvotes
UPDATE prompt SET downvotes = 0 WHERE downvotes IS NULL;

-- 6. Optional: View to get net scores
CREATE OR REPLACE VIEW prompt_scores AS
SELECT 
    p.id,
    p.slug,
    p.title,
    COALESCE(p.upvotes, 0) as upvotes,
    COALESCE(p.downvotes, 0) as downvotes,
    (COALESCE(p.upvotes, 0) - COALESCE(p.downvotes, 0)) as net_score,
    p.created_at
FROM prompt p;

COMMENT ON VIEW prompt_scores IS 'View showing prompt voting scores with net calculation';
COMMENT ON TABLE downvote IS 'Stores user downvotes for prompts';
COMMENT ON COLUMN prompt.downvotes IS 'Cached count of downvotes for performance'; 