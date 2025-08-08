package main

import (
	"log"
	"onefit/backend/models"
	"onefit/backend/routes"
	"onefit/backend/utils"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Set Gin mode from environment
	if mode := os.Getenv("GIN_MODE"); mode != "" {
		gin.SetMode(mode)
	}

	// Initialize Gin
	r := gin.Default()

	// CORS Config from environment
	config := cors.DefaultConfig()
	corsOrigins := os.Getenv("CORS_ORIGINS")
	if corsOrigins != "" {
		config.AllowOrigins = strings.Split(corsOrigins, ",")
	} else {
		config.AllowOrigins = []string{"http://localhost:3000"} // fallback
	}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Authorization", "Content-Type"}
	r.Use(cors.New(config))

	// Setup Database
	db := models.SetupDB()

	// Create test user only in development
	if os.Getenv("GIN_MODE") != "release" {
		// Clean up old test user without FirebaseUID
		db.Exec("DELETE FROM users WHERE id = 1")
		createTestUser(db)
	}

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

	// Start server on port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000" // fallback
	}
	log.Printf("Server started on :%s", port)
	r.Run(":" + port)
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
			if os.Getenv("GIN_MODE") != "release" {
				log.Println("✅ Updated test user with Firebase UID")
			}
		}
		if os.Getenv("GIN_MODE") != "release" {
			log.Println("✅ Test user already exists (ID: 1)")
		}
	}
}
