package models

import "time"

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
