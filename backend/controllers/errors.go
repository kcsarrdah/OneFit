package controllers

import (
	"errors"
	"net/http"
	"onefit/backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// respondError writes the status for a service error: notFoundMsg with 404 for
// a missing row, the error's own message with 400/404/409 for a typed service
// error, and fallbackMsg with 500 for anything else.
func respondError(c *gin.Context, err error, notFoundMsg, fallbackMsg string) {
	switch {
	case errors.Is(err, gorm.ErrRecordNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": notFoundMsg})
	case errors.Is(err, services.ErrInvalidInput):
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	case errors.Is(err, services.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
	case errors.Is(err, services.ErrConflict):
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": fallbackMsg})
	}
}
