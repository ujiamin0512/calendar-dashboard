# Supabase / PostgreSQL Setup Guide

All ready-to-run SQL code is located in this `/supabase/` folder:

| File | Purpose |
| :--- | :--- |
| **`supabase/run_all.sql`** | **⭐ All-in-one file.** Creates all tables (`dashboard_*`), enums, views, triggers, and populates sample seed data. |
| **`supabase/schema.sql`** | Clean DDL schema only (tables, extensions, enums, indexes, and algorithmic health view). |
| **`supabase/seed.sql`** | Sample realistic test data only (`dashboard_projects`, `dashboard_users`, `dashboard_checklist_tasks`). |

---

## Tables Structure

All tables use the `dashboard_` prefix:
- **`dashboard_users`**: Interns, Trainers, Admins, capacity & skills.
- **`dashboard_projects`**: Training events, D-Days, companies, storage links.
- **`dashboard_checklist_tasks`**: Phase-based actionable checklist items & intern assignments.
- **`dashboard_task_reviews`**: Audit logs for trainer sign-offs & review decisions.
- **`dashboard_view_project_health_scores`**: Dynamic algorithmic view computing `D-Day / Remaining Tasks`.

---

## How to Run in Supabase (Step-by-Step)

1. Open your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Select your project.
3. In the left sidebar, click **SQL Editor**.
4. Open **`supabase/run_all.sql`**, copy all contents, paste into the Supabase SQL Editor.
5. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
6. You will see all tables created and populated, with the result of `SELECT * FROM dashboard_view_project_health_scores;` confirming real-time algorithmic health scores!

---

## Connecting from Frontend / Next.js / Node

1. In your project, install the Supabase client:
   ```bash
   npm install @supabase/supabase-js
   ```
2. Configure `.env.local` or `.env`:
   ```env
   VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-public-key"
   ```
3. Query `dashboard_projects` or `dashboard_view_project_health_scores`:
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   export const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY
   );

   export async function getProjects() {
     const { data, error } = await supabase
       .from('dashboard_view_project_health_scores')
       .select('*')
       .order('health_score', { ascending: true });
     return data;
   }
   ```
