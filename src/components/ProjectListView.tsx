import React, { useState, useMemo } from 'react';
import { 
  Building2, Calendar, FolderGit2, QrCode, ExternalLink, 
  Search, ArrowUpDown, AlertTriangle, CheckCircle2, 
  Clock, Plus, Edit2, Trash2, ArrowRight, ShieldAlert, Sparkles
} from 'lucide-react';
import { TrainingProject, ChecklistTask } from '../types';
import { calculateProjectHealth, formatFriendlyDate } from '../utils/date';

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

  // Compute metrics and sort by Algorithmic Health Score ascending (lowest score = highest urgency at top)
  const sortedProjectsWithMetrics = useMemo(() => {
    return projects
      .map(project => ({
        project,
        metrics: calculateProjectHealth(project, tasks),
      }))
      .sort((a, b) => a.metrics.healthScore - b.metrics.healthScore);
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
    <div className="flex-1 bg-zinc-50/60 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                Project Dashboard & Health Score Monitor
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 bg-zinc-200 text-zinc-700 rounded-md">
                Algorithmic Sorting
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Ranked dynamically by <span className="font-mono font-medium text-zinc-800">Health Score = (Days until D-Day ÷ Remaining Tasks)</span>. Lowest scores are auto-pinned as urgent.
            </p>
          </div>

          <button
            onClick={onNewProject}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800 transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Training Project</span>
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

        {/* Project Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-zinc-200">
            <ShieldAlert className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-900">No matching projects found</h3>
            <p className="text-xs text-zinc-500 mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map(({ project, metrics }, index) => {
              const isPinnedTop = index === 0 && metrics.urgencyLevel === 'critical';

              return (
                <div
                  key={project.id}
                  className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden relative ${
                    isPinnedTop 
                      ? 'border-red-300 ring-2 ring-red-500/20 shadow-xs' 
                      : 'border-zinc-200 shadow-2xs hover:border-zinc-300'
                  }`}
                >
                  {/* Top Pinned Banner for Highest Urgency */}
                  {isPinnedTop && (
                    <div className="bg-red-600 text-white text-[10px] font-mono uppercase tracking-wider py-1 px-4 font-bold flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Pinned: Highest Urgency Project</span>
                      </span>
                      <span>Score: {metrics.healthScore.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="p-5 space-y-4 flex-1">
                    {/* Header: Company & D-Day Countdown Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-zinc-500 block truncate">
                          {project.company}
                        </span>
                        <h3 
                          onClick={() => onSelectProject(project)}
                          className="font-bold text-zinc-900 text-base tracking-tight hover:text-zinc-700 cursor-pointer transition-colors mt-0.5 line-clamp-1"
                          title={project.name}
                        >
                          {project.name}
                        </h3>
                      </div>

                      {/* Color-coded Countdown Badge */}
                      <div className="flex flex-col items-end shrink-0">
                        <span className={`px-2.5 py-1 rounded-md font-mono text-xs font-black tracking-tight ${
                          metrics.daysUntilDDay <= 3 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : metrics.daysUntilDDay <= 7 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                        }`}>
                          {metrics.daysUntilDDay <= 0 
                            ? (metrics.daysUntilDDay === 0 ? 'D-DAY TODAY' : `D+${Math.abs(metrics.daysUntilDDay)} OVERDUE`)
                            : `D-${metrics.daysUntilDDay}`}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          {formatFriendlyDate(project.dDay)}
                        </span>
                      </div>
                    </div>

                    {project.slogan && (
                      <p className="text-xs text-zinc-500 italic line-clamp-1">
                        "{project.slogan}"
                      </p>
                    )}

                    {/* Dual-Metric Progress UI */}
                    <div className="space-y-2 pt-2 border-t border-zinc-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-600 font-medium">Checklist Progress</span>
                        <span className="font-mono font-bold text-zinc-900">
                          {metrics.completionPercentage}% ({metrics.completedTasks}/{metrics.totalTasks})
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden border border-zinc-200/60">
                        <div
                          className={`h-full transition-all duration-300 ${
                            metrics.completionPercentage === 100
                              ? 'bg-emerald-600'
                              : metrics.daysUntilDDay <= 3
                              ? 'bg-red-500'
                              : 'bg-zinc-900'
                          }`}
                          style={{ width: `${metrics.completionPercentage}%` }}
                        />
                      </div>

                      {/* Algorithmic Health Score details */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
                        <span>Health Score:</span>
                        <span className={`font-bold px-1.5 py-0.2 rounded ${
                          metrics.healthScore < 1.0 ? 'bg-red-50 text-red-700' :
                          metrics.healthScore < 2.0 ? 'bg-amber-50 text-amber-700' :
                          'bg-zinc-100 text-zinc-700'
                        }`}>
                          {metrics.healthScore >= 999 ? '100% Complete' : `${metrics.healthScore.toFixed(2)} (${metrics.daysUntilDDay}d ÷ ${metrics.remainingTasks} rem)`}
                        </span>
                      </div>
                    </div>

                    {/* Meta Row: Training Provider & Assets */}
                    <div className="flex items-center justify-between pt-2 text-xs text-zinc-500 border-t border-zinc-100">
                      <span className="truncate pr-2 font-medium">
                        By {project.provider}
                      </span>

                      <div className="flex items-center space-x-2 shrink-0">
                        {project.storageUrl && (
                          <a
                            href={project.storageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open Cloud Assets"
                            className="p-1 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                          >
                            <FolderGit2 className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {project.evaluationQrCode && (
                          <button
                            onClick={() => onViewQrCode(project)}
                            title="View Evaluation QR Code"
                            className="p-1 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 py-3 bg-zinc-50/70 border-t border-zinc-200 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEditProject(project)}
                        title="Edit Project"
                        className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200/60 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProject(project.id)}
                        title="Delete Project"
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onSelectProject(project)}
                        className="px-2.5 py-1 text-zinc-700 hover:text-zinc-900 font-medium hover:bg-zinc-200/50 rounded transition-colors"
                      >
                        Summary
                      </button>
                      <button
                        onClick={() => onOpenDispatcherForProject(project.id)}
                        className="px-3 py-1 bg-zinc-900 text-white rounded-md font-medium hover:bg-zinc-800 transition-colors flex items-center space-x-1 shadow-2xs"
                      >
                        <span>Dispatch</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
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
