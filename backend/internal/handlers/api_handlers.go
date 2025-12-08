package handlers

import (
	"backend/internal/database"
	"backend/internal/middleware"
	"backend/internal/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
)

// ============================================
// AUTH HANDLERS
// ============================================

// AuthTelegram - авторизация через Telegram WebApp
// @Summary Telegram Authorization
// @Tags Auth
// @Accept json
// @Produce json
// @Param body body object true "initData from Telegram WebApp"
// @Success 200 {object} object
// @Router /api/auth/telegram [post]
func (s *Server) AuthTelegram(c *gin.Context) {
	var req struct {
		InitData string `json:"initData" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "initData required"})
		return
	}

	// TODO: Validate initData with Telegram Bot Token
	// For now, mock response
	user, err := s.UserRepo.GetByTelegramID(c.Request.Context(), 123456789) // Mock ID
	if err != nil {
		// Create new user if not exists
		c.JSON(http.StatusOK, gin.H{
			"token": "mock-jwt-token",
			"user": gin.H{
				"id":   1,
				"name": "New User",
				"role": "participant",
			},
		})
		return
	}

	// Generate JWT token
	token, err := middleware.GenerateToken(user.ID, user.TelegramUserID, string(user.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  user,
	})
}

// RefreshToken - обновление JWT токена
func (s *Server) RefreshToken(c *gin.Context) {
	// TODO: Implement refresh token logic
	c.JSON(http.StatusNotImplemented, gin.H{"error": "not implemented"})
}

// AdminLogin - админ авторизация (секретный вход)
// @Summary Admin login
// @Description Authenticate admin with password
// @Tags admin
// @Accept json
// @Produce json
// @Param input body object{password=string} true "Admin password"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /admin/api/login [post]
func (s *Server) AdminLogin(c *gin.Context) {
	var req struct {
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password required"})
		return
	}

	// Проверяем пароль
	if req.Password != ADMINPASS {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	// Генерируем JWT токен для админа
	token, err := middleware.GenerateToken(0, 0, "admin")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":   0,
			"role": "admin",
			"name": "Administrator",
		},
	})
}

// ============================================
// RECOMMENDATIONS & SWIPE (redirect to swipe_handlers.go)
// ============================================

func (s *Server) GetRecommendations(c *gin.Context) {
	s.GetRecommendationsReal(c)
}

func (s *Server) Swipe(c *gin.Context) {
	s.SwipeReal(c)
}

// ============================================
// TEAMS (redirect to team_handlers.go)
// ============================================

func (s *Server) GetTeams(c *gin.Context) {
	s.GetTeamsReal(c)
}

func (s *Server) GetMyTeam(c *gin.Context) {
	s.GetMyTeamReal(c)
}

func (s *Server) CreateTeam(c *gin.Context) {
	s.CreateTeamReal(c)
}

func (s *Server) UpdateTeam(c *gin.Context) {
	s.UpdateTeamReal(c)
}

func (s *Server) LeaveTeam(c *gin.Context) {
	s.LeaveTeamReal(c)
}

func (s *Server) KickMember(c *gin.Context) {
	s.KickMemberReal(c)
}

func (s *Server) UpdateTeamStatus(c *gin.Context) {
	s.UpdateTeamStatusReal(c)
}

func (s *Server) GenerateInviteLink(c *gin.Context) {
	s.GenerateInviteLinkReal(c)
}

func (s *Server) JoinTeamByCode(c *gin.Context) {
	s.JoinTeamByCodeReal(c)
}

// ============================================
// INVITES
// ============================================

// GetIncomingInvites - получить входящие приглашения в команды
func (s *Server) GetIncomingInvites(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var invites []models.TeamInvite
	if err := database.DB.Where("invited_user_id = ? AND status = ?", userID, "pending").Find(&invites).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch invites"})
		return
	}

	// Build response with team and inviter details
	response := make([]gin.H, len(invites))
	for i, invite := range invites {
		var team models.Team
		var inviter models.User
		database.DB.First(&team, invite.TeamID)
		database.DB.First(&inviter, invite.InviterID)

		// Get team captain
		var captain models.User
		database.DB.First(&captain, team.CaptainID)

		response[i] = gin.H{
			"id":        invite.ID,
			"teamId":    invite.TeamID,
			"status":    invite.Status,
			"createdAt": invite.CreatedAt,
			"team": gin.H{
				"id":          team.ID,
				"name":        team.Name,
				"description": team.Description,
				"captain":     captain,
			},
			"fromUser": gin.H{
				"id":     inviter.ID,
				"name":   inviter.Name,
				"avatar": inviter.AvatarURL,
			},
		}
	}

	c.JSON(http.StatusOK, response)
}

// GetOutgoingInvites - получить отправленные приглашения
func (s *Server) GetOutgoingInvites(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var invites []models.TeamInvite
	if err := database.DB.Where("inviter_id = ?", userID).Find(&invites).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch invites"})
		return
	}

	// Build response with team and invited user details
	response := make([]gin.H, len(invites))
	for i, invite := range invites {
		var team models.Team
		var invitedUser models.User
		database.DB.First(&team, invite.TeamID)
		database.DB.First(&invitedUser, invite.InvitedUserID)

		response[i] = gin.H{
			"id":        invite.ID,
			"teamId":    invite.TeamID,
			"status":    invite.Status,
			"createdAt": invite.CreatedAt,
			"team": gin.H{
				"id":   team.ID,
				"name": team.Name,
			},
			"toUser": gin.H{
				"id":     invitedUser.ID,
				"name":   invitedUser.Name,
				"avatar": invitedUser.AvatarURL,
			},
		}
	}

	c.JSON(http.StatusOK, response)
}

// SendInvite - отправить приглашение в команду
func (s *Server) SendInvite(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var req struct {
		ToUserID string `json:"toUserId" binding:"required"`
		TeamID   string `json:"teamId" binding:"required"`
		Message  string `json:"message"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse IDs
	teamID, err := strconv.ParseInt(req.TeamID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid team ID"})
		return
	}
	toUserID, err := strconv.ParseInt(req.ToUserID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	// Check team exists and user is captain
	var team models.Team
	if err := database.DB.First(&team, teamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
		return
	}

	if team.CaptainID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only captain can send invites"})
		return
	}

	// Check target user exists
	var targetUser models.User
	if err := database.DB.First(&targetUser, toUserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// Check if invite already exists
	var existingInvite models.TeamInvite
	if err := database.DB.Where("team_id = ? AND invited_user_id = ? AND status = ?", teamID, toUserID, "pending").First(&existingInvite).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "invite already sent"})
		return
	}

	// Create invite
	invite := models.TeamInvite{
		TeamID:        teamID,
		InvitedUserID: toUserID,
		InviterID:     userID,
		Status:        "pending",
	}
	if err := database.DB.Create(&invite).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create invite"})
		return
	}

	// Get inviter info
	var inviter models.User
	database.DB.First(&inviter, userID)

	// Send notification
	go s.sendTeamInviteNotification(team, inviter, targetUser, invite.ID)

	c.JSON(http.StatusCreated, gin.H{
		"id":       invite.ID,
		"teamId":   invite.TeamID,
		"toUserId": invite.InvitedUserID,
		"status":   invite.Status,
	})
}

