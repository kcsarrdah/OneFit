package controllers

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"onefit/backend/models"
	"testing"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// newTestRouter wires the exercise, template and workout handlers with the
// given user already in the context, the way AuthMiddleware leaves it.
func newTestRouter(db *gorm.DB, user *models.User) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(func(c *gin.Context) {
		c.Set("userId", user.ID)
		c.Set("user", user)
	})

	ec := NewExerciseController(db)
	r.GET("/api/exercises/", ec.GetExercises)
	r.POST("/api/exercises/", ec.CreateExercise)
	r.PUT("/api/exercises/:id", ec.UpdateExercise)
	r.DELETE("/api/exercises/:id", ec.DeleteExercise)

	tc := NewTemplateController(db)
	r.POST("/api/templates/", tc.CreateTemplate)
	r.PUT("/api/templates/:id", tc.UpdateTemplate)
	r.DELETE("/api/templates/:id", tc.DeleteTemplate)
	r.POST("/api/templates/:id/exercises", tc.AddExerciseToTemplate)

	wc := NewWorkoutController(db)
	r.POST("/api/workouts/", wc.StartWorkout)
	r.POST("/api/workouts/:id/exercises", wc.AddExerciseToWorkout)
	r.POST("/api/workouts/:id/exercises/:exercise_id/sets", wc.LogSet)

	return r
}

// do sends a JSON request and decodes the JSON response body.
func do(t *testing.T, r *gin.Engine, method, path string, body any) (int, map[string]any) {
	t.Helper()

	var buf bytes.Buffer
	if body != nil {
		if err := json.NewEncoder(&buf).Encode(body); err != nil {
			t.Fatalf("encode body: %v", err)
		}
	}
	req := httptest.NewRequest(method, path, &buf)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var out map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &out); err != nil {
		t.Fatalf("%s %s: decode %q: %v", method, path, w.Body.String(), err)
	}
	return w.Code, out
}

// mustDo is do that fails the test unless the status matches.
func mustDo(t *testing.T, r *gin.Engine, method, path string, body any, want int) map[string]any {
	t.Helper()

	code, out := do(t, r, method, path, body)
	if code != want {
		t.Fatalf("%s %s: status %d, want %d (%v)", method, path, code, want, out)
	}
	return out
}

// idOf reads the ID of a created object from a response body.
func idOf(t *testing.T, out map[string]any, key string) uint {
	t.Helper()

	obj, ok := out[key].(map[string]any)
	if !ok {
		t.Fatalf("response has no %q object: %v", key, out)
	}
	return uint(obj["ID"].(float64))
}
