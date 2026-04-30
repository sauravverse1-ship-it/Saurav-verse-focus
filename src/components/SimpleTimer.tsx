import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, X, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import { playTick, playWhoosh } from '../lib/audio';

interface SimpleTimerProps {
  timeLeft: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onClose: () => void;
  mode: 'study' | 'shortBreak' | 'longBreak';
  intention?: string;
}

export const SimpleTimer: React.FC<SimpleTimerProps> = ({ 
  timeLeft, 
  isRunning, 
  onToggle, 
  onReset, 
  onClose,
  mode,
  intention
}) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return {
      minutes: m.toString().padStart(2, '0'),
      seconds: s.toString().padStart(2, '0')
    };
  };

  const { minutes, seconds } = formatTime(timeLeft);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6"
    >
      {/* Intention display */}
      <AnimatePresence>
        {intention && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full"
          >
            <Target className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/70 italic">
              MISSION: {intention}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all active:scale-90"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex flex-col items-center gap-12 w-full max-w-2xl">
        <div className="flex gap-4 md:gap-8 items-center justify-center">
          <FlipUnit value={minutes} label="MINUTES" />
          <div className="text-6xl md:text-8xl font-black text-white/20 pt-4 md:pt-8">:</div>
          <FlipUnit value={seconds} label="SECONDS" />
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => {
              playTick();
              onReset();
            }}
            className="p-5 bg-white/5 hover:bg-white/10 rounded-full text-white/60 transition-all active:scale-90 border border-white/5"
          >
            <RotateCcw className="w-8 h-8" />
          </button>
          
          <button 
            onClick={() => {
              playWhoosh();
              onToggle();
            }}
            className={cn(
               "p-8 rounded-full transition-all active:scale-95 shadow-[0_0_50px_-10px] flex items-center justify-center",
               isRunning 
                ? "bg-white text-black shadow-white/20" 
                : mode === 'study' 
                   ? "bg-orange-500 text-white shadow-orange-500/40" 
                   : "bg-blue-500 text-white shadow-blue-500/40"
            )}
          >
            {isRunning ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 mt-4 text-center">
          <span className={cn(
            "text-xs font-black uppercase tracking-[0.5em] italic",
            mode === 'study' ? "text-orange-500" : "text-blue-500"
          )}>
            {mode === 'study' ? 'FOCUS PHASE' : 'RECOVERY PHASE'}
          </span>
          <p className="text-white/20 text-[10px] font-mono animate-pulse">DISTURBANCE LEVELS ZERO</p>
        </div>
      </div>
    </motion.div>
  );
};

const FlipUnit = ({ value, label }: { value: string, label: string }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-1.5 md:gap-3">
        {value.split('').map((char, i) => (
          <div key={i} className="relative w-16 h-28 md:w-28 md:h-44 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <AnimatePresence mode="popLayout">
              <motion.div 
                key={char}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.3, ease: "circOut" }}
                className="absolute inset-0 flex items-center justify-center text-5xl md:text-8xl font-black text-white italic tracking-tighter"
              >
                {char}
              </motion.div>
            </AnimatePresence>
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5 z-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
          </div>
        ))}
      </div>
      <span className="text-[10px] font-black text-white/30 tracking-[0.3em] uppercase">{label}</span>
    </div>
  );
};
