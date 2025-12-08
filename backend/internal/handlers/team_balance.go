package handlers

import (
	"backend/internal/database"
	"backend/internal/middleware"
	"backend/internal/models"
	"math"
	"net/http"

	"github.com/gin-gonic/gin"
)

// TeamBalance - информация о балансе команды
type TeamBalance struct {
	Score         float64             `json:"score"`         // Общий балл (0-100)
	SkillCoverage map[string]int      `json:"skillCoverage"` // Покрытие навыков
	MMRStats      MMRStats            `json:"mmrStats"`      // Статистика MMR
	Roles         map[string]int      `json:"roles"`         // Распределение ролей
	Warnings      []string            `json:"warnings"`      // Предупреждения
	Suggestions   []BalanceSuggestion `json:"suggestions"`   // Рекомендации
}

type MMRStats struct {
	Average float64 `json:"average"`
	Min     int     `json:"min"`
	Max     int     `json:"max"`
	Spread  int     `json:"spread"` // Разброс (max - min)
}

type BalanceSuggestion struct {
	Type    string `json:"type"` // skill, role, mmr
	Message string `json:"message"`
}

// GetTeamBalance - получить баланс команды
func (s *Server) GetTeamBalance(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	// Получаем команду пользователя
	var team models.Team
	err := database.DB.Where("captain_id = ?", userID).First(&team).Error
	if err != nil {
		// Пробуем найти команду через user.team_id
		var user models.User
		if err := database.DB.First(&user, userID).Error; err != nil || user.TeamID == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
			return
		}
		if err := database.DB.First(&team, *user.TeamID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
			return
		}
	}

	// Получаем участников команды
	var members []models.User
	database.DB.Where("team_id = ?", team.ID).Find(&members)

	// Добавляем капитана если его нет в списке
	var captain models.User
	database.DB.First(&captain, team.CaptainID)

	captainFound := false
	for _, m := range members {
		if m.ID == captain.ID {
			captainFound = true
			break
		}
	}
	if !captainFound {
		members = append(members, captain)
	}

	balance := calculateTeamBalance(members)

	c.JSON(http.StatusOK, balance)
}

// calculateTeamBalance - расчёт баланса команды
func calculateTeamBalance(members []models.User) TeamBalance {
	balance := TeamBalance{
		SkillCoverage: make(map[string]int),
		Roles:         make(map[string]int),
		Warnings:      []string{},
		Suggestions:   []BalanceSuggestion{},
	}

	if len(members) == 0 {
		balance.Score = 0
		balance.Warnings = append(balance.Warnings, "Команда пуста")
		return balance
	}

	// Сбор статистики
	totalMMR := 0
	minMMR := 10000
	maxMMR := 0

	for _, m := range members {
		// MMR статистика
		mmr := m.Mmr
		if mmr == 0 {
			mmr = 1000 // default
		}
		totalMMR += mmr
		if mmr < minMMR {
			minMMR = mmr
		}
		if mmr > maxMMR {
			maxMMR = mmr
		}

		// Навыки
		for _, skill := range m.Skills {
			balance.SkillCoverage[skill]++
		}

		// Роли (из lookingFor)
		for _, role := range m.LookingFor {
			balance.Roles[role]++
		}
	}

	// MMR статистика
	balance.MMRStats = MMRStats{
		Average: float64(totalMMR) / float64(len(members)),
		Min:     minMMR,
		Max:     maxMMR,
		Spread:  maxMMR - minMMR,
	}

	// Расчёт общего балла
	score := 100.0

	// Штраф за разброс MMR (более 500 - плохо)
	if balance.MMRStats.Spread > 500 {
		penalty := float64(balance.MMRStats.Spread-500) / 10
		score -= math.Min(penalty, 30)
		balance.Warnings = append(balance.Warnings, "Большой разброс в уровне навыков участников")
		balance.Suggestions = append(balance.Suggestions, BalanceSuggestion{
			Type:    "mmr",
			Message: "Рекомендуется искать участников с похожим MMR",
		})
	}

	// Проверка наличия ключевых ролей
	requiredRoles := []string{"frontend", "backend", "designer"}
	missingRoles := []string{}
	for _, role := range requiredRoles {
		if balance.Roles[role] == 0 {
			missingRoles = append(missingRoles, role)
		}
	}

	if len(missingRoles) > 0 {
		penalty := float64(len(missingRoles)) * 10
		score -= penalty
		balance.Warnings = append(balance.Warnings, "Не хватает ключевых ролей в команде")
		for _, role := range missingRoles {
			balance.Suggestions = append(balance.Suggestions, BalanceSuggestion{
				Type:    "role",
				Message: "Ищите: " + roleToRussian(role),
			})
		}
	}

	// Бонус за разнообразие навыков
	if len(balance.SkillCoverage) >= 5 {
		score += 10
	}

	// Бонус за полную команду (4+ человека)
	if len(members) >= 4 {
		score += 5
	}

	// Штраф за маленькую команду
	if len(members) < 2 {
		score -= 20
		balance.Warnings = append(balance.Warnings, "Команда слишком маленькая")
		balance.Suggestions = append(balance.Suggestions, BalanceSuggestion{
			Type:    "team",
			Message: "Найдите больше участников через свайп",
		})
	}

	// Ограничиваем score
	if score < 0 {
		score = 0
	}
	if score > 100 {
		score = 100
	}

	balance.Score = score

	return balance
}

