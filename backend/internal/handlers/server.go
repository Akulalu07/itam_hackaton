package handlers

import (
	"backend/internal/database"
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

	if err := database.Connect(); err != nil {
		panic(fmt.Sprintf("Failed to connect to PostgreSQL: %v", err))
	}
	defer database.Close()

	connectToRedis()
	defer redisConn.Close()

	r.POST("/api/token", takeToken)
	r.POST("/api/user/register", registerUser)
	r.GET("/api/users/authorized", getAuthorizedUsers)
	r.POST("/api/notification", sendNotification)
	r.POST("/admin/api/login", adminLogin)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	if err := r.Run("0.0.0.0:8080"); err != nil {
		panic(err)
	}
}

func connectToRedis() {
	redisConn = redis.NewClient(&redis.Options{
		Addr:     REDISADDR,
		Username: REDISUSER,
		Password: REDISPASS,
		DB:       0,
	})

	_, err := redisConn.Ping(ctx).Result()
	if err != nil {
		panic(fmt.Sprintf("err with connect to redis; err %s", err))
	}
	fmt.Println("Successfully connected to Redis")
}

func LoadEnv() {
	REDISUSER = getFromEnv("REDISUSER", "admin")
	REDISPASS = getFromEnv("REDISPASSWORD", "some_pass")
	REDISADDR = getFromEnv("REDISADDR", "redis:6379")
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
