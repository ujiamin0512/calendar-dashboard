import { TrainingProject, Meeting, ProjectKind } from '../types';

// One-time import of training events from Google Calendar (taken 2026-10-08).
// Each browser adds them once; projects you delete or edit afterwards stay that way.
const IMPORTED_KEY = 'trainer_hub_gcal_imported';

type CalendarEvent = { id: string; kind?: ProjectKind; name: string; dDay: string; endDate?: string; company: string; contact?: string; location?: string; dates: string };

const EVENTS: CalendarEvent[] = [
  { id: 'sibu-1d-ai-class', name: '1D AI Class', dDay: '2026-10-08', company: 'Sibu', contact: 'Jane', location: 'Sibu', dates: 'Oct 8' },
  { id: 'yen-beacon', name: 'Beacon', dDay: '2026-10-10', endDate: '2026-10-11', company: 'Beacon', contact: 'Yen', dates: 'Oct 10–11' },
  { id: 'koerber-annual-dinner', kind: 'team_building', name: 'Koerber Annual Dinner', dDay: '2026-10-13', endDate: '2026-10-14', company: 'Koerber', dates: 'Oct 13–14' },
  { id: 'minie-tambun', name: 'Tambun', dDay: '2026-10-15', endDate: '2026-10-16', company: 'Tambun', contact: 'Minie', location: 'Tambun', dates: 'Oct 15–16' },
  { id: 'steph-melaka-hunt', kind: 'team_building', name: 'Melaka Hunt', dDay: '2026-10-17', company: 'Melaka Hunt', contact: 'Steph', location: 'Melaka', dates: 'Oct 17' },
  { id: 'eve-claude-training', name: 'Claude Training', dDay: '2026-10-18', company: 'Eve', contact: 'Eve', dates: 'Oct 18' },
  { id: 'kwap-canva-foundation-1', name: 'Canva Foundation', dDay: '2026-10-19', company: 'KWAP', contact: 'Jason', dates: 'Oct 19' },
  { id: 'hlb-ai-canva-ppt-1', name: 'AI Canva PPT', dDay: '2026-10-20', company: 'HLB', contact: 'Info', dates: 'Oct 20' },
  { id: 'sg-soil-build', name: 'Soil Build', dDay: '2026-10-22', endDate: '2026-10-24', company: 'Soil Build', location: 'Singapore', dates: 'Oct 22–24' },
  { id: 'ivy-penang-ai-tb', kind: 'team_building', name: 'AI Team Building', dDay: '2026-10-26', company: 'Penang', contact: 'Ivy', location: 'Iconic Marjorie, Penang', dates: 'Oct 26' },
  { id: 'kwap-canva-intermediate', name: 'Canva Intermediate', dDay: '2026-10-27', endDate: '2026-10-28', company: 'KWAP', contact: 'Jason', dates: 'Oct 27–28' },
  { id: 'ken-xem', name: 'XEM', dDay: '2026-10-29', endDate: '2026-10-30', company: 'XEM', contact: 'Ken', location: 'Fu Zi Villa', dates: 'Oct 29–30' },
  { id: 'kwap-canva-foundation-2', name: 'Canva Foundation', dDay: '2026-11-02', company: 'KWAP', contact: 'Jason', dates: 'Nov 2' },
  { id: 'media-prima-infographic', name: 'Infographic', dDay: '2026-11-03', endDate: '2026-11-04', company: 'Media Prima', contact: 'Xie Hong', location: 'Wyndham Grand Bangsar Kuala Lumpur', dates: 'Nov 3–4' },
  { id: 'susan-kuching-sun-tzu-ai', name: 'Sun Tzu AI', dDay: '2026-11-07', endDate: '2026-11-08', company: 'Kuching', contact: 'Susan', location: 'Kuching', dates: 'Nov 7–8' },
  { id: 'bank-rakyat-canva-slides', name: 'Canva Slides', dDay: '2026-11-11', endDate: '2026-11-12', company: 'Bank Rakyat', contact: 'Leslie', dates: 'Nov 11–12' },
  { id: 'evonne-bingo-sg-genting', kind: 'team_building', name: 'Bingo', dDay: '2026-11-13', company: 'S.G. Genting', contact: 'Evonne', location: 'Swiss Garden Genting', dates: 'Nov 13' },
  { id: 'cbre-awana', name: 'CBRE', dDay: '2026-11-14', company: 'CBRE', location: 'Awana', dates: 'Nov 14' },
  { id: 'hlb-ai-canva-ppt-2', name: 'AI Canva PPT', dDay: '2026-11-17', company: 'HLB', contact: 'Info', dates: 'Nov 17' },
  { id: 'alvin-keysight', name: 'Keysight', dDay: '2026-11-18', company: 'Keysight', contact: 'Alvin', dates: 'Nov 18' },
  { id: 'grab-event', kind: 'team_building', name: 'Grab Event', dDay: '2026-11-19', endDate: '2026-11-20', company: 'Grab', dates: 'Nov 19–20' },
  { id: 'shirley-bingo-penang', kind: 'team_building', name: 'S.B. Bingo', dDay: '2026-11-21', company: 'ASE Electronics', contact: 'Shirley', location: 'Penang Beach Hotel', dates: 'Nov 21' },
  { id: 'phoon-courtyard-melaka', name: 'Courtyard Melaka', dDay: '2026-11-25', endDate: '2026-11-27', company: 'Courtyard Melaka', contact: 'Phoon', location: 'Courtyard Melaka', dates: 'Nov 25–27' },
  { id: 'azu-penang', name: 'Penang', dDay: '2026-11-28', endDate: '2026-11-29', company: 'Penang', contact: 'Azu', location: 'Penang', dates: 'Nov 28–29' },
  { id: 'impact-ai-tb', kind: 'team_building', name: 'S.B. AI Team Building', dDay: '2026-12-18', company: 'Impact', location: 'Avery', dates: 'Dec 18' },
];

