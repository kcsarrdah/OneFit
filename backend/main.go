package main

import (
	"log"
	"onefit/backend/models"
	"onefit/backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
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

	db.AutoMigrate(&models.User{}, &models.Workout{}, &models.Meal{}, &models.FastSession{}, &models.WaterLog{})

	createTestUser(db)

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
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("testpassword"), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Error hashing test password: %v", err)
			return
		}

		testUser = models.User{
			Email:    "test@onefit.com",
			Password: string(hashedPassword),
			Name:     "Test User",
		}

		// Set ID to 1 explicitly (for development only)
		testUser.ID = 1

		if result := db.Create(&testUser); result.Error != nil {
			log.Printf("Error creating test user: %v", result.Error)
		} else {
			log.Println("✅ Created test user (ID: 1) for development")
			log.Println("   Email: test@onefit.com")
			log.Println("   Password: testpassword")
		}
	} else {
		log.Println("✅ Test user already exists (ID: 1)")
	}
}
