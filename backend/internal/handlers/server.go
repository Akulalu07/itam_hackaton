package handlers

import (
	"context"
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

var REDISUSER string
var REDISPASS string
var REDISADDR string

var ADMINUSER string
var ADMINPASS string

var redisConn *redis.Client
var ctx = context.Background()

func Start_server() {
	r := gin.Default()
	LoadEnv()
	r.POST("/api/token", takeToken)
	r.POST("/admin/api/login", adminLogin)

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	connectToRedis()
	defer redisConn.Close()
	if err := r.Run("0.0.0.0:8080"); err != nil {
		panic(err)
	}
}

func connectToRedis() {
	var err error
	redisConn = redis.NewClient(&redis.Options{
		Addr:     REDISADDR,
		Username: REDISUSER,
		Password: REDISPASS,
		DB:       0,
	})

	if err != nil {
		panic(fmt.Sprintf("err with connect to redis; err %s", err))
	}

}

// Load from env don't work. I don't know why

// FIXME Try to fix it

func LoadEnv() {
	REDISUSER = getFromEnv("REDIS_USER", "admin")

	REDISPASS = getFromEnv("REDIS_PASS", "some_pass")

	REDISADDR = getFromEnv("REDIS_ADDR", "redis:6379")
	ADMINUSER = getFromEnv("ADMINUSER", "admin")
	ADMINPASS = getFromEnv("ADMINPASS", "admin")
}

func getFromEnv(variadle string, defaultVariable string) string {
	variab := os.Getenv(variadle)
	if variab == "" {
		variab = defaultVariable
	}
	fmt.Printf("%s:%s\n", variadle, variab)
	return variab
}
