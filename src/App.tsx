import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { ProjectListView } from './components/ProjectListView';
import { AdminDispatcher } from './components/AdminDispatcher';
import { SlideOutPanel } from './components/SlideOutPanel';
import { ProjectModal } from './components/ProjectModal';
import { TaskModal } from './components/TaskModal';
import { InternModal } from './components/InternModal';
import { QrCodeModal } from './components/QrCodeModal';
import { MeetingModal } from './components/MeetingModal';
import { EventTypesModal } from './components/EventTypesModal';
import { DEFAULT_EVENT_TYPES } from './utils/eventCategories';
import { withCalendarImport, markCalendarImported, withEventsImport, markEventsImported } from './data/calendarImport';
import { FloatingActionButton } from './components/FloatingActionButton';
import { INITIAL_INTERNS } from './data/initialData';

// Old demo projects (and their tasks) that may still be saved in a browser
const DEMO_PROJECT_IDS = ['proj-1', 'proj-2', 'proj-3'];
import { TrainingProject, Intern, ChecklistTask, TaskState, Meeting, EventCategory, EventType, ProjectKind } from './types';
import { RotateCcw } from 'lucide-react';

const buildProject = (data: Partial<TrainingProject>): TrainingProject => ({
  id: `proj-${Date.now()}`,
  kind: data.kind || 'training',
  name: data.name || 'Untitled Project',
  dDay: data.dDay || new Date().toISOString().slice(0, 10),
  endDate: data.endDate || undefined,
  company: data.company || '',
  slogan: data.slogan || '',
  provider: data.provider || '',
  storageUrl: data.storageUrl || '',
  links: data.links || [],
  evaluationQrCode: data.evaluationQrCode || '',
  location: data.location || '',
  attendeesCount: data.attendeesCount || 0,
  notes: data.notes || '',
  status: 'in_progress',
  createdAt: new Date().toISOString(),
});

const buildMeeting = (data: Partial<Meeting>): Meeting => ({
  id: `meet-${Date.now()}`,
  title: data.title || 'Event',
  category: data.category || 'meeting',
  date: data.date || new Date().toISOString().slice(0, 10),
  endDate: data.endDate,
  allDay: !!data.allDay,
  startTime: data.startTime,
  endTime: data.endTime,
  location: data.location || '',
  notes: data.notes || '',
  createdAt: new Date().toISOString(),
});

