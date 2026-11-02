package services

import (
	"errors"
	"fmt"
	"onefit/backend/data"
	"onefit/backend/models"
	"slices"
	"strings"
)

var ErrMuscleNotFound = errors.New("muscle not found")

// AnatomyService serves read-only muscle reference content. The content is
// static, so it is loaded once and indexed in memory.
type AnatomyService struct {
	muscles []models.Muscle
	byID    map[string]int
}

func NewAnatomyService() (*AnatomyService, error) {
	muscles, err := data.LoadMuscles()
	if err != nil {
		return nil, err
	}
	return newAnatomyServiceFrom(muscles)
}

func newAnatomyServiceFrom(muscles []models.Muscle) (*AnatomyService, error) {
	byID := make(map[string]int, len(muscles))
	for i, m := range muscles {
		if m.ID == "" {
			return nil, fmt.Errorf("muscle at index %d has no id", i)
		}
		if _, dup := byID[m.ID]; dup {
			return nil, fmt.Errorf("duplicate muscle id %q", m.ID)
		}
		byID[m.ID] = i
	}
	return &AnatomyService{muscles: muscles, byID: byID}, nil
}

// MuscleFilter narrows the muscle list. Empty fields are ignored.
type MuscleFilter struct {
	Region models.BodyRegion
	View   models.BodyView
	Search string
}

// ListMuscles returns muscle summaries matching the filter, in content order.
func (as *AnatomyService) ListMuscles(f MuscleFilter) []models.MuscleSummary {
	search := strings.ToLower(strings.TrimSpace(f.Search))

	result := make([]models.MuscleSummary, 0, len(as.muscles))
	for _, m := range as.muscles {
		if f.Region != "" && m.Region != f.Region {
			continue
		}
		if f.View != "" && !slices.Contains(m.Views, f.View) {
			continue
		}
		if search != "" && !muscleMatches(m, search) {
			continue
		}
		result = append(result, m.ToSummary())
	}
	return result
}

// GetMuscle returns the full detail for a single muscle.
func (as *AnatomyService) GetMuscle(id string) (*models.Muscle, error) {
	i, ok := as.byID[id]
	if !ok {
		return nil, ErrMuscleNotFound
	}
	m := as.muscles[i]
	return &m, nil
}

// muscleMatches reports whether a muscle's names or exercises contain the
// lowercase search term.
func muscleMatches(m models.Muscle, search string) bool {
	if strings.Contains(strings.ToLower(m.Name), search) {
		return true
	}
	for _, n := range m.ScientificNames {
		if strings.Contains(strings.ToLower(n), search) {
			return true
		}
	}
	for _, e := range m.Strength {
		if strings.Contains(strings.ToLower(e.Name), search) {
			return true
		}
	}
	for _, e := range m.Flexibility {
		if strings.Contains(strings.ToLower(e.Name), search) {
			return true
		}
	}
	return false
}
