/**
 * Date utility helpers for Alexa+ Smart Live Assistant
 */

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDatePretty(dateString: string): string {
  if (!dateString) return '';
  const today = getTodayDateString();

  const [y, m, d] = dateString.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - todayDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 6) {
    return targetDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  return targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(dateString: string, timeString?: string): string {
  const prettyDate = formatDatePretty(dateString);
  if (!timeString) return prettyDate;
  return `${prettyDate} at ${formatTimeDisplay(timeString)}`;
}

export function formatTimeDisplay(time24: string): string {
  if (!time24) return '';
  if (time24.includes('AM') || time24.includes('PM')) return time24;
  const [hours, minutes] = time24.split(':').map(Number);
  if (isNaN(hours)) return time24;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = String(minutes || 0).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
}

export function isTaskOverdue(dueDate: string, dueTime?: string, completed?: boolean): boolean {
  if (completed) return false;
  if (!dueDate) return false;

  const today = getTodayDateString();
  if (dueDate < today) return true;
  
  if (dueDate === today && dueTime) {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    
    let [taskH, taskM] = dueTime.split(':').map(Number);
    if (!isNaN(taskH) && !isNaN(taskM)) {
      if (currentHours > taskH || (currentHours === taskH && currentMinutes > taskM)) {
        return true;
      }
    }
  }

  return false;
}

export function isTaskDueToday(dueDate: string): boolean {
  return dueDate === getTodayDateString();
}

export const DAYS_OF_WEEK = [
  { id: 0, short: 'Sun', name: 'Sunday' },
  { id: 1, short: 'Mon', name: 'Monday' },
  { id: 2, short: 'Tue', name: 'Tuesday' },
  { id: 3, short: 'Wed', name: 'Wednesday' },
  { id: 4, short: 'Thu', name: 'Thursday' },
  { id: 5, short: 'Fri', name: 'Friday' },
  { id: 6, short: 'Sat', name: 'Saturday' },
];

export function getDayName(dayIndex: number): string {
  return DAYS_OF_WEEK[dayIndex]?.name || '';
}

export function getShortDayName(dayIndex: number): string {
  return DAYS_OF_WEEK[dayIndex]?.short || '';
}

export function isRoutineScheduledForToday(daysOfWeek: number[]): boolean {
  const currentDay = new Date().getDay();
  return daysOfWeek.includes(currentDay);
}

export function getMonthDays(year: number, month: number) {
  // month is 0-indexed (0 = Jan, 11 = Dec)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday

  const days: { dateString: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevMonthDate = new Date(year, month - 1, day);
    const dateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days.push({
      dateString: dateStr,
      dayNumber: day,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      dateString: dateStr,
      dayNumber: i,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete full weeks (up to 35 or 42 cells)
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthDate = new Date(year, month + 1, i);
    const dateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      dateString: dateStr,
      dayNumber: i,
      isCurrentMonth: false,
    });
  }

  return days;
}
