import React from 'react';
import { Calendar, LayoutGrid, GitPullRequestDraft, Users, Plus } from 'lucide-react';

interface HeaderProps {
  currentView: 'calendar' | 'projects' | 'dispatcher';
  onViewChange: (view: 'calendar' | 'projects' | 'dispatcher') => void;
  onOpenInternsModal: () => void;
  onQuickAdd: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenInternsModal,
  onQuickAdd,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-semibold text-sm tracking-wider">
                TM
              </div>
              <div>
                <span className="font-semibold text-zinc-900 tracking-tight text-base block leading-none">
                  Trainer Hub
                </span>
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest block mt-0.5">
                  Operations Dispatcher
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-zinc-200">
              <button
                onClick={() => onViewChange('calendar')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'calendar'
                    ? 'bg-zinc-100 text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </button>

              <button
                onClick={() => onViewChange('projects')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'projects'
                    ? 'bg-zinc-100 text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Projects</span>
              </button>

              <button
                onClick={() => onViewChange('dispatcher')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'dispatcher'
                    ? 'bg-zinc-100 text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <GitPullRequestDraft className="w-4 h-4" />
                <span>Admin Dispatcher</span>
              </button>
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Interns Roster Button */}
            <button
              onClick={onOpenInternsModal}
              title="Manage Interns"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-md border border-zinc-200 transition-colors"
            >
              <Users className="w-4 h-4 text-zinc-500" />
              <span className="hidden sm:inline">Interns</span>
            </button>

            {/* Quick Add Button */}
            <button
              onClick={onQuickAdd}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-zinc-900 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-zinc-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>

        {/* Mobile Subnav */}
        <div className="md:hidden flex items-center space-x-1 py-2 border-t border-zinc-100 overflow-x-auto">
          <button
            onClick={() => onViewChange('calendar')}
            className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${
              currentView === 'calendar' ? 'bg-zinc-900 text-white' : 'text-zinc-600'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => onViewChange('projects')}
            className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${
              currentView === 'projects' ? 'bg-zinc-900 text-white' : 'text-zinc-600'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => onViewChange('dispatcher')}
            className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${
              currentView === 'dispatcher' ? 'bg-zinc-900 text-white' : 'text-zinc-600'
            }`}
          >
            Dispatcher
          </button>
        </div>
      </div>
    </header>
  );
};
