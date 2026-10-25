import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Bot,
  Repeat,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'tasks' | 'assistant' | 'routines' | 'calendar' | 'insights' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingCount: number;
  todayRoutinesCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  userName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingCount,
  todayRoutinesCount,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  userName,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'tasks',
      label: 'Task Manager',
      icon: <CheckSquare className="w-5 h-5 shrink-0" />,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: 'assistant',
      label: 'Alexa+ Assistant',
      icon: <Bot className="w-5 h-5 shrink-0" />,
      badge: 'LIVE',
    },
    {
      id: 'routines',
      label: 'Daily Routines',
      icon: <Repeat className="w-5 h-5 shrink-0" />,
      badge: todayRoutinesCount > 0 ? todayRoutinesCount : undefined,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'insights',
      label: 'Productivity Insights',
      icon: <BarChart3 className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5 shrink-0" />,
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0D1527] border-r border-slate-800/80 text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80 h-16">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 opacity-30 blur-sm -z-10" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base tracking-tight">Alexa</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-gradient-to-r from-cyan-400 to-purple-400 text-slate-950 uppercase tracking-widest shadow-sm">
                  PLUS
                </span>
              </div>
              <p className="text-[10px] text-cyan-400 font-medium tracking-wide">SMART LIVE ASSISTANT</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 via-purple-500/10 to-transparent text-white border-l-2 border-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                {item.icon}
              </div>

              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 ${
                        item.badge === 'LIVE'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse'
                          : isActive
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Simulated Live Assist status widget */}
      {!isCollapsed && (
        <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-900/80 border border-slate-800/90 text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            <span>Voice & Chat Ready</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Say or type &quot;Add task&quot;, &quot;Show pending&quot;, or &quot;Daily briefing&quot;.
          </p>
        </div>
      )}

      {/* User profile footer */}
      <div className="p-3 border-t border-slate-800/80 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-inner">
          {userName.charAt(0).toUpperCase()}
        </div>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{userName}</p>
            <p className="text-[10px] text-slate-400 truncate">Amazon Developer Hackathon</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 max-w-[80vw] h-full"
            onClick={e => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
