package routes

import (
	"onefit/backend/controllers"
	"onefit/backend/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupAuthRoutes(router *gin.Engine, db *gorm.DB) {
	// Create user controller (not auth controller)
	userController := controllers.NewUserController(db)

	auth := router.Group("/api/auth")
	{
		// Public routes (no auth required)
		auth.GET("/firebase-test", userController.TestFirebase) // For testing Firebase connection

		// Protected routes (require Firebase auth)
		auth.Use(middleware.AuthMiddleware(db))
		auth.GET("/me", userController.GetProfile)
		auth.PUT("/me", userController.UpdateProfile)
		auth.PATCH("/me/settings", userController.UpdateSettings)
	}

	// NOTE: Register and Login are now handled by Firebase on the frontend
	// No backend endpoints needed for these operations
}
