CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    telegram_user_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    name TEXT,
    bio TEXT,
    avatar_url TEXT DEFAULT '',
    skills TEXT[],
    verified_skills TEXT[] DEFAULT '{}',
    experience TEXT,
    looking_for TEXT[],
    contact_info TEXT,
    tags TEXT[],
    pts INTEGER DEFAULT 0,
    mmr INTEGER DEFAULT 1000,
    skill_rating INTEGER,
    team_id BIGINT,
    current_hackathon_id BIGINT,
    profile_complete BOOLEAN DEFAULT false,
    role TEXT DEFAULT 'user',
    authorized BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_telegram_user_id ON users(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_authorized ON users(authorized);
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_users_verified_skills ON users USING GIN (verified_skills);





