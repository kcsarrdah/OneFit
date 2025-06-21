package controllers

import (
	"net/http"
	"onefit/backend/models"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type WaterController struct {
	db *gorm.DB
}

func NewWaterController(db *gorm.DB) *WaterController {
	return &WaterController{db: db}
}

// LogWaterInput matches the expected frontend data structure
type LogWaterInput struct {
	Amount   float64 `json:"amount" binding:"required,min=0"` // Amount in mL
	LoggedAt *int64  `json:"logged_at,omitempty"`             // Optional timestamp, defaults to now
}

// LogWater saves a new water intake entry
func (wc *WaterController) LogWater(c *gin.Context) {
	userId := c.GetUint("userId") // From auth middleware

	var input LogWaterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set logged time - use provided timestamp or current time
	var loggedAt time.Time
	if input.LoggedAt != nil {
		loggedAt = time.Unix(*input.LoggedAt/1000, (*input.LoggedAt%1000)*1000000)
	} else {
		loggedAt = time.Now()
	}

	// Validate that the log isn't in the future
	if loggedAt.After(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Water log cannot be in the future"})
		return
	}

	// Create water log record
	waterLog := models.WaterLog{
		UserID:   userId,
		Amount:   input.Amount,
		LoggedAt: loggedAt,
	}

	// Save to database
	if result := wc.db.Create(&waterLog); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save water log"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Water logged successfully",
		"log":     waterLog,
	})
}

// GetWaterLogs returns the user's water intake history
func (wc *WaterController) GetWaterLogs(c *gin.Context) {
	userId := c.GetUint("userId") // From auth middleware

	// Optional query parameters for filtering
	date := c.Query("date") // Format: YYYY-MM-DD

	query := wc.db.Where("user_id = ?", userId)

	// Filter by date if provided
	if date != "" {
		startDate, err := time.Parse("2006-01-02", date)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
			return
		}
		endDate := startDate.Add(24 * time.Hour)
		query = query.Where("logged_at >= ? AND logged_at < ?", startDate, endDate)
	}

	var waterLogs []models.WaterLog
	result := query.Order("logged_at desc").Find(&waterLogs)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch water logs"})
		return
	}

	// Calculate total for the day/period
	var totalAmount float64
	for _, log := range waterLogs {
		totalAmount += log.Amount
	}

	c.JSON(http.StatusOK, gin.H{
		"logs":         waterLogs,
		"count":        len(waterLogs),
		"total_amount": totalAmount,
	})
}

func (wc *WaterController) DeleteLatestWaterLog(c *gin.Context) {
	userId := c.GetUint("userId") // From auth middleware

	// Find the most recent water log for this user
	var waterLog models.WaterLog
	result := wc.db.Where("user_id = ?", userId).Order("logged_at desc, created_at desc").First(&waterLog)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "No water logs found to delete"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find water log"})
		}
		return
	}

	// Delete the latest log
	if result := wc.db.Delete(&waterLog); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete water log"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Latest water log deleted successfully",
		"deleted_log": waterLog,
	})
}

// DeleteWaterLog removes a water log entry
func (wc *WaterController) DeleteWaterLog(c *gin.Context) {
	userId := c.GetUint("userId") // From auth middleware
	logId := c.Param("id")

	// Convert logId to uint
	id, err := strconv.ParseUint(logId, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid log ID"})
		return
	}

	// Check if the log exists and belongs to the user
	var waterLog models.WaterLog
	result := wc.db.Where("id = ? AND user_id = ?", uint(id), userId).First(&waterLog)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Water log not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find water log"})
		}
		return
	}

	// Delete the log
	if result := wc.db.Delete(&waterLog); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete water log"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Water log deleted successfully",
		"log":     waterLog,
	})

}
