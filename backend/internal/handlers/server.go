package handlers

import (
	"backend/internal/database"
	"backend/internal/middleware"
	"backend/internal/services"
	"context"
	"fmt"
	"os"

	"github.com/gin-contrib/cors"
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
	r.Use(cors.Default())
	LoadEnv()

	if err := database.Connect(); err != nil {
		panic(fmt.Sprintf("Failed to connect to PostgreSQL: %v", err))
	}
	defer database.Close()

	connectToRedis()
	defer redisConn.Close()

	notificationService := services.NewNotificationService(redisConn)
	authHandler := NewAuthHandler(notificationService)

	r.POST("/api/token", takeToken) // Legacy endpoint
	r.POST("/api/auth/telegram", authHandler.AuthenticateTelegram)
	r.POST("/api/user/register", registerUser)         // Legacy
	r.GET("/api/users/authorized", getAuthorizedUsers) // Legacy
	r.POST("/api/notification", sendNotification)
	r.POST("/admin/api/login", adminLogin)

	api := r.Group("/api")
	api.Use(middleware.RequireAuth())
	{
		api.GET("/users/me", authHandler.GetMe)
		api.PATCH("/users/me/profile", authHandler.UpdateProfile)
		api.GET("/users/:id", authHandler.GetUser)

		// TODO: Add other route groups here
		// - Hackathons
		// - Teams
		// - Matching
		// - Inventory
		// - Cases
		// - Analytics
	}

	// Admin routes
	admin := r.Group("/api/admin")
	admin.Use(middleware.RequireAuth())
	admin.Use(middleware.RequireRole("admin"))
	{
		// TODO: POST /api/admin/hackathon-creators
		// TODO: POST /api/admin/clothes
		// TODO: POST /api/admin/titles
		// TODO: POST /api/admin/stickers
	}

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