// AcceptInvite - принять приглашение в команду
func (s *Server) AcceptInvite(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	inviteIDStr := c.Param("id")

	inviteID, err := strconv.ParseInt(inviteIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid invite ID"})
		return
	}

	// Find invite
	var invite models.TeamInvite
	if err := database.DB.First(&invite, inviteID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "invite not found"})
		return
	}

	// Check it's for this user
	if invite.InvitedUserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "not your invite"})
		return
	}

	if invite.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invite already processed"})
		return
	}

	// Get team
	var team models.Team
	if err := database.DB.First(&team, invite.TeamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
		return
	}

	// Add user to team
	if err := database.DB.Model(&models.User{}).Where("id = ?", userID).Update("team_id", team.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to join team"})
		return
	}

	// Update invite status
	database.DB.Model(&invite).Update("status", "accepted")

	// Update hackathon participant status if exists
	database.DB.Model(&models.HackathonParticipant{}).
		Where("user_id = ? AND hackathon_id = ?", userID, team.HackathonID).
		Update("status", "in_team")

	// Notify inviter
	var inviter models.User
	database.DB.First(&inviter, invite.InviterID)
	var user models.User
	database.DB.First(&user, userID)

	go s.sendInviteResponseNotification(team, user, inviter, true)

	c.JSON(http.StatusOK, gin.H{"message": "invite accepted", "teamId": team.ID})
}

