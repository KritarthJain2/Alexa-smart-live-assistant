import React, { useMemo } from 'react';
import {
  Repeat,
  Plus,
  Clock,
  Check,
  Calendar,
  Edit2,
  Trash2,
  Sparkles,
  Flame,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { Routine } from '../types';
import { DAYS_OF_WEEK, isRoutineScheduledForToday, getTodayDateString } from '../utils/dateUtils';

interface DailyRoutineViewProps {
  routines: Routine[];
  onToggleRoutineComplete: (routineId: string) => void;
  onOpenCreateRoutineModal: () => void;
  onEditRoutine: (routine: Routine) => void;
  onDeleteRoutine: (routineId: string) => void;
}

export const DailyRoutineView: React.FC<DailyRoutineViewProps> = ({
  routines,
  onToggleRoutineComplete,
  onOpenCreateRoutineModal,
  onEditRoutine,
  onDeleteRoutine,
}) => {
  const todayStr = getTodayDateString();
  const currentDayIndex = new Date().getDay();

  // Categorize into today's active habits vs others
  const todayRoutines = useMemo(() => {
    return routines.filter(r => isRoutineScheduledForToday(r.daysOfWeek));
  }, [routines]);

  const completedTodayCount = useMemo(() => {
    return todayRoutines.filter(r => r.completedDates?.includes(todayStr)).length;
  }, [todayRoutines, todayStr]);

  const todayCompletionPercent = todayRoutines.length > 0
    ? Math.round((completedTodayCount / todayRoutines.length) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Daily Routines & Habits</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Build consistency with recurring daily rituals and habit tracking
          </p>
        </div>

        <button
          onClick={onOpenCreateRoutineModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg shadow-purple-900/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Routine</span>
        </button>
      </div>

      {/* 2. Today's Routine Checklist Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#14122E] via-[#1A1A40] to-[#121A38] border border-purple-500/30 p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4 text-purple-400" />
              <span>Today&apos;s Active Habit Schedule</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              You&apos;ve completed {completedTodayCount} of {todayRoutines.length} habits today ({todayCompletionPercent}%)
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-black text-cyan-300">{todayCompletionPercent}%</span>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Today&apos;s Momentum</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-700"
            style={{ width: `${todayCompletionPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Today's Checklist Section */}
      <div className="rounded-2xl bg-[#0D1527] border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Today&apos;s Checklist</h3>
          </div>
          <span className="text-xs text-slate-400">
            {DAYS_OF_WEEK[currentDayIndex].name} Schedule
          </span>
        </div>

        {todayRoutines.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No routines are scheduled for today. Add one or choose active days!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todayRoutines.map(routine => {
              const isDone = routine.completedDates?.includes(todayStr);

              return (
                <div
                  key={routine.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-purple-950/20 border-purple-500/30'
                      : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/30'
                  }`}
                >
                  <button
                    onClick={() => onToggleRoutineComplete(routine.id)}
                    className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                      isDone
                        ? 'bg-purple-500 border-purple-500 text-white shadow-md shadow-purple-900/40'
                        : 'border-slate-600 hover:border-purple-400 bg-slate-800'
                    }`}
                    title={isDone ? 'Mark as not done today' : 'Mark completed today'}
                    aria-label={`Toggle completion for ${routine.name}`}
                  >
                    {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm font-semibold truncate ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                        {routine.name}
                      </h4>
                      <span className="text-xs font-mono text-cyan-300 font-semibold shrink-0">
                        {routine.time}
                      </span>
                    </div>

                    {routine.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {routine.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {routine.category}
                      </span>
                      {isDone && (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Finished Today</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. All Routines Management List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white">All Scheduled Routines ({routines.length})</h3>
        </div>

        {routines.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl bg-[#0D1527] border border-slate-800">
            <Repeat className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No routines created yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Routines help you establish daily habits like morning planning, learning sprints, or evening reviews.
            </p>
            <button
              onClick={onOpenCreateRoutineModal}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
            >
              + Create First Routine
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routines.map(routine => {
              const isToday = isRoutineScheduledForToday(routine.daysOfWeek);
              const totalDaysCompleted = routine.completedDates?.length || 0;

              return (
                <div
                  key={routine.id}
                  className="p-5 rounded-2xl bg-[#0D1527] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-mono font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{routine.time}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-slate-700">
                        {routine.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-white tracking-tight">{routine.name}</h4>

                    {routine.description && (
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        {routine.description}
                      </p>
                    )}

                    {/* Active Days Pills */}
                    <div className="mt-4 flex items-center gap-1">
                      {DAYS_OF_WEEK.map(d => {
                        const active = routine.daysOfWeek.includes(d.id);
                        return (
                          <span
                            key={d.id}
                            className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center ${
                              active
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'bg-slate-800/60 text-slate-500'
                            }`}
                            title={d.name}
                          >
                            {d.short.charAt(0)}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[11px]">
                      Completed {totalDaysCompleted} times
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditRoutine(routine)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                        title="Edit routine"
                        aria-label={`Edit ${routine.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteRoutine(routine.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="Delete routine"
                        aria-label={`Delete ${routine.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
