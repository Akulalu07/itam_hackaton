package models

import "time"

type Hackathon struct {
	ID                      int64     `json:"id"`
	Name                    string    `json:"name"`
	Description             *string   `json:"description,omitempty"`
	CreatorID               int64     `json:"creatorId"`
	AgeLimit                *int      `json:"ageLimit,omitempty"`
	Tags                    []string  `json:"tags"`
	RequiredStack           []string  `json:"requiredStack,omitempty"`
	TeamSize                int       `json:"teamSize"`
	ConfigurationTemplateID *int64    `json:"configurationTemplateId,omitempty"`
	CreatedAt               time.Time `json:"createdAt"`
	UpdatedAt               time.Time `json:"updatedAt"`
}

