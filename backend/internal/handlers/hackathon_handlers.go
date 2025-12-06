package handlers

import (
	"backend/internal/database"
	"backend/internal/middleware"
	"backend/internal/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// ============================================
// HACKATHON CRUD HANDLERS
// ============================================

// GetHackathonsReal - получить список хакатонов из БД
func (s *Server) GetHackathonsReal(c *gin.Context) {
	var hackathons []models.Hackathon

	query := database.DB.Order("created_at DESC")

	// Filter by status if provided
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&hackathons).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch hackathons"})
		return
	}

	// Get participant counts for each hackathon
	type result struct {
		HackathonID int64
		Count       int64
	}
	var counts []result
	database.DB.Model(&models.HackathonParticipant{}).
		Select("hackathon_id, count(*) as count").
		Group("hackathon_id").
		Find(&counts)

	countMap := make(map[int64]int64)
	for _, r := range counts {
		countMap[r.HackathonID] = r.Count
	}

	// Build response
	response := make([]gin.H, len(hackathons))
	for i, h := range hackathons {
		response[i] = gin.H{
			"id":                h.ID,
			"name":              h.Name,
			"description":       h.Description,
			"status":            h.Status,
			"startDate":         h.StartDate,
			"endDate":           h.EndDate,
			"teamSize":          h.TeamSize,
			"maxTeams":          h.MaxTeams,
			"tags":              h.Tags,
			"requiredStack":     h.RequiredStack,
			"participantsCount": countMap[h.ID],
			"createdAt":         h.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, response)
}

// GetActiveHackathonsReal - получить активные хакатоны
func (s *Server) GetActiveHackathonsReal(c *gin.Context) {
	var hackathons []models.Hackathon

	err := database.DB.
		Where("status IN ?", []string{"registration_open", "active"}).
		Order("created_at DESC").
		Find(&hackathons).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch hackathons"})
		return
	}

	c.JSON(http.StatusOK, hackathons)
}

// GetHackathonByID - получить хакатон по ID
func (s *Server) GetHackathonByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid hackathon ID"})
		return
	}

	var hackathon models.Hackathon
	if err := database.DB.First(&hackathon, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "hackathon not found"})
		return
	}

	// Get participants count
	var participantsCount int64
	database.DB.Model(&models.HackathonParticipant{}).
		Where("hackathon_id = ?", id).
		Count(&participantsCount)

	// Get teams count
	var teamsCount int64
	database.DB.Model(&models.Team{}).
		Where("hackathon_id = ?", id).
		Count(&teamsCount)

	c.JSON(http.StatusOK, gin.H{
		"id":                hackathon.ID,
		"name":              hackathon.Name,
		"description":       hackathon.Description,
		"status":            hackathon.Status,
		"startDate":         hackathon.StartDate,
		"endDate":           hackathon.EndDate,
		"teamSize":          hackathon.TeamSize,
		"maxTeams":          hackathon.MaxTeams,
		"tags":              hackathon.Tags,
		"requiredStack":     hackathon.RequiredStack,
		"participantsCount": participantsCount,
		"teamsCount":        teamsCount,
		"createdAt":         hackathon.CreatedAt,
	})
}