export default function App() {
  // State with LocalStorage Persistence
  const [projects, setProjects] = useState<TrainingProject[]>(() => {
    try {
      const saved = localStorage.getItem('trainer_hub_projects');
      const list: TrainingProject[] = saved ? JSON.parse(saved) : [];
      return withCalendarImport(list.filter(p => !DEMO_PROJECT_IDS.includes(p.id)));
    } catch {
      return withCalendarImport([]);
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
      const list: ChecklistTask[] = saved ? JSON.parse(saved) : [];
      return list.filter(t => !DEMO_PROJECT_IDS.includes(t.projectId));
    } catch {
      return [];
    }
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    try {
      const saved = localStorage.getItem('trainer_hub_meetings');
      return withEventsImport(saved ? JSON.parse(saved) : []);
    } catch {
      return withEventsImport([]);
    }
  });

  const [eventTypes, setEventTypes] = useState<EventType[]>(() => {
    try {
      const saved = localStorage.getItem('trainer_hub_event_types');
      return saved ? JSON.parse(saved) : DEFAULT_EVENT_TYPES;
    } catch {
      return DEFAULT_EVENT_TYPES;
    }
  });

  // Views & Navigation
  const [currentView, setCurrentView] = useState<'calendar' | 'projects' | 'dispatcher'>('calendar');

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
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [eventTypesOpen, setEventTypesOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [meetingDefaultDate, setMeetingDefaultDate] = useState<string | undefined>(undefined);
  const [meetingPrefill, setMeetingPrefill] = useState<Partial<Meeting> | undefined>(undefined);
  const [projectPrefill, setProjectPrefill] = useState<Partial<TrainingProject> | undefined>(undefined);
  const [qrModalProject, setQrModalProject] = useState<TrainingProject | null>(null);

  // Dispatcher Project Filter
  const [dispatcherProjectId, setDispatcherProjectId] = useState<string | 'all'>('all');

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('trainer_hub_projects', JSON.stringify(projects));
    markCalendarImported();
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('trainer_hub_interns', JSON.stringify(interns));
  }, [interns]);

  useEffect(() => {
    localStorage.setItem('trainer_hub_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('trainer_hub_meetings', JSON.stringify(meetings));
    markEventsImported();
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('trainer_hub_event_types', JSON.stringify(eventTypes));
  }, [eventTypes]);

  // Reset sample data helper
  const handleResetData = () => {
    if (confirm('Delete ALL projects, tasks and meetings you have added and start over with the imported calendar projects? This cannot be undone.')) {
      localStorage.clear();
      setProjects(withCalendarImport([]));
      setInterns(INITIAL_INTERNS);
      setTasks([]);
      setMeetings(withEventsImport([]));
      setEventTypes(DEFAULT_EVENT_TYPES);
    }
  };

  // --- CRUD: Projects ---
  const handleOpenNewProject = (defaultDate?: string) => {
    setEditingProject(null);
    setProjectPrefill(undefined);
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
      setProjects(prev => [buildProject(formData), ...prev]);
    }
  };

  // --- Converting between training projects and calendar events ---
  const handleSwitchProjectToEvent = (draft: Partial<TrainingProject>, category: EventCategory) => {
    const fields: Partial<Meeting> = {
      title: draft.name || '',
      category,
      date: draft.dDay,
      endDate: draft.endDate,
      allDay: true,
      location: draft.location || '',
      notes: [
        draft.company && `Client: ${draft.company}`,
        draft.notes,
        ...(draft.links || []).map(l => (l.label ? `${l.label}: ${l.url}` : l.url)),
      ].filter(Boolean).join('\n'),
    };
    setProjectModalOpen(false);
    if (editingProject) {
      const meeting = buildMeeting(fields);
      setMeetings(prev => [...prev, meeting]);
      setProjects(prev => prev.filter(p => p.id !== editingProject.id));
      setTasks(prev => prev.filter(t => t.projectId !== editingProject.id));
      if (selectedSlideProject?.id === editingProject.id) setIsSlideOpen(false);
      setEditingProject(null);
      setEditingMeeting(meeting);
    } else {
      setEditingMeeting(null);
      setMeetingPrefill(fields);
    }
    setMeetingModalOpen(true);
  };

  const handleSwitchEventToProject = (draft: Partial<Meeting>, kind: ProjectKind) => {
    const fields: Partial<TrainingProject> = {
      kind,
      name: draft.title || '',
      dDay: draft.date,
      endDate: draft.allDay ? draft.endDate : undefined,
      location: draft.location || '',
      notes: [!draft.allDay && draft.startTime && `Time: ${draft.startTime}–${draft.endTime}`, draft.notes].filter(Boolean).join('\n'),
    };
    setMeetingModalOpen(false);
    if (editingMeeting) {
      const project = buildProject(fields);
      setProjects(prev => [project, ...prev]);
      setMeetings(prev => prev.filter(m => m.id !== editingMeeting.id));
      setEditingMeeting(null);
      setEditingProject(project);
    } else {
      setEditingProject(null);
      setProjectPrefill(fields);
    }
    setProjectModalOpen(true);
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

  // --- CRUD: Meetings ---
  const handleOpenNewMeeting = (date?: string) => {
    setEditingMeeting(null);
    setMeetingPrefill(undefined);
    setMeetingDefaultDate(date);
    setMeetingModalOpen(true);
  };

  const handleSaveMeeting = (data: Partial<Meeting>) => {
    if (editingMeeting) {
      setMeetings(prev => prev.map(m => m.id === editingMeeting.id ? { ...m, ...data } as Meeting : m));
    } else {
      setMeetings(prev => [...prev, buildMeeting(data)]);
    }
  };

  // Events whose type was deleted move to the first remaining type
  const handleSaveEventTypes = (types: EventType[]) => {
    setEventTypes(types);
    setMeetings(prev => prev.map(m => (types.some(t => t.id === (m.category || 'meeting')) ? m : { ...m, category: types[0].id })));
  };

  const eventTypeUsage = meetings.reduce<Record<string, number>>((acc, m) => {
    const id = m.category || 'meeting';
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const handleDeleteMeeting = (meetingId: string) => {
    setMeetings(prev => prev.filter(m => m.id !== meetingId));
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
        dueDate: formData.dueDate || new Date().toISOString().slice(0, 10),
        comments: [],
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
        };
      }
      return t;
    }));
  };

  // Quick-add from a project's checklist
  const handleQuickAddTask = (projectId: string, title: string, description: string, internId: string | null, dueDate: string) => {
    const newTask: ChecklistTask = {
      id: `task-${Date.now()}`,
      projectId,
      title,
      description,
      assignedInternId: internId,
      state: 'not_started',
      dueDate,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleAddComment = (taskId: string, author: string, text: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      comments: [...(t.comments || []), { id: `c-${Date.now()}`, author, text, createdAt: new Date().toISOString() }],
    } : t));
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
            meetings={meetings}
            onAddMeeting={handleOpenNewMeeting}
            eventTypes={eventTypes}
            onManageEventTypes={() => setEventTypesOpen(true)}
            onSelectMeeting={(meeting) => {
              setEditingMeeting(meeting);
              setMeetingModalOpen(true);
            }}
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
          />
        )}
      </main>

      {/* Floating Action Button (Speed dial) */}
      <FloatingActionButton
        onAddProject={() => handleOpenNewProject()}
        onAddMeeting={() => handleOpenNewMeeting()}
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
        onUpdateTaskState={handleUpdateTaskState}
        onQuickAddTask={handleQuickAddTask}
        onEditTask={handleEditTask}
        onAddComment={handleAddComment}
      />

      {/* Modals */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSave={handleSaveProject}
        initialProject={editingProject}
        defaultDate={modalDefaultDate}
        prefill={projectPrefill}
        taskCount={editingProject ? tasks.filter(t => t.projectId === editingProject.id).length : 0}
        onSwitchToEvent={handleSwitchProjectToEvent}
        eventTypes={eventTypes}
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

      <MeetingModal
        isOpen={meetingModalOpen}
        onClose={() => setMeetingModalOpen(false)}
        onSave={handleSaveMeeting}
        onDelete={handleDeleteMeeting}
        initialMeeting={editingMeeting}
        defaultDate={meetingDefaultDate}
        prefill={meetingPrefill}
        onSwitchToProject={handleSwitchEventToProject}
        eventTypes={eventTypes}
        onManageTypes={() => setEventTypesOpen(true)}
      />

      <EventTypesModal
        isOpen={eventTypesOpen}
        onClose={() => setEventTypesOpen(false)}
        eventTypes={eventTypes}
        usage={eventTypeUsage}
        onSave={handleSaveEventTypes}
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
          title="Delete everything and start over"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All Data</span>
        </button>
      </footer>
    </div>
  );
}
