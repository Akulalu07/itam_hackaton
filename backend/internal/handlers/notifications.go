package handlers

import (
	"backend/internal/types"
	"context"
	"encoding/json"
	"fmt"
	"net/http"

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
