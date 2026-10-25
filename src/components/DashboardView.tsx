import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
  Repeat,
  Flame,
  Check,
  ChevronRight,
  TrendingUp,
  Send
} from 'lucide-react';
import { Task, Routine, ProductivityStats } from '../types';
import { formatDatePretty, formatTimeDisplay, isTaskDueToday, isTaskOverdue, isRoutineScheduledForToday } from '../utils/dateUtils';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  userName: string;
  tasks: Task[];
  routines: Routine[];
  stats: ProductivityStats;
  onToggleTaskComplete: (taskId: string) => void;
  onToggleRoutineComplete: (routineId: string) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenCreateTask: () => void;
  onOpenCreateRoutine: () => void;
  onSendAssistantPrompt: (promptText: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName,
  tasks,
  routines,
  stats,
  onToggleTaskComplete,
  onToggleRoutineComplete,
  onNavigateTab,
  onOpenCreateTask,
  onOpenCreateRoutine,
  onSendAssistantPrompt,
}) => {
  const [quickAssistantInput, setQuickAssistantInput] = useState('');

  // Time-of-day personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayDateFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Real today's tasks & routines
  const todayTasks = tasks.filter(t => isTaskDueToday(t.dueDate));
  const todayRoutines = routines.filter(r => isRoutineScheduledForToday(r.daysOfWeek));
  const overdueTasks = tasks.filter(t => isTaskOverdue(t.dueDate, t.dueTime, t.completed));
  const highPriorityPending = tasks.filter(t => !t.completed && (t.priority === 'urgent' || t.priority === 'high'));

  const handleQuickAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAssistantInput.trim()) return;
    onSendAssistantPrompt(quickAssistantInput.trim());
    setQuickAssistantInput('');
    onNavigateTab('assistant');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Hero Welcome & Alexa+ Pulse Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#111A35] via-[#151D40] to-[#1C1645] border border-cyan-500/20 shadow-2xl p-6 sm:p-8 text-white">
        {/* Subtle ambient background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-xs font-semibold text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Alexa+ Smart Live Assistant</span>
              <span className="text-cyan-500">•</span>
              <span>{todayDateFormatted}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {getGreeting()}, <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">{userName}</span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              {stats.overdueTasks > 0
                ? `You have ${stats.pendingTasks} pending tasks, with ${stats.overdueTasks} needing immediate attention. Let's conquer your goals today!`
                : `You're in great shape with ${stats.completedToday} task${stats.completedToday === 1 ? '' : 's'} completed today and zero overdue backlog.`}
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                onClick={onOpenCreateTask}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-900/30 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>

              <button
                onClick={onOpenCreateRoutine}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/30 transition-all hover:scale-105"
              >
                <Repeat className="w-4 h-4" />
                <span>New Routine</span>
              </button>

              <button
                onClick={() => {
                  onSendAssistantPrompt('Summarize my tasks for today');
                  onNavigateTab('assistant');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Daily Briefing</span>
              </button>

              <button
                onClick={() => onNavigateTab('calendar')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>View Calendar</span>
              </button>
            </div>
          </div>

          {/* Productivity Ring Gauge Card */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shrink-0">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${stats.completionRate}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black text-white">{stats.completionRate}%</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Done</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5" />
                <span>Real Completion Rate</span>
              </div>
              <p className="text-xs text-slate-300">
                <strong className="text-white font-bold">{stats.completedTasks}</strong> of {stats.totalTasks} total tasks finished
              </p>
              <p className="text-[11px] text-cyan-300">
                +{stats.completedThisWeek} completed this week
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Main Calculated Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="p-5 rounded-2xl bg-[#0D1527] border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
            <div className="p-2 rounded-xl bg-slate-800 text-cyan-400 group-hover:scale-110 transition-transform">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stats.totalTasks}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>All records in storage</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
        </div>

        {/* Pending Tasks */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="p-5 rounded-2xl bg-[#0D1527] border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight">{stats.pendingTasks}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Needs attention</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
        </div>

        {/* Completed Tasks */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="p-5 rounded-2xl bg-[#0D1527] border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-emerald-300 tracking-tight">{stats.completedTasks}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-emerald-400/80 font-medium">
            <span>{stats.completionRate}% completion</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
        </div>

        {/* Overdue Tasks */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer group shadow-lg ${
            stats.overdueTasks > 0
              ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400'
              : 'bg-[#0D1527] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue</span>
            <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${
              stats.overdueTasks > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className={`mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight ${
            stats.overdueTasks > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'
          }`}>
            {stats.overdueTasks}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>{stats.overdueTasks > 0 ? 'Past deadline' : 'None overdue!'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition-colors" />
          </div>
        </div>
      </div>

      {/* 3. Main Split View: Today's Schedule & Routine Momentum */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Action Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Card */}
          <div className="rounded-2xl bg-[#0D1527] border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-base text-white">Today&apos;s Schedule & Deadlines</h3>
                  <p className="text-xs text-slate-400">Tasks due today and active recurring daily rituals</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('tasks')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 hover:underline"
              >
                <span>View All Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of Today's Items */}
            {todayTasks.length === 0 && todayRoutines.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <h4 className="text-sm font-semibold text-white">No tasks or routines due today!</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Take a breather or add a new goal using the button below or asking Alexa+.
                </p>
                <button
                  onClick={onOpenCreateTask}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                >
                  + Add Today&apos;s Task
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Tasks Due Today */}
                {todayTasks.map(task => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                      task.completed
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => onToggleTaskComplete(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : 'border-slate-600 hover:border-cyan-400 bg-slate-800'
                      }`}
                      aria-label="Toggle task complete"
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                          {task.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300">
                          {task.category}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          task.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300' :
                          task.priority === 'high' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.dueTime && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-400" />
                          <span>Due at {formatTimeDisplay(task.dueTime)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Routines Due Today */}
                {todayRoutines.map(routine => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isDoneToday = routine.completedDates?.includes(todayStr);

                  return (
                    <div
                      key={routine.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                        isDoneToday
                          ? 'bg-purple-950/20 border-purple-500/30'
                          : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/30'
                      }`}
                    >
                      <button
                        onClick={() => onToggleRoutineComplete(routine.id)}
                        className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                          isDoneToday
                            ? 'bg-purple-500 border-purple-500 text-white'
                            : 'border-slate-600 hover:border-purple-400 bg-slate-800'
                        }`}
                        aria-label="Toggle routine complete"
                      >
                        {isDoneToday && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isDoneToday ? 'line-through text-slate-400' : 'text-purple-200'}`}>
                            {routine.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300">
                            Daily Routine
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{routine.time}</span>
                          {routine.description && <span className="truncate text-slate-500">• {routine.description}</span>}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Priority Focus Queue (Urgent & High Tasks) */}
          {highPriorityPending.length > 0 && (
            <div className="rounded-2xl bg-[#0D1527] border border-amber-500/30 p-6 shadow-xl">
              <div className="flex items-center gap-2.5 mb-3">
                <Flame className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base text-white">Priority Focus Queue</h3>
                  <p className="text-xs text-slate-400">High impact items requiring focused attention</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {highPriorityPending.slice(0, 4).map(task => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase ${
                          task.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {formatDatePretty(task.dueDate)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white truncate">{task.title}</p>
                    </div>

                    <button
                      onClick={() => onToggleTaskComplete(task.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-400 transition-colors shrink-0"
                      title="Mark finished"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Routine Momentum & Inline Alexa+ Quick Ask */}
        <div className="space-y-6">
          {/* Daily Habit Checklist Progress */}
          <div className="rounded-2xl bg-[#0D1527] border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Repeat className="w-4 h-4" />
                <span>Today&apos;s Habits</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-300">
                {stats.todayRoutinesCompleted}/{stats.todayRoutinesCount}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                style={{
                  width: `${stats.todayRoutinesCount > 0 ? (stats.todayRoutinesCompleted / stats.todayRoutinesCount) * 100 : 0}%`
                }}
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {stats.todayRoutinesCompleted === stats.todayRoutinesCount && stats.todayRoutinesCount > 0
                ? 'All routines completed for today! Awesome dedication.'
                : `${stats.todayRoutinesCount - stats.todayRoutinesCompleted} routine(s) left to complete today.`}
            </p>

            <button
              onClick={() => onNavigateTab('routines')}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Manage All Routines</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Conversational Prompt Box */}
          <div className="rounded-2xl bg-gradient-to-br from-[#121A33] to-[#1E1940] border border-cyan-500/30 p-6 shadow-xl">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Ask Alexa+ Directly</span>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Type naturally to add tasks, query your agenda, or schedule habits instantly.
            </p>

            <form onSubmit={handleQuickAssistantSubmit} className="relative">
              <input
                type="text"
                value={quickAssistantInput}
                onChange={e => setQuickAssistantInput(e.target.value)}
                placeholder="e.g. Add a task to finish my assignment tomorrow"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 outline-none text-xs text-white placeholder-slate-500 shadow-inner"
              />
              <button
                type="submit"
                disabled={!quickAssistantInput.trim()}
                className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 transition-colors"
                aria-label="Send to assistant"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Sample Prompts */}
            <div className="mt-3 space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Try asking:</p>
              {[
                'Add a task to finish my assignment tomorrow',
                'Show my pending tasks',
                'Summarize my tasks for today',
              ].map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    onSendAssistantPrompt(prompt);
                    onNavigateTab('assistant');
                  }}
                  className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 transition-colors truncate block"
                >
                  &quot;{prompt}&quot;
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
