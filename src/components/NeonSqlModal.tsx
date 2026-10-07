import React, { useState } from 'react';
import { 
  Database, Copy, Check, Download, Terminal, 
  ExternalLink, Server, Shield
} from 'lucide-react';
import { 
  NEON_POSTGRES_SCHEMA_SQL, 
  NEON_SEED_DATA_SQL, 
  NEXTJS_SERVER_ACTION_SNIPPET, 
  DRIZZLE_SCHEMA_SNIPPET 
} from '../utils/neonSql';

export const NeonSqlModal: React.FC<{ isOpen?: boolean; onClose?: () => void }> = () => {
  const [activeTab, setActiveTab] = useState<'sql-ddl' | 'seed-sql' | 'drizzle' | 'supabase-client'>('sql-ddl');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadSql = () => {
    const fullSql = `${NEON_POSTGRES_SCHEMA_SQL}\n\n${NEON_SEED_DATA_SQL}`;
    const blob = new Blob([fullSql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trainer_dashboard_supabase_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 bg-zinc-50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hub Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 text-emerald-400 flex items-center justify-center shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                  Supabase / PostgreSQL Implementation Blueprint
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-semibold">
                  PostgreSQL 15+ & Supabase Ready
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Production schema for <code className="font-mono text-zinc-700">dashboard_projects</code>, <code className="font-mono text-zinc-700">dashboard_checklist_tasks</code>, <code className="font-mono text-zinc-700">dashboard_users</code>, and dynamic Health Score calculation. Run directly in your Supabase SQL Editor.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={handleDownloadSql}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 rounded-lg text-xs font-medium transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-zinc-500" />
              <span>Download .sql</span>
            </button>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <span>Open Supabase</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Schema Architecture Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-zinc-900 font-mono uppercase">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>User Roles & RBAC</span>
            </div>
            <p className="text-xs text-zinc-500">
              <span className="font-mono text-zinc-800 font-semibold">dashboard_users</span> table with <span className="font-mono text-zinc-800 font-semibold">admin</span>, <span className="font-mono text-zinc-800 font-semibold">lead_trainer</span>, <span className="font-mono text-zinc-800 font-semibold">intern</span>, and <span className="font-mono text-zinc-800 font-semibold">viewer</span> enums.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-zinc-900 font-mono uppercase">
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span>Algorithmic Health View</span>
            </div>
            <p className="text-xs text-zinc-500">
              Real-time view <span className="font-mono text-zinc-800">dashboard_view_project_health_scores</span> computing <code className="bg-zinc-100 px-1 py-0.5 rounded text-[11px] font-mono">D-Days ÷ Remaining Tasks</code> automatically.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
            <div className="flex items-center space-x-2 text-xs font-bold text-zinc-900 font-mono uppercase">
              <Server className="w-4 h-4 text-amber-600" />
              <span>Dispatcher & Reviews</span>
            </div>
            <p className="text-xs text-zinc-500">
              <span className="font-mono text-zinc-800 text-[11px]">dashboard_checklist_tasks</span> & <span className="font-mono text-zinc-800 text-[11px]">dashboard_task_reviews</span> audit table with foreign key cascading.
            </p>
          </div>
        </div>

        {/* Code Tabs Container */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
          {/* Tab Bar */}
          <div className="px-6 py-3 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/70">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('sql-ddl')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                  activeTab === 'sql-ddl'
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                1. Supabase DDL (.sql)
              </button>

              <button
                onClick={() => setActiveTab('seed-sql')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                  activeTab === 'seed-sql'
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                2. Seed Data SQL (.sql)
              </button>

              <button
                onClick={() => setActiveTab('drizzle')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                  activeTab === 'drizzle'
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                3. Drizzle ORM Schema (.ts)
              </button>

              <button
                onClick={() => setActiveTab('supabase-client')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                  activeTab === 'supabase-client'
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                4. Supabase Client SDK (.ts)
              </button>
            </div>

            <button
              onClick={() => {
                const content = 
                  activeTab === 'sql-ddl' ? NEON_POSTGRES_SCHEMA_SQL :
                  activeTab === 'seed-sql' ? NEON_SEED_DATA_SQL :
                  activeTab === 'drizzle' ? DRIZZLE_SCHEMA_SNIPPET :
                  NEXTJS_SERVER_ACTION_SNIPPET;
                handleCopy(content, activeTab);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 rounded-md text-xs font-medium transition-colors border border-zinc-200"
            >
              {copiedKey === activeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer */}
          <div className="p-6 bg-zinc-950 overflow-x-auto text-zinc-100 font-mono text-xs leading-relaxed max-h-[500px]">
            <pre className="select-all">
              {activeTab === 'sql-ddl' && NEON_POSTGRES_SCHEMA_SQL}
              {activeTab === 'seed-sql' && NEON_SEED_DATA_SQL}
              {activeTab === 'drizzle' && DRIZZLE_SCHEMA_SNIPPET}
              {activeTab === 'supabase-client' && NEXTJS_SERVER_ACTION_SNIPPET}
            </pre>
          </div>
        </div>

        {/* Quick Setup Instructions for Supabase */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 uppercase font-mono tracking-wider">
            How to Set Up in Supabase in 3 Steps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-600">
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white font-mono font-bold flex items-center justify-center text-xs">
                1
              </span>
              <h4 className="font-bold text-zinc-900">Run SQL in Supabase</h4>
              <p>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-medium text-emerald-700">supabase.com/dashboard</a>, open your project, go to <strong>SQL Editor</strong>, paste Tab 1 above (or <code>supabase/run_all.sql</code>), and click <strong>Run</strong>.</p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white font-mono font-bold flex items-center justify-center text-xs">
                2
              </span>
              <h4 className="font-bold text-zinc-900">Configure Environment Keys</h4>
              <p>In Supabase, go to <strong>Project Settings $\rightarrow$ API</strong>. Copy your <code>Project URL</code> and <code>anon key</code> into your local <code>.env</code> file (e.g. <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>).</p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white font-mono font-bold flex items-center justify-center text-xs">
                3
              </span>
              <h4 className="font-bold text-zinc-900">Connect Client SDK</h4>
              <p>Install <code className="bg-zinc-200 px-1 py-0.5 rounded text-[11px] font-mono">@supabase/supabase-js</code> and use Tab 4 snippet to query <code className="font-mono">dashboard_projects</code> and <code className="font-mono">dashboard_view_project_health_scores</code>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
