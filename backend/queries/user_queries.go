package queries

// UserQueries contains all SQL queries related to user data
type UserQueries struct{}

// Fast-related queries
const (
	GetAllUserFasts = `
		SELECT 
			id,
			start_time,
			end_time,
			duration,
			target,
			type,
			notes,
			created_at
		FROM fast_sessions 
		WHERE user_id = ? 
			AND deleted_at IS NULL
		ORDER BY start_time DESC`

	GetUserFastHistory = `
		SELECT 
			fs.id,
			fs.start_time,
			fs.end_time,
			fs.duration,
			fs.target,
			fs.type,
			fs.notes,
			fs.created_at,
			
			-- Calculate success rate
			CASE 
				WHEN fs.duration >= fs.target THEN 'completed'
				ELSE 'incomplete'
			END as status,
			
			-- Calculate completion percentage
			ROUND((fs.duration * 100.0 / fs.target), 2) as completion_percentage

		FROM fast_sessions fs
		WHERE fs.user_id = ? 
			AND fs.deleted_at IS NULL
		ORDER BY fs.start_time DESC
		LIMIT 50`
)

// Water-related queries
const (
	GetUserWaterByDate = `
		SELECT 
			id,
			amount,
			logged_at,
			created_at
		FROM water_logs 
		WHERE user_id = ? 
			AND DATE(logged_at) = ?
			AND deleted_at IS NULL
		ORDER BY logged_at ASC`
)

// Workout-related queries
const (
	GetUserWorkoutTemplates = `
		SELECT 
			wt.id,
			wt.name,
			wt.description,
			wt.category,
			wt.is_public,
			wt.created_at,
			COUNT(te.id) as exercise_count
		FROM workout_templates wt
		LEFT JOIN template_exercises te ON wt.id = te.template_id AND te.deleted_at IS NULL
		WHERE wt.user_id = ? 
			AND wt.deleted_at IS NULL
		GROUP BY wt.id, wt.name, wt.description, wt.category, wt.is_public, wt.created_at
		ORDER BY wt.created_at DESC`

	GetUserWorkoutHistory = `
		SELECT 
			ws.id,
			ws.name,
			ws.started_at,
			ws.ended_at,
			ws.duration_minutes,
			ws.notes,
			wt.name as template_name,
			COUNT(DISTINCT se.id) as exercises_performed,
			COUNT(es.id) as total_sets
		FROM workout_sessions ws
		LEFT JOIN workout_templates wt ON ws.template_id = wt.id
		LEFT JOIN session_exercises se ON ws.id = se.session_id AND se.deleted_at IS NULL
		LEFT JOIN exercise_sets es ON se.id = es.session_exercise_id AND es.deleted_at IS NULL
		WHERE ws.user_id = ? 
			AND ws.deleted_at IS NULL
		GROUP BY ws.id, ws.name, ws.started_at, ws.ended_at, ws.duration_minutes, ws.notes, wt.name
		ORDER BY ws.started_at DESC`

	GetUserExercises = `
		-- Custom exercises created by user
		SELECT 
			id,
			name,
			muscle_groups,
			equipment,
			instructions,
			'custom' as source,
			created_at
		FROM exercises 
		WHERE created_by_user_id = ? 
			AND deleted_at IS NULL

		UNION

		-- All exercises used in user's templates
		SELECT DISTINCT
			e.id,
			e.name,
			e.muscle_groups,
			e.equipment,
			e.instructions,
			'template' as source,
			e.created_at
		FROM exercises e
		INNER JOIN template_exercises te ON e.id = te.exercise_id
		INNER JOIN workout_templates wt ON te.template_id = wt.id
		WHERE wt.user_id = ? 
			AND e.deleted_at IS NULL 
			AND te.deleted_at IS NULL 
			AND wt.deleted_at IS NULL

		ORDER BY name ASC`
)

// Profile-related queries
const (
	GetUserProfileWithStats = `
		SELECT 
			u.id,
			u.firebase_uid,
			u.email,
			u.name,
			u.height,
			u.weight,
			u.goals,
			u.settings,
			u.created_at,
			u.updated_at,
			
			-- Fast stats
			COUNT(DISTINCT fs.id) as total_fasts,
			AVG(fs.duration) as avg_fast_duration,
			MAX(fs.created_at) as last_fast_date,
			
			-- Water stats (today)
			COALESCE(SUM(CASE WHEN DATE(wl.logged_at) = CURRENT_DATE THEN wl.amount END), 0) as today_water_intake,
			
			-- Workout stats
			COUNT(DISTINCT ws.id) as total_workouts,
			COUNT(DISTINCT wt.id) as total_templates,
			MAX(ws.started_at) as last_workout_date

		FROM users u
		LEFT JOIN fast_sessions fs ON u.id = fs.user_id AND fs.deleted_at IS NULL
		LEFT JOIN water_logs wl ON u.id = wl.user_id AND wl.deleted_at IS NULL
		LEFT JOIN workout_sessions ws ON u.id = ws.user_id AND ws.deleted_at IS NULL
		LEFT JOIN workout_templates wt ON u.id = wt.user_id AND wt.deleted_at IS NULL

		WHERE u.id = ? 
			AND u.deleted_at IS NULL
		GROUP BY u.id, u.firebase_uid, u.email, u.name, u.height, u.weight, u.goals, u.settings, u.created_at, u.updated_at`
)
