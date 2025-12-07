package handlers

import (
	"backend/internal/database"
	"backend/internal/middleware"
	"backend/internal/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ============================================
// SWIPE & MATCHING HANDLERS
// ============================================

// GetRecommendationsReal - получить кандидатов для свайпа
func (s *Server) GetRecommendationsReal(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	// Get user's current hackathon
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	if user.CurrentHackathonID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "you must be registered for a hackathon first"})
		return
	}

	hackathonID := *user.CurrentHackathonID

	// Get participants of the same hackathon who are looking for team
	// Exclude: current user, users already swiped, users in same team
	var candidates []models.User

	subQuery := database.DB.
		Table("swipes").
		Select("target_user_id").
		Where("swiper_team_id = ? OR swiper_team_id IN (SELECT id FROM teams WHERE captain_id = ?)", userID, userID)

	err := database.DB.
		Joins("JOIN hackathon_participants hp ON hp.user_id = users.id").
		Where("hp.hackathon_id = ?", hackathonID).
		Where("users.id != ?", userID).
		Where("hp.status = ?", "looking").
		Where("users.id NOT IN (?)", subQuery).
		Limit(20).
		Find(&candidates).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch recommendations"})
		return
	}

	// Build response with profile info
	response := make([]gin.H, len(candidates))
	for i, u := range candidates {
		// Получаем кастомизацию пользователя
		var customization *models.ProfileCustomization
		var profileCustom models.ProfileCustomization
		if err := database.DB.Where("user_id = ?", u.ID).First(&profileCustom).Error; err == nil {
			customization = &profileCustom
		}

		// Собираем данные об экипированных предметах
		var customizationResponse *gin.H
		if customization != nil {
			cr := gin.H{}

			// Загружаем предметы по ID
			if customization.BackgroundID != nil {
				var item models.CustomizationItem
				if err := database.DB.Where("item_id = ?", *customization.BackgroundID).First(&item).Error; err == nil {
					cr["background"] = gin.H{
						"id":     item.ItemID,
						"name":   item.Name,
						"value":  item.Value,
						"rarity": item.Rarity,
					}
				}
			}

			if customization.NameColorID != nil {
				var item models.CustomizationItem
				if err := database.DB.Where("item_id = ?", *customization.NameColorID).First(&item).Error; err == nil {
					cr["nameColor"] = gin.H{
						"id":     item.ItemID,
						"name":   item.Name,
						"value":  item.Value,
						"rarity": item.Rarity,
					}
				}
			}

			if customization.AvatarFrameID != nil {
				var item models.CustomizationItem
				if err := database.DB.Where("item_id = ?", *customization.AvatarFrameID).First(&item).Error; err == nil {
					cr["avatarFrame"] = gin.H{
						"id":     item.ItemID,
						"name":   item.Name,
						"value":  item.Value,
						"rarity": item.Rarity,
					}
				}
			}

			if customization.TitleID != nil {
				var item models.CustomizationItem
				if err := database.DB.Where("item_id = ?", *customization.TitleID).First(&item).Error; err == nil {
					cr["title"] = gin.H{
						"id":     item.ItemID,
						"name":   item.Name,
						"value":  item.Value,
						"rarity": item.Rarity,
					}
				}
			}

			if customization.EffectID != nil {
				var item models.CustomizationItem
				if err := database.DB.Where("item_id = ?", *customization.EffectID).First(&item).Error; err == nil {
					cr["effect"] = gin.H{
						"id":     item.ItemID,
						"name":   item.Name,
						"value":  item.Value,
						"rarity": item.Rarity,
					}
				}
			}

			// Бейджи
			badges := []gin.H{}
			badgeIDs := []*string{customization.Badge1ID, customization.Badge2ID, customization.Badge3ID}
			for _, badgeID := range badgeIDs {
				if badgeID != nil {
					var item models.CustomizationItem
					if err := database.DB.Where("item_id = ?", *badgeID).First(&item).Error; err == nil {
						badges = append(badges, gin.H{
							"id":     item.ItemID,
							"name":   item.Name,
							"value":  item.Value,
							"rarity": item.Rarity,
						})
					}
				}
			}
			if len(badges) > 0 {
				cr["badges"] = badges
			}

			if len(cr) > 0 {
				customizationResponse = &cr
			}
		}

		responseItem := gin.H{
			"id":          u.ID,
			"name":        u.Name,
			"username":    u.Username,
			"bio":         u.Bio,
			"skills":      u.Skills,
			"experience":  u.Experience,
			"lookingFor":  u.LookingFor,
			"skillRating": u.SkillRating,
			"tags":        u.Tags,
			"avatarUrl":   u.AvatarURL,
			"pts":         u.Pts,
			"mmr":         u.Mmr,
		}

		if customizationResponse != nil {
			responseItem["customization"] = customizationResponse
		}

		response[i] = responseItem
	}

	c.JSON(http.StatusOK, response)
}

