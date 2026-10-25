/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TaskManagerView } from './components/TaskManagerView';
import { ChatAssistantView } from './components/ChatAssistantView';
import { DailyRoutineView } from './components/DailyRoutineView';
import { CalendarView } from './components/CalendarView';
import { InsightsView } from './components/InsightsView';
import { SettingsView } from './components/SettingsView';
import { TaskModal } from './components/TaskModal';
import { RoutineModal } from './components/RoutineModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer, ToastMessage } from './components/Toast';

import { Task, Routine, UserSettings, ChatMessage, Priority, TaskCategory } from './types';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  loadRoutinesFromStorage,
  saveRoutinesToStorage,
  loadSettingsFromStorage,
  saveSettingsToStorage,
  calculateProductivityStats,
  resetAllData,
  DEFAULT_SETTINGS
} from './utils/storage';
import { processLocalAssistantQuery } from './utils/localAssistantEngine';
import { speakAlexaResponse, stopSpeech } from './utils/speech';
import { getTodayDateString, isRoutineScheduledForToday } from './utils/dateUtils';

export default function App() {
  // 1. Persistent State
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [routines, setRoutines] = useState<Routine[]>(() => loadRoutinesFromStorage());
  const [settings, setSettings] = useState<UserSettings>(() => loadSettingsFromStorage());

  // 2. Navigation & UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 3. Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskInitialDate, setTaskInitialDate] = useState<string | undefined>(undefined);

  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [routineToEdit, setRoutineToEdit] = useState<Routine | null>(null);

  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // 4. Assistant & AI State
  const [isGeminiConfigured, setIsGeminiConfigured] = useState(false);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome-1',
        sender: 'assistant',
        text: `Hello ${settings.userName}! I am your Alexa+ Smart Live Assistant.\n\nI can help you add tasks, track daily routines, organize schedules, and review your productivity.\n\nTry saying: "Add a task to finish my assignment tomorrow" or "Show my pending tasks".`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modeUsed: 'local',
      }
    ];
  });

  // Check server Gemini configuration status on mount
  useEffect(() => {
    fetch('/api/assistant/status')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.configured === 'boolean') {
          setIsGeminiConfigured(data.configured);
        }
      })
      .catch(() => {
        setIsGeminiConfigured(false);
      });
  }, []);

  // Save tasks and routines whenever updated
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  useEffect(() => {
    saveRoutinesToStorage(routines);
  }, [routines]);

  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);

  // Toast Dispatcher Helper
  const showToast = useCallback((title: string, description?: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts(prev => [...prev, { id, title, description, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Real Productivity Stats
  const productivityStats = useMemo(() => {
    return calculateProductivityStats(tasks, routines);
  }, [tasks, routines]);

  // Task Handlers
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const nowIso = new Date().toISOString();

    if (taskData.id) {
      // Edit existing task
      setTasks(prev => prev.map(t => {
        if (t.id === taskData.id) {
          return {
            ...t,
            ...taskData,
            updatedAt: nowIso,
          } as Task;
        }
        return t;
      }));
      showToast('Task Updated', `"${taskData.title}" was updated successfully.`, 'success');
    } else {
      // Create new task
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: taskData.title,
        description: taskData.description || '',
        dueDate: taskData.dueDate,
        dueTime: taskData.dueTime,
        priority: taskData.priority,
        category: taskData.category,
        completed: false,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setTasks(prev => [newTask, ...prev]);
      showToast('Task Created', `"${newTask.title}" added to your tasks.`, 'success');
    }
  };

  const handleToggleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        const updated = {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
        showToast(
          nextCompleted ? 'Task Completed' : 'Task Reopened',
          `"${t.title}" marked as ${nextCompleted ? 'completed' : 'pending'}.`,
          nextCompleted ? 'success' : 'info'
        );
        return updated;
      }
      return t;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    setConfirmModalConfig({
      isOpen: true,
      title: 'Delete Task?',
      message: `Are you sure you want to permanently delete "${target.title}"?`,
      confirmLabel: 'Delete Task',
      onConfirm: () => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
        showToast('Task Deleted', `"${target.title}" was removed.`, 'info');
      }
    });
  };

  // Routine Handlers
  const handleSaveRoutine = (routineData: Omit<Routine, 'id' | 'createdAt'> & { id?: string }) => {
    if (routineData.id) {
      setRoutines(prev => prev.map(r => {
        if (r.id === routineData.id) {
          return {
            ...r,
            ...routineData,
          } as Routine;
        }
        return r;
      }));
      showToast('Routine Updated', `"${routineData.name}" routine was updated.`, 'success');
    } else {
      const newRoutine: Routine = {
        id: `routine-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: routineData.name,
        time: routineData.time,
        description: routineData.description || '',
        daysOfWeek: routineData.daysOfWeek,
        category: routineData.category,
        completedDates: [],
        createdAt: new Date().toISOString(),
      };
      setRoutines(prev => [newRoutine, ...prev]);
      showToast('Routine Created', `"${newRoutine.name}" added to daily routines.`, 'success');
    }
  };

  const handleToggleRoutineComplete = (routineId: string) => {
    const today = getTodayDateString();
    setRoutines(prev => prev.map(r => {
      if (r.id === routineId) {
        const completedDates = r.completedDates || [];
        const isDone = completedDates.includes(today);
        const nextDates = isDone ? completedDates.filter(d => d !== today) : [...completedDates, today];
        showToast(
          isDone ? 'Routine Reopened' : 'Routine Completed',
          `"${r.name}" marked ${isDone ? 'incomplete' : 'completed'} for today.`,
          isDone ? 'info' : 'success'
        );
        return {
          ...r,
          completedDates: nextDates,
        };
      }
      return r;
    }));
  };

  const handleDeleteRoutine = (routineId: string) => {
    const target = routines.find(r => r.id === routineId);
    if (!target) return;

    setConfirmModalConfig({
      isOpen: true,
      title: 'Delete Routine?',
      message: `Are you sure you want to permanently delete the routine "${target.name}"?`,
      confirmLabel: 'Delete Routine',
      onConfirm: () => {
        setRoutines(prev => prev.filter(r => r.id !== routineId));
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
        showToast('Routine Deleted', `"${target.name}" was removed.`, 'info');
      }
    });
  };

  // Conversational Assistant Dispatcher
  const handleSendAssistantMessage = async (userInput: string) => {
    if (!userInput.trim()) return;

    const userMsgId = `msg-user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: userInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsAssistantLoading(true);

    try {
      // 1. First attempt server-side Gemini endpoint if available
      let responseHandled = false;

      if (isGeminiConfigured) {
        try {
          const apiRes = await fetch('/api/assistant/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: userInput.trim(),
              context: {
                tasks: tasks.slice(0, 30),
                routines,
                userProfile: { name: settings.userName }
              }
            })
          });

          const data = await apiRes.json();

          if (data && data.success && (data.reply || (data.functionCalls && data.functionCalls.length > 0))) {
            responseHandled = true;

            let replyText = data.reply || '';
            let actionCard = undefined;

            // Handle tool/function calls from Gemini
            if (data.functionCalls && data.functionCalls.length > 0) {
              for (const call of data.functionCalls) {
                if (call.name === 'create_task') {
                  const args = call.args || {};
                  const newTask: Task = {
                    id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    title: args.title || 'New Task',
                    description: args.description || '',
                    dueDate: args.dueDate || getTodayDateString(),
                    dueTime: args.dueTime,
                    priority: (args.priority as Priority) || 'medium',
                    category: (args.category as TaskCategory) || 'Personal',
                    completed: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  setTasks(prev => [newTask, ...prev]);
                  actionCard = {
                    type: 'task_created' as const,
                    title: `Added Task: ${newTask.title}`,
                    details: `Due ${newTask.dueDate} • Priority: ${newTask.priority.toUpperCase()} • ${newTask.category}`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  };
                  if (!replyText) {
                    replyText = `I've created the task "${newTask.title}" for ${newTask.dueDate}.`;
                  }
                } else if (call.name === 'create_routine') {
                  const args = call.args || {};
                  const newRoutine: Routine = {
                    id: `routine-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    name: args.name || 'New Routine',
                    time: args.time || '08:00 AM',
                    description: args.description || '',
                    daysOfWeek: args.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
                    category: args.category || 'Productivity',
                    completedDates: [],
                    createdAt: new Date().toISOString(),
                  };
                  setRoutines(prev => [newRoutine, ...prev]);
                  actionCard = {
                    type: 'routine_created' as const,
                    title: `Created Routine: ${newRoutine.name}`,
                    details: `Time: ${newRoutine.time}`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  };
                  if (!replyText) {
                    replyText = `I've scheduled the routine "${newRoutine.name}" for ${newRoutine.time}.`;
                  }
                }
              }
            }

            const assistantMsg: ChatMessage = {
              id: `msg-assistant-${Date.now()}`,
              sender: 'assistant',
              text: replyText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              modeUsed: 'gemini',
              actionCard,
            };

            setChatMessages(prev => [...prev, assistantMsg]);

            if (settings.voiceFeedback) {
              speakAlexaResponse(replyText, settings.voiceSpeed);
            }
          }
        } catch (e) {
          console.warn('Gemini cloud API call failed, falling back to local assistant engine:', e);
        }
      }

      // 2. Fallback to Local Deterministic Intent Engine
      if (!responseHandled) {
        const localResult = processLocalAssistantQuery(userInput.trim(), tasks, routines, settings.userName);

        // Execute actions on real state
        if (localResult.taskToCreate) {
          const newTask: Task = {
            id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            title: localResult.taskToCreate.title || 'New Task',
            description: localResult.taskToCreate.description || '',
            dueDate: localResult.taskToCreate.dueDate || getTodayDateString(),
            dueTime: localResult.taskToCreate.dueTime,
            priority: (localResult.taskToCreate.priority as Priority) || 'medium',
            category: (localResult.taskToCreate.category as TaskCategory) || 'Personal',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setTasks(prev => [newTask, ...prev]);
          showToast('Task Created by Assistant', `"${newTask.title}" added to your list.`, 'success');
        }

        if (localResult.routineToCreate) {
          const newRoutine: Routine = {
            id: `routine-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: localResult.routineToCreate.name || 'New Routine',
            time: localResult.routineToCreate.time || '08:00 AM',
            description: localResult.routineToCreate.description || '',
            daysOfWeek: localResult.routineToCreate.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
            category: localResult.routineToCreate.category || 'Productivity',
            completedDates: [],
            createdAt: new Date().toISOString(),
          };
          setRoutines(prev => [newRoutine, ...prev]);
          showToast('Routine Created by Assistant', `"${newRoutine.name}" scheduled.`, 'success');
        }

        if (localResult.taskToCompleteId) {
          handleToggleTaskComplete(localResult.taskToCompleteId);
        }

        if (localResult.taskToDeleteId) {
          setTasks(prev => prev.filter(t => t.id !== localResult.taskToDeleteId));
          showToast('Task Removed', 'Task deleted as requested.', 'info');
        }

        if (localResult.clearCompleted) {
          setTasks(prev => prev.filter(t => !t.completed));
          showToast('Cleared', 'Completed tasks removed from active view.', 'info');
        }

        const assistantMsg: ChatMessage = {
          id: `msg-assistant-${Date.now()}`,
          sender: 'assistant',
          text: localResult.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modeUsed: 'local',
          actionCard: localResult.actionCard,
        };

        setChatMessages(prev => [...prev, assistantMsg]);

        if (settings.voiceFeedback) {
          speakAlexaResponse(localResult.reply, settings.voiceSpeed);
        }
      }
    } finally {
      setIsAssistantLoading(false);
    }
  };

  // Full Reset
  const handleResetData = () => {
    resetAllData();
    setTasks([]);
    setRoutines([]);
    setSettings(DEFAULT_SETTINGS);
    setChatMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'assistant',
        text: 'All local data has been reset to clean slate. How can I assist you with your productivity today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modeUsed: 'local',
      }
    ]);
  };

  const handleReloadData = () => {
    setTasks(loadTasksFromStorage());
    setRoutines(loadRoutinesFromStorage());
    setSettings(loadSettingsFromStorage());
  };

  // Dynamic Theme Styling
  const themeBgClasses = {
    dark: 'bg-[#0A0F1D] text-slate-100',
    twilight: 'bg-[#0E0A1E] text-slate-100',
    light: 'bg-[#0F172A] text-slate-100',
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${themeBgClasses[settings.theme]}`}>
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingCount={productivityStats.pendingTasks}
          todayRoutinesCount={productivityStats.todayRoutinesCount}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          mobileOpen={mobileDrawerOpen}
          onCloseMobile={() => setMobileDrawerOpen(false)}
          userName={settings.userName}
        />

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Header */}
          <Header
            activeTab={activeTab}
            onOpenMobile={() => setMobileDrawerOpen(true)}
            onQuickAddTask={() => {
              setTaskToEdit(null);
              setTaskInitialDate(undefined);
              setTaskModalOpen(true);
            }}
            onOpenAssistant={() => setActiveTab('assistant')}
            voiceFeedbackEnabled={settings.voiceFeedback}
            onToggleVoiceFeedback={() => {
              const nextState = !settings.voiceFeedback;
              setSettings(prev => ({ ...prev, voiceFeedback: nextState }));
              if (!nextState) stopSpeech();
            }}
            isGeminiConfigured={isGeminiConfigured}
          />

          {/* Views */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {activeTab === 'dashboard' && (
              <DashboardView
                userName={settings.userName}
                tasks={tasks}
                routines={routines}
                stats={productivityStats}
                onToggleTaskComplete={handleToggleTaskComplete}
                onToggleRoutineComplete={handleToggleRoutineComplete}
                onNavigateTab={setActiveTab}
                onOpenCreateTask={() => {
                  setTaskToEdit(null);
                  setTaskInitialDate(undefined);
                  setTaskModalOpen(true);
                }}
                onOpenCreateRoutine={() => {
                  setRoutineToEdit(null);
                  setRoutineModalOpen(true);
                }}
                onSendAssistantPrompt={handleSendAssistantMessage}
              />
            )}

            {activeTab === 'tasks' && (
              <TaskManagerView
                tasks={tasks}
                onToggleComplete={handleToggleTaskComplete}
                onOpenCreateModal={() => {
                  setTaskToEdit(null);
                  setTaskInitialDate(undefined);
                  setTaskModalOpen(true);
                }}
                onEditTask={task => {
                  setTaskToEdit(task);
                  setTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {activeTab === 'assistant' && (
              <ChatAssistantView
                messages={chatMessages}
                onSendMessage={handleSendAssistantMessage}
                isLoading={isAssistantLoading}
                voiceFeedbackEnabled={settings.voiceFeedback}
                onToggleVoiceFeedback={() => {
                  const nextState = !settings.voiceFeedback;
                  setSettings(prev => ({ ...prev, voiceFeedback: nextState }));
                  if (!nextState) stopSpeech();
                }}
                isGeminiConfigured={isGeminiConfigured}
                onNavigateTab={setActiveTab}
                onClearHistory={() => {
                  setChatMessages([
                    {
                      id: `msg-cleared-${Date.now()}`,
                      sender: 'assistant',
                      text: `Chat history cleared. How can I help you today, ${settings.userName}?`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      modeUsed: 'local',
                    }
                  ]);
                  showToast('History Cleared', 'Assistant chat history has been reset.', 'info');
                }}
              />
            )}

            {activeTab === 'routines' && (
              <DailyRoutineView
                routines={routines}
                onToggleRoutineComplete={handleToggleRoutineComplete}
                onOpenCreateRoutineModal={() => {
                  setRoutineToEdit(null);
                  setRoutineModalOpen(true);
                }}
                onEditRoutine={routine => {
                  setRoutineToEdit(routine);
                  setRoutineModalOpen(true);
                }}
                onDeleteRoutine={handleDeleteRoutine}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                tasks={tasks}
                routines={routines}
                onOpenCreateTaskOnDate={dateStr => {
                  setTaskToEdit(null);
                  setTaskInitialDate(dateStr);
                  setTaskModalOpen(true);
                }}
                onToggleTaskComplete={handleToggleTaskComplete}
              />
            )}

            {activeTab === 'insights' && (
              <InsightsView
                stats={productivityStats}
                tasks={tasks}
                routines={routines}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={newSets => setSettings(prev => ({ ...prev, ...newSets }))}
                onResetAllData={handleResetData}
                isGeminiConfigured={isGeminiConfigured}
                tasksCount={tasks.length}
                routinesCount={routines.length}
                onShowToast={showToast}
                onReloadData={handleReloadData}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modals and Toasts */}
      <TaskModal
        isOpen={taskModalOpen}
        taskToEdit={taskToEdit}
        initialDate={taskInitialDate}
        onSave={handleSaveTask}
        onClose={() => setTaskModalOpen(false)}
      />

      <RoutineModal
        isOpen={routineModalOpen}
        routineToEdit={routineToEdit}
        onSave={handleSaveRoutine}
        onClose={() => setRoutineModalOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmLabel={confirmModalConfig.confirmLabel}
        onConfirm={confirmModalConfig.onConfirm}
        onCancel={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
