import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, Plus, Filter, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { TrainingProject, ChecklistTask } from '../types';
import { 
  getCalendarGrid, MONTH_NAMES, WEEKDAY_NAMES, 
  calculateProjectHealth, formatDateString 
} from '../utils/date';

interface CalendarViewProps {
  projects: TrainingProject[];
  tasks: ChecklistTask[];
  onSelectProject: (project: TrainingProject) => void;
  onQuickAddDate: (dateString: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  projects,
  tasks,
  onSelectProject,
  onQuickAddDate,
}) => {
  // Today's date reference
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [filterUrgentOnly, setFilterUrgentOnly] = useState<boolean>(false);

  const calendarDays = getCalendarGrid(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const todayString = formatDateString(today.getFullYear(), today.getMonth() + 1, today.getDate());

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-4.1rem)] bg-white overflow-hidden">
      {/* Calendar Toolbar */}
      <div className="px-6 py-3.5 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/70">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-md hover:bg-zinc-200/70 text-zinc-600 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-md hover:bg-zinc-200/70 text-zinc-600 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleGoToday}
            className="px-3 py-1 bg-white border border-zinc-200 rounded-md text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-2xs"
          >
            Today
          </button>

          <h1 className="text-lg font-bold text-zinc-900 tracking-tight font-sans">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h1>
        </div>

        {/* Filters and legend */}
        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => setFilterUrgentOnly(!filterUrgentOnly)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md border transition-colors ${
              filterUrgentOnly
                ? 'bg-red-50 border-red-300 text-red-700 font-medium'
                : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Urgent D-Days Only</span>
          </button>

          <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-zinc-200 text-zinc-500 font-mono text-[11px]">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-red-500 inline-block"></span>
              <span>D-Day &lt; 3 Days</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block"></span>
              <span>D-Day &lt; 7 Days</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-zinc-800 inline-block"></span>
              <span>Upcoming</span>
            </span>
          </div>
        </div>
      </div>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50/50 text-[11px] font-mono font-medium text-zinc-500 text-center py-2">
        {WEEKDAY_NAMES.map((name, i) => (
          <div key={name} className={i === 0 || i === 6 ? 'text-zinc-400' : 'text-zinc-700'}>
            {name}
          </div>
        ))}
      </div>

      {/* Calendar Grid - 35 or 42 cells */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-zinc-200 gap-px overflow-y-auto">
        {calendarDays.map((cell) => {
          const isToday = cell.dateString === todayString;
          
          // Projects on this date
          let dayProjects = projects.filter(p => p.dDay === cell.dateString);
          if (filterUrgentOnly) {
            dayProjects = dayProjects.filter(p => {
              const m = calculateProjectHealth(p, tasks);
              return m.urgencyLevel === 'critical' || m.urgencyLevel === 'urgent';
            });
          }

          // Tasks due on this date
          const dayTasks = tasks.filter(t => t.dueDate === cell.dateString && t.state !== 'completed');

          return (
            <div
              key={cell.dateString}
              onClick={() => onQuickAddDate(cell.dateString)}
              className={`bg-white p-2 min-h-[95px] flex flex-col justify-between group transition-colors hover:bg-zinc-50/70 cursor-pointer ${
                !cell.isCurrentMonth ? 'bg-zinc-50/40 text-zinc-400' : 'text-zinc-800'
              } ${isToday ? 'ring-1 ring-inset ring-zinc-900 bg-zinc-50/60' : ''}`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-mono font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                    isToday
                      ? 'bg-zinc-900 text-white font-bold'
                      : cell.isCurrentMonth
                      ? 'text-zinc-700'
                      : 'text-zinc-400'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {/* Day tasks indicator if any */}
                {dayTasks.length > 0 && (
                  <span 
                    title={`${dayTasks.length} task(s) due today`}
                    className="text-[10px] font-mono text-zinc-500 flex items-center space-x-0.5"
                  >
                    <Clock className="w-2.5 h-2.5 text-zinc-400" />
                    <span>{dayTasks.length}</span>
                  </span>
                )}
              </div>

              {/* Project Events & D-Day Blocks */}
              <div className="space-y-1.5 flex-1">
                {dayProjects.map(proj => {
                  const metrics = calculateProjectHealth(proj, tasks);
                  
                  // Color styling based on D-day countdown & urgency
                  const isCritical = metrics.daysUntilDDay <= 3;
                  const isUrgent = metrics.daysUntilDDay <= 7 && !isCritical;
                  
                  const blockBg = isCritical
                    ? 'bg-red-50 hover:bg-red-100 border-red-300 text-red-950'
                    : isUrgent
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-950'
                    : metrics.completionPercentage === 100
                    ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-950'
                    : 'bg-zinc-100 hover:bg-zinc-200/80 border-zinc-300 text-zinc-900';

                  const badgeBg = isCritical
                    ? 'bg-red-600 text-white'
                    : isUrgent
                    ? 'bg-amber-600 text-white'
                    : 'bg-zinc-800 text-white';

                  return (
                    <div
                      key={proj.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(proj);
                      }}
                      className={`px-2 py-1.5 rounded-md border text-left transition-all shadow-2xs cursor-pointer ${blockBg}`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-bold uppercase font-mono tracking-tight truncate">
                          {proj.company}
                        </span>
                        <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${badgeBg}`}>
                          {metrics.daysUntilDDay <= 0 
                            ? (metrics.daysUntilDDay === 0 ? 'D-DAY' : `D+${Math.abs(metrics.daysUntilDDay)}`) 
                            : `D-${metrics.daysUntilDDay}`}
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold tracking-tight truncate leading-tight">
                        {proj.name}
                      </div>

                      {/* Micro progress indicator */}
                      <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-zinc-600">
                        <span>{metrics.completedTasks}/{metrics.totalTasks} done</span>
                        <span>Score: {metrics.healthScore >= 999 ? '100%' : metrics.healthScore}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hover add trigger */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end pt-1">
                <span className="text-[10px] text-zinc-400 flex items-center space-x-0.5">
                  <Plus className="w-3 h-3" />
                  <span className="font-mono text-[9px]">Add</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
