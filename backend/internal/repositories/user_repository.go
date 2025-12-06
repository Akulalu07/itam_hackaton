package repositories

import (
	"backend/internal/models"
	"context"
	"fmt"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create or update user on telegram auth
func (r *UserRepository) CreateOrUpdate(ctx context.Context, telegramUserID int64, username string) (*models.User, error) {
	user := &models.User{}

	err := r.db.WithContext(ctx).
		Where("telegram_user_id = ?", telegramUserID).
		First(user).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// create
			newUser := &models.User{
				TelegramUserID: telegramUserID,
				Username:       username,
				Authorized:     true,
			}
			if err := r.db.WithContext(ctx).Create(newUser).Error; err != nil {
				return nil, fmt.Errorf("failed to create user: %w", err)
			}
			return newUser, nil
		}
		return nil, err
	}

	// Update existing user
	user.Username = username
	user.Authorized = true

	if err := r.db.WithContext(ctx).Save(user).Error; err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return user, nil
}

func (r *UserRepository) GetByTelegramID(ctx context.Context, telegramUserID int64) (*models.User, error) {
	user := &models.User{}

	err := r.db.WithContext(ctx).
		Where("telegram_user_id = ?", telegramUserID).
		First(user).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id int64) (*models.User, error) {
	user := &models.User{}
	err := r.db.WithContext(ctx).First(user, id).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) UpdateProfile(ctx context.Context, id int64, skillRating *int, tags []string) error {
	updates := map[string]interface{}{}

	if skillRating != nil {
		updates["skill_rating"] = *skillRating
	}

	if tags != nil {
		updates["tags"] = tags
	}

	if len(updates) == 0 {
		return nil
	}

	return r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", id).
		Updates(updates).
		Error
}

func (r *UserRepository) UpdateRole(ctx context.Context, id int64, role models.UserRole) error {
	return r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", id).
		Update("role", role).
		Error
}

func (r *UserRepository) GetAllAuthorized(ctx context.Context) ([]models.User, error) {
	var users []models.User

	err := r.db.WithContext(ctx).
		Where("authorized = true").
		Find(&users).Error

	return users, err
}
