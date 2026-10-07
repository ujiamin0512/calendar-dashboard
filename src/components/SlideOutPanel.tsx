import React from 'react';
import { 
  X, Calendar, Building2, ExternalLink, QrCode, 
  CheckCircle2, Clock, AlertTriangle, ArrowRight, 
  FolderGit2, Plus, Sparkles, MapPin, Users
} from 'lucide-react';
import { TrainingProject, ChecklistTask, Intern } from '../types';
import { calculateProjectHealth, formatFriendlyDate } from '../utils/date';

interface SlideOutPanelProps {
  project: TrainingProject | null;
  tasks: ChecklistTask[];
  interns: Intern[];
  isOpen: boolean;
  onClose: () => void;
  onEditProject: (project: TrainingProject) => void;
  onOpenDispatcherForProject: (projectId: string) => void;
  onAddTask: (projectId: string) => void;
  onUpdateTaskState: (taskId: string, newState: ChecklistTask['state']) => void;
}

export const SlideOutPanel: React.FC<SlideOutPanelProps> = ({
  project,
  tasks,
  interns,
  isOpen,
  onClose,
  onEditProject,
  onOpenDispatcherForProject,
  onAddTask,
  onUpdateTaskState,
}) => {
  if (!isOpen || !project) return null;

  const metrics = calculateProjectHealth(project, tasks);
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const pendingTasks = projectTasks.filter(t => t.state !== 'completed');

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
                <span className="text-zinc-300">•</span>
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
                      ({formatFriendlyDate(project.dDay)})
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
                    {metrics.healthScore >= 999 ? '100%' : metrics.healthScore.toFixed(2)}
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
                  Algorithm: {metrics.daysUntilDDay} days ÷ {metrics.remainingTasks} remaining tasks = {metrics.healthScore >= 999 ? 'Complete' : metrics.healthScore}
                </p>
              </div>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-zinc-200 rounded-lg">
                <span className="text-zinc-400 block font-mono text-[10px] uppercase">Training Provider</span>
                <span className="font-semibold text-zinc-800 mt-0.5 block truncate">{project.provider}</span>
              </div>
              <div className="p-3 bg-white border border-zinc-200 rounded-lg">
                <span className="text-zinc-400 block font-mono text-[10px] uppercase">Venue & Scope</span>
                <span className="font-semibold text-zinc-800 mt-0.5 block truncate flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-zinc-400" />
                  <span>{project.location || 'HQ Venue'}</span>
                </span>
              </div>
            </div>

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
            </div>

            {/* Immediate Pending Tasks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                    Pending Checklist Tasks
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-100 text-zinc-600 font-bold">
                    {pendingTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => onAddTask(project.id)}
                  className="text-xs text-zinc-700 hover:text-zinc-900 font-medium flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Task</span>
                </button>
              </div>

              {pendingTasks.length === 0 ? (
                <div className="py-8 text-center bg-zinc-50 border border-zinc-200 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-medium text-zinc-700">All tasks completed for this project!</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Ready for smooth D-Day execution.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {pendingTasks.map(task => {
                    const assignedIntern = interns.find(i => i.id === task.assignedInternId);

                    return (
                      <div 
                        key={task.id}
                        className="p-3 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-2">
                            <span className="text-xs font-semibold text-zinc-900 block leading-tight">
                              {task.title}
                            </span>
                            <span className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                              {task.description || task.phase}
                            </span>
                          </div>

                          {/* Quick status pill */}
                          <select
                            value={task.state}
                            onChange={(e) => onUpdateTaskState(task.id, e.target.value as ChecklistTask['state'])}
                            className="text-[11px] bg-zinc-50 border border-zinc-200 rounded px-2 py-0.5 font-medium text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                          >
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="ready_for_review">Ready for Review</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-100">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            <span>Due {formatFriendlyDate(task.dueDate)}</span>
                          </span>

                          <span className="font-mono text-zinc-600">
                            {assignedIntern ? `Assigned: ${assignedIntern.name.split(' ')[0]}` : 'Backlog'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
