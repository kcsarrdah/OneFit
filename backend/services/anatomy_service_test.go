package services

import (
	"errors"
	"onefit/backend/models"
	"strings"
	"testing"
)

func TestNewAnatomyServiceLoadsEmbeddedContent(t *testing.T) {
	as, err := NewAnatomyService()
	if err != nil {
		t.Fatalf("NewAnatomyService: %v", err)
	}

	all := as.ListMuscles(MuscleFilter{})
	if len(all) == 0 {
		t.Fatal("expected embedded muscles, got none")
	}

	for _, s := range all {
		m, err := as.GetMuscle(s.ID)
		if err != nil {
			t.Fatalf("GetMuscle(%q): %v", s.ID, err)
		}
		if len(m.Views) == 0 {
			t.Errorf("%s: no views", m.ID)
		}
		if len(m.Strength) == 0 || len(m.Flexibility) == 0 {
			t.Errorf("%s: needs at least one strength and one flexibility exercise", m.ID)
		}
		for _, v := range m.Views {
			if v != models.BodyViewFront && v != models.BodyViewBack {
				t.Errorf("%s: invalid view %q", m.ID, v)
			}
		}
		switch m.Region {
		case models.BodyRegionUpper, models.BodyRegionCore, models.BodyRegionLower:
		default:
			t.Errorf("%s: invalid region %q", m.ID, m.Region)
		}
	}
}

func TestListMusclesFilters(t *testing.T) {
	as, err := newAnatomyServiceFrom([]models.Muscle{
		{ID: "chest", Name: "Chest", Region: models.BodyRegionUpper, Views: []models.BodyView{models.BodyViewFront},
			Strength: []models.StrengthExercise{{Name: "Bench Press"}}},
		{ID: "glutes", Name: "Glutes", ScientificNames: []string{"Gluteus maximus"}, Region: models.BodyRegionLower, Views: []models.BodyView{models.BodyViewBack}},
		{ID: "calves", Name: "Calves", Region: models.BodyRegionLower, Views: []models.BodyView{models.BodyViewFront, models.BodyViewBack}},
	})
	if err != nil {
		t.Fatal(err)
	}

	tests := []struct {
		name   string
		filter MuscleFilter
		want   []string
	}{
		{"no filter", MuscleFilter{}, []string{"chest", "glutes", "calves"}},
		{"region", MuscleFilter{Region: models.BodyRegionLower}, []string{"glutes", "calves"}},
		{"view", MuscleFilter{View: models.BodyViewBack}, []string{"glutes", "calves"}},
		{"search by name", MuscleFilter{Search: "CALF"}, nil},
		{"search by scientific name", MuscleFilter{Search: "maximus"}, []string{"glutes"}},
		{"search by exercise", MuscleFilter{Search: "bench"}, []string{"chest"}},
		{"combined", MuscleFilter{Region: models.BodyRegionLower, View: models.BodyViewFront}, []string{"calves"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := as.ListMuscles(tt.filter)
			if len(got) != len(tt.want) {
				t.Fatalf("got %d muscles, want %v", len(got), tt.want)
			}
			for i, m := range got {
				if m.ID != tt.want[i] {
					t.Errorf("got[%d] = %q, want %q", i, m.ID, tt.want[i])
				}
			}
		})
	}
}

func TestTutorialLinks(t *testing.T) {
	as, err := newAnatomyServiceFrom([]models.Muscle{{
		ID: "chest",
		Strength: []models.StrengthExercise{
			{Name: "Push-ups"},
			{Name: "Bench Press", VideoURL: "https://www.youtube.com/watch?v=curated"},
		},
		Flexibility: []models.FlexibilityExercise{
			{Name: "Doorway Pec Stretch"},
			{Name: "Thread the Needle"},
		},
	}})
	if err != nil {
		t.Fatal(err)
	}
	m, _ := as.GetMuscle("chest")

	if got, want := m.Strength[0].VideoURL, youtubeSearch+"Push-ups+exercise+proper+form"; got != want {
		t.Errorf("default strength link = %q, want %q", got, want)
	}
	if got := m.Strength[1].VideoURL; got != "https://www.youtube.com/watch?v=curated" {
		t.Errorf("curated link overwritten: %q", got)
	}
	if got, want := m.Flexibility[0].VideoURL, youtubeSearch+"how+to+do+Doorway+Pec+Stretch"; got != want {
		t.Errorf("stretch link = %q, want %q", got, want)
	}
	if got, want := m.Flexibility[1].VideoURL, youtubeSearch+"how+to+do+Thread+the+Needle+stretch"; got != want {
		t.Errorf("stretch link = %q, want %q", got, want)
	}
}

func TestEmbeddedContentHasTutorialLinks(t *testing.T) {
	as, err := NewAnatomyService()
	if err != nil {
		t.Fatal(err)
	}
	for _, s := range as.ListMuscles(MuscleFilter{}) {
		m, _ := as.GetMuscle(s.ID)
		for _, e := range m.Strength {
			if !strings.HasPrefix(e.VideoURL, "https://") {
				t.Errorf("%s / %s: missing video link", m.ID, e.Name)
			}
		}
		for _, e := range m.Flexibility {
			if !strings.HasPrefix(e.VideoURL, "https://") {
				t.Errorf("%s / %s: missing video link", m.ID, e.Name)
			}
		}
	}
}

func TestGetMuscleNotFound(t *testing.T) {
	as, err := newAnatomyServiceFrom(nil)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := as.GetMuscle("nope"); !errors.Is(err, ErrMuscleNotFound) {
		t.Fatalf("got %v, want ErrMuscleNotFound", err)
	}
}

func TestNewAnatomyServiceRejectsDuplicateIDs(t *testing.T) {
	_, err := newAnatomyServiceFrom([]models.Muscle{{ID: "a"}, {ID: "a"}})
	if err == nil {
		t.Fatal("expected duplicate id error")
	}
}
