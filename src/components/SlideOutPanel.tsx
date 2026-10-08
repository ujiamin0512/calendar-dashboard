import React from 'react';
import { 
  X, Calendar, Building2, ExternalLink, QrCode, 
  AlertTriangle, ArrowRight, 
  FolderGit2, Sparkles, Link as LinkIcon, MapPin, Users
} from 'lucide-react';
import { TrainingProject, ChecklistTask, Intern } from '../types';
import { calculateProjectHealth, formatFriendlyDate, formatProjectDates } from '../utils/date';
import { ProjectChecklist } from './ProjectChecklist';

interface SlideOutPanelProps {
  project: TrainingProject | null;
  tasks: ChecklistTask[];
  interns: Intern[];
  isOpen: boolean;
  onClose: () => void;
  onEditProject: (project: TrainingProject) => void;
  onOpenDispatcherForProject: (projectId: string) => void;
  onUpdateTaskState: (taskId: string, newState: ChecklistTask['state']) => void;
  onQuickAddTask: (projectId: string, title: string, description: string, internId: string | null, dueDate: string) => void;
  onEditTask: (task: ChecklistTask) => void;
  onAddComment: (taskId: string, author: string, text: string) => void;
}

export const SlideOutPanel: React.FC<SlideOutPanelProps> = ({
  project,
  tasks,
  interns,
  isOpen,
  onClose,
  onEditProject,
  onOpenDispatcherForProject,
  onUpdateTaskState,
  onQuickAddTask,
  onEditTask,
  onAddComment,
}) => {
  if (!isOpen || !project) return null;

  const metrics = calculateProjectHealth(project, tasks);
  const projectTasks = tasks.filter(t => t.projectId === project.id);

  const getUrgencyBadge = (level: typeof metrics.urgencyLevel) => {
    switch (level) {
      case 'critical':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Critical Urgency</span>;
      case 'urgent':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Urgent</span>;
      case 'moderate':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Moderate</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Complete</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800">On Track</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white border-l border-zinc-200 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-zinc-200 flex items-start justify-between bg-zinc-50/50">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                  {project.company}
                </span>
                {project.company && <span className="text-zinc-300">•</span>}
                {project.kind === 'team_building' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">Team Building</span>
                )}
                {getUrgencyBadge(metrics.urgencyLevel)}
              </div>
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight mt-1">
                {project.name}
              </h2>
              {project.slogan && (
                <p className="text-xs text-zinc-500 italic mt-0.5">
                  "{project.slogan}"
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Dual Metric Progress & D-Day Box */}
            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                    Event D-Day Countdown
                  </span>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className={`text-2xl font-black font-mono tracking-tight ${
                      metrics.daysUntilDDay <= 3 ? 'text-red-600' :
                      metrics.daysUntilDDay <= 7 ? 'text-amber-600' : 'text-zinc-900'
                    }`}>
                      {metrics.daysUntilDDay <= 0 
                        ? (metrics.daysUntilDDay === 0 ? 'D-DAY TODAY' : `D+${Math.abs(metrics.daysUntilDDay)} OVERDUE`)
                        : `D-${metrics.daysUntilDDay}`}
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({formatProjectDates(project)})
                    </span>
                  </div>
                </div>

                {/* Algorithmic Health Score */}
                <div className="text-right">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
                    Health Score
                  </span>
                  <span className={`inline-block font-mono font-bold text-lg px-2.5 py-0.5 rounded-md mt-0.5 ${
                    metrics.healthScore < 1.0 ? 'bg-red-100 text-red-900' :
                    metrics.healthScore < 2.0 ? 'bg-amber-100 text-amber-900' :
                    'bg-zinc-200 text-zinc-900'
                  }`}>
                    {metrics.totalTasks === 0 ? '–' : metrics.healthScore >= 999 ? '100%' : metrics.healthScore.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-600 mb-1.5 font-medium">
                  <span>Checklist Completion</span>
                  <span className="font-mono">{metrics.completedTasks} / {metrics.totalTasks} Done ({metrics.completionPercentage}%)</span>
                </div>
                <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      metrics.completionPercentage === 100 
                        ? 'bg-emerald-600' 
                        : metrics.daysUntilDDay <= 3 
                        ? 'bg-red-500' 
                        : 'bg-zinc-900'
                    }`}
                    style={{ width: `${metrics.completionPercentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                  {metrics.totalTasks === 0 ? 'Add tasks to get a health score.' : <>Algorithm: {metrics.daysUntilDDay} days ÷ {metrics.remainingTasks} remaining tasks = {metrics.healthScore >= 999 ? 'Complete' : metrics.healthScore}</>}
                </p>
              </div>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-zinc-200 rounded-lg">
                <span className="text-zinc-400 block font-mono text-[10px] uppercase">Training Provider</span>
                <span className="font-semibold text-zinc-800 mt-0.5 block truncate">{project.provider || '–'}</span>
              </div>
              <div className="p-3 bg-white border border-zinc-200 rounded-lg">
                <span className="text-zinc-400 block font-mono text-[10px] uppercase">Venue & Scope</span>
                <span className="font-semibold text-zinc-800 mt-0.5 block truncate flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-zinc-400" />
                  <span>{project.location || '–'}</span>
                </span>
              </div>
            </div>

            {/* Notes */}
            {project.notes && (
              <div className="p-3 bg-white border border-zinc-200 rounded-lg text-xs">
                <span className="text-zinc-400 block font-mono text-[10px] uppercase mb-1">Notes</span>
                <p className="text-zinc-700 whitespace-pre-wrap">{project.notes}</p>
              </div>
            )}

            {/* Cloud Storage & Evaluation QR Code */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 block">
                Assets & Quick Links
              </span>
              <div className="flex items-center space-x-2">
                {project.storageUrl ? (
                  <a
                    href={project.storageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                  >
                    <FolderGit2 className="w-4 h-4 text-zinc-500" />
                    <span>Cloud Asset Storage</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                ) : (
                  <div className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-400 text-center">
                    No storage link set
                  </div>
                )}

                {/* QR Code Trigger/Preview */}
                {project.evaluationQrCode && (
                  <div className="p-1.5 bg-white border border-zinc-200 rounded-lg flex items-center justify-center" title="Evaluation Survey QR Code">
                    <img 
                      src={project.evaluationQrCode} 
                      alt="Evaluation QR Code" 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                )}
              </div>
              {/* Event Links */}
              {project.links && project.links.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.links.map((link, i) => {
                    let host = link.url;
                    try {
                      host = new URL(link.url).hostname.replace(/^www\./, '');
                    } catch {}
                    return (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.url}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors max-w-full"
                      >
                        <LinkIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">{link.label || host}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-400 shrink-0" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Project Checklist */}
            <ProjectChecklist
              projectId={project.id}
              tasks={projectTasks}
              interns={interns}
              onQuickAddTask={onQuickAddTask}
              onToggleDone={(task) => onUpdateTaskState(task.id, task.state === 'completed' ? 'not_started' : 'completed')}
              onEditTask={onEditTask}
              onAddComment={onAddComment}
            />
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between space-x-3">
            <button
              onClick={() => onEditProject(project)}
              className="px-4 py-2 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 hover:bg-white hover:text-zinc-900 transition-colors"
            >
              Edit Project Form
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenDispatcherForProject(project.id);
              }}
              className="flex-1 flex items-center justify-center space-x-1.5 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800 transition-colors shadow-xs"
            >
              <span>Dispatch in Task Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
