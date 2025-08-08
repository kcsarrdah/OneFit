package middleware

import (
	"onefit/backend/services"
	"onefit/backend/utils"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Use this for development/testing only
const DEV_MODE = false
const TEST_USER_ID = 1

func AuthMiddleware(db *gorm.DB) gin.HandlerFunc {
	userService := services.NewUserService(db)

	return func(c *gin.Context) {
		// Development/testing bypass
		if DEV_MODE {
			// Get test user from database
			user, err := userService.GetUserByFirebaseUID("test-firebase-uid-123")
			if err != nil {
				c.JSON(500, gin.H{"error": "Test user not found"})
				c.Abort()
				return
			}

			c.Set("userId", user.ID)
			c.Set("firebaseUID", user.FirebaseUID)
			c.Set("user", user)
			c.Next()
			return
		}

		// Extract Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(401, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Parse Bearer token
		bearerToken := strings.Split(authHeader, " ")
		if len(bearerToken) != 2 || bearerToken[0] != "Bearer" {
			c.JSON(401, gin.H{"error": "Invalid token format. Use: Bearer <token>"})
			c.Abort()
			return
		}

		// Verify Firebase token
		token, err := utils.VerifyFirebaseToken(bearerToken[1])
		if err != nil {
			c.JSON(401, gin.H{"error": "Invalid Firebase token", "details": err.Error()})
			c.Abort()
			return
		}

		// Get or create user in database
		// Extract email and name safely
		email, _ := token.Claims["email"].(string)
		name, _ := token.Claims["name"].(string)
		if name == "" {
			// Use email as name if no display name is set
			name = email
		}

		user, err := userService.GetOrCreateUserByFirebaseUID(
			token.UID,
			email,
			name,
		)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to get user", "details": err.Error()})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("userId", user.ID)
		c.Set("firebaseUID", user.FirebaseUID)
		c.Set("user", user)
		c.Next()
	}
}
