export const NEON_POSTGRES_SCHEMA_SQL = `-- ====================================================================
-- TRAINER MANAGEMENT DASHBOARD - SUPABASE / POSTGRESQL SCHEMA
-- Ready to run directly in the Supabase SQL Editor Console
-- Compatible with PostgreSQL 15+ / Supabase
-- All tables are namespaced with "dashboard_" prefix
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enums for Strict Typing & Performance
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

-- 3. Users and Roles Table
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

-- 4. Projects Table
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

-- 5. Tasks / Checklist Items Table
CREATE TABLE IF NOT EXISTS dashboard_checklist_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES dashboard_projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_intern_id UUID REFERENCES dashboard_users(id) ON DELETE SET NULL, -- NULL indicates Master Backlog
    state task_state_enum NOT NULL DEFAULT 'not_started',
    priority task_priority_enum NOT NULL DEFAULT 'medium',
    phase VARCHAR(100) NOT NULL DEFAULT 'General Prep',
    due_date DATE,
    estimated_minutes INT DEFAULT 60,
    review_notes TEXT,
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Task Review Logs (Audit trail for Admin reviews)
CREATE TABLE IF NOT EXISTS dashboard_task_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES dashboard_checklist_tasks(id) ON DELETE CASCADE,
    reviewed_by UUID NOT NULL REFERENCES dashboard_users(id) ON DELETE CASCADE,
    decision VARCHAR(50) NOT NULL, -- 'approved', 'revision_requested'
    feedback_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_tasks_project_id ON dashboard_checklist_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_tasks_assigned_intern ON dashboard_checklist_tasks(assigned_intern_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_tasks_state ON dashboard_checklist_tasks(state);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_d_day ON dashboard_projects(d_day);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_status ON dashboard_projects(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_users_role ON dashboard_users(role);

-- 8. Algorithmic Health Score Real-Time View
-- Computes Health Score: (Days until D-Day ÷ Remaining Unfinished Tasks)
-- Pinned to top when health_score is lowest!
CREATE OR REPLACE VIEW dashboard_view_project_health_scores AS
WITH task_aggregates AS (
    SELECT 
        p.id AS project_id,
        p.name,
        p.d_day,
        p.company_name,
        p.status,
        (p.d_day - CURRENT_DATE) AS days_until_d_day,
        COUNT(t.id) AS total_tasks,
        COUNT(CASE WHEN t.state = 'completed' THEN 1 END) AS completed_tasks,
        COUNT(CASE WHEN t.state != 'completed' THEN 1 END) AS remaining_tasks
    FROM dashboard_projects p
    LEFT JOIN dashboard_checklist_tasks t ON t.project_id = p.id
    GROUP BY p.id, p.name, p.d_day, p.company_name, p.status
)
SELECT 
    project_id,
    name,
    d_day,
    company_name,
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

-- 9. Auto-updated timestamps trigger function
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
`;

