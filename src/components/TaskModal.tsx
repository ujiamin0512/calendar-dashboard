import React, { useState, useEffect } from 'react';
import { 
  X, CheckSquare, Calendar, User, AlertCircle, 
  Clock, Tag, Layers, AlignLeft 
} from 'lucide-react';
import { ChecklistTask, Intern, TrainingProject, TaskState } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<ChecklistTask>) => void;
  projects: TrainingProject[];
  interns: Intern[];
  initialTask?: ChecklistTask | null;
  defaultProjectId?: string;
  defaultInternId?: string | null;
  defaultDueDate?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projects,
  interns,
  initialTask,
  defaultProjectId,
  defaultInternId,
  defaultDueDate,
}) => {
  const [formData, setFormData] = useState<Partial<ChecklistTask>>({
    title: '',
    description: '',
    projectId: defaultProjectId || projects[0]?.id || '',
    assignedInternId: defaultInternId ?? null,
    state: 'not_started',
    dueDate: defaultDueDate || new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (initialTask) {
      setFormData(initialTask);
    } else {
      setFormData({
        title: '',
        description: '',
        projectId: defaultProjectId || projects[0]?.id || '',
        assignedInternId: defaultInternId ?? null,
        state: 'not_started',
        dueDate: defaultDueDate || new Date().toISOString().slice(0, 10),
              });
    }
  }, [initialTask, defaultProjectId, defaultInternId, defaultDueDate, projects, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.projectId) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                {initialTask ? 'Edit Checklist Item' : 'New Checklist Item'}
              </h2>
              <p className="text-xs text-zinc-500">
                Define actionable training milestone tasks and assignees.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Title */}
          <div>
            <label className="block font-semibold text-zinc-700 uppercase tracking-wider font-mono mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AV Wireless Clicker & Frequency Testing"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white text-zinc-900"
            />
          </div>

          {/* Project Association */}
          <div>
            <label className="block font-semibold text-zinc-700 uppercase tracking-wider font-mono mb-1">
              Project *
            </label>
            <select
              required
              value={formData.projectId || ''}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white text-zinc-900"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.company}: {p.name} (D-Day: {p.dDay})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-zinc-700 uppercase tracking-wider font-mono mb-1">
              Task Description & Acceptance Criteria
            </label>
            <textarea
              rows={3}
              placeholder="Specify requirements, links, checklist details..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white text-zinc-900"
            />
          </div>

          {/* Assigned Intern & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 uppercase tracking-wider font-mono mb-1">
                Assignee
              </label>
              <select
                value={formData.assignedInternId || ''}
                onChange={(e) => setFormData({ ...formData, assignedInternId: e.target.value ? e.target.value : null })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white text-zinc-900"
              >
                <option value="">Master Backlog (Unassigned)</option>
                {interns.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 uppercase tracking-wider font-mono mb-1">
                Workflow State
              </label>
              <select
                value={formData.state || 'not_started'}
                onChange={(e) => setFormData({ ...formData, state: e.target.value as TaskState })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white text-zinc-900"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Task Date */}
          <div>
              <label className="block font-semibold text-zinc-700 uppercase tracking-wider font-mono mb-1">
                Task Date
              </label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white text-zinc-900"
              />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 rounded-lg font-medium text-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors shadow-xs"
            >
              {initialTask ? 'Save Task Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
