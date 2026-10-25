import { Task, Routine, UserSettings, ProductivityStats, TaskCategory, Priority } from '../types';
import { getTodayDateString, isTaskOverdue, isTaskDueToday, isRoutineScheduledForToday } from './dateUtils';

const STORAGE_KEYS = {
  TASKS: 'alexa_plus_tasks_v1',
  ROUTINES: 'alexa_plus_routines_v1',
  SETTINGS: 'alexa_plus_settings_v1',
  CHAT: 'alexa_plus_chat_history_v1',
};

// Seed sample tasks relative to current date
export function getInitialSeedTasks(): Task[] {
  const today = getTodayDateString();
  const d = new Date();
  
  // Tomorrow
  const tomorrowDate = new Date(d);
  tomorrowDate.setDate(d.getDate() + 1);
  const tomorrow = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`;

  // In 3 days
  const futureDate = new Date(d);
  futureDate.setDate(d.getDate() + 3);
  const in3Days = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`;

  // Yesterday (overdue if pending)
  const pastDate = new Date(d);
  pastDate.setDate(d.getDate() - 1);
  const yesterday = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, '0')}-${String(pastDate.getDate()).padStart(2, '0')}`;

  return [
    {
      id: 'task-seed-1',
      title: 'Finish Alexa+ Hackathon Submission & Demo Video',
      description: 'Prepare code walkthrough, verify live assistant commands, and submit final repository link.',
      dueDate: today,
      dueTime: '17:00',
      priority: 'urgent',
      category: 'Project',
      completed: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'task-seed-2',
      title: 'Review System Architecture with Team',
      description: 'Go over cloud Gemini proxy vs local offline intent engine benchmarks.',
      dueDate: today,
      dueTime: '14:30',
      priority: 'high',
      category: 'Work',
      completed: true,
      completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'task-seed-3',
      title: 'Research Neural Voice & Speech Synthesis APIs',
      description: 'Evaluate latency differences between native Web Speech and cloud TTS models.',
      dueDate: tomorrow,
      dueTime: '11:00',
      priority: 'medium',
      category: 'Study',
      completed: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'task-seed-4',
      title: 'Weekly Grocery Restock & Meal Prep',
      description: 'Organic oats, berries, almond milk, greens, and espresso beans.',
      dueDate: in3Days,
      dueTime: '10:00',
      priority: 'low',
      category: 'Personal',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-seed-5',
      title: 'Submit Expense Report & Invoices',
      description: 'Organize receipts from dev cloud hosting and developer subscriptions.',
      dueDate: yesterday,
      dueTime: '18:00',
      priority: 'high',
      category: 'Finance',
      completed: false,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'task-seed-6',
      title: '30-Minute Evening Cardio or Stretching',
      description: 'Cardio workout and foam rolling to decompress after coding sessions.',
      dueDate: today,
      dueTime: '19:30',
      priority: 'medium',
      category: 'Health',
      completed: true,
      completedAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    }
  ];
}

export function getInitialSeedRoutines(): Routine[] {
  const today = getTodayDateString();
  return [
    {
      id: 'routine-seed-1',
      name: 'Morning Focus & Daily Planning',
      time: '08:00 AM',
      description: 'Review high-priority tasks, drink 500ml water, and organize day in Alexa+.',
      daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
      category: 'Productivity',
      completedDates: [today],
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: 'routine-seed-2',
      name: 'Midday Hydration & Posture Reset',
      time: '01:00 PM',
      description: 'Step away from screen for 10 minutes, stretch, and hydrate.',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Daily
      category: 'Health',
      completedDates: [],
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: 'routine-seed-3',
      name: 'Deep Work Learning Sprint',
      time: '04:00 PM',
      description: 'Dedicate 45 minutes to advanced AI papers or framework architecture.',
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
      category: 'Study',
      completedDates: [],
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
    {
      id: 'routine-seed-4',
      name: 'Evening Wind-Down & Digital Sunset',
      time: '10:00 PM',
      description: 'Journal reflections, close open laptop tabs, and read printed book.',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Daily
      category: 'Wellness',
      completedDates: [],
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    }
  ];
}

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Alex',
  theme: 'dark',
  voiceFeedback: true,
  voiceSpeed: 1.0,
  soundEffects: true,
  assistantMode: 'auto',
};

// Storage retrieval with safety fallbacks
export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      const seeds = getInitialSeedTasks();
      saveTasksToStorage(seeds);
      return seeds;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load tasks from localStorage:', e);
    return [];
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage:', e);
  }
}

export function loadRoutinesFromStorage(): Routine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    if (!raw) {
      const seeds = getInitialSeedRoutines();
      saveRoutinesToStorage(seeds);
      return seeds;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load routines from localStorage:', e);
    return [];
  }
}

export function saveRoutinesToStorage(routines: Routine[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  } catch (e) {
    console.error('Failed to save routines to localStorage:', e);
  }
}

export function loadSettingsFromStorage(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveSettingsToStorage(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettingsToStorage(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

// Real statistics calculator using actual stored records
export function calculateProductivityStats(tasks: Task[], routines: Routine[]): ProductivityStats {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter(t => isTaskOverdue(t.dueDate, t.dueTime, t.completed)).length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Real today and 7-day completion count
  const todayStr = getTodayDateString();
  const completedToday = tasks.filter(t => t.completed && t.completedAt && t.completedAt.startsWith(todayStr)).length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const completedThisWeek = tasks.filter(t => {
    if (!t.completed || !t.completedAt) return false;
    return new Date(t.completedAt) >= sevenDaysAgo;
  }).length;

  // Priority breakdown
  const priorityBreakdown = {
    urgent: tasks.filter(t => t.priority === 'urgent' && !t.completed).length,
    high: tasks.filter(t => t.priority === 'high' && !t.completed).length,
    medium: tasks.filter(t => t.priority === 'medium' && !t.completed).length,
    low: tasks.filter(t => t.priority === 'low' && !t.completed).length,
  };

  // Categories breakdown
  const categories: TaskCategory[] = ['Work', 'Personal', 'Study', 'Health', 'Finance', 'Project', 'Errands', 'Other'];
  const categoryBreakdown = categories.map(cat => {
    const inCat = tasks.filter(t => t.category === cat);
    return {
      category: cat,
      count: inCat.length,
      completed: inCat.filter(t => t.completed).length,
    };
  }).filter(c => c.count > 0);

  // Daily activity past 7 days
  const dailyActivity = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayName = dayNames[d.getDay()];

    const completedOnDay = tasks.filter(t => t.completed && t.completedAt && t.completedAt.startsWith(dateStr)).length;
    const createdOnDay = tasks.filter(t => t.createdAt && t.createdAt.startsWith(dateStr)).length;

    dailyActivity.push({
      date: dateStr,
      dayName: i === 0 ? 'Today' : dayName,
      completedCount: completedOnDay,
      createdCount: createdOnDay,
    });
  }

  // Today's routines count & completed
  const todayRoutines = routines.filter(r => isRoutineScheduledForToday(r.daysOfWeek));
  const todayRoutinesCount = todayRoutines.length;
  const todayRoutinesCompleted = todayRoutines.filter(r => r.completedDates?.includes(todayStr)).length;

  return {
    totalTasks,
    pendingTasks,
    completedTasks,
    overdueTasks,
    completionRate,
    completedThisWeek,
    completedToday,
    priorityBreakdown,
    categoryBreakdown,
    dailyActivity,
    todayRoutinesCount,
    todayRoutinesCompleted,
  };
}

// Data Export & Backup
export function exportAllData(): string {
  const tasks = loadTasksFromStorage();
  const routines = loadRoutinesFromStorage();
  const settings = loadSettingsFromStorage();

  const backup = {
    version: '1.0.0',
    exportTimestamp: new Date().toISOString(),
    appName: 'Alexa+ Smart Live Assistant',
    data: {
      tasks,
      routines,
      settings,
    }
  };

  return JSON.stringify(backup, null, 2);
}

// Data Import with Validation
export function importData(jsonString: string): { success: boolean; message: string; count?: number } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.data) {
      return { success: false, message: 'Invalid backup file structure: missing data root.' };
    }

    if (Array.isArray(parsed.data.tasks)) {
      saveTasksToStorage(parsed.data.tasks);
    }
    if (Array.isArray(parsed.data.routines)) {
      saveRoutinesToStorage(parsed.data.routines);
    }
    if (parsed.data.settings && typeof parsed.data.settings === 'object') {
      saveSettingsToStorage({ ...DEFAULT_SETTINGS, ...parsed.data.settings });
    }

    const taskCount = parsed.data.tasks?.length || 0;
    const routineCount = parsed.data.routines?.length || 0;
    return {
      success: true,
      message: `Successfully restored ${taskCount} tasks and ${routineCount} routines.`,
      count: taskCount + routineCount,
    };
  } catch (err: any) {
    return { success: false, message: `Failed to import JSON: ${err.message}` };
  }
}

// Reset Local Data
export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.ROUTINES);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.CHAT);
}
