-- ====================================================================
-- ALL-IN-ONE SUPABASE / POSTGRESQL INITIALIZATION (SCHEMA + SEED DATA)
-- Copy and paste this entire file directly into Supabase SQL Editor & Click Run
-- All tables are namespaced with "dashboard_" prefix
-- ====================================================================

-- ====================================================================
-- PART 1: EXTENSIONS & ENUMS
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
-- PART 2: TABLES
-- ====================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS dashboard_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS dashboard_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    created_by UUID REFERENCES dashboard_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Checklist Tasks Table
CREATE TABLE IF NOT EXISTS dashboard_checklist_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES dashboard_projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_intern_id UUID REFERENCES dashboard_users(id) ON DELETE SET NULL, -- NULL = Master Backlog
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
CREATE TABLE IF NOT EXISTS dashboard_task_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES dashboard_checklist_tasks(id) ON DELETE CASCADE,
    reviewed_by UUID NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
    decision VARCHAR(50) NOT NULL,
    feedback_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- PART 3: INDEXES & REAL-TIME ALGORITHMIC HEALTH VIEW
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_dashboard_tasks_project_id ON dashboard_checklist_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_tasks_assigned_intern ON dashboard_checklist_tasks(assigned_intern_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_tasks_state ON dashboard_checklist_tasks(state);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_d_day ON dashboard_projects(d_day);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_status ON dashboard_projects(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_users_role ON dashboard_users(role);

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
-- PART 4: TRIGGERS (AUTOMATIC TIMESTAMPS)
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
-- PART 5: SEED DATA
-- ====================================================================

-- Insert Users (Interns + Trainers)
INSERT INTO dashboard_users (id, email, full_name, role, phone, daily_capacity, skills)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'elena.rostova@traininghub.internal', 'Elena Rostova', 'intern', '+1-555-0101', 5, ARRAY['Slide QA', 'Agenda Timekeeping', 'Speaker Liaison']),
  ('b2222222-2222-2222-2222-222222222222', 'kenji.t@traininghub.internal', 'Kenji Takahashi', 'intern', '+1-555-0102', 4, ARRAY['AV Setup', 'Zoom Rooms', 'Microphones']),
  ('c3333333-3333-3333-3333-333333333333', 'sarah.j@traininghub.internal', 'Sarah Jenkins', 'intern', '+1-555-0103', 4, ARRAY['Badge Printing', 'Catering Orders', 'Workbook Binding']),
  ('d4444444-4444-4444-4444-444444444444', 'admin.marcus@traininghub.internal', 'Marcus Trainer (Admin)', 'admin', '+1-555-0100', 8, ARRAY['Curriculum Lead', 'Reviewer'])
ON CONFLICT (id) DO NOTHING;

-- Insert Projects
INSERT INTO dashboard_projects (id, name, d_day, company_name, slogan, training_provider, storage_url, location, attendees_count, status)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111', 
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
    '22222222-2222-2222-2222-222222222222', 
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
    '33333333-3333-3333-3333-333333333333', 
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
ON CONFLICT (id) DO NOTHING;

-- Insert Tasks
INSERT INTO dashboard_checklist_tasks (id, project_id, title, description, assigned_intern_id, state, priority, phase, due_date, estimated_minutes, review_notes)
VALUES
  (
    'e1111111-0001-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111', 
    'Print Executive Dossiers & VIP Lanyards', 
    'Double-sided matte 120gsm paper with custom foil stamping for keynote speakers.', 
    'a1111111-1111-1111-1111-111111111111', 
    'ready_for_review', 
    'urgent', 
    'Printouts & Badges', 
    CURRENT_DATE + INTERVAL '1 day',
    90,
    'Sample badge printed. Waiting for trainer sign-off on spelling of keynote speakers.'
  ),
  (
    'e1111111-0002-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111', 
    'AV & Dual-Screen Wireless Clicker Testing', 
    'Test HDMI matrix switcher, Shure lavalier mic frequencies, and back-up clickers.', 
    'b2222222-2222-2222-2222-222222222222', 
    'in_progress', 
    'urgent', 
    'Tech & AV Setup', 
    CURRENT_DATE + INTERVAL '1 day',
    60,
    NULL
  ),
  (
    'e1111111-0003-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111', 
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
    'e1111111-0004-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111', 
    'Master Deck Slide Proofreading & Video Links Check', 
    'Check high-res slide animations and embedded demo clips.', 
    'a1111111-1111-1111-1111-111111111111', 
    'completed', 
    'high', 
    'Curriculum & Slides', 
    CURRENT_DATE - INTERVAL '1 day',
    120,
    NULL
  ),
  (
    'e2222222-0001-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222', 
    'Pre-Provision Kubernetes Sandbox Clusters', 
    'Spin up 30 isolated k8s namespaces with pre-loaded manifests.', 
    'b2222222-2222-2222-2222-222222222222', 
    'in_progress', 
    'high', 
    'Tech & AV Setup', 
    CURRENT_DATE + INTERVAL '4 days',
    180,
    NULL
  ),
  (
    'e2222222-0002-0000-0000-000000000002',
    '22222222-2222-2222-2222-222222222222', 
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
    'e3333333-0001-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333', 
    'Figma File Access & Permission Audit', 
    'Ensure attendee emails have editor rights to workshop file.', 
    'c3333333-3333-3333-3333-333333333333', 
    'in_progress', 
    'low', 
    'Curriculum & Slides', 
    CURRENT_DATE + INTERVAL '10 days',
    60,
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- Verification Query
SELECT 
    name, 
    d_day, 
    days_until_d_day, 
    remaining_tasks, 
    health_score, 
    urgency_level 
FROM dashboard_view_project_health_scores;
