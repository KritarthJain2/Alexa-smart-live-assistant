import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Volume2,
  Download,
  Upload,
  RotateCcw,
  ShieldAlert,
  Server,
  Database,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sliders
} from 'lucide-react';
import { UserSettings, Task, Routine } from '../types';
import { exportAllData, importData } from '../utils/storage';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetAllData: () => void;
  isGeminiConfigured: boolean;
  tasksCount: number;
  routinesCount: number;
  onShowToast: (title: string, description?: string, type?: 'success' | 'warning' | 'info') => void;
  onReloadData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
  isGeminiConfigured,
  tasksCount,
  routinesCount,
  onShowToast,
  onReloadData,
}) => {
  const [userNameInput, setUserNameInput] = useState(settings.userName);
  const [isSavedName, setIsSavedName] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNameInput.trim()) return;
    onUpdateSettings({ userName: userNameInput.trim() });
    setIsSavedName(true);
    onShowToast('Name Updated', `Assistant will now address you as ${userNameInput.trim()}.`, 'success');
    setTimeout(() => setIsSavedName(false), 2000);
  };

  const handleExport = () => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alexa_plus_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Backup Exported', 'Full tasks, routines, and settings downloaded as JSON.', 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = importData(content);
      if (result.success) {
        onShowToast('Data Restored', result.message, 'success');
        onReloadData();
      } else {
        onShowToast('Import Failed', result.message, 'warning');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* 1. Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-cyan-400" />
          <span>Settings &amp; System Configuration</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Customize your assistant experience, theme preferences, speech parameters, and local data
        </p>
      </div>

      {/* 2. User Profile Display Name */}
      <div className="p-6 rounded-2xl bg-[#0D1527] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
          <User className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base text-white">User Profile</h3>
        </div>

        <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={userNameInput}
              onChange={e => setUserNameInput(e.target.value)}
              placeholder="Your Name (e.g. Alex)"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 outline-none text-white text-sm"
            />
          </div>

          <button
            type="submit"
            className="sm:mt-5 px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-md"
          >
            {isSavedName ? 'Saved!' : 'Save Name'}
          </button>
        </form>
      </div>

      {/* 3. Appearance & Themes */}
      <div className="p-6 rounded-2xl bg-[#0D1527] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
          <Moon className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-base text-white">Appearance Theme</h3>
        </div>

        <p className="text-xs text-slate-400">
          Select your visual environment for the assistant interface:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'dark', label: 'Dark Navy (Default)', desc: 'Amazon Alexa Deep Navy with glowing cyan accents', color: 'border-cyan-500 bg-[#0B101E]' },
            { id: 'twilight', label: 'Deep Twilight', desc: 'Vibrant indigo and dark violet night theme', color: 'border-purple-500 bg-[#120D24]' },
            { id: 'light', label: 'Clean Slate Light', desc: 'High contrast crisp daytime workspace', color: 'border-slate-400 bg-slate-900' },
          ].map(themeItem => {
            const isSelected = settings.theme === themeItem.id;

            return (
              <button
                key={themeItem.id}
                type="button"
                onClick={() => onUpdateSettings({ theme: themeItem.id as any })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-slate-800 ring-2 ring-cyan-400/40 shadow-lg'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white">{themeItem.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{themeItem.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Voice Audio & Speech Synthesis */}
      <div className="p-6 rounded-2xl bg-[#0D1527] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
          <Volume2 className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base text-white">Voice &amp; Audio Feedback</h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">Voice Response Readout</h4>
            <p className="text-xs text-slate-400">Alexa+ speaks out answers and confirmations using browser speech</p>
          </div>
          <button
            onClick={() => onUpdateSettings({ voiceFeedback: !settings.voiceFeedback })}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              settings.voiceFeedback ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.voiceFeedback ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Speed Slider */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Speech Rate / Speed</span>
            <span className="font-mono text-cyan-300 font-bold">{settings.voiceSpeed}x</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.4"
            step="0.1"
            value={settings.voiceSpeed}
            onChange={e => onUpdateSettings({ voiceSpeed: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400"
          />
        </div>
      </div>

      {/* 5. Data Management (Export, Import, Reset) */}
      <div className="p-6 rounded-2xl bg-[#0D1527] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
          <Database className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base text-white">Data Management &amp; Backup</h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Your tasks and daily routines are stored locally in your browser&apos;s localStorage for privacy and fast offline access. You can export a full JSON backup or restore previously saved data anytime.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Backup (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
          >
            <Upload className="w-4 h-4 text-purple-400" />
            <span>Import Backup (JSON)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 transition-colors ml-auto"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Reset Local Data</span>
          </button>
        </div>

        {/* Double confirmation for reset */}
        {showResetConfirm && (
          <div className="mt-4 p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-slate-200 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Are you completely sure you want to reset all tasks and routines?</span>
            </div>
            <p className="text-slate-300">
              This will erase all {tasksCount} tasks and {routinesCount} routines from localStorage and return to factory initial seed state. This cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onResetAllData();
                  setShowResetConfirm(false);
                  onShowToast('Data Reset', 'All tasks and routines have been reset.', 'info');
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors"
              >
                Yes, Reset Everything
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. System Diagnostics & Hackathon Verification */}
      <div className="p-6 rounded-2xl bg-[#0D1527] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
          <Server className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base text-white">System Diagnostics &amp; Hackathon Track</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block mb-1">Server AI Endpoint</span>
            <span className={`font-mono font-bold ${isGeminiConfigured ? 'text-cyan-400' : 'text-amber-400'}`}>
              {isGeminiConfigured ? 'Gemini 3.8 Flash Online' : 'Local Intent Core Active'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block mb-1">Stored Tasks &amp; Routines</span>
            <span className="font-mono text-white font-bold">
              {tasksCount} tasks • {routinesCount} routines
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block mb-1">Target Track</span>
            <span className="font-mono text-purple-400 font-bold">
              Amazon Alexa+ Simulation Track
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 italic">
          Disclaimer: This web app is a simulated Alexa+-style experience for the Amazon Developer Hackathon. It executes actual task actions using a client-side rule engine and an optional server-side Gemini 3.8 Flash API endpoint.
        </p>
      </div>
    </div>
  );
};
