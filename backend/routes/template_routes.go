package routes

import (
	"onefit/backend/controllers"
	"onefit/backend/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupTemplateRoutes(router *gin.Engine, db *gorm.DB) {
	templateController := controllers.NewTemplateController(db)

	// Template routes group
	templates := router.Group("/api/templates")
	templates.Use(middleware.AuthMiddleware(db))
	{
		// Template CRUD operations
		templates.GET("/", templateController.GetTemplates)         // List templates with filters
		templates.GET("/:id", templateController.GetTemplate)       // Get single template with exercises
		templates.POST("/", templateController.CreateTemplate)      // Create new template
		templates.PUT("/:id", templateController.UpdateTemplate)    // Update template
		templates.DELETE("/:id", templateController.DeleteTemplate) // Delete template

		// Template-Exercise management
		templates.POST("/:id/exercises", templateController.AddExerciseToTemplate)                     // Add exercise to template
		templates.PUT("/:id/exercises/:exercise_id", templateController.UpdateTemplateExercise)        // Update exercise in template
		templates.DELETE("/:id/exercises/:exercise_id", templateController.RemoveExerciseFromTemplate) // Remove exercise from template
	}
}
