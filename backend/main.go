package main

import (
	"log"
	"onefit/backend/models"
	"onefit/backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize Gin
	r := gin.Default()

	// CORS Config
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Authorization", "Content-Type"}
	r.Use(cors.New(config))

	// Setup Database
	db := models.SetupDB()
	db.AutoMigrate(&models.User{}, &models.Workout{}, &models.Meal{})

	// Setup Routes
	routes.SetupAuthRoutes(r, db)

	// Basic Routes
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Welcome to OneFit Backend!"})
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":   "healthy",
			"database": "connected",
		})
	})

	// Start Server
	log.Println("Server started on :8080")
	r.Run(":8080")
}
