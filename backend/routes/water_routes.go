package routes

import (
	"onefit/backend/controllers"
	"onefit/backend/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupWaterRoutes(router *gin.Engine, db *gorm.DB) {
	waterController := controllers.NewWaterController(db)

	water := router.Group("/api/water")
	water.Use(middleware.AuthMiddleware(db))
	{
		// Log water intake
		water.POST("/", waterController.LogWater)

		// Get water logs (with optional date filtering)
		water.GET("/", waterController.GetWaterLogs)

		// Delete a specific water log
		water.DELETE("/latest", waterController.DeleteLatestWaterLog)

		water.DELETE("/:id", waterController.DeleteWaterLog)
	}
}
