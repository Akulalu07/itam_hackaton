package handlers

import (
	"backend/internal/database"
	"backend/internal/middleware"
	"backend/internal/repositories"
	"backend/internal/services"
	"context"
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
	if err := database.AutoMigrate(); err != nil {
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

	// ============================================
	// PUBLIC ROUTES (No Auth Required)
	// ============================================
	public := r.Group("/api")
	{
		public.POST("/auth/telegram", server.AuthTelegram)
		public.POST("/auth/refresh", server.RefreshToken)
		public.POST("/token", takeToken)            // Token exchange from TG bot
		public.POST("/user/register", registerUser) // Register user from TG bot
		public.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})

		// Public customization endpoint for SwipeCard display
		inventoryHandlersPublic := NewInventoryHandlers(db)
		public.GET("/users/:id/customization", inventoryHandlersPublic.GetUserCustomization)
	}

	// Admin login (separate)
	r.POST("/admin/api/login", server.AdminLogin)

	// Swagger docs (public)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// ============================================
	// PROTECTED ROUTES (JWT Auth Required)
	// ============================================
	protected := r.Group("/api")
	protected.Use(middleware.JWTAuthMiddleware())
	{
		// User routes
		protected.GET("/users/me", server.GetMe)
		protected.PATCH("/users/me/profile", server.UpdateProfile)
		protected.GET("/users/:id", server.GetUser)

		// Recommendations & Swipe
		protected.GET("/recommendations", server.GetRecommendations)
		protected.POST("/swipe", server.Swipe)

		// Teams
		protected.GET("/teams", server.GetTeams)
		protected.GET("/teams/my", server.GetMyTeam)
		protected.POST("/teams", server.CreateTeam)
		protected.PUT("/teams/:id", server.UpdateTeam)
		protected.POST("/teams/:id/leave", server.LeaveTeam)
		protected.POST("/teams/:id/kick", server.KickMember)
		protected.PUT("/teams/:id/status", server.UpdateTeamStatus)
		protected.POST("/teams/:id/invite-link", server.GenerateInviteLink)
		protected.POST("/teams/join", server.JoinTeamByCode)

		// Invites
		protected.GET("/invites/incoming", server.GetIncomingInvites)
		protected.GET("/invites/outgoing", server.GetOutgoingInvites)
		protected.POST("/invites", server.SendInvite)
		protected.POST("/invites/:id/accept", server.AcceptInvite)
		protected.POST("/invites/:id/decline", server.DeclineInvite)
		protected.DELETE("/invites/:id", server.CancelInvite)

		// Hackathons
		protected.GET("/hackathons", server.GetHackathons)
		protected.GET("/hackathons/active", server.GetActiveHackathons)
		protected.GET("/hackathons/:id", server.GetHackathon)
		protected.POST("/hackathons/:id/register", server.RegisterForHackathon)

		// Notifications
		protected.POST("/notification", server.SendNotification)

		// Inventory & Customization
		inventoryHandlers := NewInventoryHandlers(db)
		protected.GET("/inventory", inventoryHandlers.GetInventory)
		protected.POST("/inventory/equip", inventoryHandlers.EquipItem)
		protected.POST("/inventory/cases/open", inventoryHandlers.OpenCase)
	}

	// ============================================
	// ADMIN ROUTES (Admin Role Required)
	// ============================================
	admin := r.Group("/api/admin")
	admin.Use(middleware.JWTAuthMiddleware())
	admin.Use(middleware.RequireRoleMiddleware("admin"))
	{
		admin.POST("/promote", server.AdminPromoteToCreator)
		admin.GET("/stats", server.GetAdminStats)
		admin.GET("/users", server.GetAllUsers)
		admin.PUT("/users/:id", server.AdminUpdateUser)
		admin.GET("/teams", server.GetAllTeams)
		admin.POST("/assign", server.AdminAssignToTeam)
		admin.POST("/hackathons", server.CreateHackathon)
		admin.PUT("/hackathons/:id", server.AdminUpdateHackathon)
		admin.DELETE("/hackathons/:id", server.DeleteHackathon)

		// Admin Inventory - выдача кейсов
		adminInventoryHandlers := NewInventoryHandlers(db)
		admin.POST("/cases/give", adminInventoryHandlers.GiveCase)
	}

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "itam-hackaton-backend"})
	})

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
	redisAddr := getEnv("REDISADDR", "redis:6379")
	redisUser := getEnv("REDISUSER", "")
	redisPass := getEnv("REDISPASSWORD", "")

	fmt.Printf("[DEBUG] Redis config: addr=%s, user='%s', pass='%s'\n", redisAddr, redisUser, redisPass)

	opts := &redis.Options{
		Addr: redisAddr,
		DB:   0,
	}

	// Only set username/password if they are provided
	if redisUser != "" {
		opts.Username = redisUser
	}
	if redisPass != "" {
		opts.Password = redisPass
	}

	client := redis.NewClient(opts)
	if err := client.Ping(context.Background()).Err(); err != nil {
		panic("Failed to connect Redis: " + err.Error())
	}
	fmt.Println("[DEBUG] Successfully connected to Redis!")
	return client
}
