-- Migration: Add verified_skills field to users table
-- This stores skills that have been verified through tests

ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_skills TEXT[] DEFAULT '{}';

-- Create index for faster queries on verified skills
CREATE INDEX IF NOT EXISTS idx_users_verified_skills ON users USING GIN (verified_skills);
