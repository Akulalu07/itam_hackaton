package handlers

import (
	"backend/internal/models"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// InventoryHandlers содержит handlers для работы с инвентарём
type InventoryHandlers struct {
	db *gorm.DB
}

// NewInventoryHandlers создаёт новый экземпляр handlers
func NewInventoryHandlers(db *gorm.DB) *InventoryHandlers {
	return &InventoryHandlers{db: db}
}

// GetInventory godoc
// @Summary Получить инвентарь пользователя
// @Description Возвращает все предметы, кейсы и достижения пользователя
// @Tags inventory
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.UserInventoryResponse
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/inventory [get]
func (h *InventoryHandlers) GetInventory(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var items []models.CustomizationItem
	if err := h.db.Where("user_id = ?", userID).Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch items"})
		return
	}

	var cases []models.UserCase
	if err := h.db.Where("user_id = ?", userID).Find(&cases).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cases"})
		return
	}

	var achievements []models.UserAchievement
	if err := h.db.Where("user_id = ?", userID).Find(&achievements).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch achievements"})
		return
	}

	var customization models.ProfileCustomization
	if err := h.db.Where("user_id = ?", userID).First(&customization).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Создаём пустую кастомизацию
			customization = models.ProfileCustomization{UserID: userID.(int64)}
			h.db.Create(&customization)
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch customization"})
			return
		}
	}

	c.JSON(http.StatusOK, models.UserInventoryResponse{
		Items:         items,
		Cases:         cases,
		Achievements:  achievements,
		Customization: &customization,
	})
}

// EquipItem godoc
// @Summary Экипировать/снять предмет
// @Description Устанавливает или снимает предмет кастомизации
// @Tags inventory
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.EquipItemRequest true "Equip request"
// @Success 200 {object} models.ProfileCustomization
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/inventory/equip [post]
func (h *InventoryHandlers) EquipItem(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.EquipItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Проверяем, что предмет есть в инвентаре
	var item models.CustomizationItem
	if err := h.db.Where("user_id = ? AND item_id = ?", userID, req.ItemID).First(&item).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item not found in inventory"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check item"})
		return
	}

	// Получаем или создаём кастомизацию
	var customization models.ProfileCustomization
	if err := h.db.Where("user_id = ?", userID).First(&customization).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			customization = models.ProfileCustomization{UserID: userID.(int64)}
			h.db.Create(&customization)
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch customization"})
			return
		}
	}

	// Обновляем соответствующий слот
	var itemIDPtr *string
	if req.Equip {
		itemIDPtr = &req.ItemID
	}

	switch req.ItemType {
	case models.ItemTypeBackground:
		customization.BackgroundID = itemIDPtr
	case models.ItemTypeNameColor:
		customization.NameColorID = itemIDPtr
	case models.ItemTypeAvatarFrame:
		customization.AvatarFrameID = itemIDPtr
	case models.ItemTypeTitle:
		customization.TitleID = itemIDPtr
	case models.ItemTypeEffect:
		customization.EffectID = itemIDPtr
	case models.ItemTypeBadge:
		// Для бейджей используем первый свободный слот или заменяем
		if customization.Badge1ID == nil || *customization.Badge1ID == req.ItemID {
			customization.Badge1ID = itemIDPtr
		} else if customization.Badge2ID == nil || *customization.Badge2ID == req.ItemID {
			customization.Badge2ID = itemIDPtr
		} else if customization.Badge3ID == nil || *customization.Badge3ID == req.ItemID {
			customization.Badge3ID = itemIDPtr
		} else {
			// Все слоты заняты - заменяем первый
			customization.Badge1ID = itemIDPtr
		}
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item type"})
		return
	}

	// Обновляем isEquipped у предметов
	h.db.Model(&models.CustomizationItem{}).
		Where("user_id = ? AND item_type = ?", userID, req.ItemType).
		Update("is_equipped", false)

	if req.Equip {
		h.db.Model(&item).Update("is_equipped", true)
	}

	// Сохраняем кастомизацию
	if err := h.db.Save(&customization).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save customization"})
		return
	}

	c.JSON(http.StatusOK, customization)
}

