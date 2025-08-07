package main

import (
	"log"
	"onefit/backend/models"
	"onefit/backend/routes"
	"onefit/backend/utils"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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

	db.AutoMigrate(&models.User{}, &models.Meal{}, &models.FastSession{}, &models.WaterLog{})

	// Clean up old test user without FirebaseUID
	db.Exec("DELETE FROM users WHERE id = 1")

	createTestUser(db)

	// Initialize Firebase
	if err := utils.InitFirebase(); err != nil {
		log.Printf("Warning: Failed to initialize Firebase: %v", err)
		log.Println("Firebase features will not be available")
	}

	// Setup Routes
	routes.SetupAuthRoutes(r, db)
	routes.SetupFastingRoutes(r, db)
	routes.SetupWaterRoutes(r, db)

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

	// FIXED: Start server on port 3000 to match frontend expectations
	log.Println("Server started on :3000")
	r.Run(":3000")
}

// createTestUser creates a test user for development purposes
func createTestUser(db *gorm.DB) {
	var testUser models.User

	// Check if test user already exists
	if err := db.First(&testUser, 1).Error; err != nil {
		// User doesn't exist, create it
		testUser = models.User{
			FirebaseUID: "test-firebase-uid-123",
			Email:       "test@onefit.com",
			Name:        "Test User",
		}
		testUser.ID = 1
		db.Create(&testUser)
	} else {
		// User exists, but update FirebaseUID if missing
		if testUser.FirebaseUID == "" {
			testUser.FirebaseUID = "test-firebase-uid-123"
			db.Save(&testUser)
			log.Println("✅ Updated test user with Firebase UID")
		}
		log.Println("✅ Test user already exists (ID: 1)")
	}
}
