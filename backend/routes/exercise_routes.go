package routes

import (
	"onefit/backend/controllers"
	"onefit/backend/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupExerciseRoutes(router *gin.Engine, db *gorm.DB) {
	exerciseController := controllers.NewExerciseController(db)

	// Exercise routes group
	exercises := router.Group("/api/exercises")
	exercises.Use(middleware.AuthMiddleware(db))
	{
		// Exercise CRUD operations
		exercises.GET("/", exerciseController.GetExercises)         // List exercises with filters
		exercises.GET("/:id", exerciseController.GetExercise)       // Get single exercise
		exercises.POST("/", exerciseController.CreateExercise)      // Create custom exercise
		exercises.PUT("/:id", exerciseController.UpdateExercise)    // Update custom exercise
		exercises.DELETE("/:id", exerciseController.DeleteExercise) // Delete custom exercise
	}
}
