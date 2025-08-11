# OneFit Backend Testing Plan

## Overview
This document outlines the comprehensive unit testing strategy for the OneFit backend system, focusing on testing all official app data and core functionality without user-specific data.

## Test Data Categories

### 1. Fasting System Test Data

#### Fasting Types (Official App Data)
- **16:8 Intermittent Fasting**
  - Internal name: `16_8`
  - Display name: `16:8`
  - Fasting hours: 16
  - Eating hours: 8
  - Description: "Fast for 16 hours, eat within 8 hours"

- **18:6 Intermittent Fasting**
  - Internal name: `18_6`
  - Display name: `18:6`
  - Fasting hours: 18
  - Eating hours: 6
  - Description: "Fast for 18 hours, eat within 6 hours"

- **20:4 Warrior Diet**
  - Internal name: `20_4`
  - Display name: `20:4`
  - Fasting hours: 20
  - Eating hours: 4
  - Description: "Fast for 20 hours, eat within 4 hours"

- **OMAD (One Meal A Day)**
  - Internal name: `OMAD`
  - Display name: `One Meal A Day`
  - Fasting hours: 24
  - Eating hours: 0
  - Description: "Fast for 24 hours, one meal per day"

- **Custom Fasting**
  - Internal name: `custom`
  - Display name: `Custom`
  - Fasting hours: null
  - Eating hours: null
  - Description: "Set your own fasting duration"

#### Fasting Milestones & Phases
- **0-4 hours**: Digestion phase
- **4-12 hours**: Fat burning begins
- **12-16 hours**: Ketosis starts
- **16-24 hours**: Deep ketosis
- **24+ hours**: Autophagy activation

### 2. Exercise System Test Data

#### Muscle Groups (Official Categories)
- **Chest**: Primary upper body pushing muscles
- **Back**: Primary upper body pulling muscles  
- **Shoulders**: Deltoids and supporting muscles
- **Arms**: Biceps, triceps, forearms
- **Legs**: Quadriceps, hamstrings, glutes, calves
- **Core**: Abdominals, obliques, lower back

#### Equipment Types (Official Categories)
- **Barbell**: Olympic barbells and standard bars
- **Dumbbells**: Free weights and adjustable dumbbells
- **Machine**: Cable machines, Smith machine, leg press
- **Cable**: Cable crossovers, lat pulldowns, cable rows
- **Bodyweight**: No equipment needed exercises

#### Default Exercise Library (Seeded Data)
```go
// Chest Exercises
{Name: "Push-ups", MuscleGroups: "chest,shoulders,triceps", Equipment: "bodyweight"}
{Name: "Bench Press", MuscleGroups: "chest,shoulders,triceps", Equipment: "barbell"}
{Name: "Incline Bench Press", MuscleGroups: "chest,shoulders", Equipment: "barbell"}
{Name: "Dumbbell Press", MuscleGroups: "chest,shoulders", Equipment: "dumbbells"}
{Name: "Chest Fly", MuscleGroups: "chest", Equipment: "dumbbells"}

// Back Exercises  
{Name: "Pull-ups", MuscleGroups: "back,biceps", Equipment: "bodyweight"}
{Name: "Deadlift", MuscleGroups: "back,legs,glutes", Equipment: "barbell"}
{Name: "Bent Over Row", MuscleGroups: "back,biceps", Equipment: "barbell"}
{Name: "Lat Pulldown", MuscleGroups: "back,biceps", Equipment: "cable"}

// Shoulder Exercises
{Name: "Overhead Press", MuscleGroups: "shoulders,triceps", Equipment: "barbell"}
{Name: "Lateral Raise", MuscleGroups: "shoulders", Equipment: "dumbbells"}
{Name: "Rear Delt Fly", MuscleGroups: "shoulders", Equipment: "dumbbells"}

// Arm Exercises
{Name: "Bicep Curl", MuscleGroups: "biceps", Equipment: "dumbbells"}
{Name: "Tricep Dips", MuscleGroups: "triceps", Equipment: "bodyweight"}
{Name: "Hammer Curl", MuscleGroups: "biceps,forearms", Equipment: "dumbbells"}

// Leg Exercises
{Name: "Squats", MuscleGroups: "legs,glutes", Equipment: "bodyweight"}
{Name: "Barbell Squat", MuscleGroups: "legs,glutes", Equipment: "barbell"}
{Name: "Leg Press", MuscleGroups: "legs,glutes", Equipment: "machine"}
{Name: "Lunges", MuscleGroups: "legs,glutes", Equipment: "dumbbells"}
{Name: "Calf Raise", MuscleGroups: "calves", Equipment: "dumbbells"}

// Core Exercises
{Name: "Plank", MuscleGroups: "core,shoulders", Equipment: "bodyweight"}
{Name: "Crunches", MuscleGroups: "core", Equipment: "bodyweight"}
{Name: "Russian Twists", MuscleGroups: "core,obliques", Equipment: "bodyweight"}
```