// DeclineInvite - отклонить приглашение в команду
func (s *Server) DeclineInvite(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	inviteIDStr := c.Param("id")

	inviteID, err := strconv.ParseInt(inviteIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid invite ID"})
		return
	}

	// Find invite
	var invite models.TeamInvite
	if err := database.DB.First(&invite, inviteID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "invite not found"})
		return
	}

	// Check it's for this user
	if invite.InvitedUserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "not your invite"})
		return
	}

	if invite.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invite already processed"})
		return
	}

	// Update invite status
	database.DB.Model(&invite).Update("status", "declined")

	// Notify inviter
	var team models.Team
	var inviter models.User
	var user models.User
	database.DB.First(&team, invite.TeamID)
	database.DB.First(&inviter, invite.InviterID)
	database.DB.First(&user, userID)

	go s.sendInviteResponseNotification(team, user, inviter, false)

	c.JSON(http.StatusOK, gin.H{"message": "invite declined"})
}

// CancelInvite - отменить приглашение (капитаном)
func (s *Server) CancelInvite(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	inviteIDStr := c.Param("id")

	inviteID, err := strconv.ParseInt(inviteIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid invite ID"})
		return
	}

	// Find invite
	var invite models.TeamInvite
	if err := database.DB.First(&invite, inviteID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "invite not found"})
		return
	}

	// Check user is inviter
	if invite.InviterID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "only inviter can cancel"})
		return
	}

	if invite.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invite already processed"})
		return
	}

	// Delete invite
	database.DB.Delete(&invite)

	c.JSON(http.StatusOK, gin.H{"message": "invite cancelled"})
}

// BotAcceptInvite - принять приглашение через бота (по telegramId)
func (s *Server) BotAcceptInvite(c *gin.Context) {
	inviteIDStr := c.Param("id")
	telegramIDStr := c.Query("telegramId")

	inviteID, err := strconv.ParseInt(inviteIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid invite ID"})
		return
	}

	telegramID, err := strconv.ParseInt(telegramIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid telegram ID"})
		return
	}

	// Find user by telegram ID
	var user models.User
	if err := database.DB.Where("telegram_user_id = ?", telegramID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// Find invite
	var invite models.TeamInvite
	if err := database.DB.First(&invite, inviteID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "invite not found"})
		return
	}

	// Check it's for this user
	if invite.InvitedUserID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "not your invite"})
		return
	}

	if invite.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invite already processed"})
		return
	}

	// Get team
	var team models.Team
	if err := database.DB.First(&team, invite.TeamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
		return
	}

	// Add user to team
	if err := database.DB.Model(&models.User{}).Where("id = ?", user.ID).Update("team_id", team.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to join team"})
		return
	}

	// Update invite status
	database.DB.Model(&invite).Update("status", "accepted")

	// Update hackathon participant status if exists
	database.DB.Model(&models.HackathonParticipant{}).
		Where("user_id = ? AND hackathon_id = ?", user.ID, team.HackathonID).
		Update("status", "in_team")

	// Notify inviter
	var inviter models.User
	database.DB.First(&inviter, invite.InviterID)

	go s.sendInviteResponseNotification(team, user, inviter, true)

	c.JSON(http.StatusOK, gin.H{"message": "invite accepted", "teamId": team.ID})
}

// BotDeclineInvite - отклонить приглашение через бота (по telegramId)
func (s *Server) BotDeclineInvite(c *gin.Context) {
	inviteIDStr := c.Param("id")
	telegramIDStr := c.Query("telegramId")

	inviteID, err := strconv.ParseInt(inviteIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid invite ID"})
		return
	}

	telegramID, err := strconv.ParseInt(telegramIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid telegram ID"})
		return
	}

	// Find user by telegram ID
	var user models.User
	if err := database.DB.Where("telegram_user_id = ?", telegramID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// Find invite
	var invite models.TeamInvite
	if err := database.DB.First(&invite, inviteID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "invite not found"})
		return
	}

	// Check it's for this user
	if invite.InvitedUserID != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "not your invite"})
		return
	}

	if invite.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invite already processed"})
		return
	}

	// Update invite status
	database.DB.Model(&invite).Update("status", "declined")

	// Notify inviter
	var team models.Team
	var inviter models.User
	database.DB.First(&team, invite.TeamID)
	database.DB.First(&inviter, invite.InviterID)

	go s.sendInviteResponseNotification(team, user, inviter, false)

	c.JSON(http.StatusOK, gin.H{"message": "invite declined"})
}