// OpenCase godoc
// @Summary Открыть кейс
// @Description Открывает кейс и добавляет выпавший предмет в инвентарь
// @Tags inventory
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.OpenCaseRequest true "Open case request"
// @Success 200 {object} models.OpenCaseResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/inventory/cases/open [post]
func (h *InventoryHandlers) OpenCase(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.OpenCaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Находим кейс
	var userCase models.UserCase
	if err := h.db.Where("id = ? AND user_id = ? AND is_opened = false", req.CaseID, userID).First(&userCase).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Case not found or already opened"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find case"})
		return
	}

	// Генерируем выпавший предмет на основе типа кейса
	droppedItem := generateDroppedItem(userCase.CaseType, userCase.Rarity)
	droppedItem.UserID = userID.(int64)

	// Проверяем, есть ли уже такой предмет
	var existingItem models.CustomizationItem
	isNew := true
	if err := h.db.Where("user_id = ? AND item_id = ?", userID, droppedItem.ItemID).First(&existingItem).Error; err == nil {
		// Предмет уже есть - увеличиваем количество
		existingItem.Quantity++
		h.db.Save(&existingItem)
		droppedItem = existingItem
		isNew = false
	} else {
		// Добавляем новый предмет
		h.db.Create(&droppedItem)
	}

	// Помечаем кейс открытым
	now := time.Now()
	userCase.IsOpened = true
	userCase.OpenedAt = &now
	h.db.Save(&userCase)

	c.JSON(http.StatusOK, models.OpenCaseResponse{
		DroppedItem: droppedItem,
		IsNew:       isNew,
	})
}

// GiveCase godoc
// @Summary Выдать кейс пользователям (Admin)
// @Description Выдаёт кейсы указанным пользователям
// @Tags inventory
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.GiveCaseRequest true "Give case request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Router /api/admin/cases/give [post]
func (h *InventoryHandlers) GiveCase(c *gin.Context) {
	// Роль уже проверена middleware RequireRoleMiddleware
	// Дополнительная проверка для безопасности
	role, exists := c.Get("user_role")
	if !exists || role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return
	}

	var req models.GiveCaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Выдаём кейсы всем пользователям
	var givenCount int
	for _, userID := range req.UserIDs {
		userCase := models.UserCase{
			UserID:   userID,
			CaseType: req.CaseType,
			CaseName: req.CaseName,
			Rarity:   req.Rarity,
			IsOpened: false,
		}
		if err := h.db.Create(&userCase).Error; err == nil {
			givenCount++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Cases given successfully",
		"givenCount": givenCount,
		"totalUsers": len(req.UserIDs),
	})
}

// GetUserCustomization godoc
// @Summary Получить кастомизацию пользователя по ID
// @Description Возвращает активную кастомизацию профиля пользователя
// @Tags inventory
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} models.UserCustomizationResponse
// @Failure 404 {object} map[string]string
// @Router /api/users/{id}/customization [get]
func (h *InventoryHandlers) GetUserCustomization(c *gin.Context) {
	userIDParam := c.Param("id")

	// Получаем кастомизацию пользователя
	var customization models.ProfileCustomization
	if err := h.db.Where("user_id = ?", userIDParam).First(&customization).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Возвращаем пустую кастомизацию
			c.JSON(http.StatusOK, models.UserCustomizationResponse{})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch customization"})
		return
	}

	// Собираем данные об экипированных предметах
	response := models.UserCustomizationResponse{}

	// Загружаем предметы по ID
	if customization.BackgroundID != nil {
		var item models.CustomizationItem
		if err := h.db.Where("item_id = ?", *customization.BackgroundID).First(&item).Error; err == nil {
			response.Background = &models.CustomizationItemPublic{
				ID:    item.ItemID,
				Name:  item.Name,
				Value: item.Value,
			}
		}
	}

	if customization.NameColorID != nil {
		var item models.CustomizationItem
		if err := h.db.Where("item_id = ?", *customization.NameColorID).First(&item).Error; err == nil {
			response.NameColor = &models.CustomizationItemPublic{
				ID:    item.ItemID,
				Name:  item.Name,
				Value: item.Value,
			}
		}
	}

	if customization.AvatarFrameID != nil {
		var item models.CustomizationItem
		if err := h.db.Where("item_id = ?", *customization.AvatarFrameID).First(&item).Error; err == nil {
			response.AvatarFrame = &models.CustomizationItemPublic{
				ID:    item.ItemID,
				Name:  item.Name,
				Value: item.Value,
			}
		}
	}

	if customization.TitleID != nil {
		var item models.CustomizationItem
		if err := h.db.Where("item_id = ?", *customization.TitleID).First(&item).Error; err == nil {
			response.Title = &models.CustomizationItemPublic{
				ID:    item.ItemID,
				Name:  item.Name,
				Value: item.Value,
			}
		}
	}

	if customization.EffectID != nil {
		var item models.CustomizationItem
		if err := h.db.Where("item_id = ?", *customization.EffectID).First(&item).Error; err == nil {
			response.Effect = &models.CustomizationItemPublic{
				ID:    item.ItemID,
				Name:  item.Name,
				Value: item.Value,
			}
		}
	}

	// Загружаем бейджи
	badgeIDs := []*string{customization.Badge1ID, customization.Badge2ID, customization.Badge3ID}
	for _, badgeID := range badgeIDs {
		if badgeID != nil {
			var item models.CustomizationItem
			if err := h.db.Where("item_id = ?", *badgeID).First(&item).Error; err == nil {
				response.Badges = append(response.Badges, models.CustomizationItemPublic{
					ID:    item.ItemID,
					Name:  item.Name,
					Value: item.Value,
				})
			}
		}
	}

	c.JSON(http.StatusOK, response)
}

