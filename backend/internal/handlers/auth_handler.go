package handlers

import (
	"backend/internal/middleware"
	"backend/internal/repositories"
	"backend/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	userRepo            *repositories.UserRepository
	notificationService *services.NotificationService
}

func NewAuthHandler(notificationService *services.NotificationService) *AuthHandler {
	return &AuthHandler{
		userRepo:            repositories.NewUserRepository(),
		notificationService: notificationService,
	}
}

type TelegramAuthRequest struct {
	Token string `json:"token" binding:"required"`
}

func (h *AuthHandler) AuthenticateTelegram(c *gin.Context) {
	var req TelegramAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	val, err := redisConn.Get(ctx, req.Token).Result()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired token"})
		return
	}

	ans := splitTokenData(val)
	idStr, name, _ := ans[0], ans[1], ans[2]

	telegramUserID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID in token"})
		return
	}

	user, err := h.userRepo.CreateOrUpdate(c.Request.Context(), telegramUserID, name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
		return
	}

	isNewUser := user.CreatedAt == user.UpdatedAt

	c.JSON(http.StatusOK, gin.H{
		"id":             user.ID,
		"telegramUserId": user.TelegramUserID,
		"username":       user.Username,
		"role":           user.Role,
		"isNewUser":      isNewUser,
		"registered":     isNewUser,
	})
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	authCtx, _ := middleware.GetAuthContext(c)

	user, err := h.userRepo.GetByID(c.Request.Context(), authCtx.UserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

type UpdateProfileRequest struct {
	SkillRating *int     `json:"skillRating,omitempty"`
	Tags        []string `json:"tags,omitempty"`
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	authCtx, _ := middleware.GetAuthContext(c)

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.userRepo.UpdateProfile(c.Request.Context(), authCtx.UserID, req.SkillRating, req.Tags)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func (h *AuthHandler) GetUser(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	user, err := h.userRepo.GetByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}
