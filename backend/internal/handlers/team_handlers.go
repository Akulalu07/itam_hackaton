package handlers

import (
	"backend/internal/database"
	"backend/internal/middleware"
	"backend/internal/models"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ============================================
// HELPER FUNCTIONS
// ============================================

// getTeamMemberCount - получить количество участников команды (включая капитана)
func getTeamMemberCount(teamID int64) (int, error) {
	var count int64
	err := database.DB.Model(&models.User{}).Where("team_id = ?", teamID).Count(&count).Error
	if err != nil {
		return 0, err
	}

	// Проверяем, есть ли капитан в команде по team_id
	var team models.Team
	if err := database.DB.First(&team, teamID).Error; err != nil {
		return 0, err
	}

	// Если капитан не в team_id, добавляем его к счету
	var captain models.User
	if err := database.DB.First(&captain, team.CaptainID).Error; err == nil {
		if captain.TeamID == nil || *captain.TeamID != teamID {
			count++
		}
	}

	return int(count), nil
}

// isUserInTeamForHackathon - проверить, находится ли пользователь в команде для данного хакатона
func isUserInTeamForHackathon(userID int64, hackathonID int64) (bool, *models.Team, error) {
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, nil, nil
		}
		return false, nil, err
	}

	// Проверяем team_id пользователя
	if user.TeamID != nil {
		var team models.Team
		if err := database.DB.First(&team, *user.TeamID).Error; err == nil {
			if team.HackathonID == hackathonID {
				return true, &team, nil
			}
		}
	}

	// Проверяем, является ли пользователь капитаном команды для этого хакатона
	var captainTeam models.Team
	if err := database.DB.Where("captain_id = ? AND hackathon_id = ?", userID, hackathonID).First(&captainTeam).Error; err == nil {
		return true, &captainTeam, nil
	}

	return false, nil, nil
}

