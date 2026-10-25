import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  Check,
  Flag,
  X
} from 'lucide-react';
import { Task, Routine } from '../types';
import { getMonthDays, formatDatePretty, formatTimeDisplay, getTodayDateString, DAYS_OF_WEEK } from '../utils/dateUtils';

interface CalendarViewProps {
  tasks: Task[];
  routines: Routine[];
  onOpenCreateTaskOnDate: (dateStr: string) => void;
  onToggleTaskComplete: (taskId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  routines,
  onOpenCreateTaskOnDate,
  onToggleTaskComplete,
}) => {
  const todayStr = getTodayDateString();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Generate calendar grid
  const daysInGrid = useMemo(() => {
    return getMonthDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(getTodayDateString());
  };

  // Items for selected date
  const selectedDateTasks = useMemo(() => {
    return tasks.filter(t => t.dueDate === selectedDateStr);
  }, [tasks, selectedDateStr]);

  const selectedDateRoutines = useMemo(() => {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay();
    return routines.filter(r => r.daysOfWeek.includes(dayOfWeek));
  }, [routines, selectedDateStr]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Month Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-cyan-400" />
            <span>{monthName}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click on any date to inspect scheduled deadlines and habit rituals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 overflow-hidden">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-slate-700" />
            <button
              onClick={handleNextMonth}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Calendar Grid & Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Grid */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0D1527] border border-slate-800 p-4 sm:p-6 shadow-xl">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAYS_OF_WEEK.map(d => (
              <div key={d.id} className="py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {d.short}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {daysInGrid.map(cell => {
              const isSelected = cell.dateString === selectedDateStr;
              const isToday = cell.dateString === todayStr;

              // Tasks on this day
              const dayTasks = tasks.filter(t => t.dueDate === cell.dateString);
              const pendingCount = dayTasks.filter(t => !t.completed).length;
              const completedCount = dayTasks.filter(t => t.completed).length;

              // Check if day has urgent or high tasks
              const hasUrgent = dayTasks.some(t => !t.completed && (t.priority === 'urgent' || t.priority === 'high'));

              return (
                <div
                  key={cell.dateString}
                  onClick={() => setSelectedDateStr(cell.dateString)}
                  className={`min-h-[76px] sm:min-h-[96px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg'
                      : isToday
                      ? 'bg-cyan-950/20 border-cyan-500/40 hover:bg-slate-800/80'
                      : cell.isCurrentMonth
                      ? 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50'
                      : 'bg-slate-950/40 border-slate-800/30 text-slate-600 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-cyan-400 text-slate-950 font-black'
                          : isSelected
                          ? 'text-cyan-300 font-extrabold'
                          : cell.isCurrentMonth
                          ? 'text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {hasUrgent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" title="High priority items" />
                    )}
                  </div>

                  {/* Task Indicators */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map(t => (
                      <div
                        key={t.id}
                        className={`text-[9px] px-1.5 py-0.5 rounded truncate font-medium ${
                          t.completed
                            ? 'bg-emerald-950/40 text-emerald-400/70 line-through'
                            : t.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                        }`}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[9px] text-slate-400 block text-right">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Selected Date Detail Inspector */}
        <div className="rounded-2xl bg-[#0D1527] border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div>
                <h3 className="font-bold text-base text-white">
                  {formatDatePretty(selectedDateStr)}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedDateStr}</p>
              </div>

              <button
                onClick={() => onOpenCreateTaskOnDate(selectedDateStr)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                title="Add task on this date"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Scheduled Tasks for Date */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                  <span>Scheduled Tasks</span>
                  <span className="text-cyan-300 font-mono">({selectedDateTasks.length})</span>
                </h4>

                {selectedDateTasks.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No deadlines scheduled for this date.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedDateTasks.map(t => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5"
                      >
                        <button
                          onClick={() => onToggleTaskComplete(t.id)}
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            t.completed
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                              : 'border-slate-600 bg-slate-800 hover:border-cyan-400'
                          }`}
                        >
                          {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${t.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                            {t.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span className="uppercase font-bold text-cyan-300">{t.priority}</span>
                            <span>•</span>
                            <span>{t.category}</span>
                            {t.dueTime && (
                              <>
                                <span>•</span>
                                <span>{formatTimeDisplay(t.dueTime)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scheduled Routines for this Day of Week */}
              <div className="pt-3 border-t border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                  <span>Active Habits on this Weekday</span>
                  <span className="text-purple-300 font-mono">({selectedDateRoutines.length})</span>
                </h4>

                {selectedDateRoutines.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No recurring habits scheduled for this day of the week.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDateRoutines.map(r => (
                      <div
                        key={r.id}
                        className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-200">{r.name}</span>
                        <span className="font-mono text-[11px] text-purple-300 font-semibold">{r.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
