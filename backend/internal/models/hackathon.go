package models

import "time"

type HackathonStatus string

const (
	HackathonStatusDraft            HackathonStatus = "draft"
	HackathonStatusRegistrationOpen HackathonStatus = "registration_open"
	HackathonStatusActive           HackathonStatus = "active"
	HackathonStatusCompleted        HackathonStatus = "completed"
)

type Hackathon struct {
	ID          int64           `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string          `gorm:"not null" json:"name"`
	Description *string         `json:"description,omitempty"`
	ImageUrl    *string         `json:"imageUrl,omitempty"`
	CreatorID   int64           `gorm:"index" json:"creatorId"`
	Status      HackathonStatus `gorm:"type:varchar(30);default:'draft'" json:"status"`

	StartDate            *time.Time `json:"startDate,omitempty"`
	EndDate              *time.Time `json:"endDate,omitempty"`
	RegistrationDeadline *time.Time `json:"registrationDeadline,omitempty"`

	AgeLimit      *int     `json:"ageLimit,omitempty"`
	Tags          []string `gorm:"type:text[];serializer:json" json:"tags"`
	RequiredStack []string `gorm:"type:text[];serializer:json" json:"requiredStack,omitempty"`
	TeamSize      int      `gorm:"not null;default:4" json:"teamSize"`
	MaxTeams      int      `gorm:"default:0" json:"maxTeams"` // 0 = unlimited

	ConfigurationTemplateID *int64 `gorm:"index" json:"configurationTemplateId,omitempty"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

// HackathonParticipant - регистрация участника на хакатон
type HackathonParticipant struct {
	ID          int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	HackathonID int64  `gorm:"index" json:"hackathonId"`
	UserID      int64  `gorm:"index" json:"userId"`
	TeamID      *int64 `gorm:"index" json:"teamId,omitempty"`
	Status      string `gorm:"type:varchar(20);default:'looking'" json:"status"` // looking, in_team

	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}
