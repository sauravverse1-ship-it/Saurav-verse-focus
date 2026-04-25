import React from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Timer, BookOpen, Coffee, Zap, Clock, Target } from 'lucide-react';
import { cn } from '../lib/utils';

interface WidgetProps {
  title: string;
  size: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}

const Widget: React.FC<WidgetProps> = ({ title, size, children, className, gradient }) => {
  const sizeClasses = {
    small: 'col-span-1 row-span-1 h-36 w-full',
    medium: 'col-span-2 row-span-1 h-36 w-full',
    large: 'col-span-2 row-span-2 h-72 w-full md:h-80',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] p-5 shadow-2xl glass group cursor-default",
        sizeClasses[size],
        className
      )}
    >
      {gradient && (
        <div className={cn("absolute inset-0 opacity-10 blur-3xl -z-10 bg-gradient-to-br", gradient)} />
      )}
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {title}
        </span>
      </div>
      <div className="h-full flex flex-col justify-center">
        {children}
      </div>
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
}

export const TimerWidget: React.FC<AdaptiveWidgetsProps> = ({
  timeLeft,
  isRunning,
  mode,
  onToggleTimer,
  formatTime,
}) => {
  return (
    <Widget title="Quantum Sync" size="medium" gradient="from-md-primary to-blue-600">
      <div className="flex items-center justify-between gap-6">
        <div className="flex flex-col">
          <span className={cn(
            "text-xs font-bold uppercase tracking-tight",
            mode === 'study' ? "text-md-primary" : "text-amber-400"
          )}>
            {mode === 'study' ? 'Deep Work' : 'Cellular Recovery'}
          </span>
          <span className="text-4xl font-black tracking-tighter tabular-nums">
            {formatTime(timeLeft)}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleTimer(); }}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
            isRunning ? "bg-white/10 text-white" : "bg-md-primary text-md-on-primary shadow-lg shadow-md-primary/20"
          )}
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
        </button>
      </div>
    </Widget>
  );
};

export const StatusWidget: React.FC<AdaptiveWidgetsProps> = ({ mode, isRunning }) => {
  return (
    <Widget title="Engine Status" size="small" gradient="from-purple-500 to-pink-500">
      <div className="flex flex-col items-center gap-2">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          isRunning ? "animate-pulse bg-md-primary/20" : "bg-white/5"
        )}>
          {mode === 'study' ? <Zap className="w-6 h-6 text-md-primary" /> : <Coffee className="w-6 h-6 text-amber-400" />}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
          {isRunning ? 'Active' : 'Standby'}
        </span>
      </div>
    </Widget>
  );
};

export const TaskWidget: React.FC<AdaptiveWidgetsProps & { tasks: any[] }> = ({ currentTask, tasks }) => {
  const task = tasks.find(t => t.id === currentTask);
  
  return (
    <Widget title="Target Protocol" size="medium" gradient="from-emerald-500 to-teal-500">
      {task ? (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold truncate">{task.title}</span>
            <span className="text-[10px] uppercase font-black opacity-40">{task.category}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 opacity-30">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold italic">No active objective</span>
        </div>
      )}
    </Widget>
  );
};

export const QuickActionsWidget: React.FC<AdaptiveWidgetsProps> = ({ onToggleTimer, isRunning, mode }) => {
  return (
    <Widget title="Quick Start" size="small" gradient="from-blue-500 to-md-primary">
       <button 
        onClick={(e) => { e.stopPropagation(); onToggleTimer(); }}
        className="flex flex-col items-center gap-2"
       >
         <div className="w-10 h-10 bg-md-primary text-md-on-primary rounded-full flex items-center justify-center shadow-lg shadow-md-primary/30 group-hover:scale-110 transition-transform">
           {isRunning ? <Pause className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
         </div>
         <span className="text-[10px] font-black uppercase tracking-widest">
           {mode === 'study' ? 'Focus' : 'Break'}
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
