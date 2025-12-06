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
	Rarity      RarityType    `gorm:"type:rarity_type;not null" json:"rarity"`
	Slot        EquipmentSlot `gorm:"type:equipment_slot;not null" json:"slot"`
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
