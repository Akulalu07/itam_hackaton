package handlers

import (
	"backend/internal/database"
	"backend/internal/repositories"
	"backend/internal/services"
	"fmt"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/gorm"
)

var redisConn *redis.Client

var (
	ADMINUSER string
	ADMINPASS string
)

type Server struct {
	DB                  *gorm.DB
	UserRepo            *repositories.UserRepository
	NotificationService *services.NotificationService
}

func StartServer() {
	r := gin.Default()
	r.Use(cors.Default())
	loadEnv()

	// --- Connect PostgreSQL ---
	db, err := database.Connect()
	if err != nil {
		panic(fmt.Sprintf("failed to connect PostgreSQL: %v", err))
	}

	// Auto-migrate
	if err := database.AutoMigrate(db); err != nil {
		panic(fmt.Sprintf("failed auto-migrate: %v", err))
	}

	// --- Connect Redis ---
	redisConn = connectToRedis()
	notificationService := services.NewNotificationService(redisConn)

	server := &Server{
		DB:                  db,
		UserRepo:            repositories.NewUserRepository(db),
		NotificationService: notificationService,
	}

	// PUBLIC ROUTES
	r.POST("/api/auth/telegram", server.AuthTelegram)
	r.POST("/admin/api/login", server.AdminLogin)

	// USER ROUTES
	r.GET("/api/users/me", server.GetMe)
	r.PATCH("/api/users/me/profile", server.UpdateProfile)
	r.GET("/api/users/:id", server.GetUser)
	r.POST("/api/notification", server.SendNotification)

	// ADMIN — promote to hackathon creator
	r.POST("/api/admin/promote", server.AdminPromoteToCreator)

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	if err := r.Run("0.0.0.0:8080"); err != nil {
		panic(err)
	}
}

func loadEnv() {
	ADMINUSER = getEnv("ADMINUSER", "admin")
	ADMINPASS = getEnv("ADMINPASS", "admin")
}

func getEnv(key, def string) string {
	v := os.Getenv(key)
	if v == "" {
		return def
	}
	return v
}

// ---------------------- REDIS ----------------------

func connectToRedis() *redis.Client {
	client := redis.NewClient(&redis.Options{
		Addr:     getEnv("REDISADDR", "redis:6379"),
		Username: getEnv("REDISUSER", "admin"),
		Password: getEnv("REDISPASSWORD", "some_pass"),
		DB:       0,
	})
	if err := client.Ping(client.Context()).Err(); err != nil {
		panic("Failed to connect Redis: " + err.Error())
	}
	return client
}
