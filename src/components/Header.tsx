import React, { useState, useEffect } from 'react';
import { Menu, Plus, Volume2, VolumeX, Sparkles, Clock, CalendarDays } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobile: () => void;
  onQuickAddTask: () => void;
  onOpenAssistant: () => void;
  voiceFeedbackEnabled: boolean;
  onToggleVoiceFeedback: () => void;
  isGeminiConfigured: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobile,
  onQuickAddTask,
  onOpenAssistant,
  voiceFeedbackEnabled,
  onToggleVoiceFeedback,
  isGeminiConfigured,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Productivity Dashboard', subtitle: 'Overview of your daily tasks, routines & progress' },
    tasks: { title: 'Task Manager', subtitle: 'Organize, prioritize, and track all your tasks' },
    assistant: { title: 'Alexa+ Live Assistant', subtitle: 'Conversational task management & smart assistance' },
    routines: { title: 'Daily Routines', subtitle: 'Habit tracking & scheduled recurring rituals' },
    calendar: { title: 'Calendar Schedule', subtitle: 'Month-at-a-glance view of deadlines and habits' },
    insights: { title: 'Productivity Insights', subtitle: 'Real performance metrics and completion velocity' },
    settings: { title: 'Settings & System', subtitle: 'Preferences, voice audio, backup data & diagnostics' },
  };

  const currentViewMeta = titles[activeTab] || { title: 'Alexa+', subtitle: 'Smart Live Assistant' };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0D1527]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {currentViewMeta.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-400">
            {currentViewMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Clock & Date Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{currentTime}</span>
          <span className="text-slate-600">|</span>
          <CalendarDays className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>{currentDate}</span>
        </div>

        {/* Engine status indicator pill */}
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            isGeminiConfigured
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
          title={isGeminiConfigured ? 'Connected to server-side Gemini 3.8 Flash API' : 'Alexa+ Local Core rule engine active (Zero latency)'}
        >
          <span className={`w-2 h-2 rounded-full ${isGeminiConfigured ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="hidden sm:inline">
            {isGeminiConfigured ? 'Gemini 3.8 Flash' : 'Alexa+ Local Core'}
          </span>
          <span className="sm:hidden font-mono">AI</span>
        </div>

        {/* Voice Speech Toggle */}
        <button
          onClick={onToggleVoiceFeedback}
          className={`p-2 rounded-xl border transition-all ${
            voiceFeedbackEnabled
              ? 'bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30'
              : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
          }`}
          title={voiceFeedbackEnabled ? 'Voice response enabled (Click to mute)' : 'Voice response muted (Click to enable)'}
          aria-label="Toggle voice feedback"
        >
          {voiceFeedbackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Quick Assistant Ask Button */}
        {activeTab !== 'assistant' && (
          <button
            onClick={onOpenAssistant}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ask Alexa+</span>
          </button>
        )}

        {/* Quick Add Task Button */}
        <button
          onClick={onQuickAddTask}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-cyan-900/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};
