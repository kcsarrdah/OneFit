package controllers

import (
	"fmt"
	"net/http"
	"onefit/backend/testutil"
	"testing"
)

func TestRespondErrorStatusCodes(t *testing.T) {
	db := testutil.NewDB(t)
	owner := testutil.NewUser(t, db, "owner")
	other := testutil.NewUser(t, db, "other")
	r := newTestRouter(db, owner)

	exerciseID := idOf(t, mustDo(t, r, "POST", "/api/exercises/", map[string]any{"name": "Curl"}, http.StatusCreated), "exercise")
	templateID := idOf(t, mustDo(t, r, "POST", "/api/templates/", map[string]any{"name": "Push"}, http.StatusCreated), "template")
	mustDo(t, r, "POST", fmt.Sprintf("/api/templates/%d/exercises", templateID), map[string]any{"exercise_id": exerciseID}, http.StatusCreated)
	workoutID := idOf(t, mustDo(t, r, "POST", "/api/workouts/", map[string]any{"name": "Monday", "template_id": templateID}, http.StatusCreated), "workout")
	sessionExerciseID := idOf(t, mustDo(t, r, "POST", fmt.Sprintf("/api/workouts/%d/exercises", workoutID), map[string]any{"exercise_id": exerciseID}, http.StatusCreated), "session_exercise")

	otherTemplateID := idOf(t, mustDo(t, newTestRouter(db, other), "POST", "/api/templates/", map[string]any{"name": "Private"}, http.StatusCreated), "template")

	cases := []struct {
		name   string
		method string
		path   string
		body   any
		want   int
	}{
		{"blank exercise name", "POST", "/api/exercises/", map[string]any{"name": "   "}, http.StatusBadRequest},
		{"duplicate exercise name", "POST", "/api/exercises/", map[string]any{"name": "Curl"}, http.StatusConflict},
		{"exercise in use", "DELETE", fmt.Sprintf("/api/exercises/%d", exerciseID), nil, http.StatusConflict},
		{"missing exercise", "DELETE", "/api/exercises/9999", nil, http.StatusNotFound},
		{"blank template name", "POST", "/api/templates/", map[string]any{"name": " "}, http.StatusBadRequest},
		{"duplicate template name", "POST", "/api/templates/", map[string]any{"name": "Push"}, http.StatusConflict},
		{"exercise already in template", "POST", fmt.Sprintf("/api/templates/%d/exercises", templateID), map[string]any{"exercise_id": exerciseID}, http.StatusConflict},
		{"template in use", "DELETE", fmt.Sprintf("/api/templates/%d", templateID), nil, http.StatusConflict},
		{"inaccessible template", "POST", "/api/workouts/", map[string]any{"name": "Tuesday", "template_id": otherTemplateID}, http.StatusNotFound},
		{"set with no metric", "POST", fmt.Sprintf("/api/workouts/%d/exercises/%d/sets", workoutID, sessionExerciseID), map[string]any{}, http.StatusBadRequest},
		{"set with a metric", "POST", fmt.Sprintf("/api/workouts/%d/exercises/%d/sets", workoutID, sessionExerciseID), map[string]any{"reps": 8}, http.StatusCreated},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			code, out := do(t, r, tc.method, tc.path, tc.body)
			if code != tc.want {
				t.Errorf("status %d, want %d (%v)", code, tc.want, out)
			}
			if code >= 400 && code < 500 && out["error"] == "" {
				t.Errorf("4xx without an error message: %v", out)
			}
		})
	}
}
