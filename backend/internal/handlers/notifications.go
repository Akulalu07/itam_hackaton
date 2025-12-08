package handlers

import (
	"backend/internal/database"
	"backend/internal/middleware"
	"backend/internal/models"
	"backend/internal/types"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// sendNotification godoc
// @Summary Send notification to all users
// @Description Sends a notification message to all authenticated users via Redis Streams
// @Tags notifications
// @Accept json
// @Produce json
// @Param input body types.NotificationRequest true "Notification"
// @Success 200 {object} map[string]interface{}
// @Router /api/notification [post]
func sendNotification(c *gin.Context) {
	var req types.NotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	if req.Type == "" && req.Message == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "message is required",
		})
		return
	}

	go writeToNotificationStream(req)

	c.JSON(http.StatusOK, gin.H{
		"status": "notification queued",
	})
}

func writeToNotificationStream(req types.NotificationRequest) {
	ctx := context.Background()
	streamName := "notifications"

	notificationData := map[string]interface{}{
		"message": req.Message,
	}

	if req.Type != "" {
		notificationData["type"] = req.Type
	}

	if req.Data != nil {
		for k, v := range req.Data {
			notificationData[k] = v
		}
	}

	jsonData, err := json.Marshal(notificationData)
	if err != nil {
		fmt.Printf("Error marshaling notification: %v\n", err)
		return
	}

	args := redis.XAddArgs{
		Stream: streamName,
		Values: map[string]interface{}{
			"data": string(jsonData),
		},
	}

	_, err = redisConn.XAdd(ctx, &args).Result()
	if err != nil {
		fmt.Printf("Error writing to Redis Stream: %v\n", err)
		return
	}

	fmt.Printf("Notification written to stream: %s\n", string(jsonData))
}

// GetMyNotifications - получить уведомления текущего пользователя
func (s *Server) GetMyNotifications(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	// Опциональные параметры
	unreadOnly := c.Query("unread") == "true"
	limitStr := c.DefaultQuery("limit", "50")
	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	query := database.DB.Where("user_id = ?", userID)
	if unreadOnly {
		query = query.Where("is_read = ?", false)
	}

	var notifications []models.Notification
	if err := query.Order("created_at DESC").Limit(limit).Find(&notifications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch notifications"})
		return
	}

	// Подсчёт непрочитанных
	var unreadCount int64
	database.DB.Model(&models.Notification{}).Where("user_id = ? AND is_read = ?", userID, false).Count(&unreadCount)

	response := make([]gin.H, len(notifications))
	for i, n := range notifications {
		response[i] = gin.H{
			"id":        n.ID,
			"type":      n.Type,
			"title":     n.Title,
			"message":   n.Message,
			"data":      n.Data,
			"isRead":    n.IsRead,
			"createdAt": n.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"notifications": response,
		"unreadCount":   unreadCount,
	})
}

