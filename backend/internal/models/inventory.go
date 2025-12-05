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
	ID          int64         `json:"id"`
	Name        string        `json:"name"`
	Description *string       `json:"description,omitempty"`
	Rarity      RarityType    `json:"rarity"`
	Slot        EquipmentSlot `json:"slot"`
	ImagePath   string        `json:"imagePath"`
	CreatedAt   time.Time     `json:"createdAt"`
}

type UserClothes struct {
	ID         int64     `json:"id"`
	UserID     int64     `json:"userId"`
	ClothesID  int64     `json:"clothesId"`
	ObtainedAt time.Time `json:"obtainedAt"`
	Equipped   bool      `json:"equipped"`
}

type Title struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description,omitempty"`
	ImagePath   *string   `json:"imagePath,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
}

type UserTitle struct {
	ID         int64     `json:"id"`
	UserID     int64     `json:"userId"`
	TitleID    int64     `json:"titleId"`
	ObtainedAt time.Time `json:"obtainedAt"`
	Equipped   bool      `json:"equipped"`
}

type Sticker struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description,omitempty"`
	ImagePath   string    `json:"imagePath"`
	UniqueToken *string   `json:"uniqueToken,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
}

type UserSticker struct {
	ID         int64     `json:"id"`
	UserID     int64     `json:"userId"`
	StickerID  int64     `json:"stickerId"`
	ObtainedAt time.Time `json:"obtainedAt"`
}

type Case struct {
	ID          int64      `json:"id"`
	UserID      int64      `json:"userId"`
	HackathonID *int64     `json:"hackathonId,omitempty"`
	Opened      bool       `json:"opened"`
	OpenedAt    *time.Time `json:"openedAt,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
	Contents    []CaseItem `json:"contents,omitempty"`
}

type CaseItem struct {
	ItemType string `json:"itemType"`
	ItemID   int64  `json:"itemId"`
}

type CaseContent struct {
	ID        int64     `json:"id"`
	CaseID    int64     `json:"caseId"`
	ItemType  string    `json:"itemType"`
	ItemID    int64     `json:"itemId"`
	CreatedAt time.Time `json:"createdAt"`
}
