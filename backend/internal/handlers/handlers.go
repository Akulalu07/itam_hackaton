package handlers

import (
	"backend/internal/types"
	"fmt"
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

	val, err := redisConn.Get(ctx, req.Token).Result()
	if err != nil {
		fmt.Println("Maybe you don't get this token")
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid or expired token",
		})
		return
	}

	// TODO: Analyze time
	ans := split(val)
	id, name, time := ans[0], ans[1], ans[2]
	fmt.Println(time)
	c.JSON(http.StatusOK, gin.H{
		"id":   id,
		"name": name,
	})
}

// adminLogin godoc
// @Summary      Admin login
// @Tags         admin
// @Accept       json
// @Produce      json
// @Param        input  body      types.LoginAdmin  true  "Admin credentials"
// @Success      200    {object}  map[string]interface{}
// @Failure      400    {object}  map[string]interface{}  "Bad request"
// @Failure      401    {object}  map[string]interface{}  "Invalid credentials"
// @Router       /admin/api/login [post]
func adminLogin(c *gin.Context) {
	var req types.LoginAdmin

	if err := c.ShouldBindBodyWithJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	if req.UserName == ADMINUSER && req.Password == ADMINPASS {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
		return
	}
	c.JSON(http.StatusUnauthorized, gin.H{
		"error": "Invalid credentials",
	})

}
