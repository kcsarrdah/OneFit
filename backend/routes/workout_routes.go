package routes

import (
	"onefit/backend/controllers"
	"onefit/backend/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupWorkoutRoutes(router *gin.Engine, db *gorm.DB) {
	workoutController := controllers.NewWorkoutController(db)

	// All workout routes require authentication
	workouts := router.Group("/api/workouts")
	workouts.Use(middleware.AuthMiddleware(db))
	{
		// Workout CRUD operations
		workouts.GET("/", workoutController.GetWorkouts)            // Get user's workout history
		workouts.POST("/", workoutController.StartWorkout)          // Start a new workout
		workouts.GET("/active", workoutController.GetActiveWorkout) // Get current active workout
		workouts.GET("/stats", workoutController.GetWorkoutStats)   // Get workout statistics
		workouts.GET("/:id", workoutController.GetWorkout)          // Get specific workout details
		workouts.PUT("/:id", workoutController.UpdateWorkout)       // Update/finish workout
		workouts.DELETE("/:id", workoutController.DeleteWorkout)    // Delete workout

		// Exercise management within workouts
		workouts.POST("/:id/exercises", workoutController.AddExerciseToWorkout)                     // Add exercise to workout
		workouts.PUT("/:id/exercises/:exercise_id", workoutController.UpdateSessionExercise)        // Update exercise in workout
		workouts.DELETE("/:id/exercises/:exercise_id", workoutController.RemoveExerciseFromWorkout) // Remove exercise from workout

		// Set logging and management
		workouts.POST("/:id/exercises/:exercise_id/sets", workoutController.LogSet) // Log a set for an exercise
		workouts.PUT("/:id/sets/:set_id", workoutController.UpdateSet)              // Update a logged set
		workouts.DELETE("/:id/sets/:set_id", workoutController.DeleteSet)           // Delete a logged set
	}
}
