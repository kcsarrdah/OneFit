package services

import (
	"fmt"
	"onefit/backend/models"
	"time"

	"gorm.io/gorm"
)

type WorkoutService struct {
	db *gorm.DB
}

func NewWorkoutService(db *gorm.DB) *WorkoutService {
	return &WorkoutService{db: db}
}

// GetUserWorkouts returns user's workout history with pagination and date filtering
func (ws *WorkoutService) GetUserWorkouts(userID uint, limit, offset int, startDate, endDate string) ([]models.WorkoutSession, int64, error) {
	var workouts []models.WorkoutSession
	var total int64

	query := ws.db.Model(&models.WorkoutSession{}).Where("user_id = ?", userID)

	// Apply date filters if provided
	if startDate != "" {
		query = query.Where("started_at >= ?", startDate+" 00:00:00")
	}
	if endDate != "" {
		query = query.Where("started_at <= ?", endDate+" 23:59:59")
	}

	// Get total count
	query.Count(&total)

	// Get paginated results with preloaded data
	err := query.Preload("Template").
		Preload("Exercises.Exercise").
		Preload("Exercises.Sets").
		Order("started_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&workouts).Error

	return workouts, total, err
}

// GetWorkoutWithDetails returns a single workout with all exercises and sets
func (ws *WorkoutService) GetWorkoutWithDetails(userID, workoutID uint) (*models.WorkoutSession, error) {
	var workout models.WorkoutSession

	err := ws.db.Where("id = ? AND user_id = ?", workoutID, userID).
		Preload("Template").
		Preload("Exercises.Exercise").
		Preload("Exercises.Sets", func(db *gorm.DB) *gorm.DB {
			return db.Order("set_number ASC")
		}).
		Preload("Exercises", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_index ASC")
		}).
		First(&workout).Error

	return &workout, err
}

// StartWorkout creates a new workout session
func (ws *WorkoutService) StartWorkout(userID uint, name string, templateID *uint, notes string) (*models.WorkoutSession, error) {
	// Validate name
	if name == "" {
		return nil, fmt.Errorf("workout name is required")
	}

	// If starting from template, verify template exists and user has access
	if templateID != nil {
		var template models.WorkoutTemplate
		err := ws.db.Where("id = ? AND (user_id = ? OR is_public = ?)", *templateID, userID, true).First(&template).Error
		if err != nil {
			return nil, fmt.Errorf("template not found or not accessible")
		}
	}

	// Create workout session
	workout := models.WorkoutSession{
		UserID:     userID,
		TemplateID: templateID,
		Name:       name,
		StartedAt:  time.Now(),
		Notes:      notes,
	}

	err := ws.db.Create(&workout).Error
	if err != nil {
		return nil, err
	}

	// If starting from template, copy template exercises to session
	if templateID != nil {
		err = ws.copyTemplateExercisesToSession(uint(workout.ID), *templateID)
		if err != nil {
			// Rollback workout creation if copying exercises fails
			ws.db.Delete(&workout)
			return nil, fmt.Errorf("failed to copy template exercises: %v", err)
		}
	}

	// Load the complete workout with exercises
	return ws.GetWorkoutWithDetails(userID, workout.ID)
}

// copyTemplateExercisesToSession copies exercises from template to workout session
func (ws *WorkoutService) copyTemplateExercisesToSession(sessionID, templateID uint) error {
	// Get template exercises
	var templateExercises []models.TemplateExercise
	err := ws.db.Where("template_id = ?", templateID).Order("order_index ASC").Find(&templateExercises).Error
	if err != nil {
		return err
	}

	// Create session exercises from template exercises
	for _, templateExercise := range templateExercises {
		sessionExercise := models.SessionExercise{
			SessionID:  sessionID,
			ExerciseID: templateExercise.ExerciseID,
			OrderIndex: templateExercise.OrderIndex,
			Notes:      fmt.Sprintf("Target: %d sets of %s", templateExercise.TargetSets, templateExercise.TargetReps),
		}

		err = ws.db.Create(&sessionExercise).Error
		if err != nil {
			return err
		}
	}

	return nil
}

// UpdateWorkout updates workout details or finishes the workout
func (ws *WorkoutService) UpdateWorkout(userID, workoutID uint, name, notes *string, endedAt *time.Time, isActive *bool) (*models.WorkoutSession, error) {
	// Find and verify ownership
	var workout models.WorkoutSession
	err := ws.db.Where("id = ? AND user_id = ?", workoutID, userID).First(&workout).Error
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if name != nil && *name != "" {
		workout.Name = *name
	}

	if notes != nil {
		workout.Notes = *notes
	}

	// Handle workout completion
	if endedAt != nil {
		workout.EndedAt = endedAt
		// Calculate duration in minutes
		duration := int(endedAt.Sub(workout.StartedAt).Minutes())
		workout.DurationMinutes = &duration
	} else if isActive != nil && !*isActive && workout.EndedAt == nil {
		// If marking as inactive and not already ended, set end time to now
		now := time.Now()
		workout.EndedAt = &now
		duration := int(now.Sub(workout.StartedAt).Minutes())
		workout.DurationMinutes = &duration
	}

	// Save updates
	err = ws.db.Save(&workout).Error
	if err != nil {
		return nil, err
	}

	return &workout, nil
}

