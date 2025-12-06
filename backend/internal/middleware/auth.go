package middleware

import (
	"backend/internal/models"
	"backend/internal/repositories"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthContext struct {
	UserID int64
	Role   models.UserRole
}

const AuthContextKey = "auth_context"

// RequireAuth — проверяет Telegram ID + достаёт юзера
func RequireAuth(db *gorm.DB) gin.HandlerFunc {
	userRepo := repositories.NewUserRepository(db)

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

		c.Set(AuthContextKey, &AuthContext{
			UserID: user.ID,
			Role:   user.Role,
		})

		c.Next()
	}
}

// RequireRole — RBAC
func RequireRole(required models.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth, ok := GetAuthContext(c)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
			c.Abort()
			return
		}

		switch required {
		case models.RoleAdmin:
			if auth.Role != models.RoleAdmin {
				c.JSON(http.StatusForbidden, gin.H{"error": "admin role required"})
				c.Abort()
				return
			}
		case models.RoleHackathonCreator:
			if auth.Role != models.RoleAdmin && auth.Role != models.RoleHackathonCreator {
				c.JSON(http.StatusForbidden, gin.H{"error": "hackathon_creator role required"})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}

func GetAuthContext(c *gin.Context) (*AuthContext, bool) {
	auth, ok := c.Get(AuthContextKey)
	if !ok {
		return nil, false
	}
	return auth.(*AuthContext), true
}
