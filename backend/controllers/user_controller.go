package controllers

import (
	"fmt"
	"net/http"
	"onefit/backend/models"
	"onefit/backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserController struct {
	db          *gorm.DB
	userService *services.UserService
}

func NewUserController(db *gorm.DB) *UserController {
	return &UserController{
		db:          db,
		userService: services.NewUserService(db),
	}
}

// getUserFromContext safely extracts user from gin context
func (uc *UserController) getUserFromContext(c *gin.Context) (*models.User, error) {
	user, exists := c.Get("user")
	if !exists {
		return nil, fmt.Errorf("user not found in context")
	}

	userModel, ok := user.(*models.User)
	if !ok {
		return nil, fmt.Errorf("invalid user type in context")
	}

	return userModel, nil
}

// TestFirebase tests Firebase connection (public endpoint)
func (uc *UserController) TestFirebase(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Firebase test endpoint",
		"status":  "Firebase integration ready",
		"note":    "This is a public endpoint to test Firebase setup",
	})
}

// GetProfile returns current user profile (protected endpoint)
func (uc *UserController) GetProfile(c *gin.Context) {
	userModel, err := uc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": userModel})
}

// UpdateProfile updates user profile information (protected endpoint)
func (uc *UserController) UpdateProfile(c *gin.Context) {
	userModel, err := uc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	type UpdateProfileInput struct {
		Name   *string  `json:"name"`
		Height *float64 `json:"height"`
		Weight *float64 `json:"weight"`
	}

	var input UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields if provided
	if input.Name != nil {
		userModel.Name = *input.Name
	}
	if input.Height != nil {
		userModel.Height = *input.Height
	}
	if input.Weight != nil {
		userModel.Weight = *input.Weight
	}

	if err := uc.userService.UpdateUser(userModel); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"user":    userModel,
	})
}

// UpdateSettings updates user settings (protected endpoint)
func (uc *UserController) UpdateSettings(c *gin.Context) {
	userModel, err := uc.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	type UpdateSettingsInput struct {
		Goals    *string `json:"goals"`
		Settings *string `json:"settings"`
	}

	var input UpdateSettingsInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields if provided
	if input.Goals != nil {
		userModel.Goals = *input.Goals
	}
	if input.Settings != nil {
		userModel.Settings = *input.Settings
	}

	if err := uc.userService.UpdateUser(userModel); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Settings updated successfully",
		"user":    userModel,
	})
}
