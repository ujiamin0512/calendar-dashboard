import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { ProjectListView } from './components/ProjectListView';
import { AdminDispatcher } from './components/AdminDispatcher';
import { SlideOutPanel } from './components/SlideOutPanel';
import { ProjectModal } from './components/ProjectModal';
import { TaskModal } from './components/TaskModal';
import { InternModal } from './components/InternModal';
import { AdminReviewModal } from './components/AdminReviewModal';
import { NeonSqlModal } from './components/NeonSqlModal';
import { QrCodeModal } from './components/QrCodeModal';
import { FloatingActionButton } from './components/FloatingActionButton';
import { INITIAL_PROJECTS, INITIAL_INTERNS, INITIAL_TASKS } from './data/initialData';
import { TrainingProject, Intern, ChecklistTask, TaskState } from './types';
import { RotateCcw } from 'lucide-react';

export default function App() {
  // State with LocalStorage Persistence
  const [projects, setProjects] = useState<TrainingProject[]>(() => {
    try {
      const saved = localStorage.getItem('trainer_hub_projects');
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [interns, setInterns] = useState<Intern[]>(() => {
    try {
      const saved = localStorage.getItem('trainer_hub_interns');
      return saved ? JSON.parse(saved) : INITIAL_INTERNS;
    } catch {
      return INITIAL_INTERNS;
    }
  });

  const [tasks, setTasks] = useState<ChecklistTask[]>(() => {
    try {
      const saved = localStorage.getItem('trainer_hub_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  // Views & Navigation
  const [currentView, setCurrentView] = useState<'calendar' | 'projects' | 'dispatcher' | 'neon-schema'>('calendar');

  // Slide-out Drawer Panel State
  const [selectedSlideProject, setSelectedSlideProject] = useState<TrainingProject | null>(null);
  const [isSlideOpen, setIsSlideOpen] = useState(false);

  // Modals
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<TrainingProject | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ChecklistTask | null>(null);
  const [taskModalDefaults, setTaskModalDefaults] = useState<{ projectId?: string; internId?: string | null }>({});

  const [internModalOpen, setInternModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [qrModalProject, setQrModalProject] = useState<TrainingProject | null>(null);

  // Dispatcher Project Filter
  const [dispatcherProjectId, setDispatcherProjectId] = useState<string | 'all'>('all');

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('trainer_hub_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('trainer_hub_interns', JSON.stringify(interns));
  }, [interns]);

  useEffect(() => {
    localStorage.setItem('trainer_hub_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Pending reviews
  const pendingReviewCount = tasks.filter(t => t.state === 'ready_for_review').length;

  // Reset sample data helper
  const handleResetData = () => {
    if (confirm('Reset all projects, interns, and checklist tasks to original demo values?')) {
      setProjects(INITIAL_PROJECTS);
      setInterns(INITIAL_INTERNS);
      setTasks(INITIAL_TASKS);
      localStorage.clear();
    }
  };

  // --- CRUD: Projects ---
  const handleOpenNewProject = (defaultDate?: string) => {
    setEditingProject(null);
    setModalDefaultDate(defaultDate);
    setProjectModalOpen(true);
  };

  const handleEditProject = (project: TrainingProject) => {
    setEditingProject(project);
    setProjectModalOpen(true);
  };

  const handleSaveProject = (formData: Partial<TrainingProject>) => {
    if (editingProject) {
      setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...formData } as TrainingProject : p));
      if (selectedSlideProject?.id === editingProject.id) {
        setSelectedSlideProject(prev => prev ? { ...prev, ...formData } as TrainingProject : null);
      }
    } else {
      const newProj: TrainingProject = {
        id: `proj-${Date.now()}`,
        name: formData.name || 'Untitled Project',
        dDay: formData.dDay || new Date().toISOString().slice(0, 10),
        company: formData.company || 'Client',
        slogan: formData.slogan || '',
        provider: formData.provider || 'Apex Academy',
        storageUrl: formData.storageUrl || '',
        evaluationQrCode: formData.evaluationQrCode || '',
        location: formData.location || 'Main Training Hall',
        attendeesCount: formData.attendeesCount || 30,
        status: 'in_progress',
        createdAt: new Date().toISOString(),
      };
      setProjects(prev => [newProj, ...prev]);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project and all its tasks?')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setTasks(prev => prev.filter(t => t.projectId !== projectId));
      if (selectedSlideProject?.id === projectId) {
        setIsSlideOpen(false);
      }
    }
  };

  // --- CRUD: Interns ---
  const handleAddIntern = (newInternData: Omit<Intern, 'id'>) => {
    const newIntern: Intern = {
      ...newInternData,
      id: `intern-${Date.now()}`,
    };
    setInterns(prev => [...prev, newIntern]);
  };

  const handleUpdateIntern = (id: string, updatedData: Partial<Intern>) => {
    setInterns(prev => prev.map(i => i.id === id ? { ...i, ...updatedData } : i));
  };

  const handleDeleteIntern = (internId: string) => {
    // Reassign their active tasks back to Master Backlog
    setTasks(prev => prev.map(t => t.assignedInternId === internId ? { ...t, assignedInternId: null } : t));
    setInterns(prev => prev.filter(i => i.id !== internId));
  };

  // --- CRUD: Tasks ---
  const handleOpenNewTask = (defaultProjectId?: string, defaultInternId?: string | null) => {
    setEditingTask(null);
    setTaskModalDefaults({ projectId: defaultProjectId, internId: defaultInternId });
    setTaskModalOpen(true);
  };

  const handleEditTask = (task: ChecklistTask) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = (formData: Partial<ChecklistTask>) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { 
        ...t, 
        ...formData,
        completedAt: formData.state === 'completed' && !t.completedAt ? new Date().toISOString() : t.completedAt
      } as ChecklistTask : t));
    } else {
      const newTask: ChecklistTask = {
        id: `task-${Date.now()}`,
        projectId: formData.projectId || projects[0]?.id || '',
        title: formData.title || 'New Task',
        description: formData.description || '',
        assignedInternId: formData.assignedInternId ?? null,
        state: formData.state || 'not_started',
        priority: formData.priority || 'medium',
        phase: formData.phase || 'Curriculum & Slides',
        dueDate: formData.dueDate || new Date().toISOString().slice(0, 10),
        estimatedMinutes: formData.estimatedMinutes || 60,
        reviewNotes: formData.reviewNotes || '',
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleMoveTaskToIntern = (taskId: string, internId: string | null) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignedInternId: internId } : t));
  };

  const handleUpdateTaskState = (taskId: string, newState: TaskState) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          state: newState,
          completedAt: newState === 'completed' ? new Date().toISOString() : undefined,
          submittedAt: newState === 'ready_for_review' ? new Date().toISOString() : undefined,
        };
      }
      return t;
    }));
  };

  // Review Approvals
  const handleApproveTask = (taskId: string) => {
    handleUpdateTaskState(taskId, 'completed');
  };

  const handleRejectTask = (taskId: string, feedback: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          state: 'in_progress',
          reviewNotes: feedback,
        };
      }
      return t;
    }));
  };

  const handleOpenDispatcherForProject = (projectId: string) => {
    setDispatcherProjectId(projectId);
    setCurrentView('dispatcher');
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans antialiased selection:bg-zinc-900 selection:text-white">
      {/* Minimalist Navigation Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        pendingReviewCount={pendingReviewCount}
        onOpenReviewInbox={() => setReviewModalOpen(true)}
        onOpenInternsModal={() => setInternModalOpen(true)}
        onQuickAdd={() => handleOpenNewProject()}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {currentView === 'calendar' && (
          <CalendarView
            projects={projects}
            tasks={tasks}
            onSelectProject={(project) => {
              setSelectedSlideProject(project);
              setIsSlideOpen(true);
            }}
            onQuickAddDate={(dateStr) => handleOpenNewProject(dateStr)}
          />
        )}

        {currentView === 'projects' && (
          <ProjectListView
            projects={projects}
            tasks={tasks}
            onSelectProject={(project) => {
              setSelectedSlideProject(project);
              setIsSlideOpen(true);
            }}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            onNewProject={() => handleOpenNewProject()}
            onOpenDispatcherForProject={handleOpenDispatcherForProject}
            onViewQrCode={(project) => setQrModalProject(project)}
          />
        )}

        {currentView === 'dispatcher' && (
          <AdminDispatcher
            projects={projects}
            interns={interns}
            tasks={tasks}
            selectedProjectId={dispatcherProjectId}
            onSelectProjectFilter={setDispatcherProjectId}
            onMoveTaskToIntern={handleMoveTaskToIntern}
            onUpdateTaskState={handleUpdateTaskState}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onNewTask={handleOpenNewTask}
            onOpenReviewInbox={() => setReviewModalOpen(true)}
          />
        )}

        {currentView === 'neon-schema' && (
          <NeonSqlModal />
        )}
      </main>

      {/* Floating Action Button (Speed dial) */}
      <FloatingActionButton
        onAddProject={() => handleOpenNewProject()}
        onAddTask={() => handleOpenNewTask()}
        onAddIntern={() => setInternModalOpen(true)}
      />

      {/* Slide-out Panel for Project Inspection */}
      <SlideOutPanel
        project={selectedSlideProject}
        tasks={tasks}
        interns={interns}
        isOpen={isSlideOpen}
        onClose={() => setIsSlideOpen(false)}
        onEditProject={(proj) => {
          setIsSlideOpen(false);
          handleEditProject(proj);
        }}
        onOpenDispatcherForProject={handleOpenDispatcherForProject}
        onAddTask={(projId) => handleOpenNewTask(projId)}
        onUpdateTaskState={handleUpdateTaskState}
      />

      {/* Modals */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSave={handleSaveProject}
        initialProject={editingProject}
        defaultDate={modalDefaultDate}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        projects={projects}
        interns={interns}
        initialTask={editingTask}
        defaultProjectId={taskModalDefaults.projectId}
        defaultInternId={taskModalDefaults.internId}
      />

      <InternModal
        isOpen={internModalOpen}
        onClose={() => setInternModalOpen(false)}
        interns={interns}
        onAddIntern={handleAddIntern}
        onUpdateIntern={handleUpdateIntern}
        onDeleteIntern={handleDeleteIntern}
      />

      <AdminReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        tasks={tasks}
        interns={interns}
        projects={projects}
        onApproveTask={handleApproveTask}
        onRejectTask={handleRejectTask}
      />

      <QrCodeModal
        project={qrModalProject}
        isOpen={Boolean(qrModalProject)}
        onClose={() => setQrModalProject(null)}
      />

      {/* Subtle Demo Utilities Bar */}
      <footer className="bg-white border-t border-zinc-200 py-1.5 px-4 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Trainer Command Engine</span>
          <span>•</span>
          <span>Auto-calculating Health Scores in real-time</span>
        </div>

        <button
          onClick={handleResetData}
          className="hover:text-zinc-700 flex items-center space-x-1 transition-colors"
          title="Restore original sample data"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Sample Data</span>
        </button>
      </footer>
    </div>
  );
}
