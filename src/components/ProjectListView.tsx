import React, { useState, useMemo } from 'react';
import { 
  QrCode, Search, AlertTriangle, Plus, Edit2, Trash2,
  ArrowRight, ShieldAlert, Link2
} from 'lucide-react';
import { TrainingProject, ChecklistTask } from '../types';
import { calculateProjectHealth, calculateDaysUntilDDay, formatProjectDates } from '../utils/date';

interface ProjectListViewProps {
  projects: TrainingProject[];
  tasks: ChecklistTask[];
  onSelectProject: (project: TrainingProject) => void;
  onEditProject: (project: TrainingProject) => void;
  onDeleteProject: (projectId: string) => void;
  onNewProject: () => void;
  onOpenDispatcherForProject: (projectId: string) => void;
  onViewQrCode: (project: TrainingProject) => void;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  tasks,
  onSelectProject,
  onEditProject,
  onDeleteProject,
  onNewProject,
  onOpenDispatcherForProject,
  onViewQrCode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'critical' | 'in_progress' | 'completed'>('all');

  // Scoreboard order: most urgent first (lowest health score), ties by nearest D-Day.
  // Finished events with nothing left to do drop to the bottom.
  const sortedProjectsWithMetrics = useMemo(() => {
    return projects
      .map(project => {
        const metrics = calculateProjectHealth(project, tasks);
        const lastDay = project.endDate && project.endDate > project.dDay ? project.endDate : project.dDay;
        const isPast = calculateDaysUntilDDay(lastDay) < 0 && metrics.remainingTasks === 0;
        return { project, metrics, isPast };
      })
      .sort((a, b) =>
        Number(a.isPast) - Number(b.isPast) ||
        (a.isPast ? b.project.dDay.localeCompare(a.project.dDay) : 0) ||
        a.metrics.healthScore - b.metrics.healthScore ||
        a.project.dDay.localeCompare(b.project.dDay)
      );
  }, [projects, tasks]);

