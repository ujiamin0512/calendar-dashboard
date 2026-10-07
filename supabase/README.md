# Neon PostgreSQL Setup Guide

All ready-to-run SQL code is located in this `/neon/` folder:

| File | Purpose |
| :--- | :--- |
| **`neon/run_all.sql`** | **⭐ All-in-one file.** Creates all tables, enums, views, triggers, and populates sample seed data. |
| **`neon/schema.sql`** | Clean DDL schema only (tables, extensions, enums, indexes, and algorithmic health view). |
| **`neon/seed.sql`** | Sample realistic test data only (projects, interns, checklist tasks). |

---

## How to Run in Neon (Step-by-Step)

1. Open your **[Neon Console](https://console.neon.tech/)**.
2. Select your project (or click **New Project** and choose PostgreSQL 15 or 16).
3. In the left sidebar, click **SQL Editor**.
4. Open **`neon/run_all.sql`**, copy all contents, paste into the Neon SQL Editor.
5. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
6. You will see all tables created and populated, with the result of `SELECT * FROM view_project_health_scores;` confirming real-time algorithmic health scores!

---

## Connecting from Next.js (Vercel)

1. In your Next.js project, install the Neon serverless package:
   ```bash
   npm install @neondatabase/serverless
   ```
2. Copy your Neon connection string from the Dashboard into `.env.local`:
   ```env
   DATABASE_URL="postgres://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
3. Query the algorithmic health view in your Next.js Server Action (`app/actions/projects.ts`):
   ```typescript
   import { neon } from '@neondatabase/serverless';

   const sql = neon(process.env.DATABASE_URL!);

   export async function getProjects() {
     return await sql`
       SELECT * FROM view_project_health_scores
       ORDER BY health_score ASC;
     `;
   }
   ```
