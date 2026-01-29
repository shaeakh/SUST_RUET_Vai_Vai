package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"time"
	"github.com/shaeakh/sust-cms/domain/entities"
)

// UserRepository is a PostgreSQL implementation of the UserRepository interface
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new UserRepository
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Save saves a user to the database
func (r *UserRepository) Save(ctx context.Context, user *entities.User) error {
	query := `
		INSERT INTO users (id, email, password, full_name, role, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.ExecContext(ctx, query,
		user.ID, user.Email, user.Password, user.FullName, user.Role,
		user.CreatedAt, user.UpdatedAt,
	)
	return err
}

// FindByID finds a user by ID
func (r *UserRepository) FindByID(ctx context.Context, id string) (*entities.User, error) {
	user := &entities.User{}
	query := `
		SELECT id, email, password, full_name, role, created_at, updated_at, deleted_at
		FROM users WHERE id = $1
	`
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID, &user.Email, &user.Password, &user.FullName, &user.Role,
		&user.CreatedAt, &user.UpdatedAt, &user.DeletedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found: %w", err)
		}
		return nil, err
	}
	return user, nil
}

// FindByEmail finds a user by email
func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*entities.User, error) {
	user := &entities.User{}
	query := `
		SELECT id, email, password, full_name, role, created_at, updated_at, deleted_at
		FROM users WHERE email = $1 AND deleted_at IS NULL
	`
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID, &user.Email, &user.Password, &user.FullName, &user.Role,
		&user.CreatedAt, &user.UpdatedAt, &user.DeletedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found: %w", err)
		}
		return nil, err
	}
	return user, nil
}

// Update updates a user in the database
func (r *UserRepository) Update(ctx context.Context, user *entities.User) error {
	user.UpdatedAt = time.Now()
	query := `
		UPDATE users
		SET email = $1, password = $2, full_name = $3, role = $4, updated_at = $5
		WHERE id = $6
	`
	_, err := r.db.ExecContext(ctx, query,
		user.Email, user.Password, user.FullName, user.Role, user.UpdatedAt, user.ID,
	)
	return err
}

// Delete soft deletes a user
func (r *UserRepository) Delete(ctx context.Context, id string) error {
	query := `UPDATE users SET deleted_at = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, time.Now(), id)
	return err
}

// ListByRole lists users by role
func (r *UserRepository) ListByRole(ctx context.Context, role entities.UserRole) ([]*entities.User, error) {
	query := `
		SELECT id, email, password, full_name, role, created_at, updated_at, deleted_at
		FROM users WHERE role = $1 AND deleted_at IS NULL
	`
	rows, err := r.db.QueryContext(ctx, query, role)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*entities.User
	for rows.Next() {
		user := &entities.User{}
		if err := rows.Scan(
			&user.ID, &user.Email, &user.Password, &user.FullName, &user.Role,
			&user.CreatedAt, &user.UpdatedAt, &user.DeletedAt,
		); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, rows.Err()
}
