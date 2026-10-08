import { EventColor, EventType, ProjectKind } from '../types';

// Colour palette for event types (Tailwind classes must stay literal)
export const EVENT_COLORS: Record<EventColor, { bar: string; dot: string; text: string }> = {
  sky: { bar: 'bg-sky-100 text-sky-900 border-sky-200 hover:bg-sky-200', dot: 'bg-sky-500', text: 'text-sky-900' },
  violet: { bar: 'bg-violet-100 text-violet-900 border-violet-200 hover:bg-violet-200', dot: 'bg-violet-500', text: 'text-violet-900' },
  teal: { bar: 'bg-teal-100 text-teal-900 border-teal-200 hover:bg-teal-200', dot: 'bg-teal-500', text: 'text-teal-900' },
  rose: { bar: 'bg-rose-100 text-rose-900 border-rose-200 hover:bg-rose-200', dot: 'bg-rose-500', text: 'text-rose-900' },
  slate: { bar: 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300', dot: 'bg-slate-500', text: 'text-slate-800' },
  amber: { bar: 'bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200', dot: 'bg-amber-500', text: 'text-amber-900' },
  emerald: { bar: 'bg-emerald-100 text-emerald-900 border-emerald-200 hover:bg-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-900' },
  indigo: { bar: 'bg-indigo-100 text-indigo-900 border-indigo-200 hover:bg-indigo-200', dot: 'bg-indigo-500', text: 'text-indigo-900' },
  orange: { bar: 'bg-orange-100 text-orange-900 border-orange-200 hover:bg-orange-200', dot: 'bg-orange-500', text: 'text-orange-900' },
  fuchsia: { bar: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200 hover:bg-fuchsia-200', dot: 'bg-fuchsia-500', text: 'text-fuchsia-900' },
  lime: { bar: 'bg-lime-100 text-lime-900 border-lime-200 hover:bg-lime-200', dot: 'bg-lime-500', text: 'text-lime-900' },
  cyan: { bar: 'bg-cyan-100 text-cyan-900 border-cyan-200 hover:bg-cyan-200', dot: 'bg-cyan-500', text: 'text-cyan-900' },
};

export const COLOR_KEYS = Object.keys(EVENT_COLORS) as EventColor[];

// Starting types; ids match the categories events were saved with before types were editable
export const DEFAULT_EVENT_TYPES: EventType[] = [
  { id: 'meeting', label: 'Meeting', color: 'sky' },
  { id: 'reminder', label: 'Reminder', color: 'violet' },
  { id: 'travel', label: 'Travel', color: 'teal' },
  { id: 'personal', label: 'Personal', color: 'rose' },
  { id: 'other', label: 'Other', color: 'slate' },
];

// Type + colour classes for an event; unknown or missing types fall back to the first type
export const styleOf = (types: EventType[], id?: string) => {
  const type = types.find(t => t.id === (id || 'meeting')) || types[0] || { id: 'event', label: 'Event', color: 'slate' as EventColor };
  return { ...type, ...EVENT_COLORS[type.color] };
};

// Accept "drive.google.com/..." as well as full URLs
export const normalizeUrl = (url: string) => {
  const u = url.trim();
  return !u || /^[a-z][a-z0-9+.-]*:/i.test(u) ? u : `https://${u}`;
};

// Kinds of project (both have a checklist, D-Day countdown and health score)
export const PROJECT_KINDS: { value: ProjectKind; label: string; short: string }[] = [
  { value: 'training', label: 'Training Project', short: 'Training' },
  { value: 'team_building', label: 'Team Building', short: 'Team Building' },
];

export const kindLabel = (kind?: ProjectKind) => PROJECT_KINDS.find(k => k.value === (kind || 'training'))!.label;
