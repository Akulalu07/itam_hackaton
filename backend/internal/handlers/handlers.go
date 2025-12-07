package handlers

import (
	"backend/internal/database"
	"backend/internal/middleware"
	"backend/internal/types"
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// takeToken godoc
// @Summary Takes Telegram token
// @Description Validate tg token, register user if new, and return login result
// @Tags auth
// @Accept json
// @Produce json
// @Param input body types.Token true "Token"
// @Success 200 {object} map[string]interface{} "Returns user info with isNewUser and registered flags"
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/token [post]
func takeToken(c *gin.Context) {
	var req types.Token
	if err := c.ShouldBindBodyWithJSON(&req); err != nil {
		fmt.Printf("Token bind error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	fmt.Printf("Received token: '%s' (len=%d)\n", req.Token, len(req.Token))

	val, err := redisConn.Get(c.Request.Context(), req.Token).Result()
	if err != nil {
		fmt.Printf("Redis GET error for token '%s': %v\n", req.Token, err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid or expired token",
		})
		return
	}

	ans := splitTokenData(val)
	idStr, name, time := ans[0], ans[1], ans[2]
	fmt.Println("Token time:", time)

	telegramUserID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID in token",
		})
		return
	}

	ctx := context.Background()
	userExists, err := database.UserExists(ctx, telegramUserID)
	if err != nil {
		fmt.Printf("Error checking user existence: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to check user",
		})
		return
	}

	isNewUser := !userExists
	
	// Создаём или получаем пользователя
	user, err := database.CreateUser(ctx, telegramUserID, name)
	if err != nil {
		fmt.Printf("Error creating/getting user: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to register user",
		})
		return
	}
	if isNewUser {
		fmt.Printf("New user registered: %d (%s) with ID: %d\n", telegramUserID, name, user.ID)
	}

	// Delete the token from Redis after successful use
	redisConn.Del(ctx, req.Token)

	// Generate JWT token for the user - используем реальный ID из базы!
	jwtToken, err := middleware.GenerateToken(user.ID, telegramUserID, string(user.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate auth token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":      jwtToken,
		"id":         idStr,
		"name":       name,
		"isNewUser":  isNewUser,
		"registered": isNewUser,
		"user": gin.H{
			"id":              user.ID,
			"telegramId":      telegramUserID,
			"name":            user.Name,
			"role":            user.Role,
			"profileComplete": user.ProfileComplete,
			"skills":          user.Skills,
			"bio":             user.Bio,
			"experience":      user.Experience,
			"pts":             user.Pts,
			"mmr":             user.Mmr,
		},
	})
}

// adminLogin godoc
// @Summary      Admin login
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        input  body      types.LoginAdmin  true  "Admin credentials"
// @Success      200    {object}  map[string]interface{}
// @Failure      400    {object}  map[string]interface{}  "Bad request"
// @Failure      401    {object}  map[string]interface{}  "Invalid credentials"
// @Router       /admin/api/login [post]
func adminLogin(c *gin.Context) {
	var req types.LoginAdmin

	if err := c.ShouldBindBodyWithJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	if req.UserName == ADMINUSER && req.Password == ADMINPASS {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
		return
	}
	c.JSON(http.StatusUnauthorized, gin.H{
		"error": "Invalid credentials",
	})

}