// ============================================
// HACKATHONS (redirect to hackathon_handlers.go)
// ============================================

func (s *Server) GetHackathons(c *gin.Context) {
	s.GetHackathonsReal(c)
}

func (s *Server) GetActiveHackathons(c *gin.Context) {
	s.GetActiveHackathonsReal(c)
}

func (s *Server) GetHackathon(c *gin.Context) {
	s.GetHackathonByID(c)
}

func (s *Server) RegisterForHackathon(c *gin.Context) {
	s.RegisterForHackathonReal(c)
}

func (s *Server) CreateHackathon(c *gin.Context) {
	s.CreateHackathonReal(c)
}

func (s *Server) AdminUpdateHackathon(c *gin.Context) {
	s.UpdateHackathonReal(c)
}

func (s *Server) DeleteHackathon(c *gin.Context) {
	s.DeleteHackathonReal(c)
}

// ============================================
// ADMIN
// ============================================

func (s *Server) GetAdminStats(c *gin.Context) {
	var usersCount int64
	var teamsCount int64
	var hackathonsCount int64
	var activeHackathonsCount int64

	database.DB.Model(&models.User{}).Count(&usersCount)
	database.DB.Model(&models.Team{}).Count(&teamsCount)
	database.DB.Model(&models.Hackathon{}).Count(&hackathonsCount)
	database.DB.Model(&models.Hackathon{}).Where("status IN ?", []string{"registration_open", "active"}).Count(&activeHackathonsCount)

	// Count users looking for team
	var lookingCount int64
	database.DB.Model(&models.HackathonParticipant{}).Where("status = ?", "looking").Count(&lookingCount)

	// Count users in teams
	var inTeamCount int64
	database.DB.Model(&models.User{}).Where("team_id IS NOT NULL").Count(&inTeamCount)

	c.JSON(http.StatusOK, gin.H{
		"totalUsers":          usersCount,
		"totalTeams":          teamsCount,
		"totalHackathons":     hackathonsCount,
		"activeHackathons":    activeHackathonsCount,
		"usersLookingForTeam": lookingCount,
		"usersInTeam":         inTeamCount,
	})
}

func (s *Server) GetAllUsers(c *gin.Context) {
	var users []models.User

	// Support pagination
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "50")

	pageNum, _ := strconv.Atoi(page)
	limitNum, _ := strconv.Atoi(limit)
	offset := (pageNum - 1) * limitNum

	database.DB.Offset(offset).Limit(limitNum).Find(&users)

	var total int64
	database.DB.Model(&models.User{}).Count(&total)

	// Get customizations for all users
	userIDs := make([]int64, len(users))
	for i, u := range users {
		userIDs[i] = u.ID
	}

	var customizations []models.ProfileCustomization
	database.DB.Where("user_id IN ?", userIDs).Find(&customizations)

	// Create a map for quick lookup
	customizationMap := make(map[int64]*models.ProfileCustomization)
	for i := range customizations {
		customizationMap[customizations[i].UserID] = &customizations[i]
	}

	// Build response with customization
	type UserWithCustomization struct {
		models.User
		Customization *models.ProfileCustomization `json:"customization,omitempty"`
	}

	usersWithCustomization := make([]UserWithCustomization, len(users))
	for i, u := range users {
		usersWithCustomization[i] = UserWithCustomization{
			User:          u,
			Customization: customizationMap[u.ID],
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"users": usersWithCustomization,
		"total": total,
		"page":  pageNum,
		"limit": limitNum,
	})
}

