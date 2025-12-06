package models

import "time"

type Team struct {
	ID          int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	HackathonID int64  `gorm:"index;not null" json:"hackathonId"`
	Name        string `gorm:"not null" json:"name"`
	CaptainID   int64  `gorm:"index;not null" json:"captainId"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`

	Members []User `gorm:"foreignKey:TeamID"`
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
