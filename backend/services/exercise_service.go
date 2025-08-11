package services

import (
	"fmt"
	"onefit/backend/models"
	"strings"

	"gorm.io/gorm"
)

type ExerciseService struct {
	db *gorm.DB
}

func NewExerciseService(db *gorm.DB) *ExerciseService {
	return &ExerciseService{db: db}
}

// GetExercises returns exercises with optional filters
func (es *ExerciseService) GetExercises(userID uint, muscleGroup, equipment, search string, includeCustom bool) ([]models.Exercise, error) {
	var exercises []models.Exercise

	query := es.db.Model(&models.Exercise{})

	// Base condition: include built-in exercises
	conditions := []string{"is_custom = ? OR is_custom IS NULL"}
	args := []interface{}{false}

	// Optionally include user's custom exercises
	if includeCustom {
		conditions[0] = "(is_custom = ? OR is_custom IS NULL OR (is_custom = ? AND created_by_user_id = ?))"
		args = []interface{}{false, true, userID}
	}

	// Apply filters
	if muscleGroup != "" {
		conditions = append(conditions, "muscle_groups LIKE ?")
		args = append(args, "%"+muscleGroup+"%")
	}

	if equipment != "" {
		conditions = append(conditions, "equipment LIKE ?")
		args = append(args, "%"+equipment+"%")
	}

	if search != "" {
		conditions = append(conditions, "name ILIKE ?")
		args = append(args, "%"+search+"%")
	}

	// Build WHERE clause
	whereClause := strings.Join(conditions, " AND ")

	err := query.Where(whereClause, args...).
		Order("is_custom ASC, name ASC").
		Find(&exercises).Error

	return exercises, err
}

// GetExerciseByID returns a single exercise by ID
func (es *ExerciseService) GetExerciseByID(exerciseID uint) (*models.Exercise, error) {
	var exercise models.Exercise

	err := es.db.First(&exercise, exerciseID).Error
	if err != nil {
		return nil, err
	}

	return &exercise, nil
}

// CreateCustomExercise creates a new custom exercise for a user
func (es *ExerciseService) CreateCustomExercise(userID uint, name, muscleGroups, equipment, instructions string) (*models.Exercise, error) {
	// Validate required fields
	if strings.TrimSpace(name) == "" {
		return nil, fmt.Errorf("exercise name is required")
	}

	// Check if exercise name already exists for this user
	var existingExercise models.Exercise
	err := es.db.Where("name = ? AND created_by_user_id = ?", name, userID).First(&existingExercise).Error
	if err == nil {
		return nil, fmt.Errorf("exercise with name '%s' already exists", name)
	}
	if err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Create the exercise
	exercise := models.Exercise{
		Name:            strings.TrimSpace(name),
		MuscleGroups:    strings.TrimSpace(muscleGroups),
		Equipment:       strings.TrimSpace(equipment),
		Instructions:    strings.TrimSpace(instructions),
		IsCustom:        true,
		CreatedByUserID: &userID,
	}

	err = es.db.Create(&exercise).Error
	if err != nil {
		return nil, err
	}

	return &exercise, nil
}

// UpdateCustomExercise updates an existing custom exercise
func (es *ExerciseService) UpdateCustomExercise(userID, exerciseID uint, name, muscleGroups, equipment, instructions *string) (*models.Exercise, error) {
	// Find the exercise and verify ownership
	var exercise models.Exercise
	err := es.db.Where("id = ? AND created_by_user_id = ? AND is_custom = ?", exerciseID, userID, true).First(&exercise).Error
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if name != nil && strings.TrimSpace(*name) != "" {
		// Check if new name conflicts with existing exercises for this user
		var existingExercise models.Exercise
		err := es.db.Where("name = ? AND created_by_user_id = ? AND id != ?", strings.TrimSpace(*name), userID, exerciseID).First(&existingExercise).Error
		if err == nil {
			return nil, fmt.Errorf("exercise with name '%s' already exists", *name)
		}
		if err != gorm.ErrRecordNotFound {
			return nil, err
		}
		exercise.Name = strings.TrimSpace(*name)
	}

	if muscleGroups != nil {
		exercise.MuscleGroups = strings.TrimSpace(*muscleGroups)
	}

	if equipment != nil {
		exercise.Equipment = strings.TrimSpace(*equipment)
	}

	if instructions != nil {
		exercise.Instructions = strings.TrimSpace(*instructions)
	}

	// Save the updates
	err = es.db.Save(&exercise).Error
	if err != nil {
		return nil, err
	}

	return &exercise, nil
}