func (s *Server) AdminUpdateUser(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	var req struct {
		Name string `json:"name"`
		Role string `json:"role"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Role != "" {
		updates["role"] = req.Role
	}

	database.DB.Model(&user).Updates(updates)
	database.DB.First(&user, userID)

	c.JSON(http.StatusOK, user)
}

func (s *Server) GetAllTeams(c *gin.Context) {
	var teams []models.Team

	database.DB.Find(&teams)

	// Build response with members
	response := make([]gin.H, len(teams))
	for i, team := range teams {
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
			"members":     members,
			"memberCount": len(members),
			"captain":     captain,
			"background":  team.Background,
			"borderColor": team.BorderColor,
			"nameColor":   team.NameColor,
			"avatarUrl":   team.AvatarUrl,
			"createdAt":   team.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, response)
}

func (s *Server) AdminAssignToTeam(c *gin.Context) {
	var req struct {
		UserID int64 `json:"userId" binding:"required"`
		TeamID int64 `json:"teamId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update user's team
	if err := database.DB.Model(&models.User{}).Where("id = ?", req.UserID).Update("team_id", req.TeamID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to assign user to team"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "user assigned to team",
		"userId":  req.UserID,
		"teamId":  req.TeamID,
	})
}

// ============================================
// USER PROFILE
// ============================================

