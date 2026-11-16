package services

import (
	"onefit/backend/models"
	"onefit/backend/testutil"
	"reflect"
	"testing"
)

func exerciseNames(exercises []models.Exercise) []string {
	names := []string{}
	for _, e := range exercises {
		names = append(names, e.Name)
	}
	return names
}

func TestGetExercisesFilters(t *testing.T) {
	db := testutil.NewDB(t)
	es := NewExerciseService(db)
	if err := es.SeedDefaultExercises(); err != nil {
		t.Fatalf("seed: %v", err)
	}
	user := testutil.NewUser(t, db, "user")
	other := testutil.NewUser(t, db, "other")
	if _, err := es.CreateCustomExercise(user.ID, "Leg Press", "legs", "machine", ""); err != nil {
		t.Fatalf("create: %v", err)
	}
	if _, err := es.CreateCustomExercise(other.ID, "Hack Squat", "legs", "machine", ""); err != nil {
		t.Fatalf("create: %v", err)
	}

	cases := []struct {
		name                           string
		muscleGroup, equipment, search string
		includeCustom                  bool
		want                           []string
	}{
		{"all built-ins", "", "", "", false, []string{"Deadlift", "Plank", "Pull-ups", "Push-ups", "Squats"}},
		{"built-ins and own custom", "", "", "", true, []string{"Deadlift", "Plank", "Pull-ups", "Push-ups", "Squats", "Leg Press"}},
		{"muscle group, built-ins only", "legs", "", "", false, []string{"Deadlift", "Squats"}},
		{"muscle group with custom", "legs", "", "", true, []string{"Deadlift", "Squats", "Leg Press"}},
		{"equipment, built-ins only", "", "bodyweight", "", false, []string{"Plank", "Push-ups", "Squats"}},
		{"equipment with custom", "", "machine", "", true, []string{"Leg Press"}},
		{"search is case-insensitive", "", "", "PUSH", false, []string{"Push-ups"}},
		{"search with custom", "", "", "press", true, []string{"Leg Press"}},
		{"search, filter and custom combined", "legs", "", "s", true, []string{"Squats", "Leg Press"}},
		{"no match", "", "", "zzz", true, []string{}},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := es.GetExercises(user.ID, tc.muscleGroup, tc.equipment, tc.search, tc.includeCustom)
			if err != nil {
				t.Fatalf("GetExercises: %v", err)
			}
			if names := exerciseNames(got); !reflect.DeepEqual(names, tc.want) {
				t.Errorf("got %v, want %v", names, tc.want)
			}
		})
	}
}
