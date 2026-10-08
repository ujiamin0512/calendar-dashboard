import React, { useEffect, useState } from 'react';
import { X, Clock, Trash2 } from 'lucide-react';
import { Meeting, EventType, ProjectKind } from '../types';
import { EVENT_COLORS, PROJECT_KINDS } from '../utils/eventCategories';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meeting: Partial<Meeting>) => void;
  onDelete: (meetingId: string) => void;
  initialMeeting?: Meeting | null;
  defaultDate?: string;
  prefill?: Partial<Meeting>;
  onSwitchToProject: (draft: Partial<Meeting>, kind: ProjectKind) => void;
  eventTypes: EventType[];
  onManageTypes: () => void;
}

const inputClass =
  'w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white text-zinc-900';
const labelClass = 'block text-xs font-semibold text-zinc-700 uppercase tracking-wider font-mono mb-1';

const blank = (date?: string): Partial<Meeting> => ({
  title: '',
  category: 'meeting',
  date: date || new Date().toISOString().slice(0, 10),
  endDate: '',
  allDay: false,
  startTime: '09:00',
  endTime: '10:00',
  location: '',
  notes: '',
});

export const MeetingModal: React.FC<MeetingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialMeeting,
  defaultDate,
  prefill,
  onSwitchToProject,
  eventTypes,
  onManageTypes,
}) => {
  const [form, setForm] = useState<Partial<Meeting>>(blank(defaultDate));

  useEffect(() => {
    setForm(initialMeeting ? { ...blank(), ...initialMeeting } : { ...blank(defaultDate), category: eventTypes[0]?.id, ...prefill });
  }, [initialMeeting, defaultDate, prefill, isOpen]);

  if (!isOpen) return null;

  const timeInvalid = !form.allDay && !!form.startTime && !!form.endTime && form.endTime <= form.startTime;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim() || !form.date || timeInvalid) return;
    onSave({
      ...form,
      title: form.title.trim(),
      endDate: form.allDay && form.endDate && form.endDate > form.date ? form.endDate : undefined,
      startTime: form.allDay ? undefined : form.startTime,
      endTime: form.allDay ? undefined : form.endTime,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl w-full max-w-md border border-zinc-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-zinc-700" />
            <h2 className="text-sm font-bold text-zinc-900">{initialMeeting ? 'Edit Calendar Event' : 'New Calendar Event'}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label className={labelClass}>Type</label>
              <button type="button" onClick={onManageTypes} className="text-[11px] text-zinc-500 hover:text-zinc-900 underline mb-1">
                Edit types
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PROJECT_KINDS.map(k => (
                <button
                  key={k.value}
                  type="button"
                  onClick={() => {
                    if (!initialMeeting || confirm(`Change this into a ${k.label.toLowerCase()}? You can then add a checklist and links.`)) {
                      onSwitchToProject(form, k.value);
                    }
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-zinc-200 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <span className="w-2 h-2 rounded-sm bg-zinc-800" />
                  <span>{k.label}</span>
                </button>
              ))}
              {eventTypes.map(t => {
                const active = (form.category || 'meeting') === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm({ ...form, category: t.id })}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition-colors ${
                      active ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${EVENT_COLORS[t.color].dot}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={labelClass}>Title *</label>
            <input
              required
              autoFocus
              placeholder="e.g. Meeting with Shell, Flight to Kuching"
              value={form.title || ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Date *</label>
            <input
              type="date"
              required
              value={form.date || ''}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputClass}
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!form.allDay}
              onChange={(e) => setForm({ ...form, allDay: e.target.checked })}
              className="w-4 h-4 accent-zinc-900"
            />
            <span className="font-medium">All day</span>
          </label>

          {form.allDay && (
            <div>
              <label className={labelClass}>Last Day (multi-day only)</label>
              <input
                type="date"
                min={form.date || undefined}
                value={form.endDate || ''}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className={inputClass}
              />
            </div>
          )}

          {!form.allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Start</label>
                <input
                  type="time"
                  required
                  value={form.startTime || ''}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>End</label>
                <input
                  type="time"
                  required
                  value={form.endTime || ''}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className={inputClass}
                />
              </div>
              {timeInvalid && <p className="col-span-2 text-[11px] text-red-600">End time must be after start time.</p>}
            </div>
          )}

          <div>
            <label className={labelClass}>Location / Link</label>
            <input
              placeholder="e.g. Sunway Geo L3, or a Google Meet link"
              value={form.location || ''}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              rows={3}
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        <div className="px-5 py-3 border-t border-zinc-200 flex items-center justify-between">
          {initialMeeting ? (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete "${initialMeeting.title}"?`)) {
                  onDelete(initialMeeting.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          ) : <span />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs font-medium text-zinc-700"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800">
              {initialMeeting ? 'Save' : 'Add to Calendar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