export const NEON_SEED_DATA_SQL = `-- ====================================================================
-- SEED DATA FOR SUPABASE / POSTGRESQL CONSOLE
-- ====================================================================

-- Insert Sample Interns and Admins
INSERT INTO dashboard_users (id, email, full_name, role, phone, daily_capacity, skills)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'elena.rostova@trainerhub.io', 'Elena Rostova', 'intern', '+1-555-0101', 5, ARRAY['Slide QA', 'VIP Liaison', 'Speaker Coordination']),
  ('b2222222-2222-2222-2222-222222222222', 'kenji.t@trainerhub.io', 'Kenji Takahashi', 'intern', '+1-555-0102', 4, ARRAY['AV Setup', 'Zoom Rooms', 'Microphones']),
  ('c3333333-3333-3333-3333-333333333333', 'admin.marcus@trainerhub.io', 'Marcus Trainer (Admin)', 'admin', '+1-555-0100', 8, ARRAY['Curriculum Lead', 'Reviewer'])
ON CONFLICT (id) DO NOTHING;

-- Insert Training Projects
INSERT INTO dashboard_projects (id, name, d_day, company_name, slogan, training_provider, storage_url, location, attendees_count)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Executive AI Leadership Summit', CURRENT_DATE + INTERVAL '3 days', 'Fintech Vanguard Corp', 'Mastering Enterprise Intelligence', 'Apex Academy Global', 'https://drive.google.com/drive/folders/summit-2026', 'Metropolitan Hall B', 65),
  ('22222222-2222-2222-2222-222222222222', 'Cloud Native DevOps Bootcamp', CURRENT_DATE + INTERVAL '7 days', 'Nexus Mobility Labs', 'Zero-Downtime Architecture', 'Apex Academy Global', 'https://storage.cloud.google.com/nexus-devops', 'Innovation Lab 4', 30)
ON CONFLICT (id) DO NOTHING;

-- Insert Checklist Tasks
INSERT INTO dashboard_checklist_tasks (project_id, title, description, assigned_intern_id, state, priority, phase, due_date)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Print Executive Dossiers & VIP Lanyards', 'High GSM matte print for keynote speakers', 'a1111111-1111-1111-1111-111111111111', 'ready_for_review', 'urgent', 'Printouts & Badges', CURRENT_DATE + INTERVAL '1 day'),
  ('11111111-1111-1111-1111-111111111111', 'AV Wireless Clicker & Frequency Testing', 'Check 2.4Ghz channel interference', 'b2222222-2222-2222-2222-222222222222', 'in_progress', 'urgent', 'Tech & AV Setup', CURRENT_DATE + INTERVAL '1 day'),
  ('11111111-1111-1111-1111-111111111111', 'Confirm Catering & Dietary Restrictions', 'Send allergen sheet to venue hotel', NULL, 'not_started', 'high', 'Logistics & Venue', CURRENT_DATE + INTERVAL '2 days'),
  ('22222222-2222-2222-2222-222222222222', 'Pre-Provision Kubernetes Clusters', 'Create 30 student namespaces', 'b2222222-2222-2222-2222-222222222222', 'in_progress', 'high', 'Tech & AV Setup', CURRENT_DATE + INTERVAL '4 days');
`;

export const NEXTJS_SERVER_ACTION_SNIPPET = `// lib/supabase.ts or app/actions/projects.ts
// Supabase Client & Queries with dashboard_ table names
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

export async function getProjectsWithHealthScore() {
  const { data, error } = await supabase
    .from('dashboard_view_project_health_scores')
    .select('*')
    .order('health_score', { ascending: true });
    
  if (error) throw error;
  return data;
}

export async function updateTaskState(taskId: string, newState: string, internId?: string | null) {
  const updates: Record<string, any> = {
    state: newState,
    ...(internId !== undefined && { assigned_intern_id: internId }),
    ...(newState === 'completed' && { completed_at: new Date().toISOString() }),
    ...(newState === 'ready_for_review' && { submitted_at: new Date().toISOString() }),
  };

  const { error } = await supabase
    .from('dashboard_checklist_tasks')
    .update(updates)
    .eq('id', taskId);

  if (error) throw error;
}
`;

export const DRIZZLE_SCHEMA_SNIPPET = `// db/schema.ts (Drizzle ORM for PostgreSQL / Supabase)
import { pgTable, uuid, varchar, text, date, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role_enum', ['admin', 'lead_trainer', 'intern', 'viewer']);
export const taskStateEnum = pgEnum('task_state_enum', ['not_started', 'in_progress', 'ready_for_review', 'completed']);
export const taskPriorityEnum = pgEnum('task_priority_enum', ['urgent', 'high', 'medium', 'low']);
export const projectStatusEnum = pgEnum('project_status_enum', ['upcoming', 'in_progress', 'completed', 'archived']);

export const dashboardUsers = pgTable('dashboard_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  role: userRoleEnum('role').default('intern').notNull(),
  dailyCapacity: integer('daily_capacity').default(5).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const dashboardProjects = pgTable('dashboard_projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  dDay: date('d_day').notNull(),
  companyName: varchar('company_name', { length: 200 }).notNull(),
  slogan: varchar('slogan', { length: 255 }),
  trainingProvider: varchar('training_provider', { length: 200 }).notNull(),
  storageUrl: text('storage_url'),
  evaluationQrCodeUrl: text('evaluation_qr_code_url'),
  status: projectStatusEnum('status').default('in_progress').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const dashboardChecklistTasks = pgTable('dashboard_checklist_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => dashboardProjects.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  assignedInternId: uuid('assigned_intern_id').references(() => dashboardUsers.id, { onDelete: 'set null' }),
  state: taskStateEnum('state').default('not_started').notNull(),
  priority: taskPriorityEnum('priority').default('medium').notNull(),
  phase: varchar('phase', { length: 100 }).notNull(),
  dueDate: date('due_date'),
  reviewNotes: text('review_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
`;
