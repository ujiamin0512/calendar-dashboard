export type TaskState = 'not_started' | 'in_progress' | 'ready_for_review' | 'completed';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskPhase = 
  | 'Curriculum & Slides' 
  | 'Logistics & Venue' 
  | 'Tech & AV Setup' 
  | 'Printouts & Badges' 
  | 'Post-Event Survey';

export interface ChecklistTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedInternId: string | null; // null means in Master Backlog
  state: TaskState;
  priority: TaskPriority;
  phase: TaskPhase;
  dueDate: string; // YYYY-MM-DD
  estimatedMinutes?: number;
  reviewNotes?: string;
  submittedAt?: string;
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
  dailyCapacity: number; // max tasks recommended
  skills: string[];
  status: 'active' | 'away';
}

export interface TrainingProject {
  id: string;
  name: string;
  dDay: string; // YYYY-MM-DD
  company: string;
  slogan: string;
  provider: string;
  storageUrl: string;
  evaluationQrCode: string; // URL or data URL
  location: string;
  attendeesCount: number;
  notes?: string;
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