// checkTeamCapacity - проверить, есть ли место в команде
func checkTeamCapacity(teamID int64) (bool, int, int, error) {
	var team models.Team
	if err := database.DB.First(&team, teamID).Error; err != nil {
		return false, 0, 0, err
	}

	var hackathon models.Hackathon
	if err := database.DB.First(&hackathon, team.HackathonID).Error; err != nil {
		return false, 0, 0, err
	}

	memberCount, err := getTeamMemberCount(teamID)
	if err != nil {
		return false, 0, 0, err
	}

	return memberCount < hackathon.TeamSize, memberCount, hackathon.TeamSize, nil
}

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
			"memberCount": len(members),
			"background":  team.Background,
			"borderColor": team.BorderColor,
			"nameColor":   team.NameColor,
			"avatarUrl":   team.AvatarUrl,
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

	log.Printf("[GetMyTeamReal] userID=%d, teamID=%v", userID, user.TeamID)

	var team models.Team
	var found bool

	if user.TeamID != nil {
		if err := database.DB.First(&team, *user.TeamID).Error; err == nil {
			found = true
			log.Printf("[GetMyTeamReal] Found team by user.TeamID: %d", team.ID)
		}
	}

	if !found {
		// Check if user is a captain
		if err := database.DB.Where("captain_id = ?", userID).First(&team).Error; err != nil {
			log.Printf("[GetMyTeamReal] No team found for user %d", userID)
			c.JSON(http.StatusOK, nil)
			return
		}
		log.Printf("[GetMyTeamReal] Found team as captain: %d", team.ID)
	}

	// Get members
	var members []models.User
	database.DB.Where("team_id = ?", team.ID).Find(&members)
	log.Printf("[GetMyTeamReal] Members count: %d", len(members))

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
		"memberCount": len(members),
		"background":  team.Background,
		"borderColor": team.BorderColor,
		"nameColor":   team.NameColor,
		"avatarUrl":   team.AvatarUrl,
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

	// Check if user already has a team for this hackathon (as captain)
	var existingTeam models.Team
	err := database.DB.Where("captain_id = ? AND hackathon_id = ?", userID, req.HackathonID).First(&existingTeam).Error
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "you already have a team for this hackathon"})
		return
	}

	// Check if user is already a member of another team for this hackathon
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	if user.TeamID != nil {
		var existingMemberTeam models.Team
		if err := database.DB.First(&existingMemberTeam, *user.TeamID).Error; err == nil {
			if existingMemberTeam.HackathonID == req.HackathonID {
				c.JSON(http.StatusBadRequest, gin.H{"error": "you are already in a team for this hackathon"})
				return
			}
		}
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

	// Используем транзакцию для атомарности операций
	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Update user's team_id
	if err := tx.Model(&models.User{}).Where("id = ?", userID).Update("team_id", team.ID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user team"})
		return
	}

	// Update hackathon participant status
	if err := tx.Model(&models.HackathonParticipant{}).
		Where("user_id = ? AND hackathon_id = ?", userID, req.HackathonID).
		Update("status", "in_team").Error; err != nil {
		// Если запись не найдена, это не критично - пользователь может быть не зарегистрирован
		log.Printf("Warning: failed to update hackathon participant status: %v", err)
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to commit transaction"})
		return
	}

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
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Background  *string `json:"background"`
		BorderColor *string `json:"borderColor"`
		NameColor   *string `json:"nameColor"`
		AvatarUrl   *string `json:"avatarUrl"`
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
	if req.Background != nil {
		updates["background"] = *req.Background
	}
	if req.BorderColor != nil {
		updates["border_color"] = *req.BorderColor
	}
	if req.NameColor != nil {
		updates["name_color"] = *req.NameColor
	}
	if req.AvatarUrl != nil {
		updates["avatar_url"] = *req.AvatarUrl
	}

	database.DB.Model(&team).Updates(updates)
	database.DB.First(&team, teamID)

	// Get members
	var members []models.User
	database.DB.Where("team_id = ?", team.ID).Find(&members)

	c.JSON(http.StatusOK, gin.H{
		"id":          team.ID,
		"name":        team.Name,
		"description": team.Description,
		"hackathonId": team.HackathonID,
		"captainId":   team.CaptainID,
		"status":      team.Status,
		"inviteCode":  team.InviteCode,
		"background":  team.Background,
		"borderColor": team.BorderColor,
		"nameColor":   team.NameColor,
		"avatarUrl":   team.AvatarUrl,
		"members":     members,
		"createdAt":   team.CreatedAt,
	})
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

	// Перезагрузить команду с обновлённым статусом
	database.DB.First(&team, teamID)

	c.JSON(http.StatusOK, team)
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

	// Check if user already in a team for this hackathon
	inTeam, _, err := isUserInTeamForHackathon(userID, team.HackathonID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check user team status"})
		return
	}
	if inTeam {
		c.JSON(http.StatusBadRequest, gin.H{"error": "you are already in a team for this hackathon"})
		return
	}

	// Check team capacity
	hasCapacity, currentCount, maxSize, err := checkTeamCapacity(team.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check team capacity"})
		return
	}
	if !hasCapacity {
		c.JSON(http.StatusBadRequest, gin.H{"error": "team is full", "current": currentCount, "max": maxSize})
		return
	}

	// Используем транзакцию для атомарности операций
	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Add user to team
	if err := tx.Model(&models.User{}).Where("id = ?", userID).Update("team_id", team.ID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to join team"})
		return
	}

	// Update hackathon participant status
	if err := tx.Model(&models.HackathonParticipant{}).
		Where("user_id = ? AND hackathon_id = ?", userID, team.HackathonID).
		Update("status", "in_team").Error; err != nil {
		// Не критично, если запись не найдена
		log.Printf("Warning: failed to update hackathon participant status: %v", err)
	}

	// Cancel other pending invites for this user for this hackathon
	if err := tx.Model(&models.TeamInvite{}).
		Where("invited_user_id = ? AND status = 'pending' AND team_id IN (SELECT id FROM teams WHERE hackathon_id = ?)", userID, team.HackathonID).
		Update("status", "cancelled").Error; err != nil {
		log.Printf("Warning: failed to cancel pending invites: %v", err)
	}

	// Cancel other pending join requests for this user for this hackathon
	var otherTeams []models.Team
	if err := tx.Where("hackathon_id = ?", team.HackathonID).Find(&otherTeams).Error; err == nil {
		for _, t := range otherTeams {
			if err := tx.Model(&models.TeamJoinRequest{}).
				Where("team_id = ? AND user_id = ? AND status = 'pending'", t.ID, userID).
				Update("status", "cancelled").Error; err != nil {
				log.Printf("Warning: failed to cancel join request for team %d: %v", t.ID, err)
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to commit transaction"})
		return
	}

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

// ============================================
// TEAM JOIN REQUESTS
// ============================================

// GetPublicTeams - получить список всех команд хакатона (публичный список для просмотра)
func (s *Server) GetPublicTeams(c *gin.Context) {
	hackathonID := c.Query("hackathonId")
	if hackathonID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "hackathonId required"})
		return
	}

	hid, _ := strconv.ParseInt(hackathonID, 10, 64)

	var teams []models.Team
	if err := database.DB.Where("hackathon_id = ?", hid).Find(&teams).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch teams"})
		return
	}

	// Get hackathon for max team size
	var hackathon models.Hackathon
	database.DB.First(&hackathon, hid)

	response := make([]gin.H, 0, len(teams))
	for _, team := range teams {
		// Get members
		var members []models.User
		database.DB.Where("team_id = ?", team.ID).Find(&members)

		// Get captain
		var captain models.User
		database.DB.First(&captain, team.CaptainID)

		response = append(response, gin.H{
			"id":          team.ID,
			"name":        team.Name,
			"description": team.Description,
			"hackathonId": team.HackathonID,
			"captainId":   team.CaptainID,
			"status":      team.Status,
			"background":  team.Background,
			"borderColor": team.BorderColor,
			"nameColor":   team.NameColor,
			"avatarUrl":   team.AvatarUrl,
			"captain":     captain,
			"members":     members,
			"memberCount": len(members),
			"maxMembers":  hackathon.TeamSize,
			"createdAt":   team.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, response)
}

// RequestJoinTeam - отправить запрос на вступление в команду
func (s *Server) RequestJoinTeam(c *gin.Context) {
	teamID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid team ID"})
		return
	}

	userID, _ := middleware.GetUserID(c)

	var req struct {
		Message string `json:"message"`
	}
	c.ShouldBindJSON(&req)

	// Check if team exists and is open
	var team models.Team
	if err := database.DB.First(&team, teamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
		return
	}

	if team.Status == models.TeamStatusClosed {
		c.JSON(http.StatusBadRequest, gin.H{"error": "team is not accepting new members"})
		return
	}

	// Check team capacity
	hasCapacity, currentCount, maxSize, err := checkTeamCapacity(teamID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check team capacity"})
		return
	}
	if !hasCapacity {
		c.JSON(http.StatusBadRequest, gin.H{"error": "team is full", "current": currentCount, "max": maxSize})
		return
	}

	// Check if already has pending request
	var existingRequest models.TeamJoinRequest
	if err := database.DB.Where("team_id = ? AND user_id = ? AND status = 'pending'", teamID, userID).First(&existingRequest).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "you already have a pending request"})
		return
	}

	// Check if user already in a team for this hackathon
	inTeam, _, err := isUserInTeamForHackathon(userID, team.HackathonID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check user team status"})
		return
	}
	if inTeam {
		c.JSON(http.StatusBadRequest, gin.H{"error": "you are already in a team for this hackathon"})
		return
	}

	// Get user for notification
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	// Create join request
	joinRequest := models.TeamJoinRequest{
		TeamID: teamID,
		UserID: userID,
		Status: "pending",
	}

	if err := database.DB.Create(&joinRequest).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create request"})
		return
	}

	// Send notification to captain
	var captain models.User
	database.DB.First(&captain, team.CaptainID)

	s.sendJoinRequestNotification(team, user, captain, joinRequest.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message":   "request sent",
		"requestId": joinRequest.ID,
	})
}

