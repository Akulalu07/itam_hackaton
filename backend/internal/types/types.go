package types

type Token struct {
	Token string `json:"token" binding:"required"`
}

type LoginAdmin struct {
	UserName string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterUserRequest struct {
	TelegramUserID int64  `json:"telegramUserId" binding:"required"`
	Username       string `json:"username" binding:"required"`
}

type NotificationRequest struct {
	Message string                 `json:"message"`
	Type    string                 `json:"type,omitempty"`
	Data    map[string]interface{} `json:"data,omitempty"`
}