// generateDroppedItem генерирует случайный предмет из кейса
func generateDroppedItem(caseType string, caseRarity models.RarityType) models.CustomizationItem {
	rand.Seed(time.Now().UnixNano())

	// Определяем возможные редкости на основе типа кейса
	var possibleRarities []models.RarityType
	switch caseRarity {
	case models.RarityCommon:
		possibleRarities = []models.RarityType{models.RarityCommon}
	case models.RarityUncommon:
		possibleRarities = []models.RarityType{models.RarityCommon, models.RarityUncommon}
	case models.RarityRare:
		possibleRarities = []models.RarityType{models.RarityCommon, models.RarityUncommon, models.RarityRare}
	case models.RarityEpic:
		possibleRarities = []models.RarityType{models.RarityUncommon, models.RarityRare, models.RarityEpic}
	case models.RarityLegendary:
		possibleRarities = []models.RarityType{models.RarityRare, models.RarityEpic, models.RarityLegendary}
	}

	// Случайная редкость с весами
	rarity := rollRarity(possibleRarities)

	// Случайный тип предмета
	itemTypes := []models.CustomizationItemType{
		models.ItemTypeBackground,
		models.ItemTypeNameColor,
		models.ItemTypeAvatarFrame,
		models.ItemTypeBadge,
	}
	itemType := itemTypes[rand.Intn(len(itemTypes))]

	// Генерируем предмет
	return models.CustomizationItem{
		ItemID:   generateItemID(itemType, rarity),
		ItemType: itemType,
		Rarity:   rarity,
		Name:     generateItemName(itemType, rarity),
		Value:    generateItemValue(itemType),
		Quantity: 1,
	}
}

func rollRarity(possible []models.RarityType) models.RarityType {
	// Веса для редкостей
	weights := map[models.RarityType]int{
		models.RarityCommon:    50,
		models.RarityUncommon:  30,
		models.RarityRare:      15,
		models.RarityEpic:      4,
		models.RarityLegendary: 1,
	}

	totalWeight := 0
	for _, r := range possible {
		totalWeight += weights[r]
	}

	roll := rand.Intn(totalWeight)
	cumulative := 0
	for _, r := range possible {
		cumulative += weights[r]
		if roll < cumulative {
			return r
		}
	}
	return possible[0]
}

func generateItemID(itemType models.CustomizationItemType, rarity models.RarityType) string {
	prefix := map[models.CustomizationItemType]string{
		models.ItemTypeBackground:  "bg",
		models.ItemTypeNameColor:   "color",
		models.ItemTypeAvatarFrame: "frame",
		models.ItemTypeBadge:       "badge",
		models.ItemTypeTitle:       "title",
		models.ItemTypeEffect:      "effect",
	}
	return prefix[itemType] + "_" + string(rarity) + "_" + randomString(6)
}

func generateItemName(itemType models.CustomizationItemType, rarity models.RarityType) string {
	rarityNames := map[models.RarityType]string{
		models.RarityCommon:    "Обычный",
		models.RarityUncommon:  "Необычный",
		models.RarityRare:      "Редкий",
		models.RarityEpic:      "Эпический",
		models.RarityLegendary: "Легендарный",
	}
	typeNames := map[models.CustomizationItemType]string{
		models.ItemTypeBackground:  "фон",
		models.ItemTypeNameColor:   "цвет ника",
		models.ItemTypeAvatarFrame: "рамка",
		models.ItemTypeBadge:       "значок",
		models.ItemTypeTitle:       "титул",
		models.ItemTypeEffect:      "эффект",
	}
	return rarityNames[rarity] + " " + typeNames[itemType]
}

func generateItemValue(itemType models.CustomizationItemType) string {
	switch itemType {
	case models.ItemTypeBackground:
		gradients := []string{
			"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
			"linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
			"linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
		}
		return gradients[rand.Intn(len(gradients))]
	case models.ItemTypeNameColor:
		colors := []string{"#fbbf24", "#10b981", "#3b82f6", "#a855f7", "#ef4444"}
		return colors[rand.Intn(len(colors))]
	default:
		return ""
	}
}

func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
