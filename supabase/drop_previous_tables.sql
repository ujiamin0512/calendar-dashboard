-- ====================================================================
-- DROP / RESET ALL DASHBOARD TABLES (PREPARE FOR SHORT IDS)
-- Run this if you need to wipe old tables or switch schema to short IDs
-- ====================================================================

-- 1. Drop views
DROP VIEW IF EXISTS dashboard_view_project_health_scores CASCADE;
DROP VIEW IF EXISTS view_project_health_scores CASCADE;

-- 2. Drop dashboard_* tables
DROP TABLE IF EXISTS dashboard_task_reviews CASCADE;
DROP TABLE IF EXISTS dashboard_checklist_tasks CASCADE;
DROP TABLE IF EXISTS dashboard_projects CASCADE;
DROP TABLE IF EXISTS dashboard_users CASCADE;

-- 3. Drop un-prefixed tables if they exist
DROP TABLE IF EXISTS task_reviews CASCADE;
DROP TABLE IF EXISTS checklist_tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 4. Drop trigger function
DROP FUNCTION IF EXISTS trigger_set_timestamp() CASCADE;
