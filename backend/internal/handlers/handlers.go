package handlers

import (
	"backend/internal/types"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

// takeToken godoc
// @Summary Takes Telegram token
// @Description Validate tg token and return login result
// @Tags auth
// @Accept json
// @Produce json
// @Param input body types.Token true "Token"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /api/token [post]
func takeToken(c *gin.Context) {
	var req types.Token
	if err := c.ShouldBindBodyWithJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	//TODO: Connect to redis and get the user

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}

// adminLogin godoc
// @Summary Admin login
// @Tags admin
// @Produce json
// @Failure 418 {object} map[string]interface{}
// @Router /admin/api/login [post]
func adminLogin(c *gin.Context) {
	c.JSON(http.StatusTeapot, gin.H{
		"error": errors.New("lol I don't make it"),
	})
}