// DeleteWorkout deletes a workout session and all associated data
func (ws *WorkoutService) DeleteWorkout(userID, workoutID uint) error {
	// Verify ownership
	var workout models.WorkoutSession
	err := ws.db.Where("id = ? AND user_id = ?", workoutID, userID).First(&workout).Error
	if err != nil {
		return err
	}

	// Delete workout (cascade will handle exercises and sets)
	return ws.db.Delete(&workout).Error
}

// AddExerciseToWorkout adds an exercise to a workout session
func (ws *WorkoutService) AddExerciseToWorkout(userID, workoutID, exerciseID uint, orderIndex int, notes string) (*models.SessionExercise, error) {
	// Verify workout ownership
	var workout models.WorkoutSession
	err := ws.db.Where("id = ? AND user_id = ?", workoutID, userID).First(&workout).Error
	if err != nil {
		return nil, err
	}

	// Verify exercise exists
	var exercise models.Exercise
	err = ws.db.First(&exercise, exerciseID).Error
	if err != nil {
		return nil, err
	}

	// If orderIndex is 0, set it to the next available position
	if orderIndex == 0 {
		var maxOrder int
		ws.db.Model(&models.SessionExercise{}).Where("session_id = ?", workoutID).Select("COALESCE(MAX(order_index), 0)").Scan(&maxOrder)
		orderIndex = maxOrder + 1
	}

	// Create session exercise
	sessionExercise := models.SessionExercise{
		SessionID:  workoutID,
		ExerciseID: exerciseID,
		OrderIndex: orderIndex,
		Notes:      notes,
	}

	err = ws.db.Create(&sessionExercise).Error
	if err != nil {
		return nil, err
	}

	// Load with exercise data
	err = ws.db.Preload("Exercise").First(&sessionExercise, sessionExercise.ID).Error
	if err != nil {
		return nil, err
	}

	return &sessionExercise, nil
}

// UpdateSessionExercise updates exercise details within a workout
func (ws *WorkoutService) UpdateSessionExercise(userID, workoutID, sessionExerciseID uint, orderIndex *int, notes *string, completedAt *time.Time) (*models.SessionExercise, error) {
	// Verify workout ownership through session exercise
	var sessionExercise models.SessionExercise
	err := ws.db.Joins("JOIN workout_sessions ON session_exercises.session_id = workout_sessions.id").
		Where("session_exercises.id = ? AND session_exercises.session_id = ? AND workout_sessions.user_id = ?", sessionExerciseID, workoutID, userID).
		First(&sessionExercise).Error
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if orderIndex != nil {
		sessionExercise.OrderIndex = *orderIndex
	}

	if notes != nil {
		sessionExercise.Notes = *notes
	}

	if completedAt != nil {
		sessionExercise.CompletedAt = completedAt
	}

	// Save updates
	err = ws.db.Save(&sessionExercise).Error
	if err != nil {
		return nil, err
	}

	// Load with exercise data
	err = ws.db.Preload("Exercise").First(&sessionExercise, sessionExercise.ID).Error
	if err != nil {
		return nil, err
	}

	return &sessionExercise, nil
}

// LogSet adds a set to an exercise in the workout
func (ws *WorkoutService) LogSet(userID, workoutID, sessionExerciseID uint, reps *int, weight *float64, durationSeconds *int, distanceMeters *float64, rpe *int) (*models.ExerciseSet, error) {
	// Verify session exercise ownership
	var sessionExercise models.SessionExercise
	err := ws.db.Joins("JOIN workout_sessions ON session_exercises.session_id = workout_sessions.id").
		Where("session_exercises.id = ? AND session_exercises.session_id = ? AND workout_sessions.user_id = ?", sessionExerciseID, workoutID, userID).
		First(&sessionExercise).Error
	if err != nil {
		return nil, err
	}

	// Validate that at least one metric is provided
	if reps == nil && weight == nil && durationSeconds == nil && distanceMeters == nil {
		return nil, fmt.Errorf("at least one set metric (reps, weight, duration, or distance) must be provided")
	}

	// Get next set number
	var maxSetNumber int
	ws.db.Model(&models.ExerciseSet{}).Where("session_exercise_id = ?", sessionExerciseID).Select("COALESCE(MAX(set_number), 0)").Scan(&maxSetNumber)
	setNumber := maxSetNumber + 1

	// Create exercise set
	exerciseSet := models.ExerciseSet{
		SessionExerciseID: sessionExerciseID,
		SetNumber:         setNumber,
		Reps:              reps,
		Weight:            weight,
		DurationSeconds:   durationSeconds,
		DistanceMeters:    distanceMeters,
		RPE:               rpe,
		CompletedAt:       time.Now(),
	}

	err = ws.db.Create(&exerciseSet).Error
	if err != nil {
		return nil, err
	}

	return &exerciseSet, nil
}

