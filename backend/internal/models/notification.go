package models

import (
	"encoding/json"
	"time"
)

// NotificationType - тип уведомления
type NotificationType string

const (
	NotificationTypeMatch           NotificationType = "match"
	NotificationTypeTeamInvite      NotificationType = "team_invite"
	NotificationTypeTeamRequest     NotificationType = "team_request"
	NotificationTypeHackathonStart  NotificationType = "hackathon_start"
	NotificationTypeHackathonRemind NotificationType = "hackathon_reminder"
	NotificationTypeTeamAccepted    NotificationType = "team_accepted"
	NotificationTypeTeamRejected    NotificationType = "team_rejected"
)

// Notification - уведомление для пользователя
type Notification struct {
	ID        int64            `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    int64            `gorm:"index" json:"userId"`
	Type      NotificationType `gorm:"type:varchar(50)" json:"type"`
	Title     string           `json:"title"`
	Message   string           `json:"message,omitempty"`
	Data      json.RawMessage  `gorm:"type:jsonb" json:"data,omitempty"`
	IsRead    bool             `gorm:"default:false" json:"isRead"`
	CreatedAt time.Time        `gorm:"autoCreateTime" json:"createdAt"`
}

// NotificationData - структура для data в уведомлении
type NotificationData struct {
	TeamID       *int64 `json:"teamId,omitempty"`
	MatchID      *int64 `json:"matchId,omitempty"`
	HackathonID  *int64 `json:"hackathonId,omitempty"`
	FromUserID   *int64 `json:"fromUserId,omitempty"`
	FromUserName string `json:"fromUserName,omitempty"`
	TeamName     string `json:"teamName,omitempty"`
}
