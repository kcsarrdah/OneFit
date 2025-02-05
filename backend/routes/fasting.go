package routes

import (
	"onefit/backend/controllers"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupFastingRoutes(router *gin.Engine, db *gorm.DB) {
	fastingController := controllers.NewFastingController(db)

	// Group fasting routes
	fastingRoutes := router.Group("/api/fasts")
	{
		// Fasting session endpoints
		fastingRoutes.POST("", fastingController.StartFast)
		fastingRoutes.PUT("/:id", fastingController.EndFast)
		fastingRoutes.GET("/current", fastingController.GetCurrentFast)
		fastingRoutes.GET("", fastingController.GetFastHistory)

		// Fast types endpoints
		fastingRoutes.GET("/types", fastingController.GetFastTypes)
	}
}
