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

