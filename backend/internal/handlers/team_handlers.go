package handlers

import (
	"backend/internal/database"
	"backend/internal/middleware"
	"backend/internal/models"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ============================================
// TEAM HANDLERS
// ============================================

// GetTeamsReal - получить все команды для текущего хакатона
func (s *Server) GetTeamsReal(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	// Get user's current hackathon
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	var teams []models.Team
	query := database.DB

	if user.CurrentHackathonID != nil {
		query = query.Where("hackathon_id = ?", *user.CurrentHackathonID)
	}

	if err := query.Find(&teams).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch teams"})
		return
	}

	// Build response with members
	response := make([]gin.H, len(teams))
	for i, team := range teams {
		// Get members
		var members []models.User
		database.DB.Where("team_id = ?", team.ID).Find(&members)

		// Get captain
		var captain models.User
		database.DB.First(&captain, team.CaptainID)

		response[i] = gin.H{
			"id":          team.ID,
			"name":        team.Name,
			"description": team.Description,
			"hackathonId": team.HackathonID,
			"captainId":   team.CaptainID,
			"status":      team.Status,
			"inviteCode":  team.InviteCode,
			"captain":     captain,
			"members":     members,
			"createdAt":   team.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, response)
}

// GetMyTeamReal - получить команду текущего пользователя
func (s *Server) GetMyTeamReal(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	var team models.Team
	var found bool

	if user.TeamID != nil {
		if err := database.DB.First(&team, *user.TeamID).Error; err == nil {
			found = true
		}
	}

	if !found {
		// Check if user is a captain
		if err := database.DB.Where("captain_id = ?", userID).First(&team).Error; err != nil {
			c.JSON(http.StatusOK, nil)
			return
		}
	}

	// Get members
	var members []models.User
	database.DB.Where("team_id = ?", team.ID).Find(&members)

	// Get captain
	var captain models.User
	database.DB.First(&captain, team.CaptainID)

	c.JSON(http.StatusOK, gin.H{
		"id":          team.ID,
		"name":        team.Name,
		"description": team.Description,
		"hackathonId": team.HackathonID,
		"captainId":   team.CaptainID,
		"status":      team.Status,
		"inviteCode":  team.InviteCode,
		"captain":     captain,
		"members":     members,
		"createdAt":   team.CreatedAt,
	})
}

// CreateTeamReal - создать команду
func (s *Server) CreateTeamReal(c *gin.Context) {
	var req struct {
		Name        string `json:"name" binding:"required"`
		HackathonID int64  `json:"hackathonId" binding:"required"`
		Description string `json:"description"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := middleware.GetUserID(c)

	// Check if user already has a team for this hackathon
	var existingTeam models.Team
	err := database.DB.Where("captain_id = ? AND hackathon_id = ?", userID, req.HackathonID).First(&existingTeam).Error
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "you already have a team for this hackathon"})
		return
	}

	// Generate invite code
	inviteCode := generateInviteCode()

	team := models.Team{
		Name:        req.Name,
		HackathonID: req.HackathonID,
		CaptainID:   userID,
		InviteCode:  &inviteCode,
		Status:      models.TeamStatusLooking,
	}

	if req.Description != "" {
		team.Description = &req.Description
	}

	if err := database.DB.Create(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create team"})
		return
	}

	// Update user's team_id
	database.DB.Model(&models.User{}).Where("id = ?", userID).Update("team_id", team.ID)

	// Update hackathon participant status
	database.DB.Model(&models.HackathonParticipant{}).
		Where("user_id = ? AND hackathon_id = ?", userID, req.HackathonID).
		Update("status", "in_team")

	c.JSON(http.StatusCreated, team)
}

// UpdateTeamReal - обновить команду
func (s *Server) UpdateTeamReal(c *gin.Context) {
	teamID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid team ID"})
		return
	}

	userID, _ := middleware.GetUserID(c)

	var team models.Team
	if err := database.DB.First(&team, teamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
		return
	}

	// Only captain can update
	if team.CaptainID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only captain can update team"})
		return
	}

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}

	database.DB.Model(&team).Updates(updates)
	database.DB.Preload("Members").First(&team, teamID)

	c.JSON(http.StatusOK, team)
}

// LeaveTeamReal - покинуть команду
func (s *Server) LeaveTeamReal(c *gin.Context) {
	teamID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid team ID"})
		return
	}

	userID, _ := middleware.GetUserID(c)

	var team models.Team
	if err := database.DB.First(&team, teamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
		return
	}

	// Captain can't leave, must delete team
	if team.CaptainID == userID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "captain cannot leave team, transfer ownership first"})
		return
	}

	// Remove from team
	database.DB.Model(&models.User{}).Where("id = ?", userID).Update("team_id", nil)

	// Update hackathon participant status
	database.DB.Model(&models.HackathonParticipant{}).
		Where("user_id = ? AND hackathon_id = ?", userID, team.HackathonID).
		Update("status", "looking")

	c.JSON(http.StatusOK, gin.H{"message": "left team successfully"})
}

// KickMemberReal - удалить участника из команды
func (s *Server) KickMemberReal(c *gin.Context) {
	teamID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid team ID"})
		return
	}

	var req struct {
		UserID int64 `json:"userId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := middleware.GetUserID(c)

	var team models.Team
	if err := database.DB.First(&team, teamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
		return
	}

	// Only captain can kick
	if team.CaptainID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only captain can kick members"})
		return
	}

	// Can't kick yourself
	if req.UserID == userID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot kick yourself"})
		return
	}

	// Remove from team
	database.DB.Model(&models.User{}).Where("id = ? AND team_id = ?", req.UserID, teamID).Update("team_id", nil)

	// Update hackathon participant status
	database.DB.Model(&models.HackathonParticipant{}).
		Where("user_id = ? AND hackathon_id = ?", req.UserID, team.HackathonID).
		Update("status", "looking")

	c.JSON(http.StatusOK, gin.H{"message": "member kicked"})
}

