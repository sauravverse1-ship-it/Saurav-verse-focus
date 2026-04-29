import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Timer, BookOpen, Coffee, Zap, Clock, Target, Flame, Wind, Swords } from 'lucide-react';
import { cn } from '../lib/utils';
import { FireBreathingScene } from './FireBreathingScene';

interface WidgetProps {
  title: string;
  size: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}

const Widget: React.FC<WidgetProps> = ({ title, size, children, className, gradient }) => {
  const sizeClasses = {
    small: 'col-span-1 row-span-1 h-40 w-full',
    medium: 'col-span-2 row-span-1 h-40 w-full',
    large: 'col-span-2 row-span-2 h-72 w-full md:h-80',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] p-5 shadow-2xl group cursor-default border-2 border-white/10",
        sizeClasses[size],
        className
      )}
    >
      {gradient && (
        <div className={cn("absolute inset-0 opacity-20 blur-3xl -z-10 bg-gradient-to-br", gradient)} />
      )}
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-md-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 group-hover:text-md-primary transition-colors">
            {title}
            </span>
        </div>
      </div>
      <div className="h-full flex flex-col justify-center relative z-10">
        {children}
      </div>
      
      {/* Anime Corner Accents */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-md-primary/20 group-hover:border-md-primary transition-colors" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-md-primary/20 group-hover:border-md-primary transition-colors" />
    </motion.div>
  );
};

interface AdaptiveWidgetsProps {
  timeLeft: number;
  isRunning: boolean;
  mode: 'study' | 'shortBreak' | 'longBreak';
  currentTask?: string | null;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  formatTime: (sec: number) => string;
  sessionIntention: string;
  setSessionIntention: (val: string) => void;
  distractions: number;
  onAddDistraction: () => void;
}

const TECHNIQUES = {
    study: [
        "First Method: Ripper Focus",
        "Second Method: Blood Momentum",
        "Third Method: Absolute Slaughter",
        "Fourth Method: Infinite Grind"
    ],
    break: [
        "Status: Low Oil",
        "Status: Recharging Core",
        "Status: Quiet Slay"
    ]
};

