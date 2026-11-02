package models

// Anatomy reference content. Unlike the other models these are not
// persisted with GORM: they are static, versioned with the code, and
// loaded from backend/data at startup.

type BodyView string

const (
	BodyViewFront BodyView = "front"
	BodyViewBack  BodyView = "back"
)

type BodyRegion string

const (
	BodyRegionUpper BodyRegion = "upper"
	BodyRegionCore  BodyRegion = "core"
	BodyRegionLower BodyRegion = "lower"
)

// Muscle is a selectable muscle group on the body diagram.
type Muscle struct {
	ID              string                `json:"id"`
	Name            string                `json:"name"`
	ScientificNames []string              `json:"scientific_names"`
	Region          BodyRegion            `json:"region"`
	Views           []BodyView            `json:"views"`
	Summary         string                `json:"summary"`
	Functions       []string              `json:"functions"`
	Tips            []string              `json:"tips"`
	Strength        []StrengthExercise    `json:"strength"`
	Flexibility     []FlexibilityExercise `json:"flexibility"`
}

// MuscleSummary is the lightweight shape used for listing muscles.
type MuscleSummary struct {
	ID              string     `json:"id"`
	Name            string     `json:"name"`
	ScientificNames []string   `json:"scientific_names"`
	Region          BodyRegion `json:"region"`
	Views           []BodyView `json:"views"`
	Summary         string     `json:"summary"`
}

func (m Muscle) ToSummary() MuscleSummary {
	return MuscleSummary{
		ID:              m.ID,
		Name:            m.Name,
		ScientificNames: m.ScientificNames,
		Region:          m.Region,
		Views:           m.Views,
		Summary:         m.Summary,
	}
}

type StrengthExercise struct {
	Name         string   `json:"name"`
	Equipment    string   `json:"equipment"`
	Difficulty   string   `json:"difficulty"` // beginner | intermediate | advanced
	Prescription string   `json:"prescription"`
	Cues         []string `json:"cues"`
	// VideoURL links to a how-to video. Set it in muscles.json to pick a
	// specific video; otherwise the service fills in a YouTube search.
	VideoURL string `json:"video_url"`
}

type FlexibilityExercise struct {
	Name     string   `json:"name"`
	Type     string   `json:"type"` // static | dynamic | mobility
	Duration string   `json:"duration"`
	Cues     []string `json:"cues"`
	VideoURL string   `json:"video_url"` // see StrengthExercise.VideoURL
}
