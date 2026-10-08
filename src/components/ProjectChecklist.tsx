import React, { useState } from 'react';
import { Plus, MessageSquare, ChevronDown, ChevronRight, Pencil, Send } from 'lucide-react';
import { ChecklistTask, Intern } from '../types';
import { formatFriendlyDate } from '../utils/date';

interface ProjectChecklistProps {
  projectId: string;
  tasks: ChecklistTask[]; // this project's tasks only
  interns: Intern[];
  onQuickAddTask: (projectId: string, title: string, description: string, internId: string | null, dueDate: string) => void;
  onToggleDone: (task: ChecklistTask) => void;
  onEditTask: (task: ChecklistTask) => void;
  onAddComment: (taskId: string, author: string, text: string) => void;
}

export const ProjectChecklist: React.FC<ProjectChecklistProps> = ({
  projectId,
  tasks,
  interns,
  onQuickAddTask,
  onToggleDone,
  onEditTask,
  onAddComment,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [internId, setInternId] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [internFilter, setInternFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('Admin');

  const internName = (id: string | null) => interns.find(i => i.id === id)?.name.split(' ')[0];

  const visible = tasks.filter(t =>
    internFilter === 'all' ||
    (internFilter === 'unassigned' ? !t.assignedInternId : t.assignedInternId === internFilter)
  );
  const open = visible.filter(t => t.state !== 'completed').sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const done = visible.filter(t => t.state === 'completed');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onQuickAddTask(projectId, title.trim(), description.trim(), internId || null, dueDate);
    setTitle('');
    setDescription('');
  };

  const handleComment = (e: React.FormEvent, taskId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(taskId, commentAuthor, commentText.trim());
    setCommentText('');
  };

  const renderTask = (task: ChecklistTask) => {
    const isDone = task.state === 'completed';
    const comments = task.comments || [];
    const commentsOpen = openCommentsId === task.id;

    return (
      <div key={task.id} className="bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors">
        <div className="flex items-start gap-2.5 p-2.5">
          <input
            type="checkbox"
            checked={isDone}
            onChange={() => onToggleDone(task)}
            className="mt-0.5 w-4 h-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer shrink-0"
            title={isDone ? 'Mark as not done' : 'Mark as done'}
          />

          <div className="flex-1 min-w-0">
            <span className={`text-xs font-semibold block leading-tight ${isDone ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
              {task.title}
            </span>
            {task.description && (
              <span className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5 block">{task.description}</span>
            )}
            <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-zinc-500">
              <span>{internName(task.assignedInternId) ?? 'Unassigned'}</span>
              <span>{formatFriendlyDate(task.dueDate)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setOpenCommentsId(commentsOpen ? null : task.id)}
              className={`flex items-center gap-0.5 px-1.5 py-1 rounded text-[10px] font-mono transition-colors ${
                commentsOpen ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100'
              }`}
              title="Comments"
            >
              <MessageSquare className="w-3 h-3" />
              {comments.length > 0 && <span>{comments.length}</span>}
            </button>
            <button
              onClick={() => onEditTask(task)}
              className="p-1 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
              title="Edit details"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        </div>

        {commentsOpen && (
          <div className="border-t border-zinc-100 bg-zinc-50/60 p-2.5 space-y-2">
            {comments.length === 0 ? (
              <p className="text-[11px] text-zinc-400">No comments yet.</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="text-[11px]">
                  <span className="font-semibold text-zinc-800">{c.author}</span>
                  <span className="text-zinc-400 font-mono ml-1.5">
                    {new Date(c.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <p className="text-zinc-700 whitespace-pre-wrap">{c.text}</p>
                </div>
              ))
            )}

            <form onSubmit={(e) => handleComment(e, task.id)} className="flex items-center gap-1.5">
              <select
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="text-[11px] bg-white border border-zinc-200 rounded px-1.5 py-1 text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="Admin">Admin</option>
                {interns.map(i => <option key={i.id} value={i.name}>{i.name.split(' ')[0]}</option>)}
              </select>
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 min-w-0 text-[11px] bg-white border border-zinc-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
              <button type="submit" className="p-1.5 rounded bg-zinc-900 text-white hover:bg-zinc-800" title="Post comment">
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Header + intern filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Checklist</span>
          <span className="px-1.5 rounded text-[10px] font-mono bg-zinc-100 text-zinc-600 font-bold">
            {tasks.filter(t => t.state === 'completed').length}/{tasks.length}
          </span>
        </div>
        <select
          value={internFilter}
          onChange={(e) => setInternFilter(e.target.value)}
          className="text-[11px] bg-zinc-50 border border-zinc-200 rounded px-2 py-0.5 text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        >
          <option value="all">All interns</option>
          <option value="unassigned">Unassigned</option>
          {interns.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </div>

      {/* Quick-add row */}
      <form onSubmit={handleAdd} className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1.5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task..."
          className="w-full text-xs bg-white border border-zinc-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        />
        {title.trim() && (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full text-[11px] bg-white border border-zinc-200 rounded px-2.5 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        )}
        <div className="flex items-center gap-1.5">
          <select
            value={internId}
            onChange={(e) => setInternId(e.target.value)}
            className="flex-1 min-w-0 text-[11px] bg-white border border-zinc-200 rounded px-1.5 py-1 text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          >
            <option value="">Unassigned</option>
            {interns.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="text-[11px] bg-white border border-zinc-200 rounded px-1.5 py-1 text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 text-white rounded text-[11px] font-medium hover:bg-zinc-800 disabled:opacity-40 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Open tasks, earliest task date first */}
      <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
        {open.length === 0 && (
          <p className="py-4 text-center text-xs text-zinc-400">Nothing left to do here.</p>
        )}

        {open.map(renderTask)}

        {/* Completed, collapsible */}
        {done.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => setShowCompleted(v => !v)}
              className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 hover:text-zinc-800"
            >
              {showCompleted ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Completed ({done.length})</span>
            </button>
            {showCompleted && done.map(renderTask)}
          </div>
        )}
      </div>
    </div>
  );
};