const toProject = (e: CalendarEvent): TrainingProject => ({
  id: `gcal-${e.id}`,
  kind: e.kind || 'training',
  name: e.name,
  dDay: e.dDay,
  endDate: e.endDate,
  company: e.company,
  slogan: '',
  provider: '',
  storageUrl: '',
  evaluationQrCode: '',
  location: e.location || '',
  attendeesCount: 0,
  notes: [e.contact && `Contact: ${e.contact}`, `Dates: ${e.dates}`].filter(Boolean).join('\n'),
  status: 'upcoming',
  createdAt: new Date().toISOString(),
});

// Pure (safe to call twice in StrictMode); markCalendarImported() records that it ran.
export function withCalendarImport(projects: TrainingProject[]): TrainingProject[] {
  let done = false;
  try {
    done = Boolean(localStorage.getItem(IMPORTED_KEY));
  } catch {}
  if (done) {
    // Projects imported before end dates / kinds existed: fill them in once
    return projects.map(p => {
      const ev = EVENTS.find(e => `gcal-${e.id}` === p.id);
      if (!ev) return p;
      let next = p;
      if (p.endDate === undefined && ev.endDate) next = { ...next, endDate: ev.endDate };
      if (p.kind === undefined) next = { ...next, kind: ev.kind || 'training' };
      return next;
    });
  }
  const existing = new Set(projects.map(p => p.id));
  return [...projects, ...EVENTS.map(toProject).filter(p => !existing.has(p.id))];
}

export const markCalendarImported = () => {
  try {
    if (!localStorage.getItem(IMPORTED_KEY)) localStorage.setItem(IMPORTED_KEY, new Date().toISOString());
  } catch {}
};

// ---------- One-time import of non-training events (Nov–Dec 2026) ----------
const EVENTS_IMPORTED_KEY = 'trainer_hub_gcal_events_imported';

const OTHER_EVENTS: Omit<Meeting, 'createdAt'>[] = [
  { id: 'gcal-flight-kuching', title: 'Flight to Kuching', category: 'travel', date: '2026-11-06', allDay: true },
  { id: 'gcal-sb-azu', title: 'S.b. Azu', category: 'reminder', date: '2026-11-09', endDate: '2026-11-10', allDay: true },
  { id: 'gcal-stay-mache-genting', title: 'Stay at 2R2B Mache Living @ Windmill Upon Hills', category: 'travel', date: '2026-11-13', endDate: '2026-11-14', allDay: true, location: 'Genting Highlands' },
  { id: 'gcal-stay-stonez-geo38', title: 'Stay at Stonez Suites Geo38', category: 'travel', date: '2026-11-13', endDate: '2026-11-14', allDay: true, location: 'Genting Highlands' },
  { id: 'gcal-stay-7stonez-geo38', title: 'Stay at 7Stonez Suites Geo38', category: 'travel', date: '2026-11-13', endDate: '2026-11-14', allDay: true, location: 'Geo38 Residence, L7-P3, Jalan Permai 2, Genting Highlands' },
  { id: 'gcal-sb-cancel-envato', title: 'S.b. Cancel Envato', category: 'reminder', date: '2026-11-15', allDay: true },
  { id: 'gcal-out-of-country', title: 'Out of country', category: 'travel', date: '2026-12-08', endDate: '2026-12-16', allDay: true },
  { id: 'gcal-sb-shin-yee', title: 'S.b. Shin Yee', category: 'reminder', date: '2026-12-17', allDay: true },
];

// Pure (safe to call twice); markEventsImported() records that it ran.
export function withEventsImport(meetings: Meeting[]): Meeting[] {
  try {
    if (localStorage.getItem(EVENTS_IMPORTED_KEY)) return meetings;
  } catch {
    return meetings;
  }
  const existing = new Set(meetings.map(m => m.id));
  const now = new Date().toISOString();
  return [...meetings, ...OTHER_EVENTS.filter(e => !existing.has(e.id)).map(e => ({ ...e, createdAt: now }))];
}

export const markEventsImported = () => {
  try {
    if (!localStorage.getItem(EVENTS_IMPORTED_KEY)) localStorage.setItem(EVENTS_IMPORTED_KEY, new Date().toISOString());
  } catch {}
};
