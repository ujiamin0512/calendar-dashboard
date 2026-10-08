import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2, Tags } from 'lucide-react';
import { EventType } from '../types';
import { COLOR_KEYS, EVENT_COLORS } from '../utils/eventCategories';

interface EventTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTypes: EventType[];
  usage: Record<string, number>; // events per type id
  onSave: (types: EventType[]) => void;
}

export const EventTypesModal: React.FC<EventTypesModalProps> = ({ isOpen, onClose, eventTypes, usage, onSave }) => {
  const [draft, setDraft] = useState<EventType[]>(eventTypes);
  const [colorOpenFor, setColorOpenFor] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDraft(eventTypes);
      setColorOpenFor(null);
    }
  }, [isOpen, eventTypes]);

  if (!isOpen) return null;

  const update = (id: string, patch: Partial<EventType>) =>
    setDraft(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));

  const addType = () => {
    const used = new Set(draft.map(t => t.color));
    const color = COLOR_KEYS.find(c => !used.has(c)) || COLOR_KEYS[draft.length % COLOR_KEYS.length];
    setDraft(prev => [...prev, { id: `type-${Date.now()}`, label: '', color }]);
  };

  const removeType = (type: EventType) => {
    if (draft.length === 1) return;
    setDraft(prev => prev.filter(t => t.id !== type.id));
  };

  const handleSave = () => {
    const cleaned = draft.map(t => ({ ...t, label: t.label.trim() }));
    if (cleaned.some(t => !t.label)) {
      alert('Every type needs a name.');
      return;
    }
    const removed = eventTypes.filter(t => !cleaned.some(c => c.id === t.id) && usage[t.id]);
    if (removed.length) {
      const list = removed.map(t => `"${t.label}" (${usage[t.id]} event${usage[t.id] > 1 ? 's' : ''})`).join(', ');
      if (!confirm(`${list} will be moved to "${cleaned[0].label}". Continue?`)) return;
    }
    onSave(cleaned);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-zinc-200 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <div className="flex items-center space-x-2">
            <Tags className="w-4 h-4 text-zinc-700" />
            <h2 className="text-sm font-bold text-zinc-900">Event Types</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          <p className="text-[11px] text-zinc-500 mb-1">
            Types for meetings and other non-training events. The first type is the default.
          </p>

          {draft.map(type => (
            <div key={type.id} className="border border-zinc-200 rounded-lg p-2 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setColorOpenFor(colorOpenFor === type.id ? null : type.id)}
                  className={`w-6 h-6 rounded-full shrink-0 ring-offset-1 hover:ring-2 hover:ring-zinc-300 ${EVENT_COLORS[type.color].dot}`}
                  title="Change colour"
                />
                <input
                  value={type.label}
                  onChange={(e) => update(type.id, { label: e.target.value })}
                  placeholder="Type name, e.g. Site visit"
                  autoFocus={!type.label}
                  className="flex-1 min-w-0 text-xs px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
                />
                <span className="text-[10px] font-mono text-zinc-400 shrink-0 w-14 text-right">
                  {usage[type.id] ? `${usage[type.id]} event${usage[type.id] > 1 ? 's' : ''}` : 'unused'}
                </span>
                <button
                  type="button"
                  onClick={() => removeType(type)}
                  disabled={draft.length === 1}
                  className="p-1.5 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
                  title={draft.length === 1 ? 'Keep at least one type' : 'Delete type'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {colorOpenFor === type.id && (
                <div className="flex flex-wrap gap-1.5 pl-8">
                  {COLOR_KEYS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        update(type.id, { color: c });
                        setColorOpenFor(null);
                      }}
                      className={`w-5 h-5 rounded-full ${EVENT_COLORS[c].dot} ${type.color === c ? 'ring-2 ring-offset-1 ring-zinc-900' : ''}`}
                      title={c}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addType}
            className="flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 pt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add type</span>
          </button>
        </div>

        <div className="px-5 py-3 border-t border-zinc-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs font-medium text-zinc-700"
          >
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800">
            Save Types
          </button>
        </div>
      </div>
    </div>
  );
};
