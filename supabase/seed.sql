-- ====================================================================
-- SEED DATA FOR SUPABASE / POSTGRESQL CONSOLE
-- Run this after running schema.sql to insert sample projects & interns
-- All tables are namespaced with "dashboard_" prefix
-- ====================================================================

-- 1. Insert Interns & Trainers
INSERT INTO dashboard_users (id, email, full_name, role, phone, daily_capacity, skills)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'elena.rostova@traininghub.internal', 'Elena Rostova', 'intern', '+1-555-0101', 5, ARRAY['Slide QA', 'Agenda Timekeeping', 'Speaker Liaison']),
  ('b2222222-2222-2222-2222-222222222222', 'kenji.t@traininghub.internal', 'Kenji Takahashi', 'intern', '+1-555-0102', 4, ARRAY['AV Setup', 'Zoom Rooms', 'Microphones']),
  ('c3333333-3333-3333-3333-333333333333', 'sarah.j@traininghub.internal', 'Sarah Jenkins', 'intern', '+1-555-0103', 4, ARRAY['Badge Printing', 'Catering Orders', 'Workbook Binding']),
  ('d4444444-4444-4444-4444-444444444444', 'admin.marcus@traininghub.internal', 'Marcus Trainer (Admin)', 'admin', '+1-555-0100', 8, ARRAY['Curriculum Lead', 'Reviewer'])
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Training Projects
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

-- 3. Insert Checklist Tasks
INSERT INTO dashboard_checklist_tasks (id, project_id, title, description, assigned_intern_id, state, priority, phase, due_date, estimated_minutes, review_notes)
VALUES
  -- Urgent Project 1 (D-3)
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
    NULL, -- Master Backlog
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

  -- Project 2 (D-7)
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
