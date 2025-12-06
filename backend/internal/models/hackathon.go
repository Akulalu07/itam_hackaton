package models

import "time"

type Hackathon struct {
	ID          int64   `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string  `gorm:"not null" json:"name"`
	Description *string `json:"description,omitempty"`
	CreatorID   int64   `gorm:"index;not null" json:"creatorId"`

	AgeLimit      *int     `json:"ageLimit,omitempty"`
	Tags          []string `gorm:"type:text[]" json:"tags"`
	RequiredStack []string `gorm:"type:text[]" json:"requiredStack,omitempty"`
	TeamSize      int      `gorm:"not null" json:"teamSize"`

	ConfigurationTemplateID *int64 `gorm:"index" json:"configurationTemplateId,omitempty"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`

	Creator User `gorm:"foreignKey:CreatorID"`
}