// GetMe - получить текущего пользователя
func (s *Server) GetMe(c *gin.Context) {
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

	// Загружаем кастомизацию пользователя
	var customizationResponse interface{}
	var profileCustom models.ProfileCustomization
	if err := database.DB.Where("user_id = ?", userID).First(&profileCustom).Error; err == nil {
		cr := gin.H{}

		// Загружаем предметы по ID
		if profileCustom.BackgroundID != nil {
			var item models.CustomizationItem
			if err := database.DB.Where("item_id = ? AND user_id = ?", *profileCustom.BackgroundID, userID).First(&item).Error; err == nil {
				cr["background"] = gin.H{
					"id":     item.ItemID,
					"name":   item.Name,
					"value":  item.Value,
					"rarity": item.Rarity,
				}
			}
		}

		if profileCustom.NameColorID != nil {
			var item models.CustomizationItem
			if err := database.DB.Where("item_id = ? AND user_id = ?", *profileCustom.NameColorID, userID).First(&item).Error; err == nil {
				cr["nameColor"] = gin.H{
					"id":     item.ItemID,
					"name":   item.Name,
					"value":  item.Value,
					"rarity": item.Rarity,
				}
			}
		}

		if profileCustom.AvatarFrameID != nil {
			var item models.CustomizationItem
			if err := database.DB.Where("item_id = ? AND user_id = ?", *profileCustom.AvatarFrameID, userID).First(&item).Error; err == nil {
				cr["avatarFrame"] = gin.H{
					"id":     item.ItemID,
					"name":   item.Name,
					"value":  item.Value,
					"rarity": item.Rarity,
				}
			}
		}

		if profileCustom.TitleID != nil {
			var item models.CustomizationItem
			if err := database.DB.Where("item_id = ? AND user_id = ?", *profileCustom.TitleID, userID).First(&item).Error; err == nil {
				cr["title"] = gin.H{
					"id":     item.ItemID,
					"name":   item.Name,
					"value":  item.Value,
					"rarity": item.Rarity,
				}
			}
		}

		if profileCustom.EffectID != nil {
			var item models.CustomizationItem
			if err := database.DB.Where("item_id = ? AND user_id = ?", *profileCustom.EffectID, userID).First(&item).Error; err == nil {
				cr["effect"] = gin.H{
					"id":     item.ItemID,
					"name":   item.Name,
					"value":  item.Value,
					"rarity": item.Rarity,
				}
			}
		}

		// Загружаем бейджи
		var badges []gin.H
		badgeIDs := []*string{profileCustom.Badge1ID, profileCustom.Badge2ID, profileCustom.Badge3ID}
		for _, badgeID := range badgeIDs {
			if badgeID != nil {
				var item models.CustomizationItem
				if err := database.DB.Where("item_id = ? AND user_id = ?", *badgeID, userID).First(&item).Error; err == nil {
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

		customizationResponse = cr
	}

	c.JSON(http.StatusOK, gin.H{
		"id":                 user.ID,
		"telegramId":         user.TelegramUserID,
		"name":               user.Name,
		"username":           user.Username,
		"role":               user.Role,
		"skills":             user.Skills,
		"verifiedSkills":     user.VerifiedSkills,
		"bio":                user.Bio,
		"avatarUrl":          user.AvatarURL,
		"experience":         user.Experience,
		"lookingFor":         user.LookingFor,
		"contactInfo":        user.ContactInfo,
		"profileComplete":    user.ProfileComplete,
		"currentHackathonId": user.CurrentHackathonID,
		"teamId":             user.TeamID,
		"tags":               user.Tags,
		"skillRating":        user.SkillRating,
		"pts":                user.Pts,
		"mmr":                user.Mmr,
		"customization":      customizationResponse,
	})
}

// UpdateProfile - обновить профиль пользователя
func (s *Server) UpdateProfile(c *gin.Context) {
	var req struct {
		Name           string   `json:"name"`
		Skills         []string `json:"skills"`
		VerifiedSkills []string `json:"verifiedSkills"`
		Bio            string   `json:"bio"`
		AvatarURL      string   `json:"avatarUrl"`
		LookingFor     []string `json:"lookingFor"`
		Experience     string   `json:"experience"`
		ContactInfo    string   `json:"contactInfo"`
		Tags           []string `json:"tags"`
		Pts            *int     `json:"pts"`
		Mmr            *int     `json:"mmr"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := middleware.GetUserID(c)

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	updates := map[string]interface{}{}

	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Skills != nil {
		updates["skills"] = pq.StringArray(req.Skills)
	}
	if req.VerifiedSkills != nil {
		updates["verified_skills"] = pq.StringArray(req.VerifiedSkills)
	}
	if req.Bio != "" {
		updates["bio"] = req.Bio
	}
	if req.AvatarURL != "" {
		updates["avatar_url"] = req.AvatarURL
	}
	if req.LookingFor != nil {
		updates["looking_for"] = pq.StringArray(req.LookingFor)
	}
	if req.Experience != "" {
		updates["experience"] = req.Experience
	}
	if req.ContactInfo != "" {
		updates["contact_info"] = req.ContactInfo
	}
	if req.Tags != nil {
		updates["tags"] = pq.StringArray(req.Tags)
	}
	if req.Pts != nil {
		updates["pts"] = *req.Pts
	}
	if req.Mmr != nil {
		updates["mmr"] = *req.Mmr
	}

	// Mark profile as complete if basic info is provided
	if req.Name != "" && len(req.Skills) > 0 {
		updates["profile_complete"] = true
	}

	if err := database.DB.Model(&user).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
		return
	}

	// Reload user
	database.DB.First(&user, userID)

	c.JSON(http.StatusOK, gin.H{
		"id":              user.ID,
		"name":            user.Name,
		"skills":          user.Skills,
		"verifiedSkills":  user.VerifiedSkills,
		"bio":             user.Bio,
		"avatarUrl":       user.AvatarURL,
		"lookingFor":      user.LookingFor,
		"experience":      user.Experience,
		"contactInfo":     user.ContactInfo,
		"profileComplete": user.ProfileComplete,
		"tags":            user.Tags,
		"pts":             user.Pts,
		"mmr":             user.Mmr,
	})
}

// GetUser - получить пользователя по ID
func (s *Server) GetUser(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":             user.ID,
		"name":           user.Name,
		"username":       user.Username,
		"skills":         user.Skills,
		"verifiedSkills": user.VerifiedSkills,
		"bio":            user.Bio,
		"experience":     user.Experience,
		"lookingFor":     user.LookingFor,
		"tags":           user.Tags,
		"skillRating":    user.SkillRating,
	})
}

// ============================================
// NOTIFICATIONS
// ============================================

// SendNotification - отправить уведомление
func (s *Server) SendNotification(c *gin.Context) {
	var req struct {
		UserID  string `json:"userId" binding:"required"`
		Title   string `json:"title" binding:"required"`
		Message string `json:"message" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Send notification via NotificationService
	c.JSON(http.StatusOK, gin.H{"message": "notification sent"})
}

// AdminPromoteToCreator - повысить пользователя до создателя хакатонов
func (s *Server) AdminPromoteToCreator(c *gin.Context) {
	var req struct {
		UserID string `json:"userId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Update user role in DB
	c.JSON(http.StatusOK, gin.H{
		"userId": req.UserID,
		"role":   "hackathon_creator",
	})
}
