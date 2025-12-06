package handlers

import (
	"backend/internal/models"
	"backend/internal/repositories"
	"backend/internal/services"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type AuthHandler struct {
	db           *gorm.DB
	redis        *redis.Client
	userRepo     *repositories.UserRepository
	tokenService *services.TokenService
}

func NewAuthHandler(db *gorm.DB, redis *redis.Client) *AuthHandler {
	return &AuthHandler{
		db:           db,
		redis:        redis,
		userRepo:     repositories.NewUserRepository(db),
		tokenService: services.NewTokenService(redis),
	}
}

// ================================================================
//
//	AUTH VIA TOKEN
//
// ================================================================
type AuthRequest struct {
	Token string `json:"token" binding:"required"`
}

type AuthResponse struct {
	FirstLogin bool         `json:"firstLogin"`
	User       *models.User `json:"user,omitempty"`
	TelegramID int64        `json:"telegramUserId,omitempty"`
	Username   string       `json:"username,omitempty"`
}

// POST /api/auth/telegram
func (h *AuthHandler) AuthenticateTelegram(c *gin.Context) {
	var req AuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "token required"})
		return
	}

	// 1. Проверяем токен в Redis
	data, err := h.tokenService.ValidateToken(context.Background(), req.Token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
		return
	}

	telegramID := data.TelegramID
	username := data.Username

	// 2. Проверяем есть ли юзер в БД
	user, err := h.userRepo.GetByTelegramID(c, telegramID)
	if err != nil {
		// user == nil → FIRST LOGIN
		c.JSON(http.StatusOK, AuthResponse{
			FirstLogin: true,
			TelegramID: telegramID,
			Username:   username,
		})
		return
	}

	// 3. user exists → return full user info
	c.JSON(http.StatusOK, AuthResponse{
		FirstLogin: false,
		User:       user,
	})
}

// ================================================================
//
//	REGISTER USER (CREATE AFTER FIRST LOGIN)
//
// ================================================================
type RegisterRequest struct {
	TelegramID int64    `json:"telegramUserId" binding:"required"`
	Username   string   `json:"username" binding:"required"`
	Tags       []string `json:"tags"`
}

func (h *AuthHandler) RegisterUser(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	user, err := h.userRepo.CreateUser(c, req.TelegramID, req.Username, req.Tags)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// ================================================================
//
//	GET USER BY ID
//
// ================================================================
func (h *AuthHandler) GetUser(c *gin.Context) {
	id := c.Param("id")
	user, err := h.userRepo.GetByIDParam(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// ================================================================
//
//	GET ME BY TELEGRAM ID (simple)
//
// ================================================================
func (h *AuthHandler) GetMe(c *gin.Context) {
	telegram := c.Query("telegram_user_id")
	user, err := h.userRepo.GetByTelegramIDParam(c, telegram)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}