func roleToRussian(role string) string {
	mapping := map[string]string{
		"frontend":  "Frontend разработчик",
		"backend":   "Backend разработчик",
		"fullstack": "Fullstack разработчик",
		"designer":  "Дизайнер",
		"pm":        "Менеджер проекта",
		"devops":    "DevOps инженер",
		"data":      "Data Scientist",
		"mobile":    "Mobile разработчик",
	}
	if val, ok := mapping[role]; ok {
		return val
	}
	return role
}

// GetCandidateCompatibility - получить совместимость кандидата с командой
func (s *Server) GetCandidateCompatibility(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	candidateID := c.Query("candidateId")

	if candidateID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "candidateId is required"})
		return
	}

	// Получаем текущую команду
	var team models.Team
	err := database.DB.Where("captain_id = ?", userID).First(&team).Error
	if err != nil {
		var user models.User
		if err := database.DB.First(&user, userID).Error; err != nil || user.TeamID == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
			return
		}
		if err := database.DB.First(&team, *user.TeamID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
			return
		}
	}

	// Получаем участников команды
	var members []models.User
	database.DB.Where("team_id = ?", team.ID).Find(&members)

	// Добавляем капитана
	var captain models.User
	database.DB.First(&captain, team.CaptainID)
	members = append(members, captain)

	// Получаем кандидата
	var candidate models.User
	if err := database.DB.First(&candidate, candidateID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "candidate not found"})
		return
	}

	// Расчёт текущего баланса
	currentBalance := calculateTeamBalance(members)

	// Расчёт баланса с кандидатом
	membersWithCandidate := append(members, candidate)
	newBalance := calculateTeamBalance(membersWithCandidate)

	// Рекомендация
	recommendation := "neutral"
	if newBalance.Score > currentBalance.Score+5 {
		recommendation = "recommended"
	} else if newBalance.Score < currentBalance.Score-5 {
		recommendation = "not_recommended"
	}

	c.JSON(http.StatusOK, gin.H{
		"candidate": gin.H{
			"id":     candidate.ID,
			"name":   candidate.Name,
			"skills": candidate.Skills,
			"mmr":    candidate.Mmr,
		},
		"currentBalance":   currentBalance.Score,
		"newBalance":       newBalance.Score,
		"scoreDiff":        newBalance.Score - currentBalance.Score,
		"recommendation":   recommendation,
		"newSkillsCovered": countNewSkills(currentBalance.SkillCoverage, candidate.Skills),
		"newRolesCovered":  countNewRoles(currentBalance.Roles, candidate.LookingFor),
	})
}

func countNewSkills(current map[string]int, candidateSkills []string) int {
	count := 0
	for _, skill := range candidateSkills {
		if current[skill] == 0 {
			count++
		}
	}
	return count
}

func countNewRoles(current map[string]int, candidateRoles []string) int {
	count := 0
	for _, role := range candidateRoles {
		if current[role] == 0 {
			count++
		}
	}
	return count
}
