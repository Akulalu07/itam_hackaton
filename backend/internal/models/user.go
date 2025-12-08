package models

import (
	"time"

	"github.com/lib/pq"
)

type UserRole string

const (
	RoleUser             UserRole = "user"
	RoleHackathonCreator UserRole = "hackathon_creator"
	RoleAdmin            UserRole = "admin"
)

type User struct {
	ID             int64    `gorm:"primaryKey;autoIncrement" json:"id"`
	TelegramUserID int64    `gorm:"uniqueIndex;not null" json:"telegramUserId"`
	Username       string   `gorm:"not null" json:"username"`
	Authorized     bool     `gorm:"default:false" json:"authorized"`
	Role           UserRole `gorm:"type:varchar(30);default:'user'" json:"role"`

	// Profile fields
	Name           string         `json:"name"`
	Bio            string         `json:"bio"`
	AvatarURL      string         `json:"avatarUrl"`
	Skills         pq.StringArray `gorm:"type:text[]" json:"skills"`
	VerifiedSkills pq.StringArray `gorm:"type:text[]" json:"verifiedSkills"` // Навыки, подтверждённые тестами
	Experience     string         `json:"experience"`                        // junior, middle, senior
	LookingFor     pq.StringArray `gorm:"type:text[]" json:"lookingFor"`     // roles they want in team
	ContactInfo    string         `json:"contactInfo"`                       // telegram, email, etc.

	// Gamification fields
	Pts int `gorm:"default:0" json:"pts"`    // Points - очки за активность
	Mmr int `gorm:"default:1000" json:"mmr"` // Matchmaking Rating - рейтинг для подбора команд

	SkillRating *int           `json:"skillRating,omitempty"`
	Tags        pq.StringArray `gorm:"type:text[]" json:"tags"`

	TeamID             *int64 `gorm:"index" json:"teamId,omitempty"`
	CurrentHackathonID *int64 `gorm:"index" json:"currentHackathonId,omitempty"`
	ProfileComplete    bool   `gorm:"default:false" json:"profileComplete"`

	// Notification settings
	NotificationsEnabled bool `gorm:"default:true" json:"notificationsEnabled"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}
