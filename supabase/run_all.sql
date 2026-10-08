-- ====================================================================
-- ALL-IN-ONE SUPABASE / POSTGRESQL INITIALIZATION (SCHEMA + SEED DATA)
-- Copy and paste this entire file directly into Supabase SQL Editor & Click Run
-- Uses short, human-readable IDs (e.g. 'proj-1', 'task-101', 'intern-1')
-- ====================================================================

-- ====================================================================
-- PART 1: CLEANUP PREVIOUS TABLES (ALLOWS MIGRATING UUID -> SHORT VARCHAR)
-- ====================================================================

DROP VIEW IF EXISTS dashboard_view_project_health_scores CASCADE;
DROP VIEW IF EXISTS view_project_health_scores CASCADE;
DROP TABLE IF EXISTS dashboard_task_reviews CASCADE;
DROP TABLE IF EXISTS dashboard_checklist_tasks CASCADE;
DROP TABLE IF EXISTS dashboard_projects CASCADE;
DROP TABLE IF EXISTS dashboard_users CASCADE;
DROP TABLE IF EXISTS task_reviews CASCADE;
DROP TABLE IF EXISTS checklist_tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ====================================================================
-- PART 2: ENUMS
-- ====================================================================

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

-- ====================================================================
-- PART 3: TABLES WITH SHORT & READABLE IDS
-- ====================================================================

