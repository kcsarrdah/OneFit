# 🏋️ OneFit Backend API Endpoints

This document lists all available API endpoints for the OneFit fitness tracking application.

## 🔐 Authentication
All endpoints require Firebase authentication via the `Authorization` header with a valid Bearer token, except where noted.

---

## 🔥 **Workout Endpoints** (`/api/workouts`)

### **Core Workout Operations**

| Method | Endpoint | Purpose | Query Parameters |
|--------|----------|---------|------------------|
| `GET` | `/api/workouts/` | Get user's workout history | `limit`, `offset`, `start_date`, `end_date` |
| `POST` | `/api/workouts/` | Start a new workout | - |
| `GET` | `/api/workouts/active` | Get current active workout | - |
| `GET` | `/api/workouts/stats` | Get workout statistics | `days` (default: 30) |
| `GET` | `/api/workouts/:id` | Get specific workout with full details | - |
| `PUT` | `/api/workouts/:id` | Update or finish workout | - |
| `DELETE` | `/api/workouts/:id` | Delete workout | - |

#### Start Workout Request Body:
```json
{
  "name": "Morning Workout", // required
  "template_id": 123, // optional - start from template
  "notes": "Feeling strong today"
}
```

#### Update Workout Request Body:
```json
{
  "name": "Updated Workout Name", // optional
  "notes": "Updated notes", // optional
  "ended_at": "2024-01-01T10:30:00Z", // optional - finish workout
  "is_active": false // optional - finish workout
}
```

### **Exercise Management Within Workouts**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/workouts/:id/exercises` | Add exercise to workout |
| `PUT` | `/api/workouts/:id/exercises/:exercise_id` | Update exercise in workout |
| `DELETE` | `/api/workouts/:id/exercises/:exercise_id` | Remove exercise from workout |

#### Add Exercise to Workout Request Body:
```json
{
  "exercise_id": 456, // required
  "order_index": 1, // optional - auto-assigned if not provided
  "notes": "3 sets of 8-12 reps"
}
```

#### Update Session Exercise Request Body:
```json
{
  "order_index": 2, // optional
  "notes": "Updated notes", // optional
  "completed_at": "2024-01-01T10:15:00Z" // optional
}
```

### **Set Logging & Management**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/workouts/:id/exercises/:exercise_id/sets` | Log a set for an exercise |
| `PUT` | `/api/workouts/:id/sets/:set_id` | Update a logged set |
| `DELETE` | `/api/workouts/:id/sets/:set_id` | Delete a logged set |

#### Log Set Request Body:
```json
{
  "reps": 12, // optional - for strength exercises
  "weight": 75.5, // optional - in kg
  "duration_seconds": 60, // optional - for time-based exercises
  "distance_meters": 1000, // optional - for cardio
  "rpe": 8 // optional - Rate of Perceived Exertion (1-10)
}
```

---

## 💪 **Exercise Endpoints** (`/api/exercises`)

### **Exercise Library Management**

| Method | Endpoint | Purpose | Query Parameters |
|--------|----------|---------|------------------|
| `GET` | `/api/exercises/` | List exercises with filters | `muscle_group`, `equipment`, `search`, `include_custom` |
| `GET` | `/api/exercises/:id` | Get single exercise details | - |
| `POST` | `/api/exercises/` | Create custom exercise | - |
| `PUT` | `/api/exercises/:id` | Update custom exercise | - |
| `DELETE` | `/api/exercises/:id` | Delete custom exercise | - |

#### Create/Update Exercise Request Body:
```json
{
  "name": "Custom Push-up Variation", // required for create
  "muscle_groups": "chest,shoulders,triceps", // optional
  "equipment": "bodyweight", // optional
  "instructions": "Detailed exercise instructions..." // optional
}
```

---

## 📋 **Template Endpoints** (`/api/templates`)

### **Template CRUD Operations**

| Method | Endpoint | Purpose | Query Parameters |
|--------|----------|---------|------------------|
| `GET` | `/api/templates/` | List templates with filters | `category`, `include_public` |
| `GET` | `/api/templates/:id` | Get single template with exercises | - |
| `POST` | `/api/templates/` | Create new template | - |
| `PUT` | `/api/templates/:id` | Update template | - |
| `DELETE` | `/api/templates/:id` | Delete template | - |

#### Create/Update Template Request Body:
```json
{
  "name": "Upper Body Strength", // required for create
  "description": "Focus on chest, back, and arms", // optional
  "category": "strength", // optional
  "is_public": false // optional - default false
}
```

### **Template-Exercise Management**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/templates/:id/exercises` | Add exercise to template |
| `PUT` | `/api/templates/:id/exercises/:exercise_id` | Update exercise in template |
| `DELETE` | `/api/templates/:id/exercises/:exercise_id` | Remove exercise from template |

#### Add Exercise to Template Request Body:
```json
{
  "exercise_id": 123, // required
  "order_index": 1, // required
  "target_sets": 3, // optional
  "target_reps": "8-12", // optional - can be "AMRAP", "60 sec", etc.
  "target_weight": 75.0, // optional - in kg
  "rest_seconds": 90 // optional
}
```

---

## 📊 **Response Formats**

### Success Responses
All successful responses follow this general format:
```json
{
  "message": "Operation completed successfully", // for create/update/delete
  "data_field": {...}, // actual data (workout, exercise, template, etc.)
  "total": 100, // for paginated responses
  "limit": 20, // for paginated responses
  "offset": 0 // for paginated responses
}
```

### Error Responses
```json
{
  "error": "Descriptive error message"
}
```

### HTTP Status Codes
- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid auth)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📈 **Statistics Response Example**

### Workout Stats (`GET /api/workouts/stats`)
```json
{
  "stats": {
    "total_workouts": 25,
    "total_minutes": 1250,
    "total_sets": 450,
    "average_duration_minutes": 50.0,
    "period_days": 30
  }
}
```

---

## 🔍 **Query Parameters Reference**

### Workout History Filters
- `limit` - Number of workouts to return (default: 20)
- `offset` - Number of workouts to skip (default: 0)
- `start_date` - Filter workouts from date (YYYY-MM-DD)
- `end_date` - Filter workouts to date (YYYY-MM-DD)

### Exercise Filters
- `muscle_group` - Filter by muscle group
- `equipment` - Filter by equipment needed
- `search` - Search in exercise names
- `include_custom` - Include user's custom exercises (default: true)

### Template Filters
- `category` - Filter by template category
- `include_public` - Include public templates (default: false)

---

## 📝 **Notes**

1. **Authentication**: All endpoints require a valid Firebase JWT token in the Authorization header
2. **Data Ownership**: Users can only access/modify their own data
3. **Timestamps**: All timestamps are in ISO 8601 format (UTC)
4. **Weights**: All weights are stored in kilograms
5. **Distances**: All distances are stored in meters
6. **Cascade Deletes**: Deleting workouts/templates also deletes associated exercises and sets

---

## 🚀 **Total Endpoints Summary**
- **🏋️ Workouts:** 10 endpoints (full workout lifecycle + exercise & set management)
- **💪 Exercises:** 5 endpoints (exercise library CRUD)
- **📋 Templates:** 8 endpoints (template CRUD + exercise management)

**Total: 23 endpoints** providing comprehensive fitness tracking functionality!
