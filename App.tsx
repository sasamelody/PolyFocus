import React, { useState, useEffect, useRef } from 'react';
import PolyBackground from './components/PolyBackground';
import TimerDisplay from './components/TimerDisplay';
import TagModal from './components/TagModal';
import Stats from './components/Stats';
import { 
  TimerMode, 
  TimerState, 
  TimeLog, 
  WORK_DURATION, 
  BREAK_DURATION 
} from './types';
import { analyzeTimeLogs } from './services/geminiService';

const App: React.FC = () => {
  // --- State ---
  const [mode, setMode] = useState<TimerMode>(TimerMode.WORK);
  const [timerState, setTimerState] = useState<TimerState>(TimerState.IDLE);
  const [timeLeft, setTimeLeft] = useState<number>(WORK_DURATION);
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [showTagModal, setShowTagModal] = useState<boolean>(false);
  
  // View State
  const [currentView, setCurrentView] = useState<'timer' | 'stats'>('timer');

  // Analysis State
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- Refs ---
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // --- Helpers ---
  const totalTime = mode === TimerMode.WORK ? WORK_DURATION : BREAK_DURATION;

  // Load logs from local storage on mount
  useEffect(() => {
    const savedLogs = localStorage.getItem('polyfocus_logs');
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error("Failed to load logs", e);
      }
    }
  }, []);

  // Save logs to local storage
  useEffect(() => {
    localStorage.setItem('polyfocus_logs', JSON.stringify(logs));
  }, [logs]);

  // --- Timer Logic ---
  const startTimer = () => {
    if (timerState === TimerState.RUNNING) return;
    
    setTimerState(TimerState.RUNNING);
    startTimeRef.current = Date.now();
    
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerState(TimerState.PAUSED);
  };

  const resetTimer = () => {
    pauseTimer();
    setTimerState(TimerState.IDLE);
    setTimeLeft(mode === TimerMode.WORK ? WORK_DURATION : BREAK_DURATION);
  };

  const handleTimerComplete = () => {
    pauseTimer();
    setTimerState(TimerState.IDLE);
    setShowTagModal(true);
    // Play sound if desired (omitted for strict code requirements)
  };

  const switchMode = () => {
    const newMode = mode === TimerMode.WORK ? TimerMode.BREAK : TimerMode.WORK;
    setMode(newMode);
    setTimeLeft(newMode === TimerMode.WORK ? WORK_DURATION : BREAK_DURATION);
    setTimerState(TimerState.IDLE);
    pauseTimer();
  };

  // --- Log Logic ---
  const saveLog = (tags: string[]) => {
    const now = Date.now();
    // In a real scenario, we'd calculate exact duration if paused multiple times, 
    // but here we assume full duration for simplicity of the "Pomodoro" concept
    // or calculate based on the mode duration.
    const duration = mode === TimerMode.WORK ? WORK_DURATION : BREAK_DURATION;
    
    const newLog: TimeLog = {
      id: crypto.randomUUID(),
      startTime: now - (duration * 1000),
      endTime: now,
      durationSeconds: duration,
      mode,
      tags
    };

    setLogs((prev) => [...prev, newLog]);
    setShowTagModal(false);
    
    // Auto switch mode after log save?
    // Let's ask user to switch manually or just reset. 
    // Usually auto-switch is preferred in strict flows.
    switchMode();
  };

  const discardLog = () => {
    setShowTagModal(false);
    switchMode();
  };

  // --- Analysis Logic ---
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeTimeLogs(logs);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      <PolyBackground />

      {/* Header / Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 p-6 flex justify-between items-center bg-gradient-to-b from-slate-900/80 to-transparent backdrop-blur-[2px]">
        <h1 className="text-2xl font-bold tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
          POLY<span className="text-white">FOCUS</span>
        </h1>
        <div className="flex gap-4">
            <button 
                onClick={() => setCurrentView('timer')}
                className={`text-sm font-bold uppercase tracking-widest px-4 py-2 transition-all ${currentView === 'timer' ? 'text-white border-b-2 border-cyan-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
                计时器
            </button>
            <button 
                 onClick={() => setCurrentView('stats')}
                 className={`text-sm font-bold uppercase tracking-widest px-4 py-2 transition-all ${currentView === 'stats' ? 'text-white border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
                统计
            </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-24 min-h-screen flex flex-col items-center">
        
        {currentView === 'timer' && (
            <div className="flex flex-col items-center justify-center flex-1 w-full max-w-lg animate-in fade-in zoom-in duration-500">
                <TimerDisplay 
                    timeLeft={timeLeft} 
                    totalTime={totalTime} 
                    mode={mode} 
                />

                {/* Controls */}
                <div className="flex gap-6 mt-8">
                    {timerState === TimerState.RUNNING ? (
                        <button
                            onClick={pauseTimer}
                            className="bg-slate-800 border-2 border-slate-600 hover:border-yellow-500 hover:text-yellow-500 text-white w-24 h-12 font-bold tracking-wider uppercase transition-all"
                            style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}
                        >
                            暂停
                        </button>
                    ) : (
                        <button
                            onClick={startTimer}
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white w-32 h-12 font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105"
                            style={{ clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0% 100%)' }}
                        >
                            开始
                        </button>
                    )}
                    
                    <button
                        onClick={resetTimer}
                        className="bg-transparent text-slate-500 hover:text-white font-bold w-12 h-12 flex items-center justify-center transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    </button>
                </div>
                
                {/* Mode Switcher */}
                <div className="mt-12 flex gap-4">
                    <button 
                        onClick={() => { setMode(TimerMode.WORK); setTimeLeft(WORK_DURATION); setTimerState(TimerState.IDLE); pauseTimer(); }}
                        className={`px-4 py-1 text-xs uppercase font-bold border border-slate-700 ${mode === TimerMode.WORK ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        专注 (53分)
                    </button>
                     <button 
                        onClick={() => { setMode(TimerMode.BREAK); setTimeLeft(BREAK_DURATION); setTimerState(TimerState.IDLE); pauseTimer(); }}
                        className={`px-4 py-1 text-xs uppercase font-bold border border-slate-700 ${mode === TimerMode.BREAK ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        休息 (17分)
                    </button>
                </div>
            </div>
        )}

        {currentView === 'stats' && (
            <div className="w-full animate-in slide-in-from-right duration-500">
                <Stats 
                    logs={logs} 
                    onAnalyze={handleAnalyze} 
                    isAnalyzing={isAnalyzing} 
                    analysisResult={analysisResult} 
                />
            </div>
        )}

      </main>

      <TagModal 
        isOpen={showTagModal} 
        mode={mode} 
        onSave={saveLog} 
        onDiscard={discardLog} 
      />
    </div>
  );
};

export default App;