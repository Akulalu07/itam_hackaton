package handlers

import (
	"backend/internal/database"
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
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	val, err := redisConn.Get(ctx, req.Token).Result()
	if err != nil {
		fmt.Println("Maybe you don't get this token")
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
	if isNewUser {
		if err := database.CreateUser(ctx, telegramUserID, name); err != nil {
			fmt.Printf("Error creating user: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to register user",
			})
			return
		}
		fmt.Printf("New user registered: %d (%s)\n", telegramUserID, name)
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         idStr,
		"name":       name,
		"time":       time,
		"isNewUser":  isNewUser,
		"registered": isNewUser,
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
