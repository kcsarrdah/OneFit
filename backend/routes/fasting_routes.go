package routes

import (
	"onefit/backend/controllers"
	"onefit/backend/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupFastingRoutes(router *gin.Engine, db *gorm.DB) {
	fastingController := controllers.NewFastingController(db)

	// Changed from "/api/fasting" to "/api/fasts" to match frontend expectations
	fasting := router.Group("/api/fasts")
	fasting.Use(middleware.AuthMiddleware())
	{
		// Save a completed fasting session (data comes from frontend timer)
		fasting.POST("/", fastingController.SaveFast)

		// Get user's fasting history
		fasting.GET("/history", fastingController.GetHistory)
	}
}
