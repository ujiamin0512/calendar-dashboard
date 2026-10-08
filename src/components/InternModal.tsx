import React, { useState } from 'react';
import { 
  X, User, Mail, Phone, Shield, Plus, 
  Trash2, Edit2, CheckCircle2, UserCheck, AlertCircle 
} from 'lucide-react';
import { Intern, InternRole } from '../types';

interface InternModalProps {
  isOpen: boolean;
  onClose: () => void;
  interns: Intern[];
  onAddIntern: (intern: Omit<Intern, 'id'>) => void;
  onUpdateIntern: (id: string, intern: Partial<Intern>) => void;
  onDeleteIntern: (id: string) => void;
}

export const InternModal: React.FC<InternModalProps> = ({
  isOpen,
  onClose,
  interns,
  onAddIntern,
  onUpdateIntern,
  onDeleteIntern,
}) => {
  const [editingInternId, setEditingInternId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<InternRole>('Lead Intern');
  const [formPhone, setFormPhone] = useState('');
  const [formSkills, setFormSkills] = useState('');

  if (!isOpen) return null;

  const startEdit = (intern: Intern) => {
    setEditingInternId(intern.id);
    setIsAddingNew(false);
    setFormName(intern.name);
    setFormEmail(intern.email);
    setFormRole(intern.role);
    setFormPhone(intern.phone);
    setFormSkills(intern.skills.join(', '));
  };

  const startAdd = () => {
    setEditingInternId(null);
    setIsAddingNew(true);
    setFormName('');
    setFormEmail('');
    setFormRole('Technical Intern');
    setFormPhone('+1 (555) 000-0000');
    setFormSkills('AV Setup, Microphones, Zoom Logistics');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    const skillsArray = formSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const avatar = formName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'IN';

    if (isAddingNew) {
      onAddIntern({
        name: formName,
        email: formEmail,
        role: formRole,
        avatar,
        phone: formPhone,
        skills: skillsArray,
        status: 'active',
      });
      setIsAddingNew(false);
    } else if (editingInternId) {
      onUpdateIntern(editingInternId, {
        name: formName,
        email: formEmail,
        role: formRole,
        avatar,
        phone: formPhone,
        skills: skillsArray,
      });
      setEditingInternId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                Interns & Trainer Roster Management
              </h2>
              <p className="text-xs text-zinc-500">
                Manage roles and assigned skill domains.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Add New or Edit Form */}
          {(isAddingNew || editingInternId) ? (
            <form onSubmit={handleSave} className="p-5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
                  {isAddingNew ? 'Add New Intern / Trainer' : 'Edit Intern Profile'}
                </h3>
                <button
                  type="button"
                  onClick={() => { setIsAddingNew(false); setEditingInternId(null); }}
                  className="text-xs text-zinc-500 hover:text-zinc-800"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-600 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 font-medium mb-1">Role / Function</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as InternRole)}
                    className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    <option value="Lead Intern">Lead Intern</option>
                    <option value="Technical Intern">Technical Intern</option>
                    <option value="Logistics Intern">Logistics Intern</option>
                    <option value="Assistant Trainer">Assistant Trainer</option>
                  </select>
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-zinc-600 font-medium mb-1">Phone / Slack Handle</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="text-xs">
                <label className="block text-zinc-600 font-medium mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Slide QA, AV Setup, Badge Printing"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAddingNew(false); setEditingInternId(null); }}
                  className="px-3 py-1.5 border border-zinc-200 text-xs font-medium rounded-md hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-md hover:bg-zinc-800"
                >
                  {isAddingNew ? 'Add to Roster' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={startAdd}
                className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Intern / Assistant</span>
              </button>
            </div>
          )}

          {/* Interns List */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">
              Current Active Team ({interns.length})
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {interns.map((intern) => (
                <div
                  key={intern.id}
                  className="p-4 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 transition-all flex items-start justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs font-mono shrink-0">
                      {intern.avatar}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-zinc-900">
                          {intern.name}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                          {intern.role}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-zinc-500">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-zinc-400" />
                          <span>{intern.email}</span>
                        </span>
                      </div>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {intern.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-zinc-50 border border-zinc-200 px-1.5 py-0.2 rounded text-zinc-600 font-mono"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => startEdit(intern)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                      title="Edit Intern"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {interns.length > 1 && (
                      <button
                        onClick={() => onDeleteIntern(intern.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove Intern"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
