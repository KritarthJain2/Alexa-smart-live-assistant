export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type TaskCategory = 
  | 'Work' 
  | 'Personal' 
  | 'Study' 
  | 'Health' 
  | 'Finance' 
  | 'Project' 
  | 'Errands' 
  | 'Other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: Priority;
  category: TaskCategory;
  completed: boolean;
  completedAt?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Routine {
  id: string;
  name: string;
  time: string; // e.g. "07:30 AM" or "07:30"
  description?: string;
  daysOfWeek: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  category: string;
  completedDates: string[]; // List of YYYY-MM-DD when completed
  createdAt: string;
}

export interface UserSettings {
  userName: string;
  theme: 'dark' | 'twilight' | 'light';
  voiceFeedback: boolean;
  voiceSpeed: number; // 0.8 to 1.4
  soundEffects: boolean;
  assistantMode: 'auto' | 'gemini' | 'local';
}

export type AssistantActionType = 
  | 'task_created'
  | 'task_completed'
  | 'task_deleted'
  | 'routine_created'
  | 'tasks_listed'
  | 'schedule_summary'
  | 'navigated'
  | 'cleared_completed';

export interface AssistantActionCard {
  type: AssistantActionType;
  title: string;
  details?: string;
  items?: any[];
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  modeUsed?: 'gemini' | 'local';
  actionCard?: AssistantActionCard;
}

export interface TaskFilterOptions {
  search: string;
  status: 'all' | 'pending' | 'completed' | 'overdue';
  priority: 'all' | Priority;
  category: 'all' | TaskCategory;
  sortBy: 'dueDate' | 'priority' | 'title' | 'createdAt';
  sortDirection: 'asc' | 'desc';
}

export interface ProductivityStats {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number; // 0 to 100 percentage
  completedThisWeek: number;
  completedToday: number;
  priorityBreakdown: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  categoryBreakdown: {
    category: TaskCategory;
    count: number;
    completed: number;
  }[];
  dailyActivity: {
    date: string;
    dayName: string;
    completedCount: number;
    createdCount: number;
  }[];
  todayRoutinesCount: number;
  todayRoutinesCompleted: number;
}
