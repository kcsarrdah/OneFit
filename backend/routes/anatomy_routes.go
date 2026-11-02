package routes

import (
	"log"
	"onefit/backend/controllers"
	"onefit/backend/services"

	"github.com/gin-gonic/gin"
)

// SetupAnatomyRoutes registers the muscle reference endpoints. They serve
// public, read-only content, so unlike the user-data routes they are not
// behind AuthMiddleware.
func SetupAnatomyRoutes(router *gin.Engine) {
	anatomyService, err := services.NewAnatomyService()
	if err != nil {
		log.Fatalf("Failed to load anatomy content: %v", err)
	}
	anatomyController := controllers.NewAnatomyController(anatomyService)

	anatomy := router.Group("/api/anatomy")
	{
		anatomy.GET("/muscles", anatomyController.GetMuscles)    // List muscles with filters
		anatomy.GET("/muscles/:id", anatomyController.GetMuscle) // Get muscle with exercises and stretches
	}
}
