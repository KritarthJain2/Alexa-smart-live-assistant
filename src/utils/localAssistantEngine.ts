import { Task, Routine, Priority, TaskCategory, AssistantActionCard } from '../types';
import { getTodayDateString, formatDatePretty, isTaskOverdue, isTaskDueToday, isRoutineScheduledForToday } from './dateUtils';

export interface LocalEngineResult {
  reply: string;
  actionCard?: AssistantActionCard;
  taskToCreate?: Partial<Task>;
  routineToCreate?: Partial<Routine>;
  taskToCompleteId?: string;
  taskToDeleteId?: string;
  clearCompleted?: boolean;
}

// Helper to parse relative and named dates
export function parseDateFromNaturalLanguage(input: string): { dateStr: string; dateLabel: string } {
  const lower = input.toLowerCase();
  const d = new Date();
  const todayStr = getTodayDateString();

  if (lower.includes('tomorrow')) {
    d.setDate(d.getDate() + 1);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return { dateStr: `${d.getFullYear()}-${m}-${day}`, dateLabel: 'Tomorrow' };
  }

  if (lower.includes('tonight') || lower.includes('today')) {
    return { dateStr: todayStr, dateLabel: 'Today' };
  }

  if (lower.includes('yesterday')) {
    d.setDate(d.getDate() - 1);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return { dateStr: `${d.getFullYear()}-${m}-${day}`, dateLabel: 'Yesterday' };
  }

  // "in X days"
  const inDaysMatch = lower.match(/in\s+(\d+)\s+days?/);
  if (inDaysMatch && inDaysMatch[1]) {
    const daysToAdd = parseInt(inDaysMatch[1], 10);
    d.setDate(d.getDate() + daysToAdd);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return { dateStr: `${d.getFullYear()}-${m}-${day}`, dateLabel: `In ${daysToAdd} days` };
  }

  // Days of week: "next monday", "this friday", "on tuesday", etc.
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < days.length; i++) {
    const dayName = days[i];
    if (lower.includes(dayName)) {
      const currentDay = d.getDay();
      let diff = i - currentDay;
      if (diff <= 0) diff += 7; // next occurrence
      d.setDate(d.getDate() + diff);
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return { 
        dateStr: `${d.getFullYear()}-${m}-${day}`, 
        dateLabel: dayName.charAt(0).toUpperCase() + dayName.slice(1) 
      };
    }
  }

  // Specific ISO date match (e.g. 2026-10-25)
  const isoMatch = input.match(/\b(202\d-[01]\d-[0-3]\d)\b/);
  if (isoMatch && isoMatch[1]) {
    return { dateStr: isoMatch[1], dateLabel: isoMatch[1] };
  }

  // Default to today if nothing matched
  return { dateStr: todayStr, dateLabel: 'Today' };
}

// Priority parser
export function parsePriority(input: string): Priority {
  const lower = input.toLowerCase();
  if (lower.includes('urgent') || lower.includes('critical') || lower.includes('asap')) return 'urgent';
  if (lower.includes('high priority') || lower.includes('important') || lower.includes('high')) return 'high';
  if (lower.includes('low priority') || lower.includes('minor') || lower.includes('low')) return 'low';
  return 'medium';
}

// Category parser with regex boundary matching
export function parseCategory(input: string): TaskCategory {
  const lower = input.toLowerCase();
  
  if (/\b(health|gym|workout|exercise|doctor|fitness|meditation|diet|dentist|run|jog)\b/i.test(lower)) return 'Health';
  if (/\b(study|assignment|homework|exam|learn|class|course|lecture|read|reading)\b/i.test(lower)) return 'Study';
  if (/\b(finance|tax|taxes|bill|bills|invoice|budget|bank|payroll|payment|money)\b/i.test(lower)) return 'Finance';
  if (/\b(project|code|coding|feature|repo|hackathon|bug|deploy|test|release)\b/i.test(lower)) return 'Project';
  if (/\b(errand|errands|grocery|groceries|buy|shop|shopping|clean|cleaning|laundry)\b/i.test(lower)) return 'Errands';
  if (/\b(work|office|meeting|client|boss|presentation|quarterly|sync)\b/i.test(lower)) return 'Work';
  
  return 'Personal';
}

