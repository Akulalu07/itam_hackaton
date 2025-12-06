package models

import (
	"database/sql"
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
	Role           UserRole `gorm:"type:user_role;default:'user'" json:"role"`

	SkillRating *int     `gorm:"" json:"skillRating,omitempty"`
	Tags        []string `gorm:"type:text[]" json:"tags"`

	TeamID *int64 `gorm:"index" json:"teamId,omitempty"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`

	Team *Team `gorm:"foreignKey:TeamID"`
}

func (u *User) Scan(rows *sql.Rows) error {
	var tags []string
	var skillRating sql.NullInt64
	var teamID sql.NullInt64

	err := rows.Scan(
		&u.ID,
		&u.TelegramUserID,
		&u.Username,
		&u.Authorized,
		&u.Role,
		&skillRating,
		&tags,
		&teamID,
		&u.CreatedAt,
		&u.UpdatedAt,
	)

	if err != nil {
		return err
	}

	if skillRating.Valid {
		rating := int(skillRating.Int64)
		u.SkillRating = &rating
	}

	if teamID.Valid {
		u.TeamID = &teamID.Int64
	}

	u.Tags = tags
	return nil
}
