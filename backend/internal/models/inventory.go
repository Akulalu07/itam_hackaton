package models

import "time"

type RarityType string

const (
	RarityCommon    RarityType = "common"
	RarityUncommon  RarityType = "uncommon"
	RarityRare      RarityType = "rare"
	RarityEpic      RarityType = "epic"
	RarityLegendary RarityType = "legendary"
)

type EquipmentSlot string

const (
	SlotHead       EquipmentSlot = "head"
	SlotBody       EquipmentSlot = "body"
	SlotLegs       EquipmentSlot = "legs"
	SlotFeet       EquipmentSlot = "feet"
	SlotBackground EquipmentSlot = "background"
)

type Clothes struct {
	ID          int64         `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string        `gorm:"not null" json:"name"`
	Description *string       `json:"description,omitempty"`
	Rarity      RarityType    `gorm:"type:varchar(20);not null" json:"rarity"`
	Slot        EquipmentSlot `gorm:"type:varchar(20);not null" json:"slot"`
	ImagePath   string        `gorm:"not null" json:"imagePath"`
	CreatedAt   time.Time     `gorm:"autoCreateTime" json:"createdAt"`
}

type UserClothes struct {
	ID         int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID     int64     `gorm:"index" json:"userId"`
	ClothesID  int64     `gorm:"index" json:"clothesId"`
	ObtainedAt time.Time `gorm:"autoCreateTime" json:"obtainedAt"`
	Equipped   bool      `gorm:"default:false" json:"equipped"`
}

type Title struct {
	ID          int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description *string   `json:"description,omitempty"`
	ImagePath   *string   `json:"imagePath,omitempty"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

type UserTitle struct {
	ID         int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID     int64     `gorm:"index" json:"userId"`
	TitleID    int64     `gorm:"index" json:"titleId"`
	ObtainedAt time.Time `gorm:"autoCreateTime" json:"obtainedAt"`
	Equipped   bool      `gorm:"default:false" json:"equipped"`
}

type Sticker struct {
	ID          int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description *string   `json:"description,omitempty"`
	ImagePath   string    `gorm:"not null" json:"imagePath"`
	UniqueToken *string   `gorm:"uniqueIndex" json:"uniqueToken,omitempty"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

type UserSticker struct {
	ID         int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID     int64     `gorm:"index" json:"userId"`
	StickerID  int64     `gorm:"index" json:"stickerId"`
	ObtainedAt time.Time `gorm:"autoCreateTime" json:"obtainedAt"`
}

type CaseItem struct {
	ItemType string `json:"itemType"`
	ItemID   int64  `json:"itemId"`
}

type Case struct {
	ID          int64      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID      int64      `gorm:"index" json:"userId"`
	HackathonID *int64     `gorm:"index" json:"hackathonId,omitempty"`
	Opened      bool       `gorm:"default:false" json:"opened"`
	OpenedAt    *time.Time `json:"openedAt,omitempty"`
	CreatedAt   time.Time  `gorm:"autoCreateTime" json:"createdAt"`

	Contents []CaseContent `gorm:"foreignKey:CaseID"`
}

type CaseContent struct {
	ID        int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	CaseID    int64     `gorm:"index" json:"caseId"`
	ItemType  string    `gorm:"not null" json:"itemType"`
	ItemID    int64     `gorm:"not null" json:"itemId"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// ========================================
// CUSTOMIZATION MODELS - Кастомизация профиля
// ========================================

// CustomizationItemType - тип предмета кастомизации
type CustomizationItemType string

const (
	ItemTypeBackground  CustomizationItemType = "background"
	ItemTypeNameColor   CustomizationItemType = "nameColor"
	ItemTypeAvatarFrame CustomizationItemType = "avatarFrame"
	ItemTypeBadge       CustomizationItemType = "badge"
	ItemTypeTitle       CustomizationItemType = "title"
	ItemTypeEffect      CustomizationItemType = "effect"
)

// CustomizationItem - предмет кастомизации в инвентаре
type CustomizationItem struct {
	ID         int64                 `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID     int64                 `gorm:"index;not null" json:"userId"`
	ItemID     string                `gorm:"not null" json:"itemId"` // ID предмета из каталога фронта
	ItemType   CustomizationItemType `gorm:"type:varchar(30);not null" json:"type"`
	Rarity     RarityType            `gorm:"type:varchar(20);not null" json:"rarity"`
	Name       string                `gorm:"not null" json:"name"`
	Value      string                `json:"value"` // CSS value для цвета/градиента
	IsEquipped bool                  `gorm:"default:false" json:"isEquipped"`
	Quantity   int                   `gorm:"default:1" json:"quantity"`
	ObtainedAt time.Time             `gorm:"autoCreateTime" json:"obtainedAt"`
}

// UserCase - кейс пользователя (расширенный)
type UserCase struct {
	ID         int64      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID     int64      `gorm:"index;not null" json:"userId"`
	CaseType   string     `gorm:"not null" json:"caseType"` // starter, hackathon, finalist, champion, legendary
	CaseName   string     `gorm:"not null" json:"caseName"`
	Rarity     RarityType `gorm:"type:varchar(20);not null" json:"rarity"`
	IsOpened   bool       `gorm:"default:false" json:"isOpened"`
	ReceivedAt time.Time  `gorm:"autoCreateTime" json:"receivedAt"`
	OpenedAt   *time.Time `json:"openedAt,omitempty"`
}

// UserAchievement - достижение пользователя
type UserAchievement struct {
	ID            int64      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID        int64      `gorm:"index;not null" json:"userId"`
	AchievementID string     `gorm:"not null" json:"achievementId"`
	Name          string     `gorm:"not null" json:"name"`
	Description   string     `json:"description"`
	IconURL       string     `json:"iconUrl"`
	Rarity        RarityType `gorm:"type:varchar(20)" json:"rarity"`
	Progress      int        `gorm:"default:0" json:"progress"`
	MaxProgress   int        `gorm:"default:100" json:"maxProgress"`
	IsCompleted   bool       `gorm:"default:false" json:"isCompleted"`
	EarnedAt      *time.Time `json:"earnedAt,omitempty"`
	CreatedAt     time.Time  `gorm:"autoCreateTime" json:"createdAt"`
}

// ProfileCustomization - активная кастомизация профиля
type ProfileCustomization struct {
	ID            int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID        int64     `gorm:"uniqueIndex;not null" json:"userId"`
	BackgroundID  *string   `json:"backgroundId,omitempty"`
	NameColorID   *string   `json:"nameColorId,omitempty"`
	AvatarFrameID *string   `json:"avatarFrameId,omitempty"`
	TitleID       *string   `json:"titleId,omitempty"`
	EffectID      *string   `json:"effectId,omitempty"`
	Badge1ID      *string   `json:"badge1Id,omitempty"`
	Badge2ID      *string   `json:"badge2Id,omitempty"`
	Badge3ID      *string   `json:"badge3Id,omitempty"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

// ========================================
// API Request/Response Types
// ========================================

// UserInventoryResponse - полный инвентарь пользователя
type UserInventoryResponse struct {
	Items         []CustomizationItem   `json:"items"`
	Cases         []UserCase            `json:"cases"`
	Achievements  []UserAchievement     `json:"achievements"`
	Customization *ProfileCustomization `json:"customization"`
}

// EquipItemRequest - запрос на экипировку
type EquipItemRequest struct {
	ItemID   string                `json:"itemId" binding:"required"`
	ItemType CustomizationItemType `json:"itemType" binding:"required"`
	Equip    bool                  `json:"equip"`
}

// OpenCaseRequest - открытие кейса
type OpenCaseRequest struct {
	CaseID int64 `json:"caseId" binding:"required"`
}

// OpenCaseResponse - результат открытия кейса
type OpenCaseResponse struct {
	DroppedItem CustomizationItem `json:"droppedItem"`
	IsNew       bool              `json:"isNew"`
}

// GiveCaseRequest - выдача кейса (админ)
type GiveCaseRequest struct {
	UserIDs  []int64    `json:"userIds" binding:"required"`
	CaseType string     `json:"caseType" binding:"required"`
	CaseName string     `json:"caseName" binding:"required"`
	Rarity   RarityType `json:"rarity" binding:"required"`
}

// ========================================
// Public API Types (for SwipeCard display)
// ========================================

// CustomizationItemPublic - публичная информация о предмете (без user/inventory data)
type CustomizationItemPublic struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Value string `json:"value"` // CSS gradient/color/URL
}

// UserCustomizationResponse - публичная кастомизация для отображения в SwipeCard
type UserCustomizationResponse struct {
	Background  *CustomizationItemPublic  `json:"background,omitempty"`
	NameColor   *CustomizationItemPublic  `json:"nameColor,omitempty"`
	AvatarFrame *CustomizationItemPublic  `json:"avatarFrame,omitempty"`
	Title       *CustomizationItemPublic  `json:"title,omitempty"`
	Effect      *CustomizationItemPublic  `json:"effect,omitempty"`
	Badges      []CustomizationItemPublic `json:"badges,omitempty"`
}
