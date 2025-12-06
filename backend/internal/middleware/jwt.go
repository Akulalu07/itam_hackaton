package middleware

import (
	"errors"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// ============================================
// JWT CLAIMS
// ============================================

// JWTClaims - структура claims для JWT токена
type JWTClaims struct {
	UserID     int64  `json:"user_id"`
	TelegramID int64  `json:"telegram_id"`
	Role       string `json:"role"`
	jwt.RegisteredClaims
}

// ============================================
// JWT UTILITIES
// ============================================

var jwtSecret []byte

func init() {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "itam-hackaton-default-secret-change-in-production"
	}
	jwtSecret = []byte(secret)
}

// GenerateToken - создаёт новый JWT токен
func GenerateToken(userID, telegramID int64, role string) (string, error) {
	claims := JWTClaims{
		UserID:     userID,
		TelegramID: telegramID,
		Role:       role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)), // 24 часа
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "itam-hackaton",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// GenerateRefreshToken - создаёт refresh токен (7 дней)
func GenerateRefreshToken(userID int64) (string, error) {
	claims := jwt.RegisteredClaims{
		Subject:   string(rune(userID)),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		Issuer:    "itam-hackaton-refresh",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// ValidateToken - валидирует JWT токен и возвращает claims
func ValidateToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Проверяем алгоритм подписи
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// ============================================
// GIN MIDDLEWARE
// ============================================

// JWTAuthMiddleware - middleware для проверки JWT токена
// Перехватывает все запросы и проверяет Authorization: Bearer <token>
func JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Получаем Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "unauthorized",
				"message": "Authorization header required",
			})
			c.Abort()
			return
		}

		// Проверяем формат "Bearer <token>"
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "unauthorized",
				"message": "Invalid authorization format. Use: Bearer <token>",
			})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Валидируем токен
		claims, err := ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "unauthorized",
				"message": "Invalid or expired token",
				"detail":  err.Error(),
			})
			c.Abort()
			return
		}

		// Сохраняем claims в контекст для использования в handlers
		c.Set("user_id", claims.UserID)
		c.Set("telegram_id", claims.TelegramID)
		c.Set("user_role", claims.Role)
		c.Set("jwt_claims", claims)

		c.Next()
	}
}

// OptionalJWTAuthMiddleware - опциональная проверка JWT (не блокирует запрос)
func OptionalJWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.Next()
			return
		}

		claims, err := ValidateToken(parts[1])
		if err == nil {
			c.Set("user_id", claims.UserID)
			c.Set("telegram_id", claims.TelegramID)
			c.Set("user_role", claims.Role)
			c.Set("jwt_claims", claims)
		}

		c.Next()
	}
}

// RequireRoleMiddleware - middleware для проверки роли пользователя
func RequireRoleMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "unauthorized",
				"message": "Authentication required",
			})
			c.Abort()
			return
		}

		userRole := role.(string)

		// Проверяем, есть ли роль пользователя в списке разрешённых
		allowed := false
		for _, r := range allowedRoles {
			if userRole == r {
				allowed = true
				break
			}
		}

		// Admin всегда имеет доступ
		if userRole == "admin" {
			allowed = true
		}

		if !allowed {
			c.JSON(http.StatusForbidden, gin.H{
				"error":          "forbidden",
				"message":        "Insufficient permissions",
				"required_roles": allowedRoles,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// GetUserID - получить UserID из контекста
func GetUserID(c *gin.Context) (int64, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}
	return userID.(int64), true
}

// GetTelegramID - получить TelegramID из контекста
func GetTelegramID(c *gin.Context) (int64, bool) {
	telegramID, exists := c.Get("telegram_id")
	if !exists {
		return 0, false
	}
	return telegramID.(int64), true
}

// GetUserRole - получить роль пользователя из контекста
func GetUserRole(c *gin.Context) (string, bool) {
	role, exists := c.Get("user_role")
	if !exists {
		return "", false
	}
	return role.(string), true
}

// GetJWTClaims - получить все claims из контекста
func GetJWTClaims(c *gin.Context) (*JWTClaims, bool) {
	claims, exists := c.Get("jwt_claims")
	if !exists {
		return nil, false
	}
	return claims.(*JWTClaims), true
}
