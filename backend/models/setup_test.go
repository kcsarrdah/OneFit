package models_test

import (
	"onefit/backend/models"
	"onefit/backend/testutil"
	"testing"
)

func TestMigrateDropsGlobalExerciseNameIndex(t *testing.T) {
	db := testutil.NewDB(t)

	// The unique index older databases have
	if err := db.Exec("CREATE UNIQUE INDEX idx_exercises_name ON exercises(name)").Error; err != nil {
		t.Fatalf("create old index: %v", err)
	}
	if err := models.Migrate(db); err != nil {
		t.Fatalf("Migrate: %v", err)
	}
	if db.Migrator().HasIndex(&models.Exercise{}, "idx_exercises_name") {
		t.Error("idx_exercises_name still exists")
	}

	for _, e := range []models.Exercise{{Name: "Squats"}, {Name: "Squats", IsCustom: true}} {
		if err := db.Create(&e).Error; err != nil {
			t.Fatalf("insert duplicate name: %v", err)
		}
	}
}
