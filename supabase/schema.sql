-- ====================================================================
-- TRAINER MANAGEMENT DASHBOARD - SUPABASE / POSTGRESQL SCHEMA
-- Short, human-readable IDs (e.g. 'proj-1', 'task-101', 'intern-1')
-- All tables namespaced with "dashboard_" prefix
-- ====================================================================

-- 1. Custom Enumerations (Type-Safe Workflow States & Roles)
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('admin', 'lead_trainer', 'intern', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_state_enum AS ENUM ('not_started', 'in_progress', 'ready_for_review', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority_enum AS ENUM ('urgent', 'high', 'medium', 'low');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status_enum AS ENUM ('upcoming', 'in_progress', 'completed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Users Table (Interns, Trainers, Admins)
CREATE TABLE IF NOT EXISTS dashboard_users (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('usr_' || substr(md5(random()::text), 1, 8)),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'intern',
    avatar_url TEXT,
    phone VARCHAR(50),
    daily_capacity INT NOT NULL DEFAULT 5, -- Max recommended concurrent tasks
    skills TEXT[] DEFAULT '{}',            -- e.g. ARRAY['Slide QA', 'AV Setup']
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Projects Table (Training Events & D-Days)
CREATE TABLE IF NOT EXISTS dashboard_projects (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('proj_' || substr(md5(random()::text), 1, 8)),
    name VARCHAR(255) NOT NULL,
    d_day DATE NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    slogan VARCHAR(255),
    training_provider VARCHAR(200) NOT NULL,
    storage_url TEXT,                      -- Cloud drive / materials folder link
    evaluation_qr_code_url TEXT,          -- Image URL / SVG data for feedback survey QR
    location VARCHAR(255),
    attendees_count INT DEFAULT 0,
    status project_status_enum NOT NULL DEFAULT 'in_progress',
    notes TEXT,
    created_by VARCHAR(50) REFERENCES dashboard_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Checklist Tasks Table (Actionable Items)
CREATE TABLE IF NOT EXISTS dashboard_checklist_tasks (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('task_' || substr(md5(random()::text), 1, 8)),
    project_id VARCHAR(50) NOT NULL REFERENCES dashboard_projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_intern_id VARCHAR(50) REFERENCES dashboard_users(id) ON DELETE SET NULL, -- NULL = Master Backlog
    state task_state_enum NOT NULL DEFAULT 'not_started',
    priority task_priority_enum NOT NULL DEFAULT 'medium',
    phase VARCHAR(100) NOT NULL DEFAULT 'Curriculum & Slides',
    due_date DATE,
    estimated_minutes INT DEFAULT 60,
    review_notes TEXT,                     -- Notes submitted by intern or reviewer feedback
    submitted_at TIMESTAMPTZ,              -- Set when moved to 'ready_for_review'
    completed_at TIMESTAMPTZ,              -- Set when approved to 'completed'
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Task Review Logs (Audit Trail for Admin Sign-Offs)
CREATE TABLE IF NOT EXISTS dashboard_task_reviews (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('rev_' || substr(md5(random()::text), 1, 8)),
    task_id VARCHAR(50) NOT NULL REFERENCES dashboard_checklist_tasks(id) ON DELETE CASCADE,
    reviewed_by VARCHAR(50) NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
    decision VARCHAR(50) NOT NULL,         -- 'approved', 'revision_requested'
    feedback_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_tasks_project_id ON dashboard_checklist_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_tasks_assigned_intern ON dashboard_checklist_tasks(assigned_intern_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_tasks_state ON dashboard_checklist_tasks(state);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_d_day ON dashboard_projects(d_day);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_status ON dashboard_projects(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_users_role ON dashboard_users(role);

-- 7. Algorithmic Health Score Real-Time View
-- Formula: Days until D-Day ÷ Remaining Unfinished Tasks
CREATE OR REPLACE VIEW dashboard_view_project_health_scores AS
WITH task_aggregates AS (
    SELECT 
        p.id AS project_id,
        p.name,
        p.d_day,
        p.company_name,
        p.slogan,
        p.training_provider,
        p.storage_url,
        p.evaluation_qr_code_url,
        p.status,
        (p.d_day - CURRENT_DATE) AS days_until_d_day,
        COUNT(t.id) AS total_tasks,
        COUNT(CASE WHEN t.state = 'completed' THEN 1 END) AS completed_tasks,
        COUNT(CASE WHEN t.state != 'completed' THEN 1 END) AS remaining_tasks
    FROM dashboard_projects p
    LEFT JOIN dashboard_checklist_tasks t ON t.project_id = p.id
    GROUP BY p.id, p.name, p.d_day, p.company_name, p.slogan, p.training_provider, p.storage_url, p.evaluation_qr_code_url, p.status
)
SELECT 
    project_id,
    name,
    d_day,
    company_name,
    slogan,
    training_provider,
    storage_url,
    evaluation_qr_code_url,
    status,
    days_until_d_day,
    total_tasks,
    completed_tasks,
    remaining_tasks,
    CASE 
        WHEN total_tasks = 0 THEN 100
        ELSE ROUND((completed_tasks::numeric / total_tasks::numeric) * 100, 1)
    END AS completion_percentage,
    CASE 
        WHEN remaining_tasks = 0 THEN 999.0
        WHEN days_until_d_day <= 0 THEN (days_until_d_day::numeric)
        ELSE ROUND((days_until_d_day::numeric / remaining_tasks::numeric), 2)
    END AS health_score,
    CASE
        WHEN remaining_tasks = 0 THEN 'completed'
        WHEN (days_until_d_day <= 0) OR (days_until_d_day::numeric / remaining_tasks::numeric < 1.0) THEN 'critical'
        WHEN (days_until_d_day::numeric / remaining_tasks::numeric < 2.0) THEN 'urgent'
        WHEN (days_until_d_day::numeric / remaining_tasks::numeric < 4.0) THEN 'moderate'
        ELSE 'healthy'
    END AS urgency_level
FROM task_aggregates
ORDER BY health_score ASC;

-- 8. Automatic Updated-At Timestamps Trigger
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_dashboard_users ON dashboard_users;
CREATE TRIGGER set_timestamp_dashboard_users BEFORE UPDATE ON dashboard_users FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_dashboard_projects ON dashboard_projects;
CREATE TRIGGER set_timestamp_dashboard_projects BEFORE UPDATE ON dashboard_projects FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_dashboard_tasks ON dashboard_checklist_tasks;
CREATE TRIGGER set_timestamp_dashboard_tasks BEFORE UPDATE ON dashboard_checklist_tasks FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