### 3. Workout Template Test Data

#### Predefined Template Categories
- **Full Body**: Complete workout hitting all muscle groups
- **Upper Body**: Chest, back, shoulders, arms focus
- **Lower Body**: Legs, glutes, calves focus
- **Push**: Chest, shoulders, triceps focus
- **Pull**: Back, biceps focus
- **Cardio**: High-intensity interval training
- **Strength**: Heavy compound movements
- **Beginner**: Entry-level routines
- **Intermediate**: Moderate difficulty routines
- **Advanced**: High-intensity routines

#### Sample Predefined Templates
```go
// Beginner Full Body Template
{
    Name: "Beginner Full Body",
    Description: "Perfect starter routine hitting all major muscle groups",
    Category: "Full Body",
    IsPublic: true,
    Exercises: [
        {ExerciseName: "Squats", TargetSets: 3, TargetReps: "8-12", RestSeconds: 60},
        {ExerciseName: "Push-ups", TargetSets: 3, TargetReps: "5-10", RestSeconds: 60},
        {ExerciseName: "Bent Over Row", TargetSets: 3, TargetReps: "8-12", RestSeconds: 60},
        {ExerciseName: "Overhead Press", TargetSets: 2, TargetReps: "6-10", RestSeconds: 90},
        {ExerciseName: "Plank", TargetSets: 3, TargetReps: "30-60 sec", RestSeconds: 60},
    ]
}

// Upper Body Strength Template
{
    Name: "Upper Body Strength",
    Description: "Build strength in chest, back, shoulders, and arms",
    Category: "Upper Body", 
    IsPublic: true,
    Exercises: [
        {ExerciseName: "Bench Press", TargetSets: 4, TargetReps: "6-8", RestSeconds: 120},
        {ExerciseName: "Pull-ups", TargetSets: 3, TargetReps: "AMRAP", RestSeconds: 90},
        {ExerciseName: "Overhead Press", TargetSets: 3, TargetReps: "8-10", RestSeconds: 90},
        {ExerciseName: "Bicep Curl", TargetSets: 3, TargetReps: "10-12", RestSeconds: 60},
        {ExerciseName: "Tricep Dips", TargetSets: 3, TargetReps: "8-12", RestSeconds: 60},
    ]
}
```

### 4. Water Tracking Test Data

#### Standard Water Measurements
- **Small Glass**: 250ml
- **Medium Glass**: 350ml  
- **Large Glass**: 500ml
- **Water Bottle**: 500ml
- **Large Bottle**: 750ml
- **Sports Bottle**: 1000ml

#### Daily Water Goals (Standard Recommendations)
- **Sedentary Adults**: 2000ml (8 cups)
- **Active Adults**: 2500ml (10 cups)
- **Athletes**: 3000ml+ (12+ cups)
- **Hot Climate**: +500ml adjustment
- **Pregnancy**: +300ml adjustment

### 5. User System Test Data

#### Activity Levels (Official Categories)
- **sedentary**: Little to no exercise
- **lightly_active**: Light exercise 1-3 days/week  
- **moderately_active**: Moderate exercise 3-5 days/week
- **very_active**: Hard exercise 6-7 days/week
- **extremely_active**: Very hard exercise, physical job

#### User Preference Defaults
- **Units**: metric, imperial
- **Theme**: light, dark, auto
- **Language**: en, es, fr, de, it
- **Notifications**: enabled/disabled
- **Target Water**: 2000ml default
- **Target Calories**: Based on calculated BMR

## Unit Test Categories

### 1. Model Validation Tests

#### User Model Tests
- [ ] Test valid user creation with required fields
- [ ] Test user validation with invalid email formats
- [ ] Test user validation with invalid Firebase UID
- [ ] Test user goals JSON field serialization/deserialization
- [ ] Test user settings JSON field validation
- [ ] Test user height/weight validation (positive numbers)
- [ ] Test user activity level enum validation

#### Exercise Model Tests  
- [ ] Test exercise creation with valid muscle groups
- [ ] Test exercise validation with invalid equipment types
- [ ] Test exercise name uniqueness constraint
- [ ] Test custom vs default exercise flags
- [ ] Test exercise instructions text field limits
- [ ] Test muscle groups string format validation
- [ ] Test exercise soft delete functionality

#### Workout Template Model Tests
- [ ] Test template creation with valid category
- [ ] Test template-exercise relationship integrity
- [ ] Test template exercise ordering validation
- [ ] Test target reps format validation ("8-12", "AMRAP", "60 sec")
- [ ] Test target weight validation (positive numbers)
- [ ] Test template public/private access controls

