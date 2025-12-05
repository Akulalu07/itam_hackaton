package middleware

import (
	"backend/internal/models"
	"backend/internal/repositories"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AuthContext struct {
	UserID int64
	Role   models.UserRole
}

const AuthContextKey = "auth_context"

func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		telegramUserIDStr := c.GetHeader("X-Telegram-User-ID")
		if telegramUserIDStr == "" {
			telegramUserIDStr = c.Query("telegram_user_id")
		}

		if telegramUserIDStr == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "telegram_user_id required"})
			c.Abort()
			return
		}

		telegramUserID, err := strconv.ParseInt(telegramUserIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid telegram_user_id"})
			c.Abort()
			return
		}

		userRepo := repositories.NewUserRepository()
		user, err := userRepo.GetByTelegramID(c.Request.Context(), telegramUserID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
			c.Abort()
			return
		}

		if !user.Authorized {
			c.JSON(http.StatusForbidden, gin.H{"error": "user not authorized"})
			c.Abort()
			return
		}

		authCtx := &AuthContext{
			UserID: user.ID,
			Role:   user.Role,
		}

		c.Set(AuthContextKey, authCtx)
		c.Next()
	}
}

func RequireRole(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authCtx, exists := c.Get(AuthContextKey)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
			c.Abort()
			return
		}

		ctx := authCtx.(*AuthContext)

		hasPermission := false
		requiredRoleEnum := models.UserRole(requiredRole)
		switch requiredRoleEnum {
		case models.RoleAdmin:
			hasPermission = ctx.Role == models.RoleAdmin
		case models.RoleHackathonCreator:
			hasPermission = ctx.Role == models.RoleAdmin || ctx.Role == models.RoleHackathonCreator
		case models.RoleUser:
			hasPermission = true // All authenticated users
		}

		if !hasPermission {
			c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func GetAuthContext(c *gin.Context) (*AuthContext, bool) {
	authCtx, exists := c.Get(AuthContextKey)
	if !exists {
		return nil, false
	}
	return authCtx.(*AuthContext), true
}