export const TimerWidget: React.FC<AdaptiveWidgetsProps> = ({
  timeLeft,
  isRunning,
  mode,
  onToggleTimer,
  formatTime,
  sessionIntention,
  setSessionIntention,
  distractions,
  onAddDistraction,
}) => {
  const [isEditingIntention, setIsEditingIntention] = React.useState(false);
  const [techniqueIndex] = React.useState(() => Math.floor(Math.random() * (mode === 'study' ? TECHNIQUES.study.length : TECHNIQUES.break.length)));
  
  const technique = mode === 'study' ? TECHNIQUES.study[techniqueIndex] : TECHNIQUES.break[techniqueIndex % TECHNIQUES.break.length];

  return (
    <Widget title="Chainsaw Core Engine" size="medium" className="bg-[#0a0a0f] border-orange-500/30 flex flex-col items-center justify-center relative overflow-hidden group p-4 min-h-[160px]">
      <FireBreathingScene isRunning={isRunning} intensity={mode === 'study' ? 0.8 : 0.3} />
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent pointer-events-none z-0" />

      <motion.div
        whileHover={{ rotateY: 5, scale: 1.01, translateZ: 10 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="flex items-center justify-between gap-6 w-full relative z-10"
      >
        <div className="flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
                key={mode}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 mb-1"
            >
                {mode === 'study' ? <Flame className="w-3 h-3 text-orange-500" /> : <Wind className="w-3 h-3 text-blue-400" />}
                <span className={cn(
                    "text-[12px] font-black uppercase italic tracking-tighter",
                    mode === 'study' ? "text-orange-500" : "text-blue-400"
                )}>
                    {technique}
                </span>
            </motion.div>
          </AnimatePresence>
          
          <div className="relative">
             <span className="text-6xl font-black italic tracking-tighter tabular-nums text-white drop-shadow-[0_0_20px_rgba(255,100,0,0.5)]">
               {formatTime(timeLeft)}
             </span>
             {isRunning && (
                 <motion.div 
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute -right-4 top-0 text-orange-500 font-black text-xl"
                 >!
                 </motion.div>
             )}
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-3">
             <button
                onClick={(e) => { e.stopPropagation(); onToggleTimer(); }}
                className={cn(
                    "w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all border-4 relative overflow-hidden",
                    isRunning 
                        ? "bg-white/10 border-white/20 text-white hover:bg-white/20" 
                        : "bg-orange-600 border-orange-400 text-white hover:scale-110 shadow-[0_0_30px_rgba(234,88,12,0.5)]"
                )}
            >
                {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                {!isRunning && <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 animate-shimmer" />}
            </button>
            <button 
                onClick={onAddDistraction}
                className="p-2 h-8 px-3 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-orange-500 transition-all flex items-center gap-2 group/btn"
            >
                <Swords className="w-3 h-3" />
                <span className="text-[10px] font-black tracking-widest">{distractions} Focus Breaks</span>
            </button>
        </div>
      </motion.div>

      <div className="w-full mt-4 pt-3 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-3">
              <div className="p-1 bg-md-primary/20 rounded-md">
                <Target className="w-3 h-3 text-md-primary" />
              </div>
              {isEditingIntention ? (
                  <input 
                      autoFocus
                      value={sessionIntention}
                      onChange={(e) => setSessionIntention(e.target.value)}
                      onBlur={() => setIsEditingIntention(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingIntention(false)}
                      placeholder="Declare your outcome..."
                      className="text-xs font-bold bg-transparent outline-none border-none text-white w-full placeholder:text-white/20 italic"
                  />
              ) : (
                  <button 
                    onClick={() => setIsEditingIntention(true)}
                    className="text-xs font-bold text-white/60 hover:text-white truncate max-w-full italic text-left"
                  >
                      {sessionIntention || "Declare session intent..."}
                  </button>
              )}
          </div>
      </div>
    </Widget>
  );
};

export const StatusWidget: React.FC<AdaptiveWidgetsProps> = ({ mode, isRunning }) => {
  return (
    <Widget title="Battle Status" size="small" gradient="from-red-600 to-orange-600">
      <div className="flex flex-col items-center gap-2">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
          isRunning ? "animate-pulse bg-orange-500/20 shadow-[0_0_20px_rgba(234,88,12,0.3)]" : "bg-white/5"
        )}>
          {mode === 'study' ? <Flame className="w-8 h-8 text-orange-500" /> : <Wind className="w-8 h-8 text-blue-400" />}
        </div>
        <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
            {isRunning ? 'Engaging' : 'Sheathed'}
            </span>
            <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                <motion.div 
                    className="h-full bg-orange-500"
                    animate={{ width: isRunning ? '100%' : '0%' }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </div>
      </div>
    </Widget>
  );
};

export const TaskWidget: React.FC<AdaptiveWidgetsProps & { tasks: any[] }> = ({ currentTask, tasks }) => {
  const task = tasks.find(t => t.id === currentTask);
  
  return (
    <Widget title="Current Mission" size="medium" gradient="from-indigo-600 to-blue-600">
      {task ? (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
            <Swords className="w-7 h-7 text-blue-400" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-lg font-black italic tracking-tight truncate text-white">{task.title}</span>
            <span className="text-[10px] uppercase font-black text-blue-400 tracking-widest">{task.category}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 opacity-30">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <span className="text-xs font-black uppercase italic tracking-widest">No Active Scrolls</span>
        </div>
      )}
    </Widget>
  );
};

export const QuickActionsWidget: React.FC<AdaptiveWidgetsProps> = ({ onToggleTimer, isRunning, mode }) => {
  return (
    <Widget title="Ripper" size="small" gradient="from-red-600 to-black">
       <button 
        onClick={(e) => { e.stopPropagation(); onToggleTimer(); }}
        className="flex flex-col items-center gap-2"
       >
         <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
            isRunning ? "bg-white/10 text-white" : "bg-md-primary text-md-on-primary shadow-xl"
         )}>
           {isRunning ? <Pause className="w-6 h-6" /> : <Timer className="w-6 h-6" />}
         </div>
         <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
           {mode === 'study' ? 'Ignite' : 'Cool'}
         </span>
       </button>
    </Widget>
  );
};

export const AdaptiveWidgetGrid: React.FC<AdaptiveWidgetsProps & { tasks: any[] }> = (props) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      <TimerWidget {...props} />
      <StatusWidget {...props} />
      <QuickActionsWidget {...props} />
      <TaskWidget {...props} />
    </div>
  );
};
