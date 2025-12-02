package handlers

import (
	"backend/internal/types"
	"net/http"

	"github.com/gin-gonic/gin"
)

func takeToken(c *gin.Context) {
	var req types.Token
	if err := c.ShouldBindBodyWithJSON(&req); err != nil {
		c.JSON(http.StatusTeapot, gin.H{
			"error": err.Error(),
		})
		return
	}

	//TODO: Connect to redis and get the user

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}
