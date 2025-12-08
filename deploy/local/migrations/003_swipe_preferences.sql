-- Таблица настроек свайпа
CREATE TABLE IF NOT EXISTS swipe_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    hackathon_id BIGINT NOT NULL,
    min_mmr INTEGER,
    max_mmr INTEGER,
    preferred_skills TEXT[] DEFAULT '{}',
    preferred_experience TEXT[] DEFAULT '{}',
    preferred_roles TEXT[] DEFAULT '{}',
    verified_only BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, hackathon_id)
);

CREATE INDEX IF NOT EXISTS idx_swipe_pref_user ON swipe_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_swipe_pref_hackathon ON swipe_preferences(hackathon_id);

-- Таблица уведомлений
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type TEXT NOT NULL, -- 'match', 'team_invite', 'team_request', 'hackathon_start', 'hackathon_reminder'
    title TEXT NOT NULL,
    message TEXT,
    data JSONB, -- дополнительные данные (team_id, match_id, hackathon_id, etc.)
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;