// UpdateSet updates a logged set
func (ws *WorkoutService) UpdateSet(userID, workoutID, setID uint, reps *int, weight *float64, durationSeconds *int, distanceMeters *float64, rpe *int) (*models.ExerciseSet, error) {
	// Verify set ownership through workout session
	var exerciseSet models.ExerciseSet
	err := ws.db.Joins("JOIN session_exercises ON exercise_sets.session_exercise_id = session_exercises.id").
		Joins("JOIN workout_sessions ON session_exercises.session_id = workout_sessions.id").
		Where("exercise_sets.id = ? AND workout_sessions.id = ? AND workout_sessions.user_id = ?", setID, workoutID, userID).
		First(&exerciseSet).Error
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if reps != nil {
		exerciseSet.Reps = reps
	}

	if weight != nil {
		exerciseSet.Weight = weight
	}

	if durationSeconds != nil {
		exerciseSet.DurationSeconds = durationSeconds
	}

	if distanceMeters != nil {
		exerciseSet.DistanceMeters = distanceMeters
	}

	if rpe != nil {
		exerciseSet.RPE = rpe
	}

	// Save updates
	err = ws.db.Save(&exerciseSet).Error
	if err != nil {
		return nil, err
	}

	return &exerciseSet, nil
}

// DeleteSet removes a logged set
func (ws *WorkoutService) DeleteSet(userID, workoutID, setID uint) error {
	// Verify set ownership through workout session
	var exerciseSet models.ExerciseSet
	err := ws.db.Joins("JOIN session_exercises ON exercise_sets.session_exercise_id = session_exercises.id").
		Joins("JOIN workout_sessions ON session_exercises.session_id = workout_sessions.id").
		Where("exercise_sets.id = ? AND workout_sessions.id = ? AND workout_sessions.user_id = ?", setID, workoutID, userID).
		First(&exerciseSet).Error
	if err != nil {
		return err
	}

	// Delete the set
	return ws.db.Delete(&exerciseSet).Error
}

// GetActiveWorkout returns user's currently active workout (if any)
func (ws *WorkoutService) GetActiveWorkout(userID uint) (*models.WorkoutSession, error) {
	var workout models.WorkoutSession

	err := ws.db.Where("user_id = ? AND ended_at IS NULL", userID).
		Preload("Template").
		Preload("Exercises.Exercise").
		Preload("Exercises.Sets", func(db *gorm.DB) *gorm.DB {
			return db.Order("set_number ASC")
		}).
		Preload("Exercises", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_index ASC")
		}).
		First(&workout).Error

	if err == gorm.ErrRecordNotFound {
		return nil, nil // No active workout is not an error
	}

	return &workout, err
}

// GetWorkoutStats returns workout statistics for a user
func (ws *WorkoutService) GetWorkoutStats(userID uint, days int) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Calculate date range
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -days)

	// Total workouts in period
	var totalWorkouts int64
	err := ws.db.Model(&models.WorkoutSession{}).
		Where("user_id = ? AND started_at >= ? AND ended_at IS NOT NULL", userID, startDate).
		Count(&totalWorkouts).Error
	if err != nil {
		return nil, err
	}

	// Total workout time in minutes
	var totalMinutes int
	ws.db.Model(&models.WorkoutSession{}).
		Where("user_id = ? AND started_at >= ? AND ended_at IS NOT NULL", userID, startDate).
		Select("COALESCE(SUM(duration_minutes), 0)").
		Scan(&totalMinutes)

	// Total sets logged
	var totalSets int64
	err = ws.db.Model(&models.ExerciseSet{}).
		Joins("JOIN session_exercises ON exercise_sets.session_exercise_id = session_exercises.id").
		Joins("JOIN workout_sessions ON session_exercises.session_id = workout_sessions.id").
		Where("workout_sessions.user_id = ? AND workout_sessions.started_at >= ?", userID, startDate).
		Count(&totalSets).Error
	if err != nil {
		return nil, err
	}

	// Average workout duration
	var avgDuration float64
	if totalWorkouts > 0 {
		avgDuration = float64(totalMinutes) / float64(totalWorkouts)
	}

	stats["total_workouts"] = totalWorkouts
	stats["total_minutes"] = totalMinutes
	stats["total_sets"] = totalSets
	stats["average_duration_minutes"] = avgDuration
	stats["period_days"] = days

	return stats, nil
}

func (ws *WorkoutService) RemoveExerciseFromWorkout(userID, workoutID, sessionExerciseID uint) error {
	// Verify session exercise ownership
	var sessionExercise models.SessionExercise
	err := ws.db.Joins("JOIN workout_sessions ON session_exercises.session_id = workout_sessions.id").
		Where("session_exercises.id = ? AND session_exercises.session_id = ? AND workout_sessions.user_id = ?", sessionExerciseID, workoutID, userID).
		First(&sessionExercise).Error
	if err != nil {
		return err
	}

	// Delete session exercise (cascade will handle sets)
	return ws.db.Delete(&sessionExercise).Error
}
