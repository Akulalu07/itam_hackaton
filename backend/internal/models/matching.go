package models

import "time"

type Swipe struct {
	ID           int64     `json:"id"`
	SwiperTeamID int64     `json:"swiperTeamId"`
	TargetUserID int64     `json:"targetUserId"`
	Action       string    `json:"action"`
	CreatedAt    time.Time `json:"createdAt"`
}

type Match struct {
	ID        int64     `json:"id"`
	TeamID    int64     `json:"teamId"`
	UserID    int64     `json:"userId"`
	CreatedAt time.Time `json:"createdAt"`
}

type MatchCandidate struct {
	UserID      int64    `json:"userId"`
	Username    string   `json:"username"`
	SkillRating *int     `json:"skillRating,omitempty"`
	Tags        []string `json:"tags"`
}
