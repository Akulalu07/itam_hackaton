package handlers

import (
	"backend/internal/types"
	"errors"
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

	val, err := redisConn.Get(ctx, "key").Result()
	if err != nil {
		fmt.Println("Maybe ypu don't get this token")
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	fmt.Println(val)

	//TODO: Connect to redis and get the user

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
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

	fmt.Println(req)

	if req.UserName == ADMINUSER && req.Password == ADMINPASS {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
		return
	}
	c.JSON(http.StatusTeapot, gin.H{
		"error": errors.New("lol you are not admin"),
	})

}
