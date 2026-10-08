-- ====================================================================
-- SEED DATA FOR SUPABASE / POSTGRESQL CONSOLE
-- Short, clean, human-readable IDs matching frontend mock data
-- ====================================================================

-- 1. Insert Interns & Trainers
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
  -- Project 1 (Urgent: D-3)
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
    NULL, -- Master Backlog
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

  -- Project 2 (D-7)
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
    NULL, -- Master Backlog
    'not_started', 
    'medium', 
    'Logistics & Venue', 
    CURRENT_DATE + INTERVAL '5 days',
    45,
    NULL
  ),

  -- Project 3 (D-14)
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