// UpdateTeamStatusReal - обновить статус команды
func (s *Server) UpdateTeamStatusReal(c *gin.Context) {
	teamID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid team ID"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := middleware.GetUserID(c)

	var team models.Team
	if err := database.DB.First(&team, teamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
		return
	}

	if team.CaptainID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only captain can update team status"})
		return
	}

	// Validate status
	validStatuses := []string{"looking", "ready", "closed"}
	isValid := false
	for _, s := range validStatuses {
		if s == req.Status {
			isValid = true
			break
		}
	}

	if !isValid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status"})
		return
	}

	database.DB.Model(&team).Update("status", req.Status)

	c.JSON(http.StatusOK, gin.H{"status": req.Status})
}

// GenerateInviteLinkReal - сгенерировать ссылку-приглашение
func (s *Server) GenerateInviteLinkReal(c *gin.Context) {
	teamID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid team ID"})
		return
	}

	userID, _ := middleware.GetUserID(c)

	var team models.Team
	if err := database.DB.First(&team, teamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
		return
	}

	if team.CaptainID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only captain can generate invite link"})
		return
	}

	// Generate new code
	code := generateInviteCode()
	database.DB.Model(&team).Update("invite_code", code)

	c.JSON(http.StatusOK, gin.H{
		"link":   "https://t.me/itam_hack_bot?start=join_" + code,
		"code":   code,
		"teamId": teamID,
	})
}

// JoinTeamByCodeReal - присоединиться к команде по коду
func (s *Server) JoinTeamByCodeReal(c *gin.Context) {
	var req struct {
		Code string `json:"code" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := middleware.GetUserID(c)

	// Find team by code
	var team models.Team
	if err := database.DB.Where("invite_code = ?", req.Code).First(&team).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "invalid invite code"})
		return
	}

	// Check if team is open
	if team.Status == models.TeamStatusClosed {
		c.JSON(http.StatusBadRequest, gin.H{"error": "team is not accepting new members"})
		return
	}

	// Check team size
	var memberCount int64
	database.DB.Model(&models.User{}).Where("team_id = ?", team.ID).Count(&memberCount)

	// Get hackathon to check max team size
	var hackathon models.Hackathon
	database.DB.First(&hackathon, team.HackathonID)

	if int(memberCount) >= hackathon.TeamSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "team is full"})
		return
	}

	// Add user to team
	database.DB.Model(&models.User{}).Where("id = ?", userID).Update("team_id", team.ID)

	// Update hackathon participant status
	database.DB.Model(&models.HackathonParticipant{}).
		Where("user_id = ? AND hackathon_id = ?", userID, team.HackathonID).
		Update("status", "in_team")

	c.JSON(http.StatusOK, gin.H{
		"message": "joined team successfully",
		"team":    team,
	})
}

// Helper function
func generateInviteCode() string {
	bytes := make([]byte, 4)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}