// Parse time
export function parseTime(input: string): string {
  const timeMatch = input.match(/(\d{1,2})(:(\d{2}))?\s*(am|pm)/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[3] ? timeMatch[3] : '00';
    const period = timeMatch[4].toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }
  return '09:00';
}

// Clean task title from instruction wrapper phrases
export function cleanTaskTitle(raw: string): string {
  let cleaned = raw
    .replace(/^alexa[,\s]*/i, '')
    .replace(/^(please\s+)?(can\s+you\s+)?(add|create|make|schedule|set|remind\s+me\s+to|new)\s+(a\s+)?(task|todo|reminder)?(\s+to|\s*:)?\s*/i, '')
    .replace(/\s+(due\s+(by\s+|on\s+)?|for\s+)?(tomorrow|today|tonight|next\s+\w+|in\s+\d+\s+days?|on\s+\w+).*$/i, '')
    .replace(/\s+with\s+(urgent|high|medium|low)\s+priority.*$/i, '')
    .replace(/\s+in\s+category\s+\w+.*$/i, '')
    .replace(/\s+priority\s+(urgent|high|medium|low).*$/i, '')
    .trim();

  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned || 'New Task';
}

// Clean routine name
export function cleanRoutineName(raw: string): string {
  let cleaned = raw
    .replace(/^alexa[,\s]*/i, '')
    .replace(/^(please\s+)?(can\s+you\s+)?(add|create|make|schedule|set)\s+(a\s+)?(daily\s+|weekly\s+)?(routine|habit)?(\s*:)?\s*/i, '')
    .replace(/\s+at\s+\d{1,2}(:\d{2})?\s*(am|pm)?.*$/i, '')
    .replace(/\s+every\s+(day|morning|evening|night|weekday).*$/i, '')
    .trim();

  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned || 'Daily Focus Routine';
}

/**
 * Main Deterministic Local Intent Engine
 */