#### Fast Session Model Tests
- [ ] Test fast session creation with valid duration
- [ ] Test fast session time validation (start < end)
- [ ] Test fast session type determination logic
- [ ] Test fast session completion status
- [ ] Test fast session notes text field
- [ ] Test fast session target vs actual duration

#### Water Log Model Tests
- [ ] Test water log creation with valid amount
- [ ] Test water log amount validation (positive numbers)
- [ ] Test water log timestamp validation (not future)
- [ ] Test water log daily aggregation queries
- [ ] Test water log user relationship integrity

### 2. Service Layer Tests

#### Exercise Service Tests
- [ ] Test GetDefaultExercises returns seeded exercises
- [ ] Test GetExercisesByMuscleGroup filtering
- [ ] Test GetExercisesByEquipment filtering  
- [ ] Test CreateCustomExercise validation
- [ ] Test DeleteCustomExercise authorization
- [ ] Test exercise usage prevention (delete protection)
- [ ] Test GetMuscleGroups returns unique groups
- [ ] Test GetEquipmentTypes returns unique types
- [ ] Test SeedDefaultExercises idempotency

#### Template Service Tests
- [ ] Test GetUserTemplates with category filter
- [ ] Test GetUserTemplates with public filter
- [ ] Test CreateTemplate with exercise validation
- [ ] Test UpdateTemplate authorization checks
- [ ] Test DeleteTemplate cascade behavior
- [ ] Test GetTemplateWithExercises preloading
- [ ] Test DuplicateTemplate functionality
- [ ] Test template sharing/public access

#### Fasting Service Tests
- [ ] Test determineType logic for all durations
- [ ] Test StartFastSession validation
- [ ] Test EndFastSession completion logic
- [ ] Test GetFastingHistory date filtering
- [ ] Test CalculateFastingStreak logic
- [ ] Test fasting milestone detection
- [ ] Test custom fasting duration validation

#### Water Service Tests
- [ ] Test LogWater amount validation
- [ ] Test GetDailyWaterIntake aggregation
- [ ] Test GetWaterHistory date range filtering
- [ ] Test DeleteLatestWaterLog authorization
- [ ] Test daily water goal progress calculation
- [ ] Test water intake statistics

### 3. Controller Tests

#### Auth Controller Tests
- [ ] Test Firebase token validation
- [ ] Test user profile creation on first login
- [ ] Test user profile updates
- [ ] Test user settings updates
- [ ] Test user deletion (soft delete)
- [ ] Test authentication middleware integration

#### Exercise Controller Tests
- [ ] Test GET /exercises returns default exercises
- [ ] Test GET /exercises?muscle_group= filtering
- [ ] Test GET /exercises?equipment= filtering
- [ ] Test POST /exercises creates custom exercise
- [ ] Test PUT /exercises/:id updates custom exercise
- [ ] Test DELETE /exercises/:id authorization
- [ ] Test exercise search functionality

#### Template Controller Tests
- [ ] Test GET /templates returns user templates
- [ ] Test GET /templates?category= filtering
- [ ] Test GET /templates?include_public=true
- [ ] Test POST /templates creates new template
- [ ] Test PUT /templates/:id updates template
- [ ] Test DELETE /templates/:id authorization
- [ ] Test POST /templates/:id/duplicate

#### Fasting Controller Tests
- [ ] Test POST /fasts/start creates session
- [ ] Test PUT /fasts/:id/end completes session
- [ ] Test GET /fasts/history returns user fasts
- [ ] Test GET /fasts/current returns active fast
- [ ] Test fast type determination logic
- [ ] Test fast session validation rules

#### Water Controller Tests
- [ ] Test POST /water logs water intake
- [ ] Test GET /water returns daily logs
- [ ] Test GET /water/history date filtering
- [ ] Test DELETE /water/latest removes last log
- [ ] Test water goal progress calculation
- [ ] Test water reminder scheduling

### 4. Utility & Helper Tests

#### Validation Helpers
- [ ] Test email format validation
- [ ] Test password strength validation (if applicable)
- [ ] Test phone number format validation
- [ ] Test date range validation
- [ ] Test numeric validation helpers

#### Calculation Helpers
- [ ] Test BMR calculation formulas
- [ ] Test calorie burn estimation
- [ ] Test workout volume calculations
- [ ] Test fasting duration calculations
- [ ] Test water intake percentage calculations

#### Time & Date Helpers
- [ ] Test timezone conversion utilities
- [ ] Test date formatting functions
- [ ] Test duration parsing ("16:8" -> hours)
- [ ] Test workout time calculations
- [ ] Test fasting window calculations

## Test Data Setup Strategy

