# Tracker - Database Schema

## Tables

### Fasting

#### users
| Field | Type | Key | Description |
|-------|------|-----|-------------|
| id | BIGINT | PK | User ID |
| email | VARCHAR(255) | UNIQUE | User email |
| name | VARCHAR(255) | | User display name |
| timezone | VARCHAR(50) | | User timezone |
| created_at | TIMESTAMP | | Account creation |

#### fasting_types
| Field | Type | Key | Description |
|-------|------|-----|-------------|
| id | INT | PK | Type ID |
| name | VARCHAR(50) | UNIQUE | Internal name (16_8, 18_6, etc.) |
| display_name | VARCHAR(100) | | User-friendly name |
| fasting_hours | INT | | Hours of fasting (NULL for custom) |
| eating_hours | INT | | Hours of eating window (NULL for custom) |
| description | TEXT | | Type description |
| is_active | BOOLEAN | | Whether type is available |

#### fasting_sessions
| Field | Type | Key | Description |
|-------|------|-----|-------------|
| id | BIGINT | PK | Session ID |
| user_id | BIGINT | FK | References users.id |
| fasting_type_id | INT | FK | References fasting_types.id |
| started_at | TIMESTAMP | | Fast start time |
| ended_at | TIMESTAMP | | Fast end time |
| target_hours | DECIMAL(4,2) | | Planned fast duration |
| actual_hours | DECIMAL(4,2) | | Actual fast duration |
| is_completed | BOOLEAN | | Whether fast was completed successfully |
| notes | TEXT | | User notes |
| created_at | TIMESTAMP | | Record creation |

## Relationships
- users → fasting_sessions (1:many)
- fasting_types → fasting_sessions (1:many)


##

## Updates to be made

Below is a concise, POC-ready checklist. Tackle items in order; each item is small, testable, and expandable later.


### 11) Testing (repeatable)
- [ ] Postman environment with variables: `WEB_API_KEY`, `REFRESH_TOKEN`, `ID_TOKEN`
- [ ] Add “Refresh Token” request (Google Secure Token API) and test script to set `{{ID_TOKEN}}`
- [ ] Use `Authorization: Bearer {{ID_TOKEN}}` on protected requests

Quick test suite:
- Users: `GET /api/auth/me`, `PUT /api/auth/me`, `PATCH /api/auth/me/settings`
- Fasting: `GET /api/fasts/history`, `POST /api/fasts/`
- Water: `POST /api/water/`, `GET /api/water/`, `DELETE /api/water/latest`



# Diagram

```mermaid
erDiagram
    users {
        bigint id PK
        string firebase_uid UK
        string email UK
        string name
        float height
        float weight
        json goals
        json settings
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    %% FASTING SYSTEM
    fast_sessions {
        bigint id PK
        bigint user_id FK
        timestamp start_time
        timestamp end_time
        int duration
        int target
        string type
        text notes
        timestamp created_at
        timestamp updated_at
    }
    
    %% WATER SYSTEM
    water_logs {
        bigint id PK
        bigint user_id FK
        float amount
        timestamp logged_at
        timestamp created_at
        timestamp updated_at
    }
    
    %% WORKOUT SYSTEM - Exercise Library
    exercises {
        bigint id PK
        string name UK
        string muscle_groups
        string equipment
        text instructions
        boolean is_custom
        bigint created_by_user_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    %% WORKOUT SYSTEM - Templates
    workout_templates {
        bigint id PK
        bigint user_id FK
        string name
        text description
        string category
        boolean is_public
        timestamp created_at
        timestamp updated_at
    }
    
    template_exercises {
        bigint id PK
        bigint template_id FK
        bigint exercise_id FK
        int order_index
        int target_sets
        string target_reps
        float target_weight
        int rest_seconds
        timestamp created_at
        timestamp updated_at
    }
    
    %% WORKOUT SYSTEM - Sessions
    workout_sessions {
        bigint id PK
        bigint user_id FK
        bigint template_id FK
        string name
        timestamp started_at
        timestamp ended_at
        int duration_minutes
        text notes
        timestamp created_at
        timestamp updated_at
    }
    
    session_exercises {
        bigint id PK
        bigint session_id FK
        bigint exercise_id FK
        int order_index
        text notes
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
    }
    
    exercise_sets {
        bigint id PK
        bigint session_exercise_id FK
        int set_number
        int reps
        float weight
        int duration_seconds
        float distance_meters
        int rpe
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
    }

    %% RELATIONSHIPS
    
    %% User relationships to all systems
    users ||--o{ fast_sessions : "performs fasts"
    users ||--o{ water_logs : "logs water intake"
    users ||--o{ workout_templates : "creates templates"
    users ||--o{ workout_sessions : "performs workouts"
    users ||--o{ exercises : "creates custom exercises"
    
    %% Workout system internal relationships
    workout_templates ||--o{ template_exercises : "contains exercises"
    exercises ||--o{ template_exercises : "used in templates"
    
    workout_sessions ||--o{ session_exercises : "contains exercises"
    exercises ||--o{ session_exercises : "performed in sessions"
    workout_templates ||--o{ workout_sessions : "used as basis for"
    
    session_exercises ||--o{ exercise_sets : "has sets"
```