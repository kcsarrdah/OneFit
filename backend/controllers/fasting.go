package controllers

import (
	"net/http"
	"time"

	"onefit/backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FastingController struct {
	db *gorm.DB
}

func NewFastingController(db *gorm.DB) *FastingController {
	return &FastingController{db: db}
}

// Request structs
type StartFastRequest struct {
	FastTypeID uuid.UUID `json:"fast_type_id" binding:"required"`
	Notes      string    `json:"notes"`
}

type EndFastRequest struct {
	Notes string `json:"notes"`
}

// StartFast starts a new fasting session
func (fc *FastingController) StartFast(c *gin.Context) {
	var req StartFastRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Hardcode user ID temporarily
	uid := uuid.New()

	var ongoing models.FastingSession
	result := fc.db.Where("user_id = ? AND status = ?", uid, models.FastingStatusOngoing).First(&ongoing)
	if result.RowsAffected > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "You already have an ongoing fast"})
		return
	}

	fast := models.FastingSession{
		UserID:     uid,
		FastTypeID: req.FastTypeID,
		StartTime:  time.Now(),
		Status:     models.FastingStatusOngoing,
		Notes:      req.Notes,
	}

	var fastType models.FastType
	if err := fc.db.First(&fastType, "id = ?", req.FastTypeID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid fast type"})
		return
	}
	fast.TargetHours = fastType.TargetHours

	if err := fc.db.Create(&fast).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start fast"})
		return
	}

	fc.db.Preload("FastType").First(&fast, fast.ID)

	c.JSON(http.StatusCreated, fast)
}

// GetCurrentFast gets the current ongoing fast
func (fc *FastingController) GetCurrentFast(c *gin.Context) {
	// Hardcode same user ID as StartFast for testing
	uid := uuid.MustParse("66330218-1d26-47c7-813b-ef9798ea185d")

	var fast models.FastingSession
	result := fc.db.Preload("FastType").Where("user_id = ? AND status = ?", uid, models.FastingStatusOngoing).First(&fast)

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No ongoing fast found"})
		return
	}

	c.JSON(http.StatusOK, fast)
}

// EndFast ends a fasting session
func (fc *FastingController) EndFast(c *gin.Context) {
	fastID := c.Param("id")
	uid := uuid.MustParse("66330218-1d26-47c7-813b-ef9798ea185d")

	var req EndFastRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	var fast models.FastingSession
	if err := fc.db.Where("id = ? AND user_id = ?", fastID, uid).First(&fast).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Fast not found"})
		return
	}

	if fast.Status != models.FastingStatusOngoing {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fast is not ongoing"})
		return
	}

	endTime := time.Now()
	fast.EndTime = &endTime
	fast.Status = models.FastingStatusCompleted
	if req.Notes != "" {
		fast.Notes = req.Notes
	}

	if err := fc.db.Save(&fast).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to end fast"})
		return
	}

	c.JSON(http.StatusOK, fast)
}

// GetFastHistory gets the user's fasting history
func (fc *FastingController) GetFastHistory(c *gin.Context) {
	uid := uuid.MustParse("66330218-1d26-47c7-813b-ef9798ea185d")

	var fasts []models.FastingSession
	if err := fc.db.Preload("FastType").
		Where("user_id = ?", uid).
		Order("created_at DESC").
		Find(&fasts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch fasting history"})
		return
	}

	c.JSON(http.StatusOK, fasts)
}

// GetFastTypes gets all available fast types
func (fc *FastingController) GetFastTypes(c *gin.Context) {
	var fastTypes []models.FastType
	if err := fc.db.Where("is_custom = false").
		Order("target_hours ASC").
		Find(&fastTypes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch fast types"})
		return
	}
	c.JSON(http.StatusOK, fastTypes)
}
