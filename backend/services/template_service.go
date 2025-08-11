package services

import (
	"fmt"
	"onefit/backend/models"
	"strings"

	"gorm.io/gorm"
)

type TemplateService struct {
	db *gorm.DB
}

func NewTemplateService(db *gorm.DB) *TemplateService {
	return &TemplateService{db: db}
}

// GetUserTemplates returns user's workout templates with optional filters
func (ts *TemplateService) GetUserTemplates(userID uint, category string, includePublic bool) ([]models.WorkoutTemplate, error) {
	var templates []models.WorkoutTemplate

	query := ts.db.Model(&models.WorkoutTemplate{}).Preload("Exercises.Exercise")

	// Base condition: user's own templates
	conditions := []string{"user_id = ?"}
	args := []interface{}{userID}

	// Optionally include public templates from other users
	if includePublic {
		conditions[0] = "(user_id = ? OR is_public = ?)"
		args = []interface{}{userID, true}
	}

	// Filter by category if provided
	if category != "" {
		conditions = append(conditions, "category = ?")
		args = append(args, category)
	}

	// Build WHERE clause
	whereClause := strings.Join(conditions, " AND ")

	err := query.Where(whereClause, args...).
		Order("created_at DESC").
		Find(&templates).Error

	return templates, err
}

// GetTemplateWithExercises returns a single template with all exercises
func (ts *TemplateService) GetTemplateWithExercises(userID, templateID uint) (*models.WorkoutTemplate, error) {
	var template models.WorkoutTemplate

	// User can access their own templates or public templates
	err := ts.db.Where("id = ? AND (user_id = ? OR is_public = ?)", templateID, userID, true).
		Preload("Exercises.Exercise").
		Preload("Exercises", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_index ASC")
		}).
		First(&template).Error

	return &template, err
}

// CreateTemplate creates a new workout template
func (ts *TemplateService) CreateTemplate(userID uint, name, description, category string, isPublic bool) (*models.WorkoutTemplate, error) {
	// Validate required fields
	if strings.TrimSpace(name) == "" {
		return nil, fmt.Errorf("template name is required")
	}

	// Check if template name already exists for this user
	var existingTemplate models.WorkoutTemplate
	err := ts.db.Where("name = ? AND user_id = ?", strings.TrimSpace(name), userID).First(&existingTemplate).Error
	if err == nil {
		return nil, fmt.Errorf("template with name '%s' already exists", strings.TrimSpace(name))
	}
	if err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Create the template
	template := models.WorkoutTemplate{
		UserID:      userID,
		Name:        strings.TrimSpace(name),
		Description: strings.TrimSpace(description),
		Category:    strings.TrimSpace(category),
		IsPublic:    isPublic,
	}

	err = ts.db.Create(&template).Error
	if err != nil {
		return nil, err
	}

	return &template, nil
}

// UpdateTemplate updates an existing template
func (ts *TemplateService) UpdateTemplate(userID, templateID uint, name, description, category *string, isPublic *bool) (*models.WorkoutTemplate, error) {
	// Find the template and verify ownership
	var template models.WorkoutTemplate
	err := ts.db.Where("id = ? AND user_id = ?", templateID, userID).First(&template).Error
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if name != nil && strings.TrimSpace(*name) != "" {
		// Check if new name conflicts with existing templates for this user
		var existingTemplate models.WorkoutTemplate
		err := ts.db.Where("name = ? AND user_id = ? AND id != ?", strings.TrimSpace(*name), userID, templateID).First(&existingTemplate).Error
		if err == nil {
			return nil, fmt.Errorf("template with name '%s' already exists", strings.TrimSpace(*name))
		}
		if err != gorm.ErrRecordNotFound {
			return nil, err
		}
		template.Name = strings.TrimSpace(*name)
	}

	if description != nil {
		template.Description = strings.TrimSpace(*description)
	}

	if category != nil {
		template.Category = strings.TrimSpace(*category)
	}

	if isPublic != nil {
		template.IsPublic = *isPublic
	}

	// Save the updates
	err = ts.db.Save(&template).Error
	if err != nil {
		return nil, err
	}

	return &template, nil
}

// DeleteTemplate deletes a template and its exercises
func (ts *TemplateService) DeleteTemplate(userID, templateID uint) error {
	// Check if template exists and is owned by user
	var template models.WorkoutTemplate
	err := ts.db.Where("id = ? AND user_id = ?", templateID, userID).First(&template).Error
	if err != nil {
		return err
	}

	// Check if template is used in any workout sessions
	var sessionCount int64
	err = ts.db.Model(&models.WorkoutSession{}).Where("template_id = ?", templateID).Count(&sessionCount).Error
	if err != nil {
		return err
	}

	if sessionCount > 0 {
		return fmt.Errorf("cannot delete template: it is being used in workout sessions")
	}

	// Delete template (cascade will handle template_exercises)
	return ts.db.Delete(&template).Error
}

