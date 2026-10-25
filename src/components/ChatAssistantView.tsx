import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  Plus,
  CheckCircle2,
  Calendar,
  Repeat,
  Trash2,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { ChatMessage, Task, Routine, AssistantActionCard } from '../types';
import { startSpeechRecognition, isSpeechRecognitionSupported, speakAlexaResponse, stopSpeech } from '../utils/speech';
import { ActiveTab } from './Sidebar';

interface ChatAssistantViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  voiceFeedbackEnabled: boolean;
  onToggleVoiceFeedback: () => void;
  isGeminiConfigured: boolean;
  onNavigateTab: (tab: ActiveTab) => void;
  onClearHistory: () => void;
}

const SAMPLE_QUICK_CHIPS = [
  'Add a task to finish my assignment tomorrow',
  'Show my pending tasks',
  'Create a daily study routine at 7:00 PM',
  'Summarize my tasks for today',
  'What are my high priority tasks?',
  'What is my productivity completion rate?',
];

export const ChatAssistantView: React.FC<ChatAssistantViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  voiceFeedbackEnabled,
  onToggleVoiceFeedback,
  isGeminiConfigured,
  onNavigateTab,
  onClearHistory,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognizerRef = useRef<{ stop: () => void } | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const textToSend = inputText.trim();
    setInputText('');
    setSpeechError(null);
    await onSendMessage(textToSend);
  };

  const handleChipClick = async (chipText: string) => {
    if (isLoading) return;
    await onSendMessage(chipText);
  };

  const handleToggleMic = () => {
    if (isListening) {
      recognizerRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setSpeechError('Speech recognition is not supported in this browser. Please use text typing.');
      return;
    }

    setSpeechError(null);
    setIsListening(true);

    const rec = startSpeechRecognition(
      (transcript) => {
        setInputText(transcript);
        setIsListening(false);
        // Automatically send voice transcription
        onSendMessage(transcript);
      },
      (errorMsg) => {
        setSpeechError(`Voice error: ${errorMsg}`);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    recognizerRef.current = rec;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto rounded-3xl bg-[#0D1527] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in duration-300">
      {/* 1. Assistant Top Bar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white tracking-tight">Alexa+ Live Assistant</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                isGeminiConfigured
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {isGeminiConfigured ? 'Gemini 3.8 Flash Cloud' : 'Alexa+ Local Core Active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isGeminiConfigured
                ? 'Server-side Gemini AI with real function dispatch'
                : 'Deterministic rule engine with zero latency task dispatch'}
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleVoiceFeedback}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              voiceFeedbackEnabled
                ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle voice readout"
          >
            {voiceFeedbackEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{voiceFeedbackEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>

          <button
            onClick={onClearHistory}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Clear chat history"
            aria-label="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Message History Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {speechError && (
          <div className="p-3 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-2xl flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{speechError}</span>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-lg text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-1 text-[10px] text-slate-400">
                <span className="font-semibold">{msg.sender === 'user' ? 'You' : 'Alexa+ Assistant'}</span>
                <div className="flex items-center gap-2">
                  {msg.modeUsed && (
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-800/80 text-cyan-400">
                      {msg.modeUsed}
                    </span>
                  )}
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {/* Message text with newline formatting */}
              <div className="whitespace-pre-line text-xs sm:text-sm">
                {msg.text}
              </div>

              {/* Interactive Action Card if executed */}
              {msg.actionCard && (
                <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-cyan-500/30 text-xs space-y-2">
                  <div className="flex items-center justify-between text-cyan-300 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {msg.actionCard.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{msg.actionCard.timestamp}</span>
                  </div>

                  {msg.actionCard.details && (
                    <p className="text-[11px] text-slate-300">
                      {msg.actionCard.details}
                    </p>
                  )}

                  {/* Quick Jump buttons depending on card type */}
                  <div className="pt-1 flex items-center gap-2">
                    {msg.actionCard.type === 'task_created' && (
                      <button
                        onClick={() => onNavigateTab('tasks')}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>View in Task Manager</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}

                    {msg.actionCard.type === 'routine_created' && (
                      <button
                        onClick={() => onNavigateTab('routines')}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/40 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>View in Daily Routines</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}

                    {(msg.actionCard.type === 'tasks_listed' || msg.actionCard.type === 'schedule_summary') && (
                      <button
                        onClick={() => onNavigateTab('tasks')}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Open Task Manager</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 shadow-md">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Loading wave indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 rounded-tl-none">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-slate-400 ml-2">Alexa+ is processing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Suggested Prompt Chips Carousel */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-900/40 flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">Try:</span>
        {SAMPLE_QUICK_CHIPS.map(chip => (
          <button
            key={chip}
            type="button"
            onClick={() => handleChipClick(chip)}
            className="px-3 py-1 rounded-full text-xs bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-all shrink-0 whitespace-nowrap"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* 4. Input & Voice Controls */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0B101E]">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Microphone button */}
          <button
            type="button"
            onClick={handleToggleMic}
            className={`p-3 rounded-2xl border transition-all ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse ring-4 ring-rose-500/20'
                : 'bg-slate-800 text-cyan-400 border-slate-700 hover:bg-slate-700'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Click to speak to Alexa+'}
            aria-label="Voice input toggle"
          >
            {isListening ? <Mic className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : 'Ask Alexa+ (e.g. "Add a task to finish assignment tomorrow")'
            }
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-white text-sm placeholder-slate-500 transition-all shadow-inner"
            disabled={isLoading}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-40 text-white shadow-lg shadow-cyan-900/40 transition-all active:scale-95 shrink-0"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <p className="mt-2 text-[10px] text-center text-slate-500">
          Simulated Alexa+ experience for Amazon Developer Hackathon. Supports both cloud Gemini AI and offline local intent processing.
        </p>
      </div>
    </div>
  );
};