// MarkNotificationRead - отметить уведомление прочитанным
func (s *Server) MarkNotificationRead(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	notifID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid notification ID"})
		return
	}

	var notif models.Notification
	if err := database.DB.Where("id = ? AND user_id = ?", notifID, userID).First(&notif).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "notification not found"})
		return
	}

	if err := database.DB.Model(&notif).Update("is_read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to mark as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// MarkAllNotificationsRead - отметить все уведомления прочитанными
func (s *Server) MarkAllNotificationsRead(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	if err := database.DB.Model(&models.Notification{}).Where("user_id = ? AND is_read = ?", userID, false).Update("is_read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to mark all as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetUnreadCount - получить количество непрочитанных уведомлений
func (s *Server) GetUnreadCount(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var count int64
	database.DB.Model(&models.Notification{}).Where("user_id = ? AND is_read = ?", userID, false).Count(&count)

	c.JSON(http.StatusOK, gin.H{"count": count})
}

// sendJoinRequestNotification - отправить уведомление капитану о запросе на вступление
func (s *Server) sendJoinRequestNotification(team models.Team, requestingUser models.User, captain models.User, requestID int64) {
	// Create notification in DB
	data, _ := json.Marshal(models.NotificationData{
		TeamID:       &team.ID,
		FromUserID:   &requestingUser.ID,
		FromUserName: requestingUser.Name,
		TeamName:     team.Name,
	})

	notification := models.Notification{
		UserID:  captain.ID,
		Type:    models.NotificationTypeTeamRequest,
		Title:   "Запрос на вступление в команду",
		Message: fmt.Sprintf("%s хочет вступить в вашу команду \"%s\"", requestingUser.Name, team.Name),
		Data:    data,
		IsRead:  false,
	}
	database.DB.Create(&notification)

	// Send to Telegram via Redis Stream
	go writeToNotificationStream(types.NotificationRequest{
		Type:    "join_request",
		Message: fmt.Sprintf("🔔 %s хочет вступить в вашу команду \"%s\"", requestingUser.Name, team.Name),
		Data: map[string]interface{}{
			"targetUserId": captain.TelegramUserID,
			"teamId":       team.ID,
			"teamName":     team.Name,
			"userId":       requestingUser.ID,
			"userName":     requestingUser.Name,
			"requestId":    requestID,
		},
	})
}

// sendRequestResponseNotification - отправить уведомление пользователю о решении по запросу
func (s *Server) sendRequestResponseNotification(team models.Team, user models.User, accepted bool) {
	var notifType models.NotificationType
	var title, message string
	var notificationTypeStr string

	if accepted {
		notifType = models.NotificationTypeTeamAccepted
		title = "Запрос одобрен!"
		message = fmt.Sprintf("Поздравляем! Вы приняты в команду \"%s\"", team.Name)
		notificationTypeStr = "team_accepted"
	} else {
		notifType = models.NotificationTypeTeamRejected
		title = "Запрос отклонён"
		message = fmt.Sprintf("К сожалению, ваш запрос на вступление в команду \"%s\" был отклонён", team.Name)
		notificationTypeStr = "team_rejected"
	}

	data, _ := json.Marshal(models.NotificationData{
		TeamID:   &team.ID,
		TeamName: team.Name,
	})

	notification := models.Notification{
		UserID:  user.ID,
		Type:    notifType,
		Title:   title,
		Message: message,
		Data:    data,
		IsRead:  false,
	}
	database.DB.Create(&notification)

	// Send to Telegram via Redis Stream
	var emoji string
	if accepted {
		emoji = "✅"
	} else {
		emoji = "❌"
	}

	go writeToNotificationStream(types.NotificationRequest{
		Type:    notificationTypeStr,
		Message: fmt.Sprintf("%s %s", emoji, message),
		Data: map[string]interface{}{
			"targetUserId": user.TelegramUserID,
			"teamId":       team.ID,
			"teamName":     team.Name,
			"accepted":     accepted,
		},
	})
}

// GetNotificationSettings - получить настройки уведомлений пользователя
func (s *Server) GetNotificationSettings(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"notificationsEnabled": user.NotificationsEnabled,
	})
}

// UpdateNotificationSettings - обновить настройки уведомлений
func (s *Server) UpdateNotificationSettings(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var req struct {
		NotificationsEnabled bool `json:"notificationsEnabled"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	if err := database.DB.Model(&user).Update("notifications_enabled", req.NotificationsEnabled).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":              true,
		"notificationsEnabled": req.NotificationsEnabled,
	})
}

// UpdateNotificationSettingsByTelegramID - обновить настройки по Telegram ID (для бота)
func UpdateNotificationSettingsByTelegramID(telegramID int64, enabled bool) error {
	var user models.User
	if err := database.DB.Where("telegram_user_id = ?", telegramID).First(&user).Error; err != nil {
		return err
	}

	return database.DB.Model(&user).Update("notifications_enabled", enabled).Error
}

// GetNotificationSettingsByTelegramID - получить настройки по Telegram ID (для бота)
func GetNotificationSettingsByTelegramID(telegramID int64) (bool, error) {
	var user models.User
	if err := database.DB.Where("telegram_user_id = ?", telegramID).First(&user).Error; err != nil {
		return false, err
	}
	return user.NotificationsEnabled, nil
}

// getBotNotificationSettings - HTTP handler для получения настроек через Telegram ID
func getBotNotificationSettings(c *gin.Context) {
	telegramIDStr := c.Param("telegramId")
	telegramID, err := strconv.ParseInt(telegramIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid telegram ID"})
		return
	}

	var user models.User
	if err := database.DB.Where("telegram_user_id = ?", telegramID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found", "exists": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"exists":               true,
		"notificationsEnabled": user.NotificationsEnabled,
		"username":             user.Username,
		"name":                 user.Name,
	})
}

// updateBotNotificationSettings - HTTP handler для обновления настроек через Telegram ID
func updateBotNotificationSettings(c *gin.Context) {
	telegramIDStr := c.Param("telegramId")
	telegramID, err := strconv.ParseInt(telegramIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid telegram ID"})
		return
	}

	var req struct {
		Enabled bool `json:"enabled"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("telegram_user_id = ?", telegramID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	if err := database.DB.Model(&user).Update("notifications_enabled", req.Enabled).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":              true,
		"notificationsEnabled": req.Enabled,
	})
}

// sendTeamInviteNotification - отправить уведомление пользователю о приглашении в команду
func (s *Server) sendTeamInviteNotification(team models.Team, inviter models.User, invitedUser models.User, inviteID int64) {
	// Create notification in DB
	data, _ := json.Marshal(models.NotificationData{
		TeamID:       &team.ID,
		FromUserID:   &inviter.ID,
		FromUserName: inviter.Name,
		TeamName:     team.Name,
	})

	notification := models.Notification{
		UserID:  invitedUser.ID,
		Type:    models.NotificationTypeTeamInvite,
		Title:   "Приглашение в команду",
		Message: fmt.Sprintf("%s приглашает вас в команду \"%s\"", inviter.Name, team.Name),
		Data:    data,
		IsRead:  false,
	}
	database.DB.Create(&notification)

	// Check if user has notifications enabled
	if !invitedUser.NotificationsEnabled || invitedUser.TelegramUserID == 0 {
		return
	}

	// Send to Telegram via Redis Stream
	writeToNotificationStream(types.NotificationRequest{
		Type:    "team_invite",
		Message: fmt.Sprintf("📨 %s приглашает вас в команду \"%s\"", inviter.Name, team.Name),
		Data: map[string]interface{}{
			"targetUserId": invitedUser.TelegramUserID,
			"teamId":       team.ID,
			"teamName":     team.Name,
			"inviterId":    inviter.ID,
			"inviterName":  inviter.Name,
			"inviteId":     inviteID,
		},
	})
}

// sendInviteResponseNotification - отправить уведомление инвайтеру о решении приглашённого
func (s *Server) sendInviteResponseNotification(team models.Team, invitedUser models.User, inviter models.User, accepted bool) {
	var notifType models.NotificationType
	var title, message string
	var notificationTypeStr string
	var emoji string

	if accepted {
		notifType = models.NotificationTypeTeamAccepted
		title = "Приглашение принято!"
		message = fmt.Sprintf("%s принял(а) приглашение и присоединился к команде \"%s\"", invitedUser.Name, team.Name)
		notificationTypeStr = "invite_accepted"
		emoji = "✅"
	} else {
		notifType = models.NotificationTypeTeamRejected
		title = "Приглашение отклонено"
		message = fmt.Sprintf("%s отклонил(а) приглашение в команду \"%s\"", invitedUser.Name, team.Name)
		notificationTypeStr = "invite_rejected"
		emoji = "❌"
	}

	data, _ := json.Marshal(models.NotificationData{
		TeamID:       &team.ID,
		FromUserID:   &invitedUser.ID,
		FromUserName: invitedUser.Name,
		TeamName:     team.Name,
	})

	notification := models.Notification{
		UserID:  inviter.ID,
		Type:    notifType,
		Title:   title,
		Message: message,
		Data:    data,
		IsRead:  false,
	}
	database.DB.Create(&notification)

	// Check if inviter has notifications enabled
	if !inviter.NotificationsEnabled || inviter.TelegramUserID == 0 {
		return
	}

	// Send to Telegram via Redis Stream
	writeToNotificationStream(types.NotificationRequest{
		Type:    notificationTypeStr,
		Message: fmt.Sprintf("%s %s", emoji, message),
		Data: map[string]interface{}{
			"targetUserId": inviter.TelegramUserID,
			"teamId":       team.ID,
			"teamName":     team.Name,
			"userId":       invitedUser.ID,
			"userName":     invitedUser.Name,
		},
	})
}
