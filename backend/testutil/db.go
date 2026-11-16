// Package testutil holds helpers shared by the backend's Go tests.
package testutil

import (
	"fmt"
	"onefit/backend/models"
	"testing"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// NewDB returns a migrated, empty in-memory SQLite database private to the test.
func NewDB(t testing.TB) *gorm.DB {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		t.Fatalf("open test db: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("test db handle: %v", err)
	}
	t.Cleanup(func() { sqlDB.Close() })

	if err := models.Migrate(db); err != nil {
		t.Fatalf("migrate test db: %v", err)
	}

	return db
}

// NewUser inserts a user and returns it.
func NewUser(t testing.TB, db *gorm.DB, firebaseUID string) *models.User {
	t.Helper()

	user := models.User{FirebaseUID: firebaseUID, Email: firebaseUID + "@test.local", Name: firebaseUID}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("create user: %v", err)
	}
	return &user
}