// SwipeReal - свайп пользователя (like/pass)
func (s *Server) SwipeReal(c *gin.Context) {
	var req struct {
		TargetUserID int64  `json:"targetUserId" binding:"required"`
		Action       string `json:"action" binding:"required"` // "like" or "pass"
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Action != "like" && req.Action != "pass" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "action must be 'like' or 'pass'"})
		return
	}

	userID, _ := middleware.GetUserID(c)

	// Get or create team for the user (captain becomes the team)
	var team models.Team
	err := database.DB.Where("captain_id = ?", userID).First(&team).Error

	var swiperTeamID int64
	if err != nil {
		// User doesn't have a team, use userID as swiperTeamID (solo user)
		swiperTeamID = userID
	} else {
		swiperTeamID = team.ID
	}

	// Check if already swiped
	var existingSwipe models.Swipe
	err = database.DB.
		Where("swiper_team_id = ? AND target_user_id = ?", swiperTeamID, req.TargetUserID).
		First(&existingSwipe).Error

	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "already swiped on this user"})
		return
	}

	// Create swipe
	swipe := models.Swipe{
		SwiperTeamID: swiperTeamID,
		TargetUserID: req.TargetUserID,
		Action:       req.Action,
	}

	if err := database.DB.Create(&swipe).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save swipe"})
		return
	}

	// If "like", check for mutual match
	isMatch := false
	if req.Action == "like" {
		// Check if target user also liked current user/team
		var reverseSwipe models.Swipe
		err = database.DB.
			Where("swiper_team_id = ? AND target_user_id = ? AND action = ?", req.TargetUserID, userID, "like").
			First(&reverseSwipe).Error

		if err == nil {
			// It's a match!
			isMatch = true

			// Create match record
			match := models.Match{
				TeamID: swiperTeamID,
				UserID: req.TargetUserID,
			}
			database.DB.Create(&match)

			// TODO: Send notification to both users via TG bot
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"action":  req.Action,
		"match":   isMatch,
	})
}

// GetMatches - получить список мэтчей
func (s *Server) GetMatches(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var matches []models.Match

	// Get matches where user is either the team captain or the matched user
	err := database.DB.
		Where("team_id = ? OR user_id = ?", userID, userID).
		Find(&matches).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch matches"})
		return
	}

	// Get user details for each match
	response := make([]gin.H, 0)
	for _, m := range matches {
		var matchedUser models.User
		if m.UserID == userID {
			// Find the team captain
			database.DB.Where("id = ?", m.TeamID).First(&matchedUser)
		} else {
			database.DB.Where("id = ?", m.UserID).First(&matchedUser)
		}

		response = append(response, gin.H{
			"id":        m.ID,
			"matchedAt": m.CreatedAt,
			"user": gin.H{
				"id":       matchedUser.ID,
				"name":     matchedUser.Name,
				"username": matchedUser.Username,
				"skills":   matchedUser.Skills,
				"bio":      matchedUser.Bio,
			},
		})
	}

	c.JSON(http.StatusOK, response)
}

// ============================================
// USER PROFILE HANDLERS
// ============================================

// GetMeReal - получить текущего пользователя из БД
func (s *Server) GetMeReal(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":                 user.ID,
		"telegramId":         user.TelegramUserID,
		"username":           user.Username,
		"name":               user.Name,
		"bio":                user.Bio,
		"skills":             user.Skills,
		"experience":         user.Experience,
		"lookingFor":         user.LookingFor,
		"role":               user.Role,
		"profileComplete":    user.ProfileComplete,
		"currentHackathonId": user.CurrentHackathonID,
		"teamId":             user.TeamID,
		"createdAt":          user.CreatedAt,
	})
}

// UpdateProfileReal - обновить профиль пользователя
func (s *Server) UpdateProfileReal(c *gin.Context) {
	var req struct {
		Name       string   `json:"name"`
		Bio        string   `json:"bio"`
		Skills     []string `json:"skills"`
		Experience string   `json:"experience"`
		LookingFor []string `json:"lookingFor"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := middleware.GetUserID(c)

	updates := map[string]interface{}{
		"profile_complete": true,
	}

	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Bio != "" {
		updates["bio"] = req.Bio
	}
	if req.Skills != nil {
		updates["skills"] = req.Skills
	}
	if req.Experience != "" {
		updates["experience"] = req.Experience
	}
	if req.LookingFor != nil {
		updates["looking_for"] = req.LookingFor
	}

	if err := database.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
		return
	}

	// Return updated user
	var user models.User
	database.DB.First(&user, userID)

	c.JSON(http.StatusOK, gin.H{
		"id":              user.ID,
		"name":            user.Name,
		"bio":             user.Bio,
		"skills":          user.Skills,
		"experience":      user.Experience,
		"lookingFor":      user.LookingFor,
		"profileComplete": user.ProfileComplete,
	})
}

// GetUserByID - получить пользователя по ID
func (s *Server) GetUserByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         user.ID,
		"name":       user.Name,
		"username":   user.Username,
		"bio":        user.Bio,
		"skills":     user.Skills,
		"experience": user.Experience,
	})
}

// GetAllUsersReal - получить всех пользователей (admin)
func (s *Server) GetAllUsersReal(c *gin.Context) {
	var users []models.User
	if err := database.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, users)
}

// GetAdminStatsReal - получить статистику (admin)
func (s *Server) GetAdminStatsReal(c *gin.Context) {
	var totalUsers int64
	var totalTeams int64
	var totalHackathons int64
	var activeHackathons int64

	database.DB.Model(&models.User{}).Count(&totalUsers)
	database.DB.Model(&models.Team{}).Count(&totalTeams)
	database.DB.Model(&models.Hackathon{}).Count(&totalHackathons)
	database.DB.Model(&models.Hackathon{}).
		Where("status IN ?", []string{"registration_open", "active"}).
		Count(&activeHackathons)

	var usersLooking int64
	database.DB.Model(&models.HackathonParticipant{}).
		Where("status = ?", "looking").
		Count(&usersLooking)

	c.JSON(http.StatusOK, gin.H{
		"totalUsers":          totalUsers,
		"totalTeams":          totalTeams,
		"totalHackathons":     totalHackathons,
		"activeHackathons":    activeHackathons,
		"usersLookingForTeam": usersLooking,
		"usersInTeam":         totalUsers - usersLooking,
	})
}
