export type TaskState = 'not_started' | 'in_progress' | 'ready_for_review' | 'completed';
export interface TaskComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface ChecklistTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedInternId: string | null; // null means in Master Backlog
  state: TaskState;
  dueDate: string; // YYYY-MM-DD, the day the intern should do it
  reviewNotes?: string; // legacy, kept so old saved data still loads
  submittedAt?: string;
  comments?: TaskComment[];
  completedAt?: string;
  createdAt: string;
}

export type InternRole = 'Lead Intern' | 'Technical Intern' | 'Logistics Intern' | 'Assistant Trainer';

export interface Intern {
  id: string;
  name: string;
  email: string;
  role: InternRole;
  avatar: string;
  phone: string;
  skills: string[];
  status: 'active' | 'away';
}

export type ProjectKind = 'training' | 'team_building';

export interface TrainingProject {
  id: string;
  kind?: ProjectKind; // missing = 'training'
  name: string;
  dDay: string; // YYYY-MM-DD, first day of the event
  endDate?: string; // YYYY-MM-DD, last day for multi-day events
  company: string;
  slogan: string;
  provider: string;
  storageUrl: string;
  evaluationQrCode: string; // URL or data URL
  location: string;
  attendeesCount: number;
  notes?: string;
  links?: EventLink[]; // registration forms, slides, survey, etc.
  status: 'upcoming' | 'in_progress' | 'completed' | 'archived';
  createdAt: string;
}

export interface ProjectHealthMetrics {
  daysUntilDDay: number;
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  completionPercentage: number;
  healthScore: number; // Days until D-Day / Remaining Tasks
  urgencyLevel: 'critical' | 'urgent' | 'moderate' | 'healthy' | 'completed';
}

export interface EventLink {
  label: string;
  url: string;
}

export type EventColor =
  | 'sky' | 'violet' | 'teal' | 'rose' | 'slate' | 'amber'
  | 'emerald' | 'indigo' | 'orange' | 'fuchsia' | 'lime' | 'cyan';

// User-managed event type (Meeting, Travel, ...)
export interface EventType {
  id: string;
  label: string;
  color: EventColor;
}

export type EventCategory = string; // EventType id

// Any non-training calendar event (meetings, reminders, travel, ...)
export interface Meeting {
  id: string;
  title: string;
  category?: EventCategory; // EventType id; missing = 'meeting'
  date: string; // YYYY-MM-DD, first day
  endDate?: string; // YYYY-MM-DD, last day for multi-day all-day events
  allDay: boolean;
  startTime?: string; // HH:MM, when not all-day
  endTime?: string; // HH:MM
  location?: string;
  notes?: string;
  createdAt: string;
}
