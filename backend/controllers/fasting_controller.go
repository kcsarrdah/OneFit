package controllers

import (
	"net/http"
	"onefit/backend/models"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type FastingController struct {
	db *gorm.DB
}

func NewFastingController(db *gorm.DB) *FastingController {
	return &FastingController{db: db}
}

// SaveFastInput matches the frontend data structure
type SaveFastInput struct {
	StartTime             int64  `json:"startTime" binding:"required"`             // milliseconds timestamp
	EndTime               int64  `json:"endTime" binding:"required"`               // milliseconds timestamp
	ActualDurationSeconds int    `json:"actualDurationSeconds" binding:"required"` // actual duration in seconds
	GoalDurationSeconds   int    `json:"goalDurationSeconds" binding:"required"`   // goal duration in seconds
	Notes                 string `json:"notes"`                                    // optional user notes
}

// SaveFast saves a completed fasting session from the frontend
func (fc *FastingController) SaveFast(c *gin.Context) {
	userId := c.GetUint("userId") // From auth middleware

	var input SaveFastInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate timestamps
	if input.StartTime >= input.EndTime {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Start time must be before end time"})
		return
	}

	// Validate durations
	if input.ActualDurationSeconds <= 0 || input.GoalDurationSeconds <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Durations must be positive"})
		return
	}

	// Convert milliseconds to time.Time
	startTime := time.Unix(input.StartTime/1000, (input.StartTime%1000)*1000000)
	endTime := time.Unix(input.EndTime/1000, (input.EndTime%1000)*1000000)

	// Validate that the fast isn't in the future
	now := time.Now()
	if startTime.After(now) || endTime.After(now) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fast cannot be in the future"})
		return
	}

	// Create fasting session record
	fastSession := models.FastSession{
		UserID:    userId,
		StartTime: startTime,
		EndTime:   endTime,
		Duration:  input.ActualDurationSeconds / 60, // Convert to minutes for storage consistency
		Target:    input.GoalDurationSeconds / 60,   // Convert to minutes for storage consistency
		Type:      fc.determineType(input.GoalDurationSeconds),
		Notes:     input.Notes,
	}

	// Save to database
	if result := fc.db.Create(&fastSession); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save fasting session"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Fast saved successfully",
		"session": fastSession,
	})
}

// GetHistory returns the user's fasting history
func (fc *FastingController) GetHistory(c *gin.Context) {
	userId := c.GetUint("userId") // From auth middleware

	var fastSessions []models.FastSession
	result := fc.db.Where("user_id = ?", userId).Order("created_at desc").Find(&fastSessions)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch fasting history"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"sessions": fastSessions,
		"count":    len(fastSessions),
	})
}

// determineType automatically determines the fast type based on goal duration
func (fc *FastingController) determineType(goalDurationSeconds int) string {
	hours := goalDurationSeconds / 3600

	switch hours {
	case 16:
		return "16:8"
	case 18:
		return "18:6"
	case 20:
		return "20:4"
	case 24:
		return "OMAD"
	default:
		return "custom"
	}
}
