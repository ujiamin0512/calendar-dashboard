import { ChecklistTask, ProjectHealthMetrics, TrainingProject } from '../types';

/**
 * Calculates days remaining until D-Day from a target date string (YYYY-MM-DD).
 * Negative means days past D-Day.
 */
export function calculateDaysUntilDDay(dDayString: string, referenceDate: Date = new Date()): number {
  if (!dDayString) return 0;
  const [year, month, day] = dDayString.split('-').map(Number);
  const target = new Date(year, month - 1, day, 0, 0, 0);
  const current = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), 0, 0, 0);
  
  const diffTime = target.getTime() - current.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates Algorithmic Health Score:
 * Formula: Days until D-Day ÷ Remaining Tasks
 * 
 * Rules:
 * - If remaining tasks is 0 -> Health Score is treated as infinity (100% complete)
 * - If days until D-Day is negative or 0 and remaining tasks > 0 -> Health score is <= 0 (Critical urgent)
 * - Lowest scores are most urgent and pinned to the top.
 */
export function calculateProjectHealth(
  project: TrainingProject,
  tasks: ChecklistTask[]
): ProjectHealthMetrics {
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(t => t.state === 'completed').length;
  const remainingTasks = totalTasks - completedTasks;
  const daysUntilDDay = calculateDaysUntilDDay(project.dDay);

  // No tasks yet = nothing done (not "100% complete")
  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  let healthScore: number;
  let urgencyLevel: ProjectHealthMetrics['urgencyLevel'];

  if (totalTasks === 0) {
    healthScore = 999;
    urgencyLevel = 'healthy';
  } else if (remainingTasks === 0) {
    healthScore = 999;
    urgencyLevel = 'completed';
  } else if (daysUntilDDay <= 0) {
    // Past or at D-Day with unfinished tasks!
    healthScore = daysUntilDDay <= 0 ? (daysUntilDDay === 0 ? 0 : daysUntilDDay) : 0;
    urgencyLevel = 'critical';
  } else {
    healthScore = Number((daysUntilDDay / remainingTasks).toFixed(2));
    if (healthScore < 1.0) {
      urgencyLevel = 'critical';
    } else if (healthScore < 2.0) {
      urgencyLevel = 'urgent';
    } else if (healthScore < 4.0) {
      urgencyLevel = 'moderate';
    } else {
      urgencyLevel = 'healthy';
    }
  }

  return {
    daysUntilDDay,
    totalTasks,
    completedTasks,
    remainingTasks,
    completionPercentage,
    healthScore,
    urgencyLevel,
  };
}

/**
 * Returns month calendar matrix for minimalist Google Calendar style view
 */
export function getCalendarGrid(year: number, month: number) {
  // month: 0-indexed (0 = Jan)
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  // Days from previous month to fill the first row
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const calendarCells = [];

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    calendarCells.push({
      date: new Date(y, m, d),
      dateString: formatDateString(y, m + 1, d),
      dayNumber: d,
      isCurrentMonth: false,
    });
  }

  // Days in current month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({
      date: new Date(year, month, d),
      dateString: formatDateString(year, month + 1, d),
      dayNumber: d,
      isCurrentMonth: true,
    });
  }

  // Days from next month to complete standard 35 or 42 cell grid
  const remainingCells = 35 - calendarCells.length;
  const targetTotal = remainingCells >= 0 ? 35 : 42;
  const nextMonthCells = targetTotal - calendarCells.length;

  for (let d = 1; d <= nextMonthCells; d++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    calendarCells.push({
      date: new Date(y, m, d),
      dateString: formatDateString(y, m + 1, d),
      dayNumber: d,
      isCurrentMonth: false,
    });
  }

  return calendarCells;
}

export function formatDateString(year: number, month: number, day: number): string {
  const m = month.toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// "Oct 22, 2026" or "Oct 22 – Oct 24, 2026" for multi-day events
export function formatProjectDates(project: { dDay: string; endDate?: string }): string {
  if (!project.endDate || project.endDate <= project.dDay) return formatFriendlyDate(project.dDay);
  const start = formatFriendlyDate(project.dDay).replace(/, \d{4}$/, '');
  return `${start} – ${formatFriendlyDate(project.endDate)}`;
}

// 1-based day number of the event on `date`, or 0 if the event isn't on that date
export function eventDayOn(project: { dDay: string; endDate?: string }, date: string): number {
  const end = project.endDate && project.endDate > project.dDay ? project.endDate : project.dDay;
  if (date < project.dDay || date > end) return 0;
  return calculateDaysUntilDDay(date, new Date(project.dDay + 'T00:00:00')) + 1;
}

export function eventLength(project: { dDay: string; endDate?: string }): number {
  return project.endDate && project.endDate > project.dDay ? eventDayOn(project, project.endDate) : 1;
}
