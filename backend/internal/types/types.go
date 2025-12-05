package types

type Token struct {
	Token string `json:"token"  binding:"required"`
}

type LoginAdmin struct {
	UserName string `json:"username"  binding:"required"`
	Password string `json:"password"  binding:"required"`
}
