package handlers

import (
	"github.com/gin-gonic/gin"
)

func Start_server() {
	r := gin.Default()
	r.POST("/api/token", takeToken)
	r.Run("0.0.0.0:8080")
}
