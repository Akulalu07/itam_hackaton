package database

import (
	"context"
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

type User struct {
	TelegramUserID int64
	Username       string
	Authorized     bool
	CreatedAt      string
}

func Connect() error {
	host := getFromEnv("POSTGRES_HOST", "postgres")
	port := getFromEnv("POSTGRES_PORT", "5432")
	user := getFromEnv("POSTGRES_USER", "postgres")
	password := getFromEnv("POSTGRES_PASSWORD", "postgres")
	dbname := getFromEnv("POSTGRES_DB", "itam_hackaton")

	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	DB, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	if err = DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	fmt.Println("Successfully connected to PostgreSQL")
	return nil
}

func Close() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}

func getFromEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func CreateUser(ctx context.Context, telegramUserID int64, username string) error {
	query := `
		INSERT INTO users (telegram_user_id, username, authorized, created_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (telegram_user_id) DO UPDATE
		SET username = EXCLUDED.username, authorized = true
		RETURNING telegram_user_id
	`
	
	var id int64
	err := DB.QueryRowContext(ctx, query, telegramUserID, username, true).Scan(&id)
	if err != nil {
		return fmt.Errorf("failed to create/update user: %w", err)
	}
	
	return nil
}

func UserExists(ctx context.Context, telegramUserID int64) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE telegram_user_id = $1)`
	err := DB.QueryRowContext(ctx, query, telegramUserID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check user existence: %w", err)
	}
	return exists, nil
}

func GetUser(ctx context.Context, telegramUserID int64) (*User, error) {
	user := &User{}
	query := `SELECT telegram_user_id, username, authorized, created_at FROM users WHERE telegram_user_id = $1`
	
	err := DB.QueryRowContext(ctx, query, telegramUserID).Scan(
		&user.TelegramUserID,
		&user.Username,
		&user.Authorized,
		&user.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	
	return user, nil
}

func GetAllAuthorizedUsers(ctx context.Context) ([]User, error) {
	query := `SELECT telegram_user_id, username, authorized, created_at FROM users WHERE authorized = true`
	
	rows, err := DB.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()
	
	var users []User
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.TelegramUserID, &user.Username, &user.Authorized, &user.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}
	
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating users: %w", err)
	}
	
	return users, nil
}

