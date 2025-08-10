package controllers

import (
	"fmt"
	"net/http"
	"onefit/backend/models"
	"onefit/backend/services"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type WorkoutController struct {
	db             *gorm.DB
	workoutService *services.WorkoutService
}

func NewWorkoutController(db *gorm.DB) *WorkoutController {
	return &WorkoutController{
		db:             db,
		workoutService: services.NewWorkoutService(db),
	}
}

// getUserFromContext safely extracts user from gin context
func (wc *WorkoutController) getUserFromContext(c *gin.Context) (*models.User, error) {
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

// GetWorkouts returns user's workout history
func (wc *WorkoutController) GetWorkouts(c *gin.Context) {
	userModel, err := wc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Query parameters
	limit := c.DefaultQuery("limit", "20")
	offset := c.DefaultQuery("offset", "0")
	startDate := c.Query("start_date") // YYYY-MM-DD
	endDate := c.Query("end_date")     // YYYY-MM-DD

	limitInt, _ := strconv.Atoi(limit)
	offsetInt, _ := strconv.Atoi(offset)

	workouts, total, err := wc.workoutService.GetUserWorkouts(userModel.ID, limitInt, offsetInt, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch workouts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"workouts": workouts,
		"total":    total,
		"limit":    limitInt,
		"offset":   offsetInt,
	})
}

// GetWorkout returns a single workout with all details
func (wc *WorkoutController) GetWorkout(c *gin.Context) {
	userModel, err := wc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	workoutID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid workout ID"})
		return
	}

	workout, err := wc.workoutService.GetWorkoutWithDetails(userModel.ID, uint(workoutID))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Workout not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch workout"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"workout": workout})
}

// StartWorkout creates a new workout session
func (wc *WorkoutController) StartWorkout(c *gin.Context) {
	userModel, err := wc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	type StartWorkoutInput struct {
		Name       string `json:"name" binding:"required"`
		TemplateID *uint  `json:"template_id"` // Optional - can start from template or freestyle
		Notes      string `json:"notes"`
	}

	var input StartWorkoutInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	workout, err := wc.workoutService.StartWorkout(userModel.ID, input.Name, input.TemplateID, input.Notes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start workout"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Workout started successfully",
		"workout": workout,
	})
}

// UpdateWorkout updates workout details or finishes the workout
func (wc *WorkoutController) UpdateWorkout(c *gin.Context) {
	userModel, err := wc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	workoutID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid workout ID"})
		return
	}

	type UpdateWorkoutInput struct {
		Name     *string    `json:"name"`
		Notes    *string    `json:"notes"`
		EndedAt  *time.Time `json:"ended_at"`  // Set to finish workout
		IsActive *bool      `json:"is_active"` // Set to false to finish workout
	}

	var input UpdateWorkoutInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	workout, err := wc.workoutService.UpdateWorkout(userModel.ID, uint(workoutID), input.Name, input.Notes, input.EndedAt, input.IsActive)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Workout not found or not owned by user"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update workout"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Workout updated successfully",
		"workout": workout,
	})
}

// DeleteWorkout deletes a workout session
func (wc *WorkoutController) DeleteWorkout(c *gin.Context) {
	userModel, err := wc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	workoutID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid workout ID"})
		return
	}

	err = wc.workoutService.DeleteWorkout(userModel.ID, uint(workoutID))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Workout not found or not owned by user"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete workout"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Workout deleted successfully"})
}

// AddExerciseToWorkout adds an exercise to a workout session
func (wc *WorkoutController) AddExerciseToWorkout(c *gin.Context) {
	userModel, err := wc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	workoutID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid workout ID"})
		return
	}

	type AddExerciseInput struct {
		ExerciseID uint   `json:"exercise_id" binding:"required"`
		OrderIndex int    `json:"order_index"`
		Notes      string `json:"notes"`
	}

	var input AddExerciseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sessionExercise, err := wc.workoutService.AddExerciseToWorkout(userModel.ID, uint(workoutID), input.ExerciseID, input.OrderIndex, input.Notes)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Workout or exercise not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add exercise to workout"})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":          "Exercise added to workout successfully",
		"session_exercise": sessionExercise,
	})
}

