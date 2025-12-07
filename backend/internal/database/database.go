package database

import (
	"backend/internal/models"
	"context"
	"errors"
	"fmt"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() (*gorm.DB, error) {
	host := getEnv("POSTGRES_HOST", "postgres")
	port := getEnv("POSTGRES_PORT", "5432")
	user := getEnv("POSTGRES_USER", "postgres")
	pass := getEnv("POSTGRES_PASSWORD", "postgres")
	dbname := getEnv("POSTGRES_DB", "itam_hackaton")

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		host, user, pass, dbname, port,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	DB = db
	return db, nil
}

func Close() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

func AutoMigrate() error {
	// Создаём таблицы если их нет, но не удаляем существующие constraints
	migrator := DB.Migrator()

	// Миграция моделей по одной для лучшего контроля
	modelsToMigrate := []interface{}{
		&models.User{},
		&models.Case{},
		&models.CaseContent{},
		&models.CaseItem{},
		&models.Clothes{},
		&models.Hackathon{},
		&models.HackathonParticipant{},
		&models.Team{},
		&models.TeamJoinRequest{},
		&models.TeamInvite{},
		&models.Swipe{},
		&models.Match{},
		// Customization models
		&models.CustomizationItem{},
		&models.UserCase{},
		&models.UserAchievement{},
		&models.ProfileCustomization{},
	}

	for _, model := range modelsToMigrate {
		if !migrator.HasTable(model) {
			if err := DB.AutoMigrate(model); err != nil {
				return fmt.Errorf("failed to migrate %T: %w", model, err)
			}
		}
	}

	return nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func CreateUser(ctx context.Context, telegramUserID int64, username string) (*models.User, error) {
	var user models.User

	err := DB.WithContext(ctx).Where("telegram_user_id = ?", telegramUserID).First(&user).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// New user
		user = models.User{
			TelegramUserID: telegramUserID,
			Username:       username,
			Authorized:     true,
		}
		if err := DB.WithContext(ctx).Create(&user).Error; err != nil {
			return nil, err
		}
		return &user, nil
	}

	if err != nil {
		return nil, err
	}

	// Update existing user
	if err := DB.WithContext(ctx).Model(&user).Updates(map[string]interface{}{
		"username":   username,
		"authorized": true,
	}).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func UserExists(ctx context.Context, telegramUserID int64) (bool, error) {
	var count int64
	err := DB.WithContext(ctx).Model(&models.User{}).
		Where("telegram_user_id = ?", telegramUserID).
		Count(&count).Error

	return count > 0, err
}

func GetUser(ctx context.Context, telegramUserID int64) (*models.User, error) {
	var user models.User
	err := DB.WithContext(ctx).Where("telegram_user_id = ?", telegramUserID).
		First(&user).Error

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func GetAllAuthorizedUsers(ctx context.Context) ([]models.User, error) {
	var users []models.User
	err := DB.WithContext(ctx).
		Where("authorized = true").
		Find(&users).Error

	return users, err
}