// DeleteCustomExercise deletes a custom exercise
func (es *ExerciseService) DeleteCustomExercise(userID, exerciseID uint) error {
	// Check if exercise exists and is owned by user
	var exercise models.Exercise
	err := es.db.Where("id = ? AND created_by_user_id = ? AND is_custom = ?", exerciseID, userID, true).First(&exercise).Error
	if err != nil {
		return err
	}

	// Check if exercise is used in any templates or sessions
	var templateCount int64
	err = es.db.Model(&models.TemplateExercise{}).Where("exercise_id = ?", exerciseID).Count(&templateCount).Error
	if err != nil {
		return err
	}

	var sessionCount int64
	err = es.db.Model(&models.SessionExercise{}).Where("exercise_id = ?", exerciseID).Count(&sessionCount).Error
	if err != nil {
		return err
	}

	if templateCount > 0 || sessionCount > 0 {
		return fmt.Errorf("cannot delete exercise: it is being used in workout templates or sessions")
	}

	// Safe to delete
	return es.db.Delete(&exercise).Error
}

// GetMuscleGroups returns list of unique muscle groups
func (es *ExerciseService) GetMuscleGroups() ([]string, error) {
	var muscleGroups []string

	// This is a simplified version - in a real app you might want to parse JSON muscle groups
	err := es.db.Model(&models.Exercise{}).
		Distinct("muscle_groups").
		Where("muscle_groups != '' AND muscle_groups IS NOT NULL").
		Pluck("muscle_groups", &muscleGroups).Error

	return muscleGroups, err
}

// GetEquipmentTypes returns list of unique equipment types
func (es *ExerciseService) GetEquipmentTypes() ([]string, error) {
	var equipmentTypes []string

	err := es.db.Model(&models.Exercise{}).
		Distinct("equipment").
		Where("equipment != '' AND equipment IS NOT NULL").
		Pluck("equipment", &equipmentTypes).Error

	return equipmentTypes, err
}

// SeedDefaultExercises creates default exercises if none exist
func (es *ExerciseService) SeedDefaultExercises() error {
	// Check if any exercises exist
	var count int64
	err := es.db.Model(&models.Exercise{}).Count(&count).Error
	if err != nil {
		return err
	}

	// If exercises already exist, don't seed
	if count > 0 {
		return nil
	}

	// Default exercises to seed
	defaultExercises := []models.Exercise{
		{
			Name:         "Push-ups",
			MuscleGroups: "chest,shoulders,triceps",
			Equipment:    "bodyweight",
			Instructions: "Start in plank position, lower body until chest nearly touches floor, push back up.",
			IsCustom:     false,
		},
		{
			Name:         "Squats",
			MuscleGroups: "legs,glutes",
			Equipment:    "bodyweight",
			Instructions: "Stand with feet shoulder-width apart, lower hips until thighs parallel to floor, stand back up.",
			IsCustom:     false,
		},
		{
			Name:         "Pull-ups",
			MuscleGroups: "back,biceps",
			Equipment:    "pull-up bar",
			Instructions: "Hang from bar with palms facing away, pull body up until chin over bar, lower with control.",
			IsCustom:     false,
		},
		{
			Name:         "Plank",
			MuscleGroups: "core,shoulders",
			Equipment:    "bodyweight",
			Instructions: "Hold push-up position with forearms on ground, keep body straight from head to heels.",
			IsCustom:     false,
		},
		{
			Name:         "Deadlift",
			MuscleGroups: "back,legs,glutes",
			Equipment:    "barbell",
			Instructions: "Stand with feet hip-width apart, bend at hips and knees to lift barbell from floor to standing.",
			IsCustom:     false,
		},
	}

	// Create default exercises
	for i := range defaultExercises {
		err := es.db.Create(&defaultExercises[i]).Error
		if err != nil {
			return err
		}
	}

	return nil
}
