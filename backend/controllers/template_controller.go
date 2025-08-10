package controllers

import (
	"fmt"
	"net/http"
	"onefit/backend/models"
	"onefit/backend/services"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TemplateController struct {
	db              *gorm.DB
	templateService *services.TemplateService
}

func NewTemplateController(db *gorm.DB) *TemplateController {
	return &TemplateController{
		db:              db,
		templateService: services.NewTemplateService(db),
	}
}

// getUserFromContext safely extracts user from gin context
func (tc *TemplateController) getUserFromContext(c *gin.Context) (*models.User, error) {
	user, exists := c.Get("user")
	if !exists {
		return nil, fmt.Errorf("user not found in context")
	}

	userModel, ok := user.(*models.User)
	if !ok {
		return nil, fmt.Errorf("invalid user type in context")
	}

	return userModel, nil
}

// GetTemplates returns user's workout templates
func (tc *TemplateController) GetTemplates(c *gin.Context) {
	userModel, err := tc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Query parameters
	category := c.Query("category")
	includePublic := c.DefaultQuery("include_public", "false") == "true"

	templates, err := tc.templateService.GetUserTemplates(userModel.ID, category, includePublic)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch templates"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"templates": templates,
		"count":     len(templates),
	})
}

// GetTemplate returns a single template with exercises
func (tc *TemplateController) GetTemplate(c *gin.Context) {
	userModel, err := tc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	templateID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid template ID"})
		return
	}

	template, err := tc.templateService.GetTemplateWithExercises(userModel.ID, uint(templateID))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch template"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"template": template})
}

// CreateTemplate creates a new workout template
func (tc *TemplateController) CreateTemplate(c *gin.Context) {
	userModel, err := tc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	type CreateTemplateInput struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		Category    string `json:"category"`
		IsPublic    bool   `json:"is_public"`
	}

	var input CreateTemplateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	template, err := tc.templateService.CreateTemplate(userModel.ID, input.Name, input.Description, input.Category, input.IsPublic)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create template"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Template created successfully",
		"template": template,
	})
}

// UpdateTemplate updates an existing template
func (tc *TemplateController) UpdateTemplate(c *gin.Context) {
	userModel, err := tc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	templateID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid template ID"})
		return
	}

	type UpdateTemplateInput struct {
		Name        *string `json:"name"`
		Description *string `json:"description"`
		Category    *string `json:"category"`
		IsPublic    *bool   `json:"is_public"`
	}

	var input UpdateTemplateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	template, err := tc.templateService.UpdateTemplate(userModel.ID, uint(templateID), input.Name, input.Description, input.Category, input.IsPublic)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Template not found or not owned by user"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update template"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Template updated successfully",
		"template": template,
	})
}

// DeleteTemplate deletes a template
func (tc *TemplateController) DeleteTemplate(c *gin.Context) {
	userModel, err := tc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	templateID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid template ID"})
		return
	}

	err = tc.templateService.DeleteTemplate(userModel.ID, uint(templateID))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Template not found or not owned by user"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete template"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Template deleted successfully"})
}

// AddExerciseToTemplate adds an exercise to a template
func (tc *TemplateController) AddExerciseToTemplate(c *gin.Context) {
	userModel, err := tc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	templateID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid template ID"})
		return
	}

	type AddExerciseInput struct {
		ExerciseID   uint     `json:"exercise_id" binding:"required"`
		OrderIndex   int      `json:"order_index"`
		TargetSets   int      `json:"target_sets"`
		TargetReps   string   `json:"target_reps"`
		TargetWeight *float64 `json:"target_weight"`
		RestSeconds  int      `json:"rest_seconds"`
	}

	var input AddExerciseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	templateExercise, err := tc.templateService.AddExerciseToTemplate(
		userModel.ID,
		uint(templateID),
		input.ExerciseID,
		input.OrderIndex,
		input.TargetSets,
		input.TargetReps,
		input.TargetWeight,
		input.RestSeconds,
	)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Template or exercise not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add exercise to template"})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":           "Exercise added to template successfully",
		"template_exercise": templateExercise,
	})
}

// RemoveExerciseFromTemplate removes an exercise from a template
func (tc *TemplateController) RemoveExerciseFromTemplate(c *gin.Context) {
	userModel, err := tc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	templateID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid template ID"})
		return
	}

	exerciseID, err := strconv.ParseUint(c.Param("exercise_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid exercise ID"})
		return
	}

	err = tc.templateService.RemoveExerciseFromTemplate(userModel.ID, uint(templateID), uint(exerciseID))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Template exercise not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove exercise from template"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Exercise removed from template successfully"})
}

// UpdateTemplateExercise updates exercise details within a template
func (tc *TemplateController) UpdateTemplateExercise(c *gin.Context) {
	userModel, err := tc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	templateID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid template ID"})
		return
	}

	exerciseID, err := strconv.ParseUint(c.Param("exercise_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid exercise ID"})
		return
	}

	type UpdateTemplateExerciseInput struct {
		OrderIndex   *int     `json:"order_index"`
		TargetSets   *int     `json:"target_sets"`
		TargetReps   *string  `json:"target_reps"`
		TargetWeight *float64 `json:"target_weight"`
		RestSeconds  *int     `json:"rest_seconds"`
	}

	var input UpdateTemplateExerciseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	templateExercise, err := tc.templateService.UpdateTemplateExercise(
		userModel.ID,
		uint(templateID),
		uint(exerciseID),
		input.OrderIndex,
		input.TargetSets,
		input.TargetReps,
		input.TargetWeight,
		input.RestSeconds,
	)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Template exercise not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update template exercise"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":           "Template exercise updated successfully",
		"template_exercise": templateExercise,
	})
}