// AddExerciseToTemplate adds an exercise to a template
func (ts *TemplateService) AddExerciseToTemplate(userID, templateID, exerciseID uint, orderIndex, targetSets int, targetReps string, targetWeight *float64, restSeconds int) (*models.TemplateExercise, error) {
	// Verify template ownership
	var template models.WorkoutTemplate
	err := ts.db.Where("id = ? AND user_id = ?", templateID, userID).First(&template).Error
	if err != nil {
		return nil, err
	}

	// Verify exercise exists
	var exercise models.Exercise
	err = ts.db.First(&exercise, exerciseID).Error
	if err != nil {
		return nil, err
	}

	// Check if exercise is already in template
	var existingTemplateExercise models.TemplateExercise
	err = ts.db.Where("template_id = ? AND exercise_id = ?", templateID, exerciseID).First(&existingTemplateExercise).Error
	if err == nil {
		return nil, fmt.Errorf("exercise is already in this template")
	}
	if err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// If orderIndex is 0, set it to the next available position
	if orderIndex == 0 {
		var maxOrder int
		ts.db.Model(&models.TemplateExercise{}).Where("template_id = ?", templateID).Select("COALESCE(MAX(order_index), 0)").Scan(&maxOrder)
		orderIndex = maxOrder + 1
	}

	// Create template exercise
	templateExercise := models.TemplateExercise{
		TemplateID:   templateID,
		ExerciseID:   exerciseID,
		OrderIndex:   orderIndex,
		TargetSets:   targetSets,
		TargetReps:   strings.TrimSpace(targetReps),
		TargetWeight: targetWeight,
		RestSeconds:  restSeconds,
	}

	err = ts.db.Create(&templateExercise).Error
	if err != nil {
		return nil, err
	}

	// Load the exercise data
	err = ts.db.Preload("Exercise").First(&templateExercise, templateExercise.ID).Error
	if err != nil {
		return nil, err
	}

	return &templateExercise, nil
}

// RemoveExerciseFromTemplate removes an exercise from a template
func (ts *TemplateService) RemoveExerciseFromTemplate(userID, templateID, exerciseID uint) error {
	// Verify template ownership
	var template models.WorkoutTemplate
	err := ts.db.Where("id = ? AND user_id = ?", templateID, userID).First(&template).Error
	if err != nil {
		return err
	}

	// Find and delete the template exercise
	var templateExercise models.TemplateExercise
	err = ts.db.Where("template_id = ? AND exercise_id = ?", templateID, exerciseID).First(&templateExercise).Error
	if err != nil {
		return err
	}

	return ts.db.Delete(&templateExercise).Error
}

// UpdateTemplateExercise updates exercise details within a template
func (ts *TemplateService) UpdateTemplateExercise(userID, templateID, exerciseID uint, orderIndex, targetSets *int, targetReps *string, targetWeight *float64, restSeconds *int) (*models.TemplateExercise, error) {
	// Verify template ownership
	var template models.WorkoutTemplate
	err := ts.db.Where("id = ? AND user_id = ?", templateID, userID).First(&template).Error
	if err != nil {
		return nil, err
	}

	// Find the template exercise
	var templateExercise models.TemplateExercise
	err = ts.db.Where("template_id = ? AND exercise_id = ?", templateID, exerciseID).First(&templateExercise).Error
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if orderIndex != nil {
		templateExercise.OrderIndex = *orderIndex
	}

	if targetSets != nil {
		templateExercise.TargetSets = *targetSets
	}

	if targetReps != nil {
		templateExercise.TargetReps = strings.TrimSpace(*targetReps)
	}

	if targetWeight != nil {
		templateExercise.TargetWeight = targetWeight
	}

	if restSeconds != nil {
		templateExercise.RestSeconds = *restSeconds
	}

	// Save the updates
	err = ts.db.Save(&templateExercise).Error
	if err != nil {
		return nil, err
	}

	// Load the exercise data
	err = ts.db.Preload("Exercise").First(&templateExercise, templateExercise.ID).Error
	if err != nil {
		return nil, err
	}

	return &templateExercise, nil
}

// GetTemplateCategories returns list of unique template categories
func (ts *TemplateService) GetTemplateCategories(userID uint) ([]string, error) {
	var categories []string

	err := ts.db.Model(&models.WorkoutTemplate{}).
		Distinct("category").
		Where("(user_id = ? OR is_public = ?) AND category != '' AND category IS NOT NULL", userID, true).
		Pluck("category", &categories).Error

	return categories, err
}

// DuplicateTemplate creates a copy of an existing template
func (ts *TemplateService) DuplicateTemplate(userID, templateID uint, newName string) (*models.WorkoutTemplate, error) {
	// Get the original template (user can duplicate their own or public templates)
	originalTemplate, err := ts.GetTemplateWithExercises(userID, templateID)
	if err != nil {
		return nil, err
	}

	// Validate new name
	if strings.TrimSpace(newName) == "" {
		newName = originalTemplate.Name + " (Copy)"
	}

	// Check if new name conflicts
	var existingTemplate models.WorkoutTemplate
	err = ts.db.Where("name = ? AND user_id = ?", strings.TrimSpace(newName), userID).First(&existingTemplate).Error
	if err == nil {
		return nil, fmt.Errorf("template with name '%s' already exists", strings.TrimSpace(newName))
	}
	if err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Create new template
	newTemplate := models.WorkoutTemplate{
		UserID:      userID,
		Name:        strings.TrimSpace(newName),
		Description: originalTemplate.Description,
		Category:    originalTemplate.Category,
		IsPublic:    false, // Duplicated templates are private by default
	}

	err = ts.db.Create(&newTemplate).Error
	if err != nil {
		return nil, err
	}

	// Copy all exercises
	for _, templateExercise := range originalTemplate.Exercises {
		newTemplateExercise := models.TemplateExercise{
			TemplateID:   newTemplate.ID,
			ExerciseID:   templateExercise.ExerciseID,
			OrderIndex:   templateExercise.OrderIndex,
			TargetSets:   templateExercise.TargetSets,
			TargetReps:   templateExercise.TargetReps,
			TargetWeight: templateExercise.TargetWeight,
			RestSeconds:  templateExercise.RestSeconds,
		}

		err = ts.db.Create(&newTemplateExercise).Error
		if err != nil {
			return nil, err
		}
	}

	return &newTemplate, nil
}