  const filteredProjects = useMemo(() => {
    return sortedProjectsWithMetrics.filter(({ project, metrics }) => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.provider.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterMode === 'critical') {
        return metrics.urgencyLevel === 'critical' || metrics.urgencyLevel === 'urgent';
      }
      if (filterMode === 'completed') {
        return metrics.completionPercentage === 100 || project.status === 'completed';
      }
      if (filterMode === 'in_progress') {
        return metrics.completionPercentage < 100 && project.status !== 'completed';
      }
      return true;
    });
  }, [sortedProjectsWithMetrics, searchQuery, filterMode]);

  return (
    <div className="flex-1 bg-zinc-50/60 p-4 md:p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                Project Scoreboard
              </h1>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Ranked by urgency: <span className="font-mono font-medium text-zinc-800">Health Score = Days until D-Day ÷ Remaining Tasks</span> (lower = more urgent), then nearest D-Day. Finished events drop to the bottom.
            </p>
          </div>

          <button
            onClick={onNewProject}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800 transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              All Projects ({projects.length})
            </button>
            <button
              onClick={() => setFilterMode('critical')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1 ${
                filterMode === 'critical'
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Critical & Urgent</span>
            </button>
            <button
              onClick={() => setFilterMode('in_progress')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterMode === 'in_progress'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilterMode('completed')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterMode === 'completed'
                  ? 'bg-emerald-700 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Completed
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event, client, provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Scoreboard */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-zinc-200">
            <ShieldAlert className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-900">No matching projects found</h3>
            <p className="text-xs text-zinc-500 mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden">
            {/* Column headers */}
            <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto_auto] md:grid-cols-[3.5rem_minmax(0,1fr)_9rem_6.5rem_10rem_7rem_9.5rem] items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <span className="text-center">Rank</span>
              <span>Project</span>
              <span className="hidden md:block">Date</span>
              <span>Countdown</span>
              <span className="hidden md:block">Checklist</span>
              <span className="hidden md:block">Health</span>
              <span className="text-right">Actions</span>
            </div>

            {filteredProjects.map(({ project, metrics, isPast }, index) => {
              const rank = index + 1;
              const countdownClass = isPast
                ? 'bg-zinc-100 text-zinc-500 border-zinc-200'
                : metrics.daysUntilDDay <= 3
                ? 'bg-red-100 text-red-800 border-red-200'
                : metrics.daysUntilDDay <= 7
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-zinc-100 text-zinc-800 border-zinc-200';
              const rankClass = isPast
                ? 'text-zinc-300'
                : rank === 1
                ? 'bg-zinc-900 text-white'
                : rank <= 3
                ? 'bg-zinc-200 text-zinc-900'
                : 'text-zinc-500';
              const linkCount = (project.links?.length || 0) + (project.storageUrl ? 1 : 0);

              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className={`grid grid-cols-[2.25rem_minmax(0,1fr)_auto_auto] md:grid-cols-[3.5rem_minmax(0,1fr)_9rem_6.5rem_10rem_7rem_9.5rem] items-center gap-2 md:gap-3 px-3 md:px-4 py-3 border-b border-zinc-100 last:border-b-0 cursor-pointer transition-colors hover:bg-zinc-50 ${
                    isPast ? 'opacity-60' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="flex justify-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-black text-sm ${rankClass}`}>
                      {rank}
                    </span>
                  </div>

                  {/* Project */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-sm text-zinc-900 truncate" title={project.name}>
                        {project.name}
                      </span>
                      {project.kind === 'team_building' && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Team Building
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {[project.company, project.location].filter(Boolean).join(' · ') || '—'}
                      <span className="md:hidden"> · {formatProjectDates(project)}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="hidden md:block text-xs font-mono text-zinc-600">
                    {formatProjectDates(project)}
                  </div>

                  {/* Countdown */}
                  <div>
                    <span className={`inline-block px-2 py-1 rounded-md border font-mono text-xs font-black tracking-tight ${countdownClass}`}>
                      {metrics.daysUntilDDay === 0
                        ? 'D-DAY'
                        : metrics.daysUntilDDay < 0
                        ? isPast ? 'DONE' : `D+${Math.abs(metrics.daysUntilDDay)}`
                        : `D-${metrics.daysUntilDDay}`}
                    </span>
                  </div>

                  {/* Checklist progress */}
                  <div className="hidden md:block">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 mb-1">
                      <span>{metrics.completedTasks}/{metrics.totalTasks}</span>
                      <span>{metrics.totalTasks === 0 ? '—' : `${metrics.completionPercentage}%`}</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          metrics.completionPercentage === 100
                            ? 'bg-emerald-600'
                            : metrics.daysUntilDDay <= 3
                            ? 'bg-red-500'
                            : 'bg-zinc-900'
                        }`}
                        style={{ width: `${metrics.completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Health score */}
                  <div className="hidden md:block">
                    <span className={`inline-block font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                      metrics.totalTasks === 0
                        ? 'text-zinc-400'
                        : metrics.healthScore >= 999
                        ? 'bg-emerald-50 text-emerald-700'
                        : metrics.healthScore < 1.0
                        ? 'bg-red-50 text-red-700'
                        : metrics.healthScore < 2.0
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}>
                      {metrics.totalTasks === 0 ? 'No tasks' : metrics.healthScore >= 999 ? 'Complete' : metrics.healthScore.toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                    {linkCount > 0 && (
                      <span className="hidden md:flex items-center gap-0.5 px-1.5 text-[10px] font-mono text-zinc-400" title={`${linkCount} link(s), open the project to see them`}>
                        <Link2 className="w-3 h-3" />
                        {linkCount}
                      </span>
                    )}
                    {project.evaluationQrCode && (
                      <button
                        onClick={() => onViewQrCode(project)}
                        title="View Evaluation QR Code"
                        className="hidden md:block p-1.5 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onEditProject(project)}
                      title="Edit Project"
                      className="p-1.5 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(project.id)}
                      title="Delete Project"
                      className="p-1.5 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenDispatcherForProject(project.id)}
                      title="Open in Task Queue"
                      className="hidden md:flex ml-1 px-2 py-1 bg-zinc-900 text-white rounded-md text-[11px] font-medium hover:bg-zinc-800 items-center gap-0.5"
                    >
                      <span>Tasks</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
