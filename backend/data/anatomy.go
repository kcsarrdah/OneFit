package data

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"onefit/backend/models"
)

//go:embed muscles.json
var musclesJSON []byte

// LoadMuscles parses the embedded muscle reference content.
func LoadMuscles() ([]models.Muscle, error) {
	var muscles []models.Muscle
	if err := json.Unmarshal(musclesJSON, &muscles); err != nil {
		return nil, fmt.Errorf("parse muscles.json: %w", err)
	}
	return muscles, nil
}