// GetTeamJoinRequests - получить список запросов на вступление в команду (для капитана)
func (s *Server) GetTeamJoinRequests(c *gin.Context) {
	teamID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid team ID"})
		return
	}

	userID, _ := middleware.GetUserID(c)

	// Check if user is captain
	var team models.Team
	if err := database.DB.First(&team, teamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
		return
	}

	if team.CaptainID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only captain can view requests"})
		return
	}

	// Get pending requests
	var requests []models.TeamJoinRequest
	database.DB.Where("team_id = ? AND status = 'pending'", teamID).Find(&requests)

	response := make([]gin.H, 0, len(requests))
	for _, req := range requests {
		var user models.User
		database.DB.First(&user, req.UserID)

		response = append(response, gin.H{
			"id":        req.ID,
			"userId":    req.UserID,
			"status":    req.Status,
			"user":      user,
			"createdAt": req.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, response)
}

// HandleJoinRequest - принять/отклонить запрос на вступление
func (s *Server) HandleJoinRequest(c *gin.Context) {
	requestID, err := strconv.ParseInt(c.Param("requestId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request ID"})
		return
	}

	var req struct {
		Action string `json:"action" binding:"required"` // accept or reject
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Action != "accept" && req.Action != "reject" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "action must be 'accept' or 'reject'"})
		return
	}

	userID, _ := middleware.GetUserID(c)

	// Get request
	var joinRequest models.TeamJoinRequest
	if err := database.DB.First(&joinRequest, requestID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "request not found"})
		return
	}

	// Get team
	var team models.Team
	database.DB.First(&team, joinRequest.TeamID)

	// Only captain can handle requests
	if team.CaptainID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only captain can handle requests"})
		return
	}

	// Get requesting user
	var requestingUser models.User
	database.DB.First(&requestingUser, joinRequest.UserID)

	if req.Action == "accept" {
		// Check if user already in a team for this hackathon
		inTeam, _, err := isUserInTeamForHackathon(joinRequest.UserID, team.HackathonID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check user team status"})
			return
		}
		if inTeam {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user is already in a team for this hackathon"})
			return
		}

		// Check team capacity
		hasCapacity, currentCount, maxSize, err := checkTeamCapacity(team.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check team capacity"})
			return
		}
		if !hasCapacity {
			c.JSON(http.StatusBadRequest, gin.H{"error": "team is full", "current": currentCount, "max": maxSize})
			return
		}

		// Используем транзакцию для атомарности операций
		tx := database.DB.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
			}
		}()

		// Add user to team
		if err := tx.Model(&models.User{}).Where("id = ?", joinRequest.UserID).Update("team_id", team.ID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add user to team"})
			return
		}

		// Update hackathon participant status
		if err := tx.Model(&models.HackathonParticipant{}).
			Where("user_id = ? AND hackathon_id = ?", joinRequest.UserID, team.HackathonID).
			Update("status", "in_team").Error; err != nil {
			// Не критично, если запись не найдена
			log.Printf("Warning: failed to update hackathon participant status: %v", err)
		}

		joinRequest.Status = "accepted"
		if err := tx.Save(&joinRequest).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update request status"})
			return
		}

		// Cancel other pending invites for this user for this hackathon
		if err := tx.Model(&models.TeamInvite{}).
			Where("invited_user_id = ? AND status = 'pending' AND team_id IN (SELECT id FROM teams WHERE hackathon_id = ?)", joinRequest.UserID, team.HackathonID).
			Update("status", "cancelled").Error; err != nil {
			log.Printf("Warning: failed to cancel pending invites: %v", err)
		}

		// Cancel other pending join requests from this user for this hackathon
		var otherTeams []models.Team
		if err := tx.Where("hackathon_id = ?", team.HackathonID).Find(&otherTeams).Error; err == nil {
			for _, t := range otherTeams {
				if err := tx.Model(&models.TeamJoinRequest{}).
					Where("team_id = ? AND user_id = ? AND status = 'pending'", t.ID, joinRequest.UserID).
					Update("status", "cancelled").Error; err != nil {
					log.Printf("Warning: failed to cancel join request for team %d: %v", t.ID, err)
				}
			}
		}

		if err := tx.Commit().Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to commit transaction"})
			return
		}

		// Send acceptance notification
		s.sendRequestResponseNotification(team, requestingUser, true)
	} else {
		joinRequest.Status = "rejected"
		if err := database.DB.Save(&joinRequest).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update request status"})
			return
		}

		// Send rejection notification
		s.sendRequestResponseNotification(team, requestingUser, false)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": req.Action + "ed",
		"status":  joinRequest.Status,
	})
}

// GetMyJoinRequests - получить свои запросы на вступление
func (s *Server) GetMyJoinRequests(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var requests []models.TeamJoinRequest
	database.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&requests)

	response := make([]gin.H, 0, len(requests))
	for _, req := range requests {
		var team models.Team
		database.DB.First(&team, req.TeamID)

		response = append(response, gin.H{
			"id":        req.ID,
			"teamId":    req.TeamID,
			"teamName":  team.Name,
			"status":    req.Status,
			"createdAt": req.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, response)
}

// CancelJoinRequest - отменить свой запрос на вступление
func (s *Server) CancelJoinRequest(c *gin.Context) {
	requestID, err := strconv.ParseInt(c.Param("requestId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request ID"})
		return
	}

	userID, _ := middleware.GetUserID(c)

	var joinRequest models.TeamJoinRequest
	if err := database.DB.Where("id = ? AND user_id = ?", requestID, userID).First(&joinRequest).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "request not found"})
		return
	}

	if joinRequest.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "can only cancel pending requests"})
		return
	}

	joinRequest.Status = "cancelled"
	database.DB.Save(&joinRequest)

	c.JSON(http.StatusOK, gin.H{"message": "request cancelled"})
}