// UpdateSessionExercise updates exercise details within a workout
func (wc *WorkoutController) UpdateSessionExercise(c *gin.Context) {
	userModel, err := wc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	workoutID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid workout ID"})
		return
	}

	sessionExerciseID, err := strconv.ParseUint(c.Param("exercise_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session exercise ID"})
		return
	}

	type UpdateSessionExerciseInput struct {
		OrderIndex  *int       `json:"order_index"`
		Notes       *string    `json:"notes"`
		CompletedAt *time.Time `json:"completed_at"`
	}

	var input UpdateSessionExerciseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sessionExercise, err := wc.workoutService.UpdateSessionExercise(userModel.ID, uint(workoutID), uint(sessionExerciseID), input.OrderIndex, input.Notes, input.CompletedAt)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session exercise not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update session exercise"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":          "Session exercise updated successfully",
		"session_exercise": sessionExercise,
	})
}

// LogSet adds a set to an exercise in the workout
func (wc *WorkoutController) LogSet(c *gin.Context) {
	userModel, err := wc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	workoutID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid workout ID"})
		return
	}

	sessionExerciseID, err := strconv.ParseUint(c.Param("exercise_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session exercise ID"})
		return
	}

	type LogSetInput struct {
		Reps            *int     `json:"reps"`
		Weight          *float64 `json:"weight"`
		DurationSeconds *int     `json:"duration_seconds"`
		DistanceMeters  *float64 `json:"distance_meters"`
		RPE             *int     `json:"rpe"` // Rate of Perceived Exertion (1-10)
	}

	var input LogSetInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	exerciseSet, err := wc.workoutService.LogSet(userModel.ID, uint(workoutID), uint(sessionExerciseID), input.Reps, input.Weight, input.DurationSeconds, input.DistanceMeters, input.RPE)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session exercise not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log set"})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Set logged successfully",
		"set":     exerciseSet,
	})
}

// UpdateSet updates a logged set
func (wc *WorkoutController) UpdateSet(c *gin.Context) {
	userModel, err := wc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	workoutID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid workout ID"})
		return
	}

	setID, err := strconv.ParseUint(c.Param("set_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid set ID"})
		return
	}

	type UpdateSetInput struct {
		Reps            *int     `json:"reps"`
		Weight          *float64 `json:"weight"`
		DurationSeconds *int     `json:"duration_seconds"`
		DistanceMeters  *float64 `json:"distance_meters"`
		RPE             *int     `json:"rpe"`
	}

	var input UpdateSetInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	exerciseSet, err := wc.workoutService.UpdateSet(userModel.ID, uint(workoutID), uint(setID), input.Reps, input.Weight, input.DurationSeconds, input.DistanceMeters, input.RPE)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Set not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update set"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Set updated successfully",
		"set":     exerciseSet,
	})
}

// DeleteSet removes a logged set
func (wc *WorkoutController) DeleteSet(c *gin.Context) {
	userModel, err := wc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	workoutID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid workout ID"})
		return
	}

	setID, err := strconv.ParseUint(c.Param("set_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid set ID"})
		return
	}

	err = wc.workoutService.DeleteSet(userModel.ID, uint(workoutID), uint(setID))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Set not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete set"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Set deleted successfully"})
}

// GetActiveWorkout returns user's currently active workout
func (wc *WorkoutController) GetActiveWorkout(c *gin.Context) {
	userModel, err := wc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	workout, err := wc.workoutService.GetActiveWorkout(userModel.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch active workout"})
		return
	}

	if workout == nil {
		c.JSON(http.StatusOK, gin.H{"workout": nil, "message": "No active workout"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"workout": workout})
}

// GetWorkoutStats returns workout statistics for the user
func (wc *WorkoutController) GetWorkoutStats(c *gin.Context) {
	userModel, err := wc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Default to 30 days if not specified
	days := c.DefaultQuery("days", "30")
	daysInt, err := strconv.Atoi(days)
	if err != nil || daysInt <= 0 {
		daysInt = 30
	}

	stats, err := wc.workoutService.GetWorkoutStats(userModel.ID, daysInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch workout stats"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"stats": stats})
}

// RemoveExerciseFromWorkout removes an exercise from a workout session
func (wc *WorkoutController) RemoveExerciseFromWorkout(c *gin.Context) {
	userModel, err := wc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	workoutID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid workout ID"})
		return
	}

	sessionExerciseID, err := strconv.ParseUint(c.Param("exercise_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session exercise ID"})
		return
	}

	err = wc.workoutService.RemoveExerciseFromWorkout(userModel.ID, uint(workoutID), uint(sessionExerciseID))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session exercise not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove exercise from workout"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Exercise removed from workout successfully"})
}
