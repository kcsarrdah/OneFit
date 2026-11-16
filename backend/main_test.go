package main

import (
	"onefit/backend/models"
	"onefit/backend/testutil"
	"testing"
	"time"
)

func TestSetupDevDataCreatesMissingUser(t *testing.T) {
	t.Setenv("GIN_MODE", "debug")
	db := testutil.NewDB(t)

	setupDevData(db)

	var user models.User
	if err := db.First(&user, 1).Error; err != nil {
		t.Fatalf("test user not created: %v", err)
	}
	if user.FirebaseUID != "test-firebase-uid-123" {
		t.Errorf("FirebaseUID = %q", user.FirebaseUID)
	}
}

func TestSetupDevDataKeepsExistingUserAndData(t *testing.T) {
	t.Setenv("GIN_MODE", "debug")
	db := testutil.NewDB(t)
	setupDevData(db)
	if err := db.Model(&models.User{}).Where("id = ?", 1).Update("name", "Renamed").Error; err != nil {
		t.Fatalf("rename: %v", err)
	}
	if err := db.Create(&models.WaterLog{UserID: 1, Amount: 250, LoggedAt: time.Now()}).Error; err != nil {
		t.Fatalf("log water: %v", err)
	}

	// A restart in development
	setupDevData(db)

	var user models.User
	if err := db.First(&user, 1).Error; err != nil {
		t.Fatalf("test user gone: %v", err)
	}
	if user.Name != "Renamed" {
		t.Errorf("Name = %q, want the existing user kept", user.Name)
	}
	var logs int64
	db.Model(&models.WaterLog{}).Where("user_id = ?", 1).Count(&logs)
	if logs != 1 {
		t.Errorf("%d water logs, want 1", logs)
	}
}

func TestSetupDevDataSkipsReleaseMode(t *testing.T) {
	t.Setenv("GIN_MODE", "release")
	db := testutil.NewDB(t)

	setupDevData(db)

	var users int64
	db.Model(&models.User{}).Count(&users)
	if users != 0 {
		t.Errorf("%d users created in release mode", users)
	}
}
