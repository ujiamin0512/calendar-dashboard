import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, Plus, Filter, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { TrainingProject, ChecklistTask, Meeting, EventType } from '../types';
import { styleOf } from '../utils/eventCategories';
import { 
  getCalendarGrid, MONTH_NAMES, WEEKDAY_NAMES, 
  calculateProjectHealth, formatDateString, eventLength, formatProjectDates 
} from '../utils/date';

interface CalendarViewProps {
  projects: TrainingProject[];
  tasks: ChecklistTask[];
  onSelectProject: (project: TrainingProject) => void;
  onQuickAddDate: (dateString: string) => void;
  meetings: Meeting[];
  onAddMeeting: (dateString: string) => void;
  onSelectMeeting: (meeting: Meeting) => void;
  eventTypes: EventType[];
  onManageEventTypes: () => void;
}

// "14:30" -> "2:30pm"
const formatTime = (t?: string) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''}${suffix}`;
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  projects,
  tasks,
  onSelectProject,
  onQuickAddDate,
  meetings,
  onAddMeeting,
  onSelectMeeting,
  eventTypes,
  onManageEventTypes,
}) => {
  // Today's date reference
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [filterUrgentOnly, setFilterUrgentOnly] = useState<boolean>(false);

  const calendarDays = getCalendarGrid(currentYear, currentMonth);
  const weeks = Array.from({ length: calendarDays.length / 7 }, (_, i) => calendarDays.slice(i * 7, i * 7 + 7));

  const projectEnd = (p: TrainingProject) => (p.endDate && p.endDate > p.dDay ? p.endDate : p.dDay);
  const visibleProjects = filterUrgentOnly
    ? projects.filter(p => {
        const m = calculateProjectHealth(p, tasks);
        return m.urgencyLevel === 'critical' || m.urgencyLevel === 'urgent';
      })
    : projects;

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

          <button
            onClick={onManageEventTypes}
            className="px-3 py-1 rounded-md border bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
            title="Add, rename, recolour or delete event types"
          >
            Event Types
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

      {/* Calendar Grid: one row per week, multi-day events span across days */}
      <div className="flex-1 flex flex-col bg-zinc-200 gap-px overflow-y-auto">
        {weeks.map((week) => {
          const weekStart = week[0].dateString;
          const weekEnd = week[6].dateString;
          const colOf = (date: string) => week.findIndex(c => c.dateString === date);

          // Event segments in this week, packed into lanes so they never overlap
          const segments = visibleProjects
            .filter(p => p.dDay <= weekEnd && projectEnd(p) >= weekStart)
            .map(p => {
              const segStart = p.dDay < weekStart ? weekStart : p.dDay;
              const segEnd = projectEnd(p) > weekEnd ? weekEnd : projectEnd(p);
              const col = colOf(segStart);
              return { project: p, col, span: colOf(segEnd) - col + 1, startsHere: p.dDay >= weekStart, endsHere: projectEnd(p) <= weekEnd };
            })
            .sort((a, b) => a.col - b.col || b.span - a.span);

          // Other events in this week: by start day, all-day (longest first), then by time
          const meetingEnd = (m: Meeting) => (m.allDay && m.endDate && m.endDate > m.date ? m.endDate : m.date);
          const weekMeetings = (filterUrgentOnly ? [] : meetings)
            .filter(m => m.date <= weekEnd && meetingEnd(m) >= weekStart)
            .map(m => {
              const segStart = m.date < weekStart ? weekStart : m.date;
              const segEnd = meetingEnd(m) > weekEnd ? weekEnd : meetingEnd(m);
              const col = colOf(segStart);
              return { meeting: m, col, span: colOf(segEnd) - col + 1, startsHere: m.date >= weekStart, endsHere: meetingEnd(m) <= weekEnd };
            })
            .sort((a, b) =>
              a.col - b.col ||
              Number(b.meeting.allDay) - Number(a.meeting.allDay) ||
              b.span - a.span ||
              (a.meeting.startTime || '').localeCompare(b.meeting.startTime || '')
            );

          // Pack items into lanes (rows) so nothing overlaps; projects take the top lanes
          const occupied: boolean[][] = [];
          const takeLane = (col: number, span: number) => {
            let lane = 0;
            while (occupied[lane]?.slice(col, col + span).some(Boolean)) lane++;
            occupied[lane] = occupied[lane] || Array(7).fill(false);
            for (let c = col; c < col + span; c++) occupied[lane][c] = true;
            return lane;
          };
          const placed = segments.map(seg => ({ ...seg, lane: takeLane(seg.col, seg.span) }));
          const placedMeetings = weekMeetings.map(seg => ({ ...seg, lane: takeLane(seg.col, seg.span) }));

          return (
            <div key={weekStart} className="relative flex-1 min-h-[110px]">
              {/* Day cells (background) */}
              <div className="absolute inset-0 grid grid-cols-7 gap-px">
                {week.map((cell) => {
                  const isToday = cell.dateString === todayString;
                  const dayTasks = tasks.filter(t => t.dueDate === cell.dateString && t.state !== 'completed');

                  return (
                    <div
                      key={cell.dateString}
                      onClick={() => onQuickAddDate(cell.dateString)}
                      className={`bg-white p-2 flex flex-col justify-between group transition-colors hover:bg-zinc-50/70 cursor-pointer ${
                        !cell.isCurrentMonth ? 'bg-zinc-50/40 text-zinc-400' : 'text-zinc-800'
                      } ${isToday ? 'ring-1 ring-inset ring-zinc-900 bg-zinc-50/60' : ''}`}
                    >
                      <div className="flex items-center justify-between">
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

                        {dayTasks.length > 0 && (
                          <span
                            title={`${dayTasks.length} task(s) on this day`}
                            className="text-[10px] font-mono text-zinc-500 flex items-center space-x-0.5"
                          >
                            <Clock className="w-2.5 h-2.5 text-zinc-400" />
                            <span>{dayTasks.length}</span>
                          </span>
                        )}
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); onAddMeeting(cell.dateString); }}
                          className="text-[9px] font-mono text-zinc-400 hover:text-zinc-900 flex items-center"
                          title="Add a meeting or other event on this day"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Event</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onQuickAddDate(cell.dateString); }}
                          className="text-[9px] font-mono text-zinc-400 hover:text-zinc-900 flex items-center"
                          title="Add a training project on this day"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Project</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Event bars (foreground) */}
              <div className="relative grid grid-cols-7 gap-x-px gap-y-1.5 pt-9 pb-6 pointer-events-none">
                {placed.map(({ project: proj, col, span, lane, startsHere, endsHere }) => {
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

                  const totalDays = eventLength(proj);

                  return (
                    <div
                      key={proj.id}
                      style={{ gridColumn: `${col + 1} / span ${span}`, gridRow: lane + 1 }}
                      onClick={() => onSelectProject(proj)}
                      title={totalDays > 1 ? `${proj.name} · ${formatProjectDates(proj)}` : proj.name}
                      className={`pointer-events-auto px-2 py-1.5 border text-left transition-all shadow-2xs cursor-pointer min-w-0 ${blockBg} ${
                        startsHere ? 'ml-1.5 rounded-l-md' : 'border-l-0'
                      } ${endsHere ? 'mr-1.5 rounded-r-md' : 'border-r-0'}`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-bold uppercase font-mono tracking-tight truncate">
                          {!startsHere && '← '}{proj.kind === 'team_building' && <span className="mr-1 px-1 rounded bg-white/70 ring-1 ring-black/10">TB</span>}{proj.company}
                        </span>
                        <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold shrink-0 ${badgeBg}`}>
                          {metrics.daysUntilDDay <= 0
                            ? (metrics.daysUntilDDay === 0 ? 'D-DAY' : `D+${Math.abs(metrics.daysUntilDDay)}`)
                            : `D-${metrics.daysUntilDDay}`}
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold tracking-tight truncate leading-tight">
                        {proj.name}
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-1 text-[9px] font-mono text-zinc-600">
                        <span className="truncate">
                          {metrics.completedTasks}/{metrics.totalTasks} done
                          {totalDays > 1 && ` · ${totalDays} days`}
                        </span>
                        <span className="shrink-0">Score: {metrics.totalTasks === 0 ? '–' : metrics.healthScore >= 999 ? '100%' : metrics.healthScore}</span>
                      </div>
                    </div>
                  );
                })}

                {placedMeetings.map(({ meeting: m, col, span, lane, startsHere, endsHere }) => {
                  const cat = styleOf(eventTypes, m.category);
                  return (
                    <div
                      key={m.id}
                      style={{ gridColumn: `${col + 1} / span ${span}`, gridRow: lane + 1 }}
                      onClick={() => onSelectMeeting(m)}
                      title={[cat.label, m.title, m.allDay ? 'All day' : `${formatTime(m.startTime)} – ${formatTime(m.endTime)}`, m.location].filter(Boolean).join(' · ')}
                      className={`pointer-events-auto px-1.5 py-0.5 text-[10px] leading-tight cursor-pointer truncate min-w-0 ${
                        m.allDay
                          ? `border ${cat.bar} ${startsHere ? 'ml-1.5 rounded-l' : 'border-l-0'} ${endsHere ? 'mr-1.5 rounded-r' : 'border-r-0'}`
                          : `mx-1.5 rounded hover:bg-zinc-100 flex items-center gap-1 ${cat.text}`
                      }`}
                    >
                      {!m.allDay && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cat.dot}`} />}
                      {!m.allDay && <span className="font-mono text-zinc-500 shrink-0">{formatTime(m.startTime)}</span>}
                      <span className="font-medium truncate">{!startsHere && '← '}{m.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
