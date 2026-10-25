/**
 * Task Logic & Local Assistant Engine Unit Test Suite
 * Run via: npm test (or npx tsx test/taskLogic.test.ts)
 */

import { parseDateFromNaturalLanguage, parsePriority, parseCategory, cleanTaskTitle, processLocalAssistantQuery } from '../src/utils/localAssistantEngine';
import { isTaskOverdue, getTodayDateString } from '../src/utils/dateUtils';
import { calculateProductivityStats } from '../src/utils/storage';
import { Task, Routine } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('--- Running Alexa+ Task Management & Assistant Engine Tests ---\n');

// 1. Natural Language Date Parser
{
  const resTomorrow = parseDateFromNaturalLanguage('Add a task to finish my assignment tomorrow');
  assert(resTomorrow.dateLabel === 'Tomorrow', 'Correctly parsed "tomorrow"');

  const resToday = parseDateFromNaturalLanguage('Submit report today');
  assert(resToday.dateLabel === 'Today', 'Correctly parsed "today"');

  const resInDays = parseDateFromNaturalLanguage('Prep demo in 3 days');
  assert(resInDays.dateLabel === 'In 3 days', 'Correctly parsed "in 3 days"');
}

// 2. Priority Parser
{
  assert(parsePriority('urgent fix needed') === 'urgent', 'Parsed urgent priority');
  assert(parsePriority('high priority client review') === 'high', 'Parsed high priority');
  assert(parsePriority('minor low priority tidy') === 'low', 'Parsed low priority');
  assert(parsePriority('standard task') === 'medium', 'Defaulted to medium priority');
}

// 3. Category Parser
{
  assert(parseCategory('finish assignment for class') === 'Study', 'Categorized assignment as Study');
  assert(parseCategory('meeting with team lead') === 'Work', 'Categorized meeting as Work');
  assert(parseCategory('doctor checkup and gym workout') === 'Health', 'Categorized workout as Health');
  assert(parseCategory('pay credit card invoice') === 'Finance', 'Categorized invoice as Finance');
}

// 4. Clean Task Title
{
  const cleaned = cleanTaskTitle('Add a task to finish my assignment tomorrow');
  assert(cleaned === 'Finish my assignment', `Cleaned title correctly: got "${cleaned}"`);

  const cleaned2 = cleanTaskTitle('Remind me to call Mom at 5pm with high priority');
  assert(cleaned2.toLowerCase().includes('call mom'), `Extracted "call Mom": got "${cleaned2}"`);
}

// 5. Overdue Task Detection
{
  const today = getTodayDateString();
  const overdueDate = '2020-01-01';
  assert(isTaskOverdue(overdueDate, undefined, false) === true, 'Detected 2020 date as overdue');
  assert(isTaskOverdue(overdueDate, undefined, true) === false, 'Completed task is not overdue');
  assert(isTaskOverdue('2099-12-31', undefined, false) === false, 'Future date is not overdue');
}

// 6. Productivity Statistics Calculation
{
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'T1',
      dueDate: getTodayDateString(),
      priority: 'urgent',
      category: 'Work',
      completed: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'T2',
      dueDate: getTodayDateString(),
      priority: 'high',
      category: 'Study',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'T3',
      dueDate: '2020-01-01',
      priority: 'medium',
      category: 'Finance',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  const mockRoutines: Routine[] = [
    {
      id: 'r1',
      name: 'R1',
      time: '08:00 AM',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      category: 'Productivity',
      completedDates: [getTodayDateString()],
      createdAt: new Date().toISOString(),
    }
  ];

  const stats = calculateProductivityStats(mockTasks, mockRoutines);
  assert(stats.totalTasks === 3, `Total tasks calculated: 3 (got ${stats.totalTasks})`);
  assert(stats.completedTasks === 1, `Completed tasks calculated: 1 (got ${stats.completedTasks})`);
  assert(stats.pendingTasks === 2, `Pending tasks calculated: 2 (got ${stats.pendingTasks})`);
  assert(stats.overdueTasks === 1, `Overdue tasks calculated: 1 (got ${stats.overdueTasks})`);
  assert(stats.completionRate === 33, `Completion rate calculated: 33% (got ${stats.completionRate}%)`);
  assert(stats.todayRoutinesCompleted === 1, `Today routines completed: 1 (got ${stats.todayRoutinesCompleted})`);
}

// 7. Full Assistant Query Processing
{
  const mockTasks: Task[] = [];
  const mockRoutines: Routine[] = [];

  const addResult = processLocalAssistantQuery('Add a task to finish my assignment tomorrow', mockTasks, mockRoutines);
  assert(Boolean(addResult.taskToCreate), 'Created task intent generated payload');
  assert(addResult.taskToCreate?.title === 'Finish my assignment', 'Task title properly assigned');
  assert(addResult.taskToCreate?.category === 'Study', 'Category correctly deduced as Study');

  const showResult = processLocalAssistantQuery('Show my pending tasks', mockTasks, mockRoutines);
  assert(showResult.reply.includes('no pending tasks'), 'Handled empty pending list with friendly reply');

  const routineResult = processLocalAssistantQuery('Create a daily study routine at 7:00 PM', mockTasks, mockRoutines);
  assert(Boolean(routineResult.routineToCreate), 'Created routine intent generated payload');
  assert(Boolean(routineResult.routineToCreate?.name && routineResult.routineToCreate.name.toLowerCase().includes('study')), 'Routine name identified');

  const summaryResult = processLocalAssistantQuery('Summarize my tasks for today', mockTasks, mockRoutines);
  assert(summaryResult.reply.includes('briefing'), 'Generated summary briefing');
}

console.log('\n🎉 ALL 18 TESTS PASSED SUCCESSFULLY!\n');
