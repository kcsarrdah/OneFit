package services

import (
	"onefit/backend/models"
	"onefit/backend/testutil"
	"testing"
)

func TestDeleteTemplateSoftDeletesExercises(t *testing.T) {
	db := testutil.NewDB(t)
	ts := NewTemplateService(db)
	es := NewExerciseService(db)
	user := testutil.NewUser(t, db, "user")
	exercise, err := es.CreateCustomExercise(user.ID, "Curl", "", "", "")
	if err != nil {
		t.Fatalf("create exercise: %v", err)
	}
	template, err := ts.CreateTemplate(user.ID, "Arms", "", "", false)
	if err != nil {
		t.Fatalf("create template: %v", err)
	}
	if _, err := ts.AddExerciseToTemplate(user.ID, template.ID, exercise.ID, 0, 3, "10", nil, 60); err != nil {
		t.Fatalf("add exercise: %v", err)
	}

	if err := ts.DeleteTemplate(user.ID, template.ID); err != nil {
		t.Fatalf("DeleteTemplate: %v", err)
	}
	if n := liveCount(t, db, &models.TemplateExercise{}, "template_id = ?", template.ID); n != 0 {
		t.Errorf("%d template exercises left live", n)
	}
	if err := es.DeleteCustomExercise(user.ID, exercise.ID); err != nil {
		t.Errorf("exercise used only by a deleted template should be deletable: %v", err)
	}
}
