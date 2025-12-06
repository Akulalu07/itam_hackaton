-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('user', 'hackathon_creator', 'admin');

-- Rarity enum for items
CREATE TYPE rarity_type AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');

-- Equipment slot enum
CREATE TYPE equipment_slot AS ENUM ('head', 'body', 'legs', 'feet', 'background');

-- Users table (extended)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    telegram_user_id BIGINT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    authorized BOOLEAN NOT NULL DEFAULT true,
    role user_role NOT NULL DEFAULT 'user',
    skill_rating INTEGER,
    tags TEXT[] DEFAULT '{}',
    team_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_telegram_user_id ON users(telegram_user_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_tags ON users USING GIN(tags);

-- Hackathons table
CREATE TABLE IF NOT EXISTS hackathons (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    creator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    age_limit INTEGER,
    tags TEXT[] DEFAULT '{}',
    required_stack TEXT[],
    team_size INTEGER NOT NULL,
    configuration_template_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hackathons_creator_id ON hackathons(creator_id);
CREATE INDEX idx_hackathons_tags ON hackathons USING GIN(tags);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id BIGSERIAL PRIMARY KEY,
    hackathon_id BIGINT NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    captain_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(hackathon_id, captain_id)
);

CREATE INDEX idx_teams_hackathon_id ON teams(hackathon_id);
CREATE INDEX idx_teams_captain_id ON teams(captain_id);

-- Team members (many-to-many)
CREATE TABLE IF NOT EXISTS team_members (
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- Team join requests
CREATE TABLE IF NOT EXISTS team_join_requests (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_join_requests_team_id ON team_join_requests(team_id);
CREATE INDEX idx_team_join_requests_user_id ON team_join_requests(user_id);

-- Team invites
CREATE TABLE IF NOT EXISTS team_invites (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    invited_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    inviter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, invited_user_id)
);

CREATE INDEX idx_team_invites_team_id ON team_invites(team_id);
CREATE INDEX idx_team_invites_invited_user_id ON team_invites(invited_user_id);

-- Swipes (matching system)
CREATE TABLE IF NOT EXISTS swipes (
    id BIGSERIAL PRIMARY KEY,
    swiper_team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    target_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'like' or 'dislike'
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(swiper_team_id, target_user_id)
);

CREATE INDEX idx_swipes_swiper_team_id ON swipes(swiper_team_id);
CREATE INDEX idx_swipes_target_user_id ON swipes(target_user_id);

-- Matches (mutual likes)
CREATE TABLE IF NOT EXISTS matches (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_matches_team_id ON matches(team_id);
CREATE INDEX idx_matches_user_id ON matches(user_id);

-- Clothes table
CREATE TABLE IF NOT EXISTS clothes (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    rarity rarity_type NOT NULL,
    slot equipment_slot NOT NULL,
    image_path TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clothes_rarity ON clothes(rarity);
CREATE INDEX idx_clothes_slot ON clothes(slot);

-- User clothes inventory
CREATE TABLE IF NOT EXISTS user_clothes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clothes_id BIGINT NOT NULL REFERENCES clothes(id) ON DELETE CASCADE,
    obtained_at TIMESTAMP NOT NULL DEFAULT NOW(),
    equipped BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(user_id, clothes_id)
);

CREATE INDEX idx_user_clothes_user_id ON user_clothes(user_id);
CREATE INDEX idx_user_clothes_clothes_id ON user_clothes(clothes_id);

-- Titles table
CREATE TABLE IF NOT EXISTS titles (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_path TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User titles inventory
CREATE TABLE IF NOT EXISTS user_titles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title_id BIGINT NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
    obtained_at TIMESTAMP NOT NULL DEFAULT NOW(),
    equipped BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(user_id, title_id)
);

CREATE INDEX idx_user_titles_user_id ON user_titles(user_id);

-- Stickers table (NFT-like)
CREATE TABLE IF NOT EXISTS stickers (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_path TEXT NOT NULL,
    unique_token TEXT UNIQUE, -- For NFT-like uniqueness
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stickers_unique_token ON stickers(unique_token);

-- User stickers inventory
CREATE TABLE IF NOT EXISTS user_stickers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sticker_id BIGINT NOT NULL REFERENCES stickers(id) ON DELETE CASCADE,
    obtained_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, sticker_id)
);

CREATE INDEX idx_user_stickers_user_id ON user_stickers(user_id);

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hackathon_id BIGINT REFERENCES hackathons(id) ON DELETE SET NULL,
    opened BOOLEAN NOT NULL DEFAULT false,
    opened_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_hackathon_id ON cases(hackathon_id);

-- Case contents (what was in the case)
CREATE TABLE IF NOT EXISTS case_contents (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL, -- 'clothes', 'sticker', 'title'
    item_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_case_contents_case_id ON case_contents(case_id);

-- Hackathon winners
CREATE TABLE IF NOT EXISTS hackathon_winners (
    id BIGSERIAL PRIMARY KEY,
    hackathon_id BIGINT NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    place INTEGER NOT NULL, -- 1, 2, 3
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(hackathon_id, place)
);

CREATE INDEX idx_hackathon_winners_hackathon_id ON hackathon_winners(hackathon_id);





