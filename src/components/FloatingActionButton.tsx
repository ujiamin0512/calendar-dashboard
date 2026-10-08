import React, { useState } from 'react';
import { Plus, Calendar, CheckSquare, UserPlus, X, Clock } from 'lucide-react';

interface FloatingActionButtonProps {
  onAddProject: () => void;
  onAddMeeting: () => void;
  onAddTask: () => void;
  onAddIntern: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onAddProject,
  onAddMeeting,
  onAddTask,
  onAddIntern,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Expanded Quick Options Menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30 bg-zinc-950/20 backdrop-blur-2xs"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative z-40 mb-3 space-y-2 flex flex-col items-end">
            <button
              onClick={() => {
                setIsOpen(false);
                onAddProject();
              }}
              className="flex items-center space-x-2.5 px-4 py-2.5 bg-white text-zinc-900 border border-zinc-200 rounded-full shadow-lg hover:bg-zinc-50 transition-transform active:scale-95 text-xs font-semibold"
            >
              <span>New Project</span>
              <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onAddMeeting();
              }}
              className="flex items-center space-x-2.5 px-4 py-2.5 bg-white text-zinc-900 border border-zinc-200 rounded-full shadow-lg hover:bg-zinc-50 transition-transform active:scale-95 text-xs font-semibold"
            >
              <span>New Meeting / Event</span>
              <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onAddTask();
              }}
              className="flex items-center space-x-2.5 px-4 py-2.5 bg-white text-zinc-900 border border-zinc-200 rounded-full shadow-lg hover:bg-zinc-50 transition-transform active:scale-95 text-xs font-semibold"
            >
              <span>Add Checklist Task</span>
              <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center">
                <CheckSquare className="w-3.5 h-3.5" />
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onAddIntern();
              }}
              className="flex items-center space-x-2.5 px-4 py-2.5 bg-white text-zinc-900 border border-zinc-200 rounded-full shadow-lg hover:bg-zinc-50 transition-transform active:scale-95 text-xs font-semibold"
            >
              <span>Add Intern / Trainer</span>
              <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-13 h-13 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 active:scale-90 relative z-40 ${
          isOpen
            ? 'bg-zinc-900 text-white rotate-45'
            : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-2xl'
        }`}
        title="Quick Add Action"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};
