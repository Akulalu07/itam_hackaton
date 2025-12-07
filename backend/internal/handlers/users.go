package handlers

import (
	"backend/internal/database"
	"backend/internal/types"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

// registerUser godoc
// @Summary Register a new user
// @Description Registers a Telegram user in the database
// @Tags users
// @Accept json
// @Produce json
// @Param input body types.RegisterUserRequest true "User registration data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/user/register [post]
func registerUser(c *gin.Context) {
	var req types.RegisterUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx := context.Background()

	exists, err := database.UserExists(ctx, req.TelegramUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to check user existence",
		})
		return
	}

	_, err = database.CreateUser(ctx, req.TelegramUserID, req.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to register user",
		})
		return
	}

	response := gin.H{
		"status":    "success",
		"isNewUser": !exists,
	}

	c.JSON(http.StatusOK, response)
}

// getAuthorizedUsers godoc
// @Summary Get all authorized users
// @Description Returns a list of all authorized Telegram users
// @Tags users
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/users/authorized [get]
func getAuthorizedUsers(c *gin.Context) {
	ctx := context.Background()

	users, err := database.GetAllAuthorizedUsers(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get users",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users": users,
	})
}
