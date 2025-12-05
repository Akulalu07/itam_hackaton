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
	ID            int64     `json:"id"`
	TelegramUserID int64    `json:"telegramUserId"`
	Username      string    `json:"username"`
	Authorized    bool      `json:"authorized"`
	Role          UserRole  `json:"role"`
	SkillRating   *int      `json:"skillRating,omitempty"`
	Tags          []string  `json:"tags"`
	TeamID        *int64    `json:"teamId,omitempty"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
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

