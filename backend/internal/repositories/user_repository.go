package repositories

import (
	"backend/internal/database"
	"backend/internal/models"
	"context"
	"database/sql"
	"fmt"
	"strings"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository() *UserRepository {
	return &UserRepository{db: database.DB}
}

func (r *UserRepository) CreateOrUpdate(ctx context.Context, telegramUserID int64, username string) (*models.User, error) {
	query := `
		INSERT INTO users (telegram_user_id, username, authorized, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		ON CONFLICT (telegram_user_id) DO UPDATE
		SET username = EXCLUDED.username, authorized = true, updated_at = NOW()
		RETURNING id, telegram_user_id, username, authorized, role, skill_rating, tags, team_id, created_at, updated_at
	`
	
	user := &models.User{}
	var skillRating sql.NullInt64
	var teamID sql.NullInt64
	var tags []string
	
	err := r.db.QueryRowContext(ctx, query, telegramUserID, username, true).Scan(
		&user.ID,
		&user.TelegramUserID,
		&user.Username,
		&user.Authorized,
		&user.Role,
		&skillRating,
		&tags,
		&teamID,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	
	if err != nil {
		return nil, fmt.Errorf("failed to create/update user: %w", err)
	}
	
	if skillRating.Valid {
		rating := int(skillRating.Int64)
		user.SkillRating = &rating
	}
	
	if teamID.Valid {
		user.TeamID = &teamID.Int64
	}
	
	user.Tags = tags
	return user, nil
}

func (r *UserRepository) GetByTelegramID(ctx context.Context, telegramUserID int64) (*models.User, error) {
	query := `
		SELECT id, telegram_user_id, username, authorized, role, skill_rating, tags, team_id, created_at, updated_at
		FROM users
		WHERE telegram_user_id = $1
	`
	
	user := &models.User{}
	var skillRating sql.NullInt64
	var teamID sql.NullInt64
	var tags []string
	
	err := r.db.QueryRowContext(ctx, query, telegramUserID).Scan(
		&user.ID,
		&user.TelegramUserID,
		&user.Username,
		&user.Authorized,
		&user.Role,
		&skillRating,
		&tags,
		&teamID,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	
	if skillRating.Valid {
		rating := int(skillRating.Int64)
		user.SkillRating = &rating
	}
	
	if teamID.Valid {
		user.TeamID = &teamID.Int64
	}
	
	user.Tags = tags
	return user, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id int64) (*models.User, error) {
	query := `
		SELECT id, telegram_user_id, username, authorized, role, skill_rating, tags, team_id, created_at, updated_at
		FROM users
		WHERE id = $1
	`
	
	user := &models.User{}
	var skillRating sql.NullInt64
	var teamID sql.NullInt64
	var tags []string
	
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.TelegramUserID,
		&user.Username,
		&user.Authorized,
		&user.Role,
		&skillRating,
		&tags,
		&teamID,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	
	if skillRating.Valid {
		rating := int(skillRating.Int64)
		user.SkillRating = &rating
	}
	
	if teamID.Valid {
		user.TeamID = &teamID.Int64
	}
	
	user.Tags = tags
	return user, nil
}

func (r *UserRepository) UpdateProfile(ctx context.Context, userID int64, skillRating *int, tags []string) error {
	var query string
	var args []interface{}
	
	updates := []string{}
	argPos := 1
	
	if skillRating != nil {
		updates = append(updates, fmt.Sprintf("skill_rating = $%d", argPos))
		args = append(args, *skillRating)
		argPos++
	}
	
	if tags != nil {
		updates = append(updates, fmt.Sprintf("tags = $%d", argPos))
		args = append(args, fmt.Sprintf("{%s}", strings.Join(tags, ",")))
		argPos++
	}
	
	if len(updates) == 0 {
		return nil
	}
	
	updates = append(updates, fmt.Sprintf("updated_at = NOW()"))
	args = append(args, userID)
	
	query = fmt.Sprintf(`
		UPDATE users
		SET %s
		WHERE id = $%d
	`, strings.Join(updates, ", "), argPos)
	
	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update profile: %w", err)
	}
	
	return nil
}

func (r *UserRepository) UpdateRole(ctx context.Context, userID int64, role models.UserRole) error {
	query := `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, string(role), userID)
	if err != nil {
		return fmt.Errorf("failed to update role: %w", err)
	}
	return nil
}

func (r *UserRepository) GetAllAuthorized(ctx context.Context) ([]models.User, error) {
	query := `
		SELECT id, telegram_user_id, username, authorized, role, skill_rating, tags, team_id, created_at, updated_at
		FROM users
		WHERE authorized = true
	`
	
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()
	
	var users []models.User
	for rows.Next() {
		user := models.User{}
		var skillRating sql.NullInt64
		var teamID sql.NullInt64
		var tags []string
		
		err := rows.Scan(
			&user.ID,
			&user.TelegramUserID,
			&user.Username,
			&user.Authorized,
			&user.Role,
			&skillRating,
			&tags,
			&teamID,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		
		if err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		
		if skillRating.Valid {
			rating := int(skillRating.Int64)
			user.SkillRating = &rating
		}
		
		if teamID.Valid {
			user.TeamID = &teamID.Int64
		}
		
		user.Tags = tags
		users = append(users, user)
	}
	
	return users, nil
}

