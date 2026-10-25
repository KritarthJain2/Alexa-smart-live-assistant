import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Check,
  Edit2,
  Trash2,
  Clock,
  Calendar,
  AlertTriangle,
  ListTodo,
  CheckCircle2,
  Tag,
  Flag,
  X
} from 'lucide-react';
import { Task, Priority, TaskCategory, TaskFilterOptions } from '../types';
import { formatDatePretty, formatTimeDisplay, isTaskOverdue, isTaskDueToday } from '../utils/dateUtils';

interface TaskManagerViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onOpenCreateModal: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const CATEGORIES: ('all' | TaskCategory)[] = [
  'all',
  'Work',
  'Personal',
  'Study',
  'Health',
  'Finance',
  'Project',
  'Errands',
  'Other',
];

const PRIORITIES: ('all' | Priority)[] = ['all', 'urgent', 'high', 'medium', 'low'];

export const TaskManagerView: React.FC<TaskManagerViewProps> = ({
  tasks,
  onToggleComplete,
  onOpenCreateModal,
  onEditTask,
  onDeleteTask,
}) => {
  const [filterOptions, setFilterOptions] = useState<TaskFilterOptions>({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    sortBy: 'dueDate',
    sortDirection: 'asc',
  });

  // Calculate quick status counts for tab badges
  const counts = useMemo(() => {
    return {
      all: tasks.length,
      pending: tasks.filter(t => !t.completed).length,
      completed: tasks.filter(t => t.completed).length,
      overdue: tasks.filter(t => isTaskOverdue(t.dueDate, t.dueTime, t.completed)).length,
    };
  }, [tasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // Search filter
        if (filterOptions.search.trim()) {
          const q = filterOptions.search.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q) || false;
          const matchCat = task.category.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        // Status tab
        if (filterOptions.status === 'pending' && task.completed) return false;
        if (filterOptions.status === 'completed' && !task.completed) return false;
        if (filterOptions.status === 'overdue' && !isTaskOverdue(task.dueDate, task.dueTime, task.completed)) return false;

        // Priority filter
        if (filterOptions.priority !== 'all' && task.priority !== filterOptions.priority) return false;

        // Category filter
        if (filterOptions.category !== 'all' && task.category !== filterOptions.category) return false;

        return true;
      })
      .sort((a, b) => {
        const dir = filterOptions.sortDirection === 'asc' ? 1 : -1;

        if (filterOptions.sortBy === 'dueDate') {
          return a.dueDate.localeCompare(b.dueDate) * dir;
        }
        if (filterOptions.sortBy === 'priority') {
          const priorityWeights: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (priorityWeights[b.priority] - priorityWeights[a.priority]) * dir;
        }
        if (filterOptions.sortBy === 'title') {
          return a.title.localeCompare(b.title) * dir;
        }
        if (filterOptions.sortBy === 'createdAt') {
          return a.createdAt.localeCompare(b.createdAt) * dir;
        }
        return 0;
      });
  }, [tasks, filterOptions]);

  const priorityBadgeStyle: Record<Priority, string> = {
    urgent: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    high: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    medium: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    low: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Task Manager</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize tasks by deadline, priority level, and categories
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-cyan-900/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0D1527] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={filterOptions.search}
              onChange={e => setFilterOptions(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search tasks by title, note, or category..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-cyan-400 outline-none text-xs text-white placeholder-slate-500"
            />
            {filterOptions.search && (
              <button
                onClick={() => setFilterOptions(prev => ({ ...prev, search: '' }))}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={filterOptions.priority}
              onChange={e => setFilterOptions(prev => ({ ...prev, priority: e.target.value as any }))}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none focus:border-cyan-400"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Category Filter */}
            <Tag className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={filterOptions.category}
              onChange={e => setFilterOptions(prev => ({ ...prev, category: e.target.value as any }))}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none focus:border-cyan-400"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={`${filterOptions.sortBy}-${filterOptions.sortDirection}`}
              onChange={e => {
                const [by, dir] = e.target.value.split('-');
                setFilterOptions(prev => ({ ...prev, sortBy: by as any, sortDirection: dir as any }));
              }}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none focus:border-cyan-400"
            >
              <option value="dueDate-asc">Due Date (Soonest first)</option>
              <option value="dueDate-desc">Due Date (Latest first)</option>
              <option value="priority-desc">Priority (Highest first)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="createdAt-desc">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex border-t border-slate-800/80 pt-3 gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Tasks', count: counts.all },
            { id: 'pending', label: 'Pending', count: counts.pending },
            { id: 'overdue', label: 'Overdue', count: counts.overdue, alert: counts.overdue > 0 },
            { id: 'completed', label: 'Completed', count: counts.completed },
          ].map(tab => {
            const isActive = filterOptions.status === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterOptions(prev => ({ ...prev, status: tab.id as any }))}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    tab.alert
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                      : isActive
                      ? 'bg-cyan-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Task List Section */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl bg-[#0D1527] border border-slate-800 shadow-xl">
            <ListTodo className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No tasks match your criteria</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              {filterOptions.search
                ? `No tasks found for "${filterOptions.search}". Try clearing your search.`
                : 'There are no tasks in this view right now.'}
            </p>
            <button
              onClick={onOpenCreateModal}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
            >
              + Create New Task
            </button>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isOverdue = isTaskOverdue(task.dueDate, task.dueTime, task.completed);
            const isToday = isTaskDueToday(task.dueDate);

            return (
              <div
                key={task.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
                  task.completed
                    ? 'bg-slate-900/30 border-slate-800/60 opacity-60'
                    : isOverdue
                    ? 'bg-[#181123] border-rose-500/40 hover:border-rose-400 shadow-lg shadow-rose-950/20'
                    : 'bg-[#0D1527] border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                {/* Left check & info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : isOverdue
                        ? 'border-rose-500/80 bg-rose-950/40 text-transparent hover:border-rose-400'
                        : 'border-slate-600 hover:border-cyan-400 bg-slate-800'
                    }`}
                    title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    aria-label={`Toggle completion for ${task.title}`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-semibold tracking-wide ${
                          task.completed ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h4>

                      {/* Category tag */}
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                        {task.category}
                      </span>

                      {/* Priority tag */}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase border ${priorityBadgeStyle[task.priority]}`}>
                        {task.priority}
                      </span>

                      {/* Overdue alert badge */}
                      {isOverdue && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>Overdue</span>
                        </span>
                      )}

                      {/* Due today badge */}
                      {!task.completed && isToday && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Due Today
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-cyan-400" />
                        <span>Due {formatDatePretty(task.dueDate)}</span>
                      </span>

                      {task.dueTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-400" />
                          <span>{formatTimeDisplay(task.dueTime)}</span>
                        </span>
                      )}

                      {task.completed && task.completedAt && (
                        <span className="text-emerald-400/80 text-[11px] font-mono">
                          Finished {new Date(task.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onEditTask(task)}
                    className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                    title="Edit task"
                    aria-label={`Edit ${task.title}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Delete task"
                    aria-label={`Delete ${task.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
