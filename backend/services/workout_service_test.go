package services

import (
	"onefit/backend/models"
	"onefit/backend/testutil"
	"testing"
	"time"

	"gorm.io/gorm"
)

// liveCount counts rows of model that are not soft-deleted.
func liveCount(t *testing.T, db *gorm.DB, model any, query string, args ...any) int64 {
	t.Helper()

	var n int64
	if err := db.Model(model).Where(query, args...).Count(&n).Error; err != nil {
		t.Fatalf("count: %v", err)
	}
	return n
}

// finishedWorkoutWithSets starts a workout, adds an exercise, logs sets and ends it.
func finishedWorkoutWithSets(t *testing.T, ws *WorkoutService, userID, exerciseID uint, sets int) (*models.WorkoutSession, *models.SessionExercise) {
	t.Helper()

	workout, err := ws.StartWorkout(userID, "Workout", nil, "")
	if err != nil {
		t.Fatalf("start: %v", err)
	}
	sessionExercise, err := ws.AddExerciseToWorkout(userID, workout.ID, exerciseID, 0, "")
	if err != nil {
		t.Fatalf("add exercise: %v", err)
	}
	reps := 5
	for i := 0; i < sets; i++ {
		if _, err := ws.LogSet(userID, workout.ID, sessionExercise.ID, &reps, nil, nil, nil, nil); err != nil {
			t.Fatalf("log set: %v", err)
		}
	}
	ended := time.Now()
	if _, err := ws.UpdateWorkout(userID, workout.ID, nil, nil, &ended, nil); err != nil {
		t.Fatalf("finish: %v", err)
	}
	return workout, sessionExercise
}

func TestDeleteWorkoutSoftDeletesChildrenAndStats(t *testing.T) {
	db := testutil.NewDB(t)
	ws := NewWorkoutService(db)
	user := testutil.NewUser(t, db, "user")
	exercise, err := NewExerciseService(db).CreateCustomExercise(user.ID, "Curl", "", "", "")
	if err != nil {
		t.Fatalf("create exercise: %v", err)
	}

	kept, _ := finishedWorkoutWithSets(t, ws, user.ID, exercise.ID, 2)
	deleted, deletedExercise := finishedWorkoutWithSets(t, ws, user.ID, exercise.ID, 3)

	if err := ws.DeleteWorkout(user.ID, deleted.ID); err != nil {
		t.Fatalf("DeleteWorkout: %v", err)
	}

	if n := liveCount(t, db, &models.SessionExercise{}, "session_id = ?", deleted.ID); n != 0 {
		t.Errorf("%d session exercises left live", n)
	}
	if n := liveCount(t, db, &models.ExerciseSet{}, "session_exercise_id = ?", deletedExercise.ID); n != 0 {
		t.Errorf("%d sets left live", n)
	}
	if n := liveCount(t, db, &models.SessionExercise{}, "session_id = ?", kept.ID); n != 1 {
		t.Errorf("kept workout has %d session exercises, want 1", n)
	}

	stats, err := ws.GetWorkoutStats(user.ID, 30)
	if err != nil {
		t.Fatalf("stats: %v", err)
	}
	if stats["total_workouts"] != int64(1) || stats["total_sets"] != int64(2) {
		t.Errorf("stats = %v, want 1 workout and 2 sets", stats)
	}

	// The exercise is now only used by the kept workout's rows
	if err := ws.DeleteWorkout(user.ID, kept.ID); err != nil {
		t.Fatalf("DeleteWorkout: %v", err)
	}
	if err := NewExerciseService(db).DeleteCustomExercise(user.ID, exercise.ID); err != nil {
		t.Errorf("exercise used only by deleted workouts should be deletable: %v", err)
	}
}

func TestStatsIgnoreSetsOfDeletedParents(t *testing.T) {
	db := testutil.NewDB(t)
	ws := NewWorkoutService(db)
	user := testutil.NewUser(t, db, "user")
	exercise, err := NewExerciseService(db).CreateCustomExercise(user.ID, "Curl", "", "", "")
	if err != nil {
		t.Fatalf("create exercise: %v", err)
	}
	workout, _ := finishedWorkoutWithSets(t, ws, user.ID, exercise.ID, 2)

	// Rows orphaned before deletes cascaded: parent deleted, sets still live
	if err := db.Delete(&models.WorkoutSession{}, workout.ID).Error; err != nil {
		t.Fatalf("delete: %v", err)
	}

	stats, err := ws.GetWorkoutStats(user.ID, 30)
	if err != nil {
		t.Fatalf("stats: %v", err)
	}
	if stats["total_sets"] != int64(0) {
		t.Errorf("total_sets = %v, want 0", stats["total_sets"])
	}
}

func TestRemoveExerciseFromWorkoutSoftDeletesSets(t *testing.T) {
	db := testutil.NewDB(t)
	ws := NewWorkoutService(db)
	user := testutil.NewUser(t, db, "user")
	exercise, err := NewExerciseService(db).CreateCustomExercise(user.ID, "Curl", "", "", "")
	if err != nil {
		t.Fatalf("create exercise: %v", err)
	}
	workout, sessionExercise := finishedWorkoutWithSets(t, ws, user.ID, exercise.ID, 2)

	if err := ws.RemoveExerciseFromWorkout(user.ID, workout.ID, sessionExercise.ID); err != nil {
		t.Fatalf("RemoveExerciseFromWorkout: %v", err)
	}
	if n := liveCount(t, db, &models.ExerciseSet{}, "session_exercise_id = ?", sessionExercise.ID); n != 0 {
		t.Errorf("%d sets left live", n)
	}
}
