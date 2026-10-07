import React, { useState } from 'react';
import { 
  GitPullRequestDraft, UserCheck, Layers, Plus, 
  Clock, AlertCircle, ArrowRight, CheckCircle2, 
  RotateCcw, Sparkles, Filter, MoreVertical, Edit2, Trash2
} from 'lucide-react';
import { ChecklistTask, Intern, TrainingProject, TaskState } from '../types';
import { formatFriendlyDate } from '../utils/date';

interface AdminDispatcherProps {
  projects: TrainingProject[];
  interns: Intern[];
  tasks: ChecklistTask[];
  selectedProjectId: string | 'all';
  onSelectProjectFilter: (projectId: string | 'all') => void;
  onMoveTaskToIntern: (taskId: string, internId: string | null) => void;
  onUpdateTaskState: (taskId: string, newState: TaskState) => void;
  onEditTask: (task: ChecklistTask) => void;
  onDeleteTask: (taskId: string) => void;
  onNewTask: (defaultProjectId?: string, defaultInternId?: string | null) => void;
  onOpenReviewInbox: () => void;
}

export const AdminDispatcher: React.FC<AdminDispatcherProps> = ({
  projects,
  interns,
  tasks,
  selectedProjectId,
  onSelectProjectFilter,
  onMoveTaskToIntern,
  onUpdateTaskState,
  onEditTask,
  onDeleteTask,
  onNewTask,
  onOpenReviewInbox,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  // Filter tasks by selected project
  const filteredTasks = selectedProjectId === 'all'
    ? tasks
    : tasks.filter(t => t.projectId === selectedProjectId);

  // Unassigned tasks (Master Backlog)
  const backlogTasks = filteredTasks.filter(t => !t.assignedInternId);

  // Ready for Review count
  const pendingReviewCount = tasks.filter(t => t.state === 'ready_for_review').length;

  // HTML5 Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverTarget(targetId);
  };

  const handleDragLeave = () => {
    setDragOverTarget(null);
  };

  const handleDropOnIntern = (e: React.DragEvent, internId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onMoveTaskToIntern(taskId, internId);
    }
    setDraggedTaskId(null);
    setDragOverTarget(null);
  };

  const handleDropOnBacklog = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onMoveTaskToIntern(taskId, null);
    }
    setDraggedTaskId(null);
    setDragOverTarget(null);
  };

  const getStateColor = (state: TaskState) => {
    switch (state) {
      case 'not_started':
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'ready_for_review':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  const getStateLabel = (state: TaskState) => {
    switch (state) {
      case 'not_started': return 'Not Started';
      case 'in_progress': return 'In Progress';
      case 'ready_for_review': return 'Ready for Review';
      case 'completed': return 'Completed';
    }
  };

  const getPriorityBadge = (priority: ChecklistTask['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-red-100 text-red-800">URGENT</span>;
      case 'high':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-amber-100 text-amber-800">HIGH</span>;
      case 'medium':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-100 text-zinc-700">MED</span>;
      case 'low':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-50 text-zinc-500">LOW</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4.1rem)] bg-zinc-100 overflow-hidden">
      {/* Dispatcher Header & Filter Bar */}
      <div className="bg-white border-b border-zinc-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <GitPullRequestDraft className="w-5 h-5 text-zinc-900" />
            <h1 className="text-base font-bold text-zinc-900 tracking-tight">
              Admin Dispatcher & Queue Allocation
            </h1>
          </div>

          {/* Project Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-zinc-500 pl-3 border-l border-zinc-200">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span>Scope:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => onSelectProjectFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1 text-xs font-medium text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="all">All Active Projects ({tasks.length} tasks)</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.company}: {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Info: Review Inbox & Add Task */}
        <div className="flex items-center space-x-3 text-xs">
          {pendingReviewCount > 0 && (
            <button
              onClick={onOpenReviewInbox}
              className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500 text-white rounded-md font-medium hover:bg-amber-600 transition-colors shadow-2xs animate-pulse"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{pendingReviewCount} Tasks Need Approval</span>
            </button>
          )}

          <button
            onClick={() => onNewTask(selectedProjectId === 'all' ? projects[0]?.id : selectedProjectId, null)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-zinc-900 text-white rounded-md font-medium hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Main Split Screen Area: Left Master Backlog, Right Intern Queues */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-px bg-zinc-200 overflow-hidden">
        {/* LEFT COLUMN: Master Backlog (4 cols on desktop) */}
        <div
          onDragOver={(e) => handleDragOver(e, 'backlog')}
          onDragLeave={handleDragLeave}
          onDrop={handleDropOnBacklog}
          className={`md:col-span-4 bg-zinc-50 flex flex-col h-full overflow-hidden transition-colors ${
            dragOverTarget === 'backlog' ? 'bg-zinc-200/60 ring-2 ring-zinc-400' : ''
          }`}
        >
          {/* Backlog Column Header */}
          <div className="p-4 bg-white border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-zinc-600" />
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider font-mono">
                Master Backlog
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                {backlogTasks.length}
              </span>
            </div>

            <span className="text-[11px] text-zinc-400 font-mono">
              Unassigned Pool
            </span>
          </div>

          <div className="px-4 py-2 bg-zinc-100/70 border-b border-zinc-200 text-[11px] text-zinc-500 font-mono">
            Drag card to an intern column on the right to assign
          </div>

          {/* Backlog Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {backlogTasks.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-zinc-200 rounded-xl p-6">
                <CheckCircle2 className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-zinc-600">Backlog is empty!</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">All tasks have been dispatched to interns.</p>
                <button
                  onClick={() => onNewTask(selectedProjectId === 'all' ? projects[0]?.id : selectedProjectId, null)}
                  className="mt-3 text-xs text-zinc-900 font-semibold hover:underline"
                >
                  + Add task to backlog
                </button>
              </div>
            ) : (
              backlogTasks.map(task => {
                const project = projects.find(p => p.id === task.projectId);

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="p-3.5 bg-white border border-zinc-200 rounded-xl shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all cursor-grab active:cursor-grabbing space-y-2.5 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        {project && (
                          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-500 block truncate">
                            {project.company}
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-zinc-900 leading-snug">
                          {task.title}
                        </h4>
                      </div>
                      {getPriorityBadge(task.priority)}
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-zinc-500 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-100">
                      <span className="font-mono text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600">
                        {task.phase}
                      </span>
                      <span className="flex items-center space-x-1 font-mono text-[10px]">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>Due {formatFriendlyDate(task.dueDate)}</span>
                      </span>
                    </div>

                    {/* Quick Assign Dropdown */}
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400">Assign to:</span>
                      <div className="flex items-center space-x-1">
                        {interns.map(intern => (
                          <button
                            key={intern.id}
                            onClick={() => onMoveTaskToIntern(task.id, intern.id)}
                            title={`Assign to ${intern.name}`}
                            className="px-2 py-0.5 text-[10px] font-medium bg-zinc-50 hover:bg-zinc-900 hover:text-white border border-zinc-200 rounded transition-colors"
                          >
                            {intern.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMNS: Intern Daily Queues (8 cols on desktop, divided among interns) */}
        <div className="md:col-span-8 bg-zinc-100 flex flex-col h-full overflow-hidden">
          <div className="p-4 bg-white border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-zinc-600" />
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider font-mono">
                Intern Daily Queues & Execution Pipelines
              </h2>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              Drag & Drop Tasks to Assign or Re-assign
            </span>
          </div>

          {/* Interns Column Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-200 overflow-y-auto">
            {interns.map((intern) => {
              const internTasks = filteredTasks.filter(t => t.assignedInternId === intern.id);
              const activeCount = internTasks.filter(t => t.state !== 'completed').length;
              const isOverCapacity = activeCount > intern.dailyCapacity;

              return (
                <div
                  key={intern.id}
                  onDragOver={(e) => handleDragOver(e, intern.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDropOnIntern(e, intern.id)}
                  className={`bg-zinc-50 flex flex-col h-full transition-colors ${
                    dragOverTarget === intern.id ? 'bg-zinc-200/80 ring-2 ring-zinc-900' : ''
                  }`}
                >
                  {/* Intern Header & Capacity Tracker */}
                  <div className="p-3.5 bg-white border-b border-zinc-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center font-mono font-bold text-xs">
                          {intern.avatar}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-zinc-900 leading-tight">
                            {intern.name}
                          </h3>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {intern.role}
                          </span>
                        </div>
                      </div>

                      {/* Capacity badge */}
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isOverCapacity 
                          ? 'bg-red-100 text-red-800' 
                          : activeCount === intern.dailyCapacity 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-zinc-100 text-zinc-700'
                      }`}>
                        {activeCount} / {intern.dailyCapacity} tasks
                      </span>
                    </div>

                    {/* Capacity bar */}
                    <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${isOverCapacity ? 'bg-red-500' : 'bg-zinc-800'}`}
                        style={{ width: `${Math.min(100, (activeCount / intern.dailyCapacity) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Tasks in Intern Queue */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
                    {internTasks.length === 0 ? (
                      <div className="py-12 text-center border border-dashed border-zinc-200 rounded-lg p-4">
                        <p className="text-xs text-zinc-400 font-medium">Queue is empty</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Drag tasks here from backlog</p>
                      </div>
                    ) : (
                      internTasks.map(task => {
                        const project = projects.find(p => p.id === task.projectId);

                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            className="p-3 bg-white border border-zinc-200 rounded-lg shadow-2xs hover:border-zinc-300 transition-all space-y-2 cursor-grab active:cursor-grabbing"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="flex-1">
                                {project && (
                                  <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 block truncate">
                                    {project.company}
                                  </span>
                                )}
                                <h4 className="text-xs font-bold text-zinc-900 leading-snug">
                                  {task.title}
                                </h4>
                              </div>
                              {getPriorityBadge(task.priority)}
                            </div>

                            {/* Task 4-State Pipeline Selector */}
                            <div className="pt-1 border-t border-zinc-100 flex items-center justify-between gap-2">
                              <select
                                value={task.state}
                                onChange={(e) => onUpdateTaskState(task.id, e.target.value as TaskState)}
                                className={`text-[10px] font-mono rounded px-2 py-0.5 border focus:outline-none ${getStateColor(task.state)}`}
                              >
                                <option value="not_started">Not Started</option>
                                <option value="in_progress">In Progress</option>
                                <option value="ready_for_review">Ready for Review ⚠️</option>
                                <option value="completed">Completed ✓</option>
                              </select>

                              {/* Unassign back to backlog button */}
                              <button
                                onClick={() => onMoveTaskToIntern(task.id, null)}
                                title="Return to Backlog"
                                className="text-[10px] font-mono text-zinc-400 hover:text-zinc-800 transition-colors"
                              >
                                Return
                              </button>
                            </div>

                            {/* If in Review state, show alert */}
                            {task.state === 'ready_for_review' && (
                              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-900 flex items-center justify-between">
                                <span>Awaiting admin approval</span>
                                <button
                                  onClick={onOpenReviewInbox}
                                  className="underline font-bold"
                                >
                                  Review
                                </button>
                              </div>
                            )}

                            {/* Card Footer with Due Date & Edit */}
                            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1">
                              <span>Due {formatFriendlyDate(task.dueDate)}</span>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => onEditTask(task)}
                                  className="p-1 hover:text-zinc-900"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => onDeleteTask(task.id)}
                                  className="p-1 hover:text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
