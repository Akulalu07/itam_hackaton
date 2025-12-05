package models

import "time"

type Team struct {
	ID          int64     `json:"id"`
	HackathonID int64     `json:"hackathonId"`
	Name        string    `json:"name"`
	CaptainID   int64     `json:"captainId"`
	CreatedAt   time.Time `json:"createdAt"`
	Members     []int64   `json:"members,omitempty"`
}

type TeamJoinRequest struct {
	ID        int64     `json:"id"`
	TeamID    int64     `json:"teamId"`
	UserID    int64     `json:"userId"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
}

type TeamInvite struct {
	ID            int64     `json:"id"`
	TeamID        int64     `json:"teamId"`
	InvitedUserID int64     `json:"invitedUserId"`
	InviterID     int64     `json:"inviterId"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"createdAt"`
}
