package controllers

import (
	"errors"
	"net/http"
	"onefit/backend/models"
	"onefit/backend/services"

	"github.com/gin-gonic/gin"
)

type AnatomyController struct {
	anatomyService *services.AnatomyService
}

func NewAnatomyController(anatomyService *services.AnatomyService) *AnatomyController {
	return &AnatomyController{anatomyService: anatomyService}
}

// GetMuscles returns muscle summaries with optional region, view and search filters
func (ac *AnatomyController) GetMuscles(c *gin.Context) {
	region := models.BodyRegion(c.Query("region"))
	switch region {
	case "", models.BodyRegionUpper, models.BodyRegionCore, models.BodyRegionLower:
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "region must be one of: upper, core, lower"})
		return
	}

	view := models.BodyView(c.Query("view"))
	switch view {
	case "", models.BodyViewFront, models.BodyViewBack:
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "view must be one of: front, back"})
		return
	}

	muscles := ac.anatomyService.ListMuscles(services.MuscleFilter{
		Region: region,
		View:   view,
		Search: c.Query("search"),
	})

	c.JSON(http.StatusOK, gin.H{
		"muscles": muscles,
		"count":   len(muscles),
	})
}

// GetMuscle returns full detail, including exercises and stretches, for one muscle
func (ac *AnatomyController) GetMuscle(c *gin.Context) {
	muscle, err := ac.anatomyService.GetMuscle(c.Param("id"))
	if err != nil {
		if errors.Is(err, services.ErrMuscleNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Muscle not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch muscle"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"muscle": muscle})
}