### 1. Database Seeding
```go
// Create test database with all official app data
func SetupTestDatabase() *gorm.DB {
    // Initialize test database
    // Seed default exercises
    // Seed fasting types  
    // Seed default templates
    // Seed activity levels
    // Seed equipment types
    // Seed muscle groups
}
```

### 2. Test Fixtures
```go
// Standard test user data
func CreateTestUser() *models.User {
    return &models.User{
        FirebaseUID: "test-firebase-uid",
        Email: "test@example.com", 
        Name: "Test User",
        Height: 175.0,
        Weight: 70.0,
    }
}

// Standard exercise test data
func CreateTestExercise() *models.Exercise {
    return &models.Exercise{
        Name: "Test Exercise",
        MuscleGroups: "chest,shoulders",
        Equipment: "dumbbells",
        Instructions: "Test instructions",
        IsCustom: false,
    }
}
```

### 3. Mock Data Generators
```go
// Generate realistic test data
func GenerateWorkoutTemplate(category string) *models.WorkoutTemplate
func GenerateFastSession(fastType string) *models.FastSession  
func GenerateWaterLogs(days int) []models.WaterLog
func GenerateExerciseSet(exercise *models.Exercise) *models.ExerciseSet
```

## Test Organization Structure

```
backend/tests/
├── unit/
│   ├── models/
│   │   ├── user_test.go
│   │   ├── exercise_test.go
│   │   ├── workout_template_test.go
│   │   ├── fast_session_test.go
│   │   └── water_log_test.go
│   ├── services/
│   │   ├── exercise_service_test.go
│   │   ├── template_service_test.go
│   │   ├── fasting_service_test.go
│   │   ├── water_service_test.go
│   │   └── user_service_test.go
│   ├── controllers/
│   │   ├── auth_controller_test.go
│   │   ├── exercise_controller_test.go
│   │   ├── template_controller_test.go
│   │   ├── fasting_controller_test.go
│   │   └── water_controller_test.go
│   └── utils/
│       ├── validation_test.go
│       ├── calculations_test.go
│       └── helpers_test.go
├── testdata/
│   ├── exercises.json
│   ├── templates.json
│   ├── fasting_types.json
│   └── sample_users.json
├── helpers/
│   ├── database.go
│   ├── fixtures.go
│   └── mocks.go
└── test_plan_doc.md
├── unit/
│ ├── models/
│ │ ├── user_test.go
│ │ ├── exercise_test.go
│ │ ├── workout_template_test.go
│ │ ├── fast_session_test.go
│ │ └── water_log_test.go
│ ├── services/
│ │ ├── exercise_service_test.go
│ │ ├── template_service_test.go
│ │ ├── fasting_service_test.go
│ │ ├── water_service_test.go
│ │ └── user_service_test.go
│ ├── controllers/
│ │ ├── auth_controller_test.go
│ │ ├── exercise_controller_test.go
│ │ ├── template_controller_test.go
│ │ ├── fasting_controller_test.go
│ │ └── water_controller_test.go
│ └── utils/
│ ├── validation_test.go
│ ├── calculations_test.go
│ └── helpers_test.go
├── testdata/
│ ├── exercises.json
│ ├── templates.json
│ ├── fasting_types.json
│ └── sample_users.json
├── helpers/
│ ├── database.go
│ ├── fixtures.go
│ └── mocks.go
└── test_plan_doc.md
```

## Test Coverage Goals

### Target Coverage Percentages
- **Models**: 95%+ coverage
- **Services**: 90%+ coverage  
- **Controllers**: 85%+ coverage
- **Utilities**: 95%+ coverage
- **Overall**: 90%+ coverage

### Critical Path Coverage
- All authentication flows: 100%
- Data validation logic: 100%
- Financial calculations: 100%
- User data operations: 100%
- Official app data seeding: 100%

## Testing Tools & Framework

### Go Testing Stack
- **Testing Framework**: Go's built-in `testing` package
- **Assertions**: `testify/assert` and `testify/require`
- **Mocking**: `testify/mock` for service mocks
- **Database**: In-memory SQLite for fast tests
- **HTTP Testing**: `httptest` package for controller tests

### Test Database Setup
```go
// Use in-memory SQLite for fast, isolated tests
func setupTestDB() *gorm.DB {
    db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
    db.AutoMigrate(&models.User{}, &models.Exercise{}, ...)
    return db
}
```

## Continuous Testing Strategy

### Pre-commit Testing
- [ ] All unit tests must pass
- [ ] Coverage threshold must be met
- [ ] No critical security issues
- [ ] Database migrations tested

### CI/CD Pipeline Testing
- [ ] Full test suite on multiple Go versions
- [ ] Integration with test database
- [ ] Performance regression testing
- [ ] Security vulnerability scanning

This comprehensive testing plan ensures that all official app data, core business logic, and user interactions are thoroughly tested while maintaining fast, reliable unit tests that can be run frequently during development.
