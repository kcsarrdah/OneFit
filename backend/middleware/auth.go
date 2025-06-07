package middleware

import (
	"onefit/backend/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

// Use this for development/testing only
const DEV_MODE = true
const TEST_USER_ID = 1

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Development/testing bypass
		if DEV_MODE {
			c.Set("userId", uint(TEST_USER_ID))
			c.Next()
			return
		}

		// Normal authentication flow
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(401, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		bearerToken := strings.Split(authHeader, " ")
		if len(bearerToken) != 2 {
			c.JSON(401, gin.H{"error": "Invalid token format"})
			c.Abort()
			return
		}

		userId, err := utils.ValidateToken(bearerToken[1])
		if err != nil {
			c.JSON(401, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Set("userId", userId)
		c.Next()
	}
}
