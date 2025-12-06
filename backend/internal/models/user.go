package models

import (
	"time"
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
	Name        string   `json:"name"`
	Bio         string   `json:"bio"`
	Skills      []string `gorm:"type:text[];serializer:json" json:"skills"`
	Experience  string   `json:"experience"`                                    // junior, middle, senior
	LookingFor  []string `gorm:"type:text[];serializer:json" json:"lookingFor"` // roles they want in team
	ContactInfo string   `json:"contactInfo"`                                   // telegram, email, etc.

	SkillRating *int     `json:"skillRating,omitempty"`
	Tags        []string `gorm:"type:text[];serializer:json" json:"tags"`

	TeamID             *int64 `gorm:"index" json:"teamId,omitempty"`
	CurrentHackathonID *int64 `gorm:"index" json:"currentHackathonId,omitempty"`
	ProfileComplete    bool   `gorm:"default:false" json:"profileComplete"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}
