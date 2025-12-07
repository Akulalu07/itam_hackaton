package handlers

import (
	"backend/internal/database"
	"backend/internal/models"
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

	user, err := database.CreateUser(ctx, req.TelegramUserID, req.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to register user",
		})
		return
	}

	// Выдаём стартовый набор новому пользователю
	if !exists {
		// Стартовый кейс
		starterCase := models.UserCase{
			UserID:   user.ID,
			CaseType: "starter",
			CaseName: "Стартовый набор",
			Rarity:   models.RarityUncommon,
			IsOpened: false,
		}
		database.DB.Create(&starterCase)

		// Стартовые предметы кастомизации
		starterItems := []models.CustomizationItem{
			{
				UserID:   user.ID,
				ItemID:   "bg-default",
				ItemType: models.ItemTypeBackground,
				Rarity:   models.RarityCommon,
				Name:     "Стандартный фон",
				Value:    "from-slate-900 to-slate-800",
			},
			{
				UserID:   user.ID,
				ItemID:   "nc-default",
				ItemType: models.ItemTypeNameColor,
				Rarity:   models.RarityCommon,
				Name:     "Белый",
				Value:    "#FFFFFF",
			},
			{
				UserID:   user.ID,
				ItemID:   "badge-participant",
				ItemType: models.ItemTypeBadge,
				Rarity:   models.RarityCommon,
				Name:     "Участник",
				Value:    "🎯",
			},
		}
		for _, item := range starterItems {
			database.DB.Create(&item)
		}
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
