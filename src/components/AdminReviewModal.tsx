import React, { useState } from 'react';
import { 
  X, CheckCircle, RotateCcw, AlertTriangle, 
  MessageSquare, User, Building2, Calendar, Sparkles
} from 'lucide-react';
import { ChecklistTask, Intern, TrainingProject } from '../types';
import { formatFriendlyDate } from '../utils/date';

interface AdminReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: ChecklistTask[];
  interns: Intern[];
  projects: TrainingProject[];
  onApproveTask: (taskId: string) => void;
  onRejectTask: (taskId: string, feedback: string) => void;
}

export const AdminReviewModal: React.FC<AdminReviewModalProps> = ({
  isOpen,
  onClose,
  tasks,
  interns,
  projects,
  onApproveTask,
  onRejectTask,
}) => {
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const reviewTasks = tasks.filter(t => t.state === 'ready_for_review');

  const handleReject = (taskId: string) => {
    const feedback = feedbackMap[taskId] || 'Revision requested. Please review requirements.';
    onRejectTask(taskId, feedback);
    setFeedbackMap(prev => {
      const copy = { ...prev };
      delete copy[taskId];
      return copy;
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                Admin Review Inbox
              </h2>
              <p className="text-xs text-zinc-500">
                {reviewTasks.length} task{reviewTasks.length === 1 ? '' : 's'} waiting for sign-off
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {reviewTasks.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-zinc-900">All submissions cleared!</h3>
              <p className="text-xs text-zinc-500 mt-1">
                There are no tasks pending review right now.
              </p>
            </div>
          ) : (
            reviewTasks.map((task) => {
              const project = projects.find(p => p.id === task.projectId);
              const intern = interns.find(i => i.id === task.assignedInternId);

              return (
                <div
                  key={task.id}
                  className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3.5 shadow-2xs hover:border-zinc-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {project && (
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-500 block">
                          {project.company} • {project.name}
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-zinc-900 mt-0.5">
                        {task.title}
                      </h4>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 shrink-0">
                      Pending Approval
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                      {task.description}
                    </p>
                  )}

                  {/* Intern note if any */}
                  {task.reviewNotes && (
                    <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/80 text-xs text-amber-950 space-y-1">
                      <span className="font-mono text-[10px] font-bold uppercase text-amber-800 flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>Intern Submission Note</span>
                      </span>
                      <p>{task.reviewNotes}</p>
                    </div>
                  )}

                  {/* Metadata line */}
                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                    <span className="flex items-center space-x-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Submitted by {intern?.name || 'Intern'}</span>
                    </span>

                    <span className="font-mono text-[11px]">
                      Due: {formatFriendlyDate(task.dueDate)}
                    </span>
                  </div>

                  {/* Feedback field for revisions */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                    <input
                      type="text"
                      placeholder="Add revision feedback note (optional)..."
                      value={feedbackMap[task.id] || ''}
                      onChange={(e) => setFeedbackMap({ ...feedbackMap, [task.id]: e.target.value })}
                      className="w-full text-xs px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      onClick={() => handleReject(task.id)}
                      className="px-3.5 py-1.5 border border-zinc-200 hover:border-zinc-300 rounded-lg text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Request Revision</span>
                    </button>

                    <button
                      onClick={() => onApproveTask(task.id)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve & Complete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50/70 flex justify-between items-center text-xs text-zinc-500">
          <span>Approving a task will immediately update the project's completion metric.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