// CreateHackathonReal - создать хакатон (admin)
func (s *Server) CreateHackathonReal(c *gin.Context) {
	var req struct {
		Name          string   `json:"name" binding:"required"`
		Description   string   `json:"description"`
		StartDate     string   `json:"startDate"`
		EndDate       string   `json:"endDate"`
		TeamSize      int      `json:"teamSize"`
		MaxTeams      int      `json:"maxTeams"`
		Tags          []string `json:"tags"`
		RequiredStack []string `json:"requiredStack"`
		Status        string   `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := middleware.GetUserID(c)

	hackathon := models.Hackathon{
		Name:          req.Name,
		CreatorID:     userID,
		TeamSize:      req.TeamSize,
		MaxTeams:      req.MaxTeams,
		Tags:          req.Tags,
		RequiredStack: req.RequiredStack,
		Status:        models.HackathonStatus(req.Status),
	}

	if hackathon.TeamSize == 0 {
		hackathon.TeamSize = 4
	}
	if hackathon.Status == "" {
		hackathon.Status = models.HackathonStatusDraft
	}

	if req.Description != "" {
		hackathon.Description = &req.Description
	}

	if req.StartDate != "" {
		t, _ := time.Parse(time.RFC3339, req.StartDate)
		hackathon.StartDate = &t
	}
	if req.EndDate != "" {
		t, _ := time.Parse(time.RFC3339, req.EndDate)
		hackathon.EndDate = &t
	}

	if err := database.DB.Create(&hackathon).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create hackathon"})
		return
	}

	c.JSON(http.StatusCreated, hackathon)
}

// UpdateHackathonReal - обновить хакатон (admin)
func (s *Server) UpdateHackathonReal(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid hackathon ID"})
		return
	}

	var hackathon models.Hackathon
	if err := database.DB.First(&hackathon, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "hackathon not found"})
		return
	}

	var req struct {
		Name          string   `json:"name"`
		Description   string   `json:"description"`
		StartDate     string   `json:"startDate"`
		EndDate       string   `json:"endDate"`
		TeamSize      int      `json:"teamSize"`
		MaxTeams      int      `json:"maxTeams"`
		Tags          []string `json:"tags"`
		RequiredStack []string `json:"requiredStack"`
		Status        string   `json:"status"`
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
	if req.TeamSize > 0 {
		updates["team_size"] = req.TeamSize
	}
	if req.MaxTeams >= 0 {
		updates["max_teams"] = req.MaxTeams
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}
	if req.Tags != nil {
		updates["tags"] = req.Tags
	}
	if req.RequiredStack != nil {
		updates["required_stack"] = req.RequiredStack
	}
	if req.StartDate != "" {
		t, _ := time.Parse(time.RFC3339, req.StartDate)
		updates["start_date"] = t
	}
	if req.EndDate != "" {
		t, _ := time.Parse(time.RFC3339, req.EndDate)
		updates["end_date"] = t
	}

	if err := database.DB.Model(&hackathon).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update hackathon"})
		return
	}

	// Reload
	database.DB.First(&hackathon, id)
	c.JSON(http.StatusOK, hackathon)
}

// DeleteHackathonReal - удалить хакатон (admin)
func (s *Server) DeleteHackathonReal(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid hackathon ID"})
		return
	}

	// Delete participants first
	database.DB.Where("hackathon_id = ?", id).Delete(&models.HackathonParticipant{})

	// Delete hackathon
	if err := database.DB.Delete(&models.Hackathon{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete hackathon"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "hackathon deleted"})
}

// ============================================
// HACKATHON PARTICIPANTS
// ============================================

// GetHackathonParticipants - получить участников хакатона
func (s *Server) GetHackathonParticipants(c *gin.Context) {
	hackathonID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid hackathon ID"})
		return
	}

	var participants []models.HackathonParticipant
	err = database.DB.
		Preload("User").
		Where("hackathon_id = ?", hackathonID).
		Find(&participants).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch participants"})
		return
	}

	c.JSON(http.StatusOK, participants)
}

// RegisterForHackathonReal - зарегистрироваться на хакатон
func (s *Server) RegisterForHackathonReal(c *gin.Context) {
	hackathonID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid hackathon ID"})
		return
	}

	userID, _ := middleware.GetUserID(c)

	// Check if hackathon exists and is open for registration
	var hackathon models.Hackathon
	if err := database.DB.First(&hackathon, hackathonID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "hackathon not found"})
		return
	}

	if hackathon.Status != models.HackathonStatusRegistrationOpen {
		c.JSON(http.StatusBadRequest, gin.H{"error": "registration is not open"})
		return
	}

	// Check if already registered
	var existing models.HackathonParticipant
	err = database.DB.
		Where("hackathon_id = ? AND user_id = ?", hackathonID, userID).
		First(&existing).Error

	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "already registered"})
		return
	}

	// Register
	participant := models.HackathonParticipant{
		HackathonID: hackathonID,
		UserID:      userID,
		Status:      "looking",
	}

	if err := database.DB.Create(&participant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to register"})
		return
	}

	// Update user's current hackathon
	database.DB.Model(&models.User{}).Where("id = ?", userID).Update("current_hackathon_id", hackathonID)

	c.JSON(http.StatusOK, gin.H{
		"message":     "registered successfully",
		"participant": participant,
	})
}
