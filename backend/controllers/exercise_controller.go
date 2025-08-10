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

type ExerciseController struct {
	db              *gorm.DB
	exerciseService *services.ExerciseService
}

func NewExerciseController(db *gorm.DB) *ExerciseController {
	return &ExerciseController{
		db:              db,
		exerciseService: services.NewExerciseService(db),
	}
}

// getUserFromContext safely extracts user from gin context
func (ec *ExerciseController) getUserFromContext(c *gin.Context) (*models.User, error) {
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

// GetExercises returns list of exercises with optional filters
func (ec *ExerciseController) GetExercises(c *gin.Context) {
	userModel, err := ec.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Query parameters for filtering
	muscleGroup := c.Query("muscle_group")
	equipment := c.Query("equipment")
	search := c.Query("search")
	includeCustom := c.DefaultQuery("include_custom", "true") == "true"

	exercises, err := ec.exerciseService.GetExercises(userModel.ID, muscleGroup, equipment, search, includeCustom)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch exercises"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"exercises": exercises,
		"count":     len(exercises),
	})
}

// GetExercise returns a single exercise by ID
func (ec *ExerciseController) GetExercise(c *gin.Context) {
	exerciseID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid exercise ID"})
		return
	}

	exercise, err := ec.exerciseService.GetExerciseByID(uint(exerciseID))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Exercise not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch exercise"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"exercise": exercise})
}

// CreateExercise creates a new custom exercise
func (ec *ExerciseController) CreateExercise(c *gin.Context) {
	userModel, err := ec.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	type CreateExerciseInput struct {
		Name         string `json:"name" binding:"required"`
		MuscleGroups string `json:"muscle_groups"`
		Equipment    string `json:"equipment"`
		Instructions string `json:"instructions"`
	}

	var input CreateExerciseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	exercise, err := ec.exerciseService.CreateCustomExercise(userModel.ID, input.Name, input.MuscleGroups, input.Equipment, input.Instructions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create exercise"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Exercise created successfully",
		"exercise": exercise,
	})
}

// UpdateExercise updates an existing custom exercise
func (ec *ExerciseController) UpdateExercise(c *gin.Context) {
	userModel, err := ec.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	exerciseID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid exercise ID"})
		return
	}

	type UpdateExerciseInput struct {
		Name         *string `json:"name"`
		MuscleGroups *string `json:"muscle_groups"`
		Equipment    *string `json:"equipment"`
		Instructions *string `json:"instructions"`
	}

	var input UpdateExerciseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	exercise, err := ec.exerciseService.UpdateCustomExercise(userModel.ID, uint(exerciseID), input.Name, input.MuscleGroups, input.Equipment, input.Instructions)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Exercise not found or not owned by user"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update exercise"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Exercise updated successfully",
		"exercise": exercise,
	})
}

// DeleteExercise deletes a custom exercise
func (ec *ExerciseController) DeleteExercise(c *gin.Context) {
	userModel, err := ec.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	exerciseID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid exercise ID"})
		return
	}

	err = ec.exerciseService.DeleteCustomExercise(userModel.ID, uint(exerciseID))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Exercise not found or not owned by user"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete exercise"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Exercise deleted successfully"})
}