-- 1. Users Table (Interns, Trainers, Admins)
CREATE TABLE dashboard_users (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('usr_' || substr(md5(random()::text), 1, 8)),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'intern',
    avatar_url TEXT,
    phone VARCHAR(50),
    daily_capacity INT NOT NULL DEFAULT 5,
    skills TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Projects Table (Training Events & D-Days)
CREATE TABLE dashboard_projects (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('proj_' || substr(md5(random()::text), 1, 8)),
    name VARCHAR(255) NOT NULL,
    d_day DATE NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    slogan VARCHAR(255),
    training_provider VARCHAR(200) NOT NULL,
    storage_url TEXT,
    evaluation_qr_code_url TEXT,
    location VARCHAR(255),
    attendees_count INT DEFAULT 0,
    status project_status_enum NOT NULL DEFAULT 'in_progress',
    notes TEXT,
    created_by VARCHAR(50) REFERENCES dashboard_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Checklist Tasks Table (Actionable Items)
CREATE TABLE dashboard_checklist_tasks (
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
    review_notes TEXT,
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Task Reviews Audit Table
CREATE TABLE dashboard_task_reviews (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('rev_' || substr(md5(random()::text), 1, 8)),
    task_id VARCHAR(50) NOT NULL REFERENCES dashboard_checklist_tasks(id) ON DELETE CASCADE,
    reviewed_by VARCHAR(50) NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
    decision VARCHAR(50) NOT NULL,
    feedback_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- PART 4: INDEXES & REAL-TIME ALGORITHMIC HEALTH VIEW
-- ====================================================================

CREATE INDEX idx_dashboard_tasks_project_id ON dashboard_checklist_tasks(project_id);
CREATE INDEX idx_dashboard_tasks_assigned_intern ON dashboard_checklist_tasks(assigned_intern_id);
CREATE INDEX idx_dashboard_tasks_state ON dashboard_checklist_tasks(state);
CREATE INDEX idx_dashboard_projects_d_day ON dashboard_projects(d_day);
CREATE INDEX idx_dashboard_projects_status ON dashboard_projects(status);
CREATE INDEX idx_dashboard_users_role ON dashboard_users(role);

-- Algorithmic Health Score Real-Time View
-- Health Score = Days until D-Day ÷ Remaining Tasks
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

-- ====================================================================
-- PART 5: TRIGGERS (AUTOMATIC TIMESTAMPS)
-- ====================================================================

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

-- ====================================================================
-- PART 6: SEED DATA (READABLE SHORT IDS)
-- ====================================================================

-- 1. Insert Users (Interns + Trainers)
INSERT INTO dashboard_users (id, email, full_name, role, phone, daily_capacity, skills)
VALUES 
  ('intern-1', 'elena.rostova@traininghub.internal', 'Elena Rostova', 'intern', '+1-555-0101', 5, ARRAY['Slide QA', 'Agenda Timekeeping', 'Speaker Liaison']),
  ('intern-2', 'kenji.t@traininghub.internal', 'Kenji Takahashi', 'intern', '+1-555-0102', 4, ARRAY['AV Setup', 'Zoom Rooms', 'Microphones']),
  ('intern-3', 'sarah.j@traininghub.internal', 'Sarah Jenkins', 'intern', '+1-555-0103', 4, ARRAY['Badge Printing', 'Catering Orders', 'Workbook Binding']),
  ('admin-1',  'admin.marcus@traininghub.internal', 'Marcus Trainer (Admin)', 'admin', '+1-555-0100', 8, ARRAY['Curriculum Lead', 'Reviewer'])
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  daily_capacity = EXCLUDED.daily_capacity,
  skills = EXCLUDED.skills;

-- 2. Insert Training Projects
INSERT INTO dashboard_projects (id, name, d_day, company_name, slogan, training_provider, storage_url, location, attendees_count, status)
VALUES 
  (
    'proj-1', 
    'Executive AI Leadership Summit', 
    CURRENT_DATE + INTERVAL '3 days', 
    'Fintech Vanguard Corp', 
    'Mastering Enterprise Intelligence', 
    'Apex Academy Global', 
    'https://drive.google.com/drive/folders/fintech-summit-assets', 
    'Metropolitan Hall B & Hybrid Stream', 
    65, 
    'in_progress'
  ),
  (
    'proj-2', 
    'Cloud Native DevOps Bootcamp', 
    CURRENT_DATE + INTERVAL '7 days', 
    'Nexus Mobility Labs', 
    'Zero-Downtime Architecture in Practice', 
    'Apex Academy Global', 
    'https://storage.cloud.google.com/nexus-devops-training', 
    'Innovation Lab 4, Tech Park', 
    30, 
    'in_progress'
  ),
  (
    'proj-3', 
    'Product Design Systems Workshop', 
    CURRENT_DATE + INTERVAL '14 days', 
    'Omni Retail Brands', 
    'Harmonizing Design & Multi-Platform Delivery', 
    'DesignSprint Institute', 
    'https://www.figma.com/@omni-design-system-workshop', 
    'Creative Hub Suite 300', 
    45, 
    'upcoming'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  d_day = EXCLUDED.d_day,
  company_name = EXCLUDED.company_name,
  status = EXCLUDED.status;

-- 3. Insert Checklist Tasks
INSERT INTO dashboard_checklist_tasks (id, project_id, title, description, assigned_intern_id, state, priority, phase, due_date, estimated_minutes, review_notes)
VALUES
  (
    'task-101',
    'proj-1', 
    'Print Executive Dossiers & VIP Lanyards', 
    'Double-sided matte 120gsm paper with custom foil stamping for keynote speakers.', 
    'intern-1', 
    'ready_for_review', 
    'urgent', 
    'Printouts & Badges', 
    CURRENT_DATE + INTERVAL '1 day',
    90,
    'Sample badge printed. Waiting for trainer sign-off on spelling of keynote speakers.'
  ),
  (
    'task-102',
    'proj-1', 
    'AV & Dual-Screen Wireless Clicker Testing', 
    'Test HDMI matrix switcher, Shure lavalier mic frequencies, and back-up clickers.', 
    'intern-2', 
    'in_progress', 
    'urgent', 
    'Tech & AV Setup', 
    CURRENT_DATE + INTERVAL '1 day',
    60,
    NULL
  ),
  (
    'task-103',
    'proj-1', 
    'Confirm Catering Headcount & Dietary Requirements', 
    'Provide final VIP dietary restrictions to venue hotel.', 
    NULL, 
    'not_started', 
    'urgent', 
    'Logistics & Venue', 
    CURRENT_DATE + INTERVAL '2 days',
    30,
    NULL
  ),
  (
    'task-104',
    'proj-1', 
    'Master Deck Slide Proofreading & Video Links Check', 
    'Check high-res slide animations and embedded demo clips.', 
    'intern-1', 
    'completed', 
    'high', 
    'Curriculum & Slides', 
    CURRENT_DATE - INTERVAL '1 day',
    120,
    NULL
  ),
  (
    'task-201',
    'proj-2', 
    'Pre-Provision Kubernetes Sandbox Clusters', 
    'Spin up 30 isolated k8s namespaces with pre-loaded manifests.', 
    'intern-2', 
    'in_progress', 
    'high', 
    'Tech & AV Setup', 
    CURRENT_DATE + INTERVAL '4 days',
    180,
    NULL
  ),
  (
    'task-202',
    'proj-2', 
    'Reserve Extension Cords & High-Speed LAN Hubs', 
    'Secure 10 surge-protected power strips and switch boxes.', 
    NULL, 
    'not_started', 
    'medium', 
    'Logistics & Venue', 
    CURRENT_DATE + INTERVAL '5 days',
    45,
    NULL
  ),
  (
    'task-301',
    'proj-3', 
    'Figma File Access & Permission Audit', 
    'Ensure attendee emails have editor rights to workshop file.', 
    'intern-3', 
    'in_progress', 
    'low', 
    'Curriculum & Slides', 
    CURRENT_DATE + INTERVAL '10 days',
    60,
    NULL
  ),
  (
    'task-302',
    'proj-3', 
    'Procure Design Workshop Sticky Materials & Sharpies', 
    'Post-it super sticky notes, colored dot stickers, Sharpie fine points.', 
    'intern-3', 
    'ready_for_review', 
    'low', 
    'Logistics & Venue', 
    CURRENT_DATE + INTERVAL '9 days',
    30,
    'Ordered from central supply. Order slip #8821 attached for admin validation.'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  state = EXCLUDED.state,
  assigned_intern_id = EXCLUDED.assigned_intern_id,
  due_date = EXCLUDED.due_date;

-- Verification Query
SELECT 
    project_id,
    name, 
    d_day, 
    days_until_d_day, 
    remaining_tasks, 
    health_score, 
    urgency_level 
FROM dashboard_view_project_health_scores;
