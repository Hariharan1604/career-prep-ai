-- Migration: Add AI-generated fields to assessment_questions
ALTER TABLE IF EXISTS assessment_questions
  ADD COLUMN IF NOT EXISTS ai_answer TEXT,
  ADD COLUMN IF NOT EXISTS ai_key_points JSON,
  ADD COLUMN IF NOT EXISTS ai_intent TEXT;

-- Optional: backfill empty JSON arrays for existing rows if needed
UPDATE assessment_questions
SET ai_key_points = '[]'::json
WHERE ai_key_points IS NULL;
