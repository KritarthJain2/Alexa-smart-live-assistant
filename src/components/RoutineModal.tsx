import React, { useState, useEffect } from 'react';
import { X, Clock, Repeat, Tag } from 'lucide-react';
import { Routine } from '../types';
import { DAYS_OF_WEEK } from '../utils/dateUtils';

interface RoutineModalProps {
  isOpen: boolean;
  routineToEdit?: Routine | null;
  onSave: (routineData: Omit<Routine, 'id' | 'createdAt'> & { id?: string }) => void;
  onClose: () => void;
}

const CATEGORIES = ['Productivity', 'Health', 'Study', 'Wellness', 'Work', 'Personal'];

export const RoutineModal: React.FC<RoutineModalProps> = ({
  isOpen,
  routineToEdit,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [time, setTime] = useState('08:00 AM');
  const [description, setDescription] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]); // Weekdays default
  const [category, setCategory] = useState('Productivity');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (routineToEdit) {
      setName(routineToEdit.name);
      setTime(routineToEdit.time);
      setDescription(routineToEdit.description || '');
      setDaysOfWeek(routineToEdit.daysOfWeek || []);
      setCategory(routineToEdit.category || 'Productivity');
    } else {
      setName('');
      setTime('08:00 AM');
      setDescription('');
      setDaysOfWeek([1, 2, 3, 4, 5]);
      setCategory('Productivity');
    }
    setError(null);
  }, [routineToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (dayId: number) => {
    setDaysOfWeek(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId].sort((a, b) => a - b)
    );
  };

  const handleSelectAll = (weekdaysOnly = false) => {
    if (weekdaysOnly) {
      setDaysOfWeek([1, 2, 3, 4, 5]);
    } else {
      setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Routine name is required.');
      return;
    }
    if (daysOfWeek.length === 0) {
      setError('Please select at least one active day.');
      return;
    }

    onSave({
      id: routineToEdit?.id,
      name: name.trim(),
      time,
      description: description.trim(),
      daysOfWeek,
      category,
      completedDates: routineToEdit?.completedDates || [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-xl text-white">
              {routineToEdit ? 'Edit Routine' : 'Create Daily Routine'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Build lasting productivity rituals & automated daily habits
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Routine Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Morning Focus Ritual"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none text-white text-sm transition-all"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Scheduled Time
              </label>
              <input
                type="text"
                value={time}
                onChange={e => setTime(e.target.value)}
                placeholder="08:00 AM"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-purple-400 outline-none text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-400" />
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-purple-400 outline-none text-white text-sm"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description / Action Steps
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What specific actions happen during this routine?"
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-purple-400 outline-none text-white text-sm transition-all resize-none"
            />
          </div>

          {/* Days of week selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-cyan-400" />
                Active Days <span className="text-rose-400">*</span>
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSelectAll(true)}
                  className="text-cyan-400 hover:underline"
                >
                  Weekdays
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => handleSelectAll(false)}
                  className="text-cyan-400 hover:underline"
                >
                  Everyday
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map(d => {
                const isActive = daysOfWeek.includes(d.id);
                return (
                  <button
                    type="button"
                    key={d.id}
                    onClick={() => toggleDay(d.id)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isActive
                        ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-900/40'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg shadow-purple-900/30 transition-all"
            >
              {routineToEdit ? 'Save Routine' : 'Create Routine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
