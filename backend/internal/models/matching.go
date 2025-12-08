package models

import (
	"time"

	"github.com/lib/pq"
)

type Swipe struct {
	ID           int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	SwiperTeamID int64  `gorm:"index" json:"swiperTeamId"`
	TargetUserID int64  `gorm:"index" json:"targetUserId"`
	Action       string `gorm:"type:varchar(20)" json:"action"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

type Match struct {
	ID        int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	TeamID    int64     `gorm:"index" json:"teamId"`
	UserID    int64     `gorm:"index" json:"userId"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

type MatchCandidate struct {
	UserID      int64    `json:"userId"`
	Username    string   `json:"username"`
	SkillRating *int     `json:"skillRating,omitempty"`
	Tags        []string `json:"tags"`
}

// SwipePreference - настройки поиска тиммейтов
type SwipePreference struct {
	ID          int64 `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID      int64 `gorm:"uniqueIndex:idx_user_hackathon_pref" json:"userId"`
	HackathonID int64 `gorm:"uniqueIndex:idx_user_hackathon_pref" json:"hackathonId"`

	// MMR диапазон
	MinMMR *int `json:"minMmr,omitempty"`
	MaxMMR *int `json:"maxMmr,omitempty"`

	// Предпочтительные навыки
	PreferredSkills pq.StringArray `gorm:"type:text[]" json:"preferredSkills,omitempty"`

	// Уровень опыта: beginner, intermediate, advanced, expert
	PreferredExperience pq.StringArray `gorm:"type:text[]" json:"preferredExperience,omitempty"`

	// Предпочтительные роли: frontend, backend, designer, pm, etc.
	PreferredRoles pq.StringArray `gorm:"type:text[]" json:"preferredRoles,omitempty"`

	// Только с проверенными навыками?
	VerifiedOnly bool `gorm:"default:false" json:"verifiedOnly"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}
