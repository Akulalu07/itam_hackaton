package models

import "time"

type TeamStatus string

const (
	TeamStatusLooking TeamStatus = "looking"
	TeamStatusReady   TeamStatus = "ready"
	TeamStatusClosed  TeamStatus = "closed"
)

type Team struct {
	ID          int64      `gorm:"primaryKey;autoIncrement" json:"id"`
	HackathonID int64      `gorm:"index" json:"hackathonId"`
	Name        string     `gorm:"not null" json:"name"`
	Description *string    `gorm:"type:text" json:"description,omitempty"`
	CaptainID   int64      `gorm:"index" json:"captainId"`
	Status      TeamStatus `gorm:"type:varchar(20);default:'looking'" json:"status"`
	InviteCode  *string    `gorm:"type:varchar(20);uniqueIndex" json:"inviteCode,omitempty"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}
type TeamJoinRequest struct {
	ID     int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	TeamID int64  `gorm:"index" json:"teamId"`
	UserID int64  `gorm:"index" json:"userId"`
	Status string `gorm:"type:varchar(20);default:'pending'" json:"status"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

type TeamInvite struct {
	ID            int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	TeamID        int64  `gorm:"index" json:"teamId"`
	InvitedUserID int64  `gorm:"index" json:"invitedUserId"`
	InviterID     int64  `gorm:"index" json:"inviterId"`
	Status        string `gorm:"type:varchar(20);default:'pending'" json:"status"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}
