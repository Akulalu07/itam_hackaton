-- Initialize database types and extensions

-- Create user_role ENUM type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'hackathon_creator', 'admin');
    END IF;
END
$$;

-- Create team_status ENUM type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_status') THEN
        CREATE TYPE team_status AS ENUM ('open', 'closed', 'complete');
    END IF;
END
$$;

-- Create hackathon_status ENUM type  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hackathon_status') THEN
        CREATE TYPE hackathon_status AS ENUM ('draft', 'registration_open', 'registration_closed', 'active', 'completed', 'cancelled');
    END IF;
END
$$;

-- Create invite_status ENUM type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invite_status') THEN
        CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'declined', 'cancelled');
    END IF;
END
$$;

-- Create rarity_type ENUM type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rarity_type') THEN
        CREATE TYPE rarity_type AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
    END IF;
END
$$;

-- Create equipment_slot ENUM type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'equipment_slot') THEN
        CREATE TYPE equipment_slot AS ENUM ('head', 'body', 'legs', 'feet', 'background');
    END IF;
END
$$;
