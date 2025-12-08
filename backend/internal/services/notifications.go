package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type NotificationService struct {
	redisClient *redis.Client
	ctx         context.Context
}

func NewNotificationService(redisClient *redis.Client) *NotificationService {
	return &NotificationService{
		redisClient: redisClient,
		ctx:         context.Background(),
	}
}

type NotificationEvent struct {
	Type    string                 `json:"type"`
	Message string                 `json:"message"`
	Data    map[string]interface{} `json:"data,omitempty"`
}

func (ns *NotificationService) PublishNotification(event NotificationEvent) error {
	streamName := "notifications"

	// Prepare notification data
	notificationData := map[string]interface{}{
		"type":      event.Type,
		"message":   event.Message,
		"data":      event.Data,
		"timestamp": time.Now().Unix(),
	}

	jsonData, err := json.Marshal(notificationData)
	if err != nil {
		return fmt.Errorf("failed to marshal notification: %w", err)
	}

	args := redis.XAddArgs{
		Stream: streamName,
		Values: map[string]interface{}{
			"data": string(jsonData),
		},
		MaxLen: 10000,
		Approx: true,
	}

	_, err = ns.redisClient.XAdd(ns.ctx, &args).Result()
	if err != nil {
		return fmt.Errorf("failed to write to Redis Stream: %w", err)
	}

	return nil
}

func (ns *NotificationService) NotifyTeamInvite(teamID, invitedUserID, inviterID int64, teamName string) error {
	return ns.PublishNotification(NotificationEvent{
		Type:    "team_invite",
		Message: fmt.Sprintf("You've been invited to join team '%s'", teamName),
		Data: map[string]interface{}{
			"teamId":        teamID,
			"invitedUserId": invitedUserID,
			"inviterId":     inviterID,
			"teamName":      teamName,
		},
	})
}

func (ns *NotificationService) NotifyJoinRequest(teamID, userID int64, userName, teamName string) error {
	return ns.PublishNotification(NotificationEvent{
		Type:    "join_request",
		Message: fmt.Sprintf("%s wants to join your team '%s'", userName, teamName),
		Data: map[string]interface{}{
			"teamId":   teamID,
			"userId":   userID,
			"userName": userName,
			"teamName": teamName,
		},
	})
}

func (ns *NotificationService) NotifyMatch(teamID, userID int64, teamName, userName string) error {
	return ns.PublishNotification(NotificationEvent{
		Type:    "match",
		Message: fmt.Sprintf("🎉 Match! Team '%s' and %s liked each other!", teamName, userName),
		Data: map[string]interface{}{
			"teamId":   teamID,
			"userId":   userID,
			"teamName": teamName,
			"userName": userName,
		},
	})
}

// SendMatchNotification sends a match notification to a specific user
func (ns *NotificationService) SendMatchNotification(userID int64, matchedUserName string) error {
	return ns.PublishNotification(NotificationEvent{
		Type:    "match",
		Message: fmt.Sprintf("🎉 Новый мэтч! %s тоже хочет с тобой в команду!", matchedUserName),
		Data: map[string]interface{}{
			"userId":          userID,
			"matchedUserName": matchedUserName,
		},
	})
}

func (ns *NotificationService) NotifyCaseOpened(userID, caseID int64, items []map[string]interface{}) error {
	return ns.PublishNotification(NotificationEvent{
		Type:    "case_opened",
		Message: "You opened a case! Check your inventory for new items.",
		Data: map[string]interface{}{
			"userId": userID,
			"caseId": caseID,
			"items":  items,
		},
	})
}

func (ns *NotificationService) NotifyHackathonAnnouncement(hackathonID int64, title, message string) error {
	return ns.PublishNotification(NotificationEvent{
		Type:    "hackathon_announcement",
		Message: fmt.Sprintf("📢 %s: %s", title, message),
		Data: map[string]interface{}{
			"hackathonId": hackathonID,
			"title":       title,
			"message":     message,
		},
	})
}
