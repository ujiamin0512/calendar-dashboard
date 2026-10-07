import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Building2, Link as LinkIcon, 
  QrCode, Upload, FileText, MapPin, Users, Sparkles
} from 'lucide-react';
import { TrainingProject } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<TrainingProject>) => void;
  initialProject?: TrainingProject | null;
  defaultDate?: string;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProject,
  defaultDate,
}) => {
  const [formData, setFormData] = useState<Partial<TrainingProject>>({
    name: '',
    dDay: defaultDate || '',
    company: '',
    slogan: '',
    provider: 'Apex Academy Global',
    storageUrl: '',
    evaluationQrCode: '',
    location: '',
    attendeesCount: 30,
    notes: '',
    status: 'in_progress',
  });

  useEffect(() => {
    if (initialProject) {
      setFormData(initialProject);
    } else {
      setFormData({
        name: '',
        dDay: defaultDate || new Date().toISOString().slice(0, 10),
        company: '',
        slogan: '',
        provider: 'Apex Academy Global',
        storageUrl: '',
        evaluationQrCode: '',
        location: 'Grand Training Ballroom A',
        attendeesCount: 30,
        notes: '',
        status: 'in_progress',
      });
    }
  }, [initialProject, defaultDate, isOpen]);

  if (!isOpen) return null;

  // Handle file upload for QR Code image
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, evaluationQrCode: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateDefaultQr = () => {
    const sampleSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="25" height="25" fill="black"/><rect x="15" y="15" width="15" height="15" fill="white"/><rect x="20" y="20" width="5" height="5" fill="black"/><rect x="65" y="10" width="25" height="25" fill="black"/><rect x="70" y="15" width="15" height="15" fill="white"/><rect x="75" y="20" width="5" height="5" fill="black"/><rect x="10" y="65" width="25" height="25" fill="black"/><rect x="15" y="70" width="15" height="15" fill="white"/><rect x="20" y="75" width="5" height="5" fill="black"/><rect x="45" y="15" width="10" height="10" fill="black"/><rect x="45" y="45" width="15" height="15" fill="black"/><rect x="65" y="45" width="20" height="10" fill="black"/><rect x="40" y="70" width="10" height="20" fill="black"/><rect x="60" y="70" width="25" height="15" fill="black"/></svg>`;
    setFormData(prev => ({ ...prev, evaluationQrCode: sampleSvg }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dDay || !formData.company) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div>
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">
              {initialProject ? 'Edit Training Project' : 'Create Training Project'}
            </h2>
            <p className="text-xs text-zinc-500">
              Configure event parameters, D-Day milestone, and collateral assets.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider font-mono mb-1">
              Project / Event Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Executive AI Leadership Summit"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white text-zinc-900"
            />
          </div>

          {/* D-Day Date & Company Name Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider font-mono mb-1">
                D-Day (Event Date) *
              </label>
              <input
                type="date"
                required
                value={formData.dDay || ''}
                onChange={(e) => setFormData({ ...formData, dDay: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white text-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider font-mono mb-1">
                Company / Client Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Fintech Vanguard Corp"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white text-zinc-900"
              />
            </div>
          </div>

          {/* Slogan / Theme & Training Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider font-mono mb-1">
                Slogan / Theme
              </label>
              <input
                type="text"
                placeholder="e.g. Mastering Enterprise Intelligence"
                value={formData.slogan || ''}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white text-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider font-mono mb-1">
                Training Provider *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Academy Global"
                value={formData.provider || ''}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white text-zinc-900"
              />
            </div>
          </div>

          {/* Storage Link URL */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider font-mono mb-1">
              Storage Link (Cloud Drive URL)
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="https://drive.google.com/drive/folders/..."
                value={formData.storageUrl || ''}
                onChange={(e) => setFormData({ ...formData, storageUrl: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white text-zinc-900"
              />
            </div>
          </div>

          {/* Evaluation QR Code Upload / Preview */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider font-mono mb-1">
              Evaluation Survey QR Code
            </label>
            <div className="flex items-center space-x-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
              {formData.evaluationQrCode ? (
                <div className="w-14 h-14 bg-white p-1 rounded-lg border border-zinc-200 shrink-0 flex items-center justify-center">
                  <img
                    src={formData.evaluationQrCode}
                    alt="QR Code Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 bg-zinc-200 rounded-lg flex items-center justify-center shrink-0 text-zinc-400">
                  <QrCode className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer px-3 py-1 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-md text-xs font-medium text-zinc-700 inline-flex items-center space-x-1">
                    <Upload className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={generateDefaultQr}
                    className="px-2.5 py-1 text-xs text-zinc-600 hover:text-zinc-900 hover:underline"
                  >
                    Generate Sample
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400">
                  PNG, JPG, or SVG scanned by attendees at end of session.
                </p>
              </div>
            </div>
          </div>

          {/* Location & Attendee Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider font-mono mb-1">
                Location / Venue
              </label>
              <input
                type="text"
                placeholder="e.g. Grand Ballroom B"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white text-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider font-mono mb-1">
                Attendees Headcount
              </label>
              <input
                type="number"
                min="1"
                value={formData.attendeesCount || 30}
                onChange={(e) => setFormData({ ...formData, attendeesCount: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white text-zinc-900"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs font-medium text-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800 transition-colors shadow-xs"
            >
              {initialProject ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
