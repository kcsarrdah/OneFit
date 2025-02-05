package routes

import (
    "github.com/gin-gonic/gin"
    "onefit/backend/controllers"
    "gorm.io/gorm"
)

func SetupAuthRoutes(router *gin.Engine, db *gorm.DB) {
    authController := controllers.NewAuthController(db)
    
    auth := router.Group("/api/auth")
    {
        auth.POST("/register", authController.Register)
        auth.POST("/login", authController.Login)
    }
}