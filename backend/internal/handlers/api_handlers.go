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

// AdminLogin - админ авторизация
func (s *Server) AdminLogin(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email and password required"})
		return
	}

	if req.Email != ADMINUSER && req.Password != ADMINPASS {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	token, _ := middleware.GenerateToken(0, 0, "admin")

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":    0,
			"email": req.Email,
			"role":  "admin",
			"name":  "Administrator",
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

func (s *Server) GetIncomingInvites(c *gin.Context) {
	c.JSON(http.StatusOK, []gin.H{})
}

func (s *Server) GetOutgoingInvites(c *gin.Context) {
	c.JSON(http.StatusOK, []gin.H{})
}

func (s *Server) SendInvite(c *gin.Context) {
	var req struct {
		ToUserID string `json:"toUserId" binding:"required"`
		TeamID   string `json:"teamId" binding:"required"`
		Message  string `json:"message"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":       "invite-1",
		"teamId":   req.TeamID,
		"toUserId": req.ToUserID,
		"status":   "pending",
	})
}

func (s *Server) AcceptInvite(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "invite accepted"})
}

func (s *Server) DeclineInvite(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "invite declined"})
}

func (s *Server) CancelInvite(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "invite cancelled"})
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

	c.JSON(http.StatusOK, gin.H{
		"users": users,
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

		response[i] = gin.H{
			"id":          team.ID,
			"name":        team.Name,
			"hackathonId": team.HackathonID,
			"captainId":   team.CaptainID,
			"status":      team.Status,
			"members":     members,
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

	c.JSON(http.StatusOK, gin.H{
		"id":                 user.ID,
		"telegramId":         user.TelegramUserID,
		"name":               user.Name,
		"username":           user.Username,
		"role":               user.Role,
		"skills":             user.Skills,
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
	})
}

// UpdateProfile - обновить профиль пользователя
func (s *Server) UpdateProfile(c *gin.Context) {
	var req struct {
		Name        string   `json:"name"`
		Skills      []string `json:"skills"`
		Bio         string   `json:"bio"`
		AvatarURL   string   `json:"avatarUrl"`
		LookingFor  []string `json:"lookingFor"`
		Experience  string   `json:"experience"`
		ContactInfo string   `json:"contactInfo"`
		Tags        []string `json:"tags"`
		Pts         *int     `json:"pts"`
		Mmr         *int     `json:"mmr"`
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
		"id":          user.ID,
		"name":        user.Name,
		"username":    user.Username,
		"skills":      user.Skills,
		"bio":         user.Bio,
		"experience":  user.Experience,
		"lookingFor":  user.LookingFor,
		"tags":        user.Tags,
		"skillRating": user.SkillRating,
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