export function processLocalAssistantQuery(
  userInput: string,
  tasks: Task[],
  routines: Routine[],
  userName: string = 'Alex'
): LocalEngineResult {
  const query = userInput.trim();
  const lower = query.toLowerCase();

  // 1. ADD / CREATE TASK INTENT
  const isAddTask = 
    /^(add|create|schedule|set|remind\s+me|new\s+task)/i.test(lower) ||
    lower.includes('add a task') ||
    lower.includes('add task') ||
    lower.includes('create a task') ||
    lower.includes('create task') ||
    lower.includes('remind me to');

  if (isAddTask && !lower.includes('routine') && !lower.includes('habit')) {
    const title = cleanTaskTitle(query);
    const { dateStr, dateLabel } = parseDateFromNaturalLanguage(query);
    const priority = parsePriority(query);
    const category = parseCategory(query);

    const newTask: Partial<Task> = {
      title,
      description: `Created via Alexa+ Live Assistant on ${getTodayDateString()}`,
      dueDate: dateStr,
      priority,
      category,
      completed: false,
    };

    return {
      reply: `I've added "${title}" to your tasks. It is due ${dateLabel} (${dateStr}) with ${priority} priority in ${category}.`,
      actionCard: {
        type: 'task_created',
        title: `Added Task: ${title}`,
        details: `Due ${dateLabel} • Priority: ${priority.toUpperCase()} • Category: ${category}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      taskToCreate: newTask,
    };
  }

  // 2. CREATE ROUTINE INTENT
  if (lower.includes('routine') || lower.includes('habit')) {
    if (lower.includes('create') || lower.includes('add') || lower.includes('schedule') || lower.includes('new') || lower.includes('set')) {
      const routineName = cleanRoutineName(query);
      const timeStr = parseTime(query);
      
      let daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Default daily
      if (lower.includes('weekday') || lower.includes('work day')) {
        daysOfWeek = [1, 2, 3, 4, 5];
      } else if (lower.includes('weekend')) {
        daysOfWeek = [0, 6];
      }

      const newRoutine: Partial<Routine> = {
        name: routineName,
        time: timeStr.includes('AM') || timeStr.includes('PM') ? timeStr : `${timeStr} ${parseInt(timeStr.split(':')[0], 10) >= 12 ? 'PM' : 'AM'}`,
        description: `Daily routine scheduled via Alexa+ Assistant`,
        daysOfWeek,
        category: parseCategory(query),
        completedDates: [],
      };

      const daysDescription = daysOfWeek.length === 7 ? 'Every day' : (daysOfWeek.length === 5 ? 'Weekdays (Mon-Fri)' : `${daysOfWeek.length} days/week`);

      return {
        reply: `I have created the routine "${routineName}" scheduled for ${timeStr} (${daysDescription}). You can track its daily completion in the Routines tab.`,
        actionCard: {
          type: 'routine_created',
          title: `Created Routine: ${routineName}`,
          details: `Time: ${timeStr} • Schedule: ${daysDescription}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        routineToCreate: newRoutine,
      };
    }
  }

  // 3. SHOW PENDING TASKS
  if (
    lower.includes('pending tasks') ||
    lower.includes('show pending') ||
    lower.includes('what are my pending') ||
    lower.includes('what tasks are pending') ||
    lower.includes('list pending') ||
    (lower.includes('show') && lower.includes('tasks') && !lower.includes('complete') && !lower.includes('overdue'))
  ) {
    const pending = tasks.filter(t => !t.completed);
    if (pending.length === 0) {
      return {
        reply: `You have no pending tasks! Great job staying on top of everything today. Would you like me to add a new task?`,
      };
    }

    const itemsSummary = pending.slice(0, 5).map(t => `• ${t.title} (Due ${formatDatePretty(t.dueDate)} [${t.priority}])`).join('\n');
    const extraCount = pending.length > 5 ? `\n...and ${pending.length - 5} more.` : '';

    return {
      reply: `You have ${pending.length} pending task${pending.length === 1 ? '' : 's'}:\n\n${itemsSummary}${extraCount}`,
      actionCard: {
        type: 'tasks_listed',
        title: `${pending.length} Pending Task${pending.length === 1 ? '' : 's'}`,
        details: 'Displaying active tasks needing your attention',
        items: pending.slice(0, 5),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    };
  }

  // 4. SUMMARIZE TASKS FOR TODAY / DAILY BRIEFING
  if (
    lower.includes('summarize') ||
    lower.includes('summary') ||
    lower.includes('today') ||
    lower.includes('daily briefing') ||
    lower.includes('schedule for today') ||
    lower.includes('overview')
  ) {
    const todayTasks = tasks.filter(t => isTaskDueToday(t.dueDate));
    const overdue = tasks.filter(t => isTaskOverdue(t.dueDate, t.dueTime, t.completed));
    const todayRoutines = routines.filter(r => isRoutineScheduledForToday(r.daysOfWeek));
    const todayCompletedTasks = todayTasks.filter(t => t.completed).length;

    let briefing = `Here is your productivity briefing for today, ${userName}:\n\n`;
    briefing += `• Tasks due today: ${todayTasks.length} (${todayCompletedTasks} completed)\n`;
    briefing += `• Overdue backlog: ${overdue.length} task${overdue.length === 1 ? '' : 's'}\n`;
    briefing += `• Routines scheduled: ${todayRoutines.length} habits for today\n`;

    if (overdue.length > 0) {
      briefing += `\n⚠️ Attention: You have ${overdue.length} overdue task${overdue.length === 1 ? '' : 's'}. Consider tackling "${overdue[0].title}" first.`;
    } else {
      briefing += `\n✨ You have zero overdue tasks! Keep up the great pace!`;
    }

    return {
      reply: briefing,
      actionCard: {
        type: 'schedule_summary',
        title: `Today's Daily Briefing`,
        details: `${todayTasks.length} due today • ${overdue.length} overdue • ${todayRoutines.length} routines`,
        items: todayTasks,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    };
  }

  // 5. OVERDUE TASKS
  if (lower.includes('overdue') || lower.includes('late tasks')) {
    const overdue = tasks.filter(t => isTaskOverdue(t.dueDate, t.dueTime, t.completed));
    if (overdue.length === 0) {
      return {
        reply: `Excellent! You don't have any overdue tasks right now.`,
      };
    }

    const itemsSummary = overdue.map(t => `• ${t.title} (Due ${formatDatePretty(t.dueDate)})`).join('\n');
    return {
      reply: `You have ${overdue.length} overdue task${overdue.length === 1 ? '' : 's'}:\n\n${itemsSummary}`,
      actionCard: {
        type: 'tasks_listed',
        title: `${overdue.length} Overdue Task${overdue.length === 1 ? '' : 's'}`,
        details: 'Tasks that have passed their deadline',
        items: overdue,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    };
  }

  // 6. HIGH PRIORITY / URGENT TASKS
  if (lower.includes('urgent') || lower.includes('high priority') || lower.includes('priority tasks')) {
    const urgentTasks = tasks.filter(t => !t.completed && (t.priority === 'urgent' || t.priority === 'high'));
    if (urgentTasks.length === 0) {
      return {
        reply: `You don't have any pending urgent or high-priority tasks right now.`,
      };
    }
    const itemsSummary = urgentTasks.map(t => `• [${t.priority.toUpperCase()}] ${t.title} (Due ${formatDatePretty(t.dueDate)})`).join('\n');
    return {
      reply: `Here are your ${urgentTasks.length} high priority task${urgentTasks.length === 1 ? '' : 's'}:\n\n${itemsSummary}`,
      actionCard: {
        type: 'tasks_listed',
        title: `Priority Focus (${urgentTasks.length})`,
        details: 'Urgent and High priority tasks',
        items: urgentTasks,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    };
  }

  // 7. COMPLETE TASK INTENT
  if (lower.includes('complete') || lower.includes('finish') || lower.includes('done') || lower.includes('check off')) {
    // Find task matching keywords
    const searchPart = lower
      .replace(/^alexa[,\s]*/i, '')
      .replace(/^(please\s+)?(mark|set|complete|finish|check\s+off)\s+(the\s+)?(task\s+)?/i, '')
      .replace(/\s+(as\s+)?(done|completed|finished).*$/i, '')
      .trim();

    if (searchPart.length > 2) {
      const match = tasks.find(t => !t.completed && t.title.toLowerCase().includes(searchPart));
      if (match) {
        return {
          reply: `Done! I've marked "${match.title}" as completed.`,
          actionCard: {
            type: 'task_completed',
            title: `Completed: ${match.title}`,
            details: `Marked finished at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          taskToCompleteId: match.id,
        };
      }
    }
  }

  // 8. DELETE TASK INTENT
  if (lower.includes('delete') || lower.includes('remove') || lower.includes('cancel task')) {
    const searchPart = lower
      .replace(/^alexa[,\s]*/i, '')
      .replace(/^(please\s+)?(delete|remove|cancel)\s+(the\s+)?(task\s+)?/i, '')
      .trim();

    if (searchPart.length > 2) {
      const match = tasks.find(t => t.title.toLowerCase().includes(searchPart));
      if (match) {
        return {
          reply: `I've removed the task "${match.title}" from your task list.`,
          actionCard: {
            type: 'task_deleted',
            title: `Deleted: ${match.title}`,
            details: 'Task removed permanently',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          taskToDeleteId: match.id,
        };
      }
    }
  }

  // 9. CLEAR COMPLETED
  if (lower.includes('clear completed') || lower.includes('clean completed') || lower.includes('remove completed')) {
    const completedCount = tasks.filter(t => t.completed).length;
    return {
      reply: `I've cleared all ${completedCount} completed tasks for you.`,
      actionCard: {
        type: 'cleared_completed',
        title: 'Cleared Completed Tasks',
        details: `Removed ${completedCount} finished items`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      clearCompleted: true,
    };
  }

  // 10. PRODUCTIVITY SCORE / STATS
  if (lower.includes('productivity') || lower.includes('completion rate') || lower.includes('stats')) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      reply: `Your overall task completion rate is ${rate}% (${completed} of ${total} tasks finished). Check the Insights tab for detailed priority and category breakdowns!`,
    };
  }

  // 11. HELP / GREETING / CAPABILITIES
  if (lower.includes('help') || lower.includes('what can you do') || lower.includes('commands') || lower.includes('hello') || lower.includes('hi')) {
    return {
      reply: `Hello ${userName}! I am your Alexa+ Smart Live Assistant. Here are some things you can ask me:

• "Add a task to finish my assignment tomorrow"
• "Show my pending tasks"
• "Create a daily study routine at 4:00 PM"
• "Summarize my tasks for today"
• "What are my high priority tasks?"
• "Mark [task name] as done"
• "Delete task [task name]"
• "What is my productivity completion rate?"

You can type or use the voice microphone button anytime!`,
    };
  }

  // Fallback conversational reply
  return {
    reply: `I understand you're saying: "${query}". You can ask me to add tasks (e.g., "Add a task to review notes tomorrow"), show pending tasks, create daily routines, or summarize your day.`,
  };
}
