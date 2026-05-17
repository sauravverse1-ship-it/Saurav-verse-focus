import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Star, Sparkles, CheckCircle, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile, SessionLog, Task, Habit } from '../types';

interface Props {
  profile: UserProfile | null;
  sessionLogs: SessionLog[];
  tasks: Task[];
  habits: Habit[];
  onComplete: (rewardXP: number) => void;
}

export const NightRitual: React.FC<Props> = ({ profile, sessionLogs, tasks, habits, onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const todayFocus = sessionLogs.filter(log => {
      const logDate = new Date(log.timestamp).toDateString();
      return logDate === new Date().toDateString();
  }).reduce((acc, log) => acc + log.duration, 0);

  const tasksCompleted = tasks.filter(t => t.completed).length;

  const calculateReward = () => {
    return Math.round((todayFocus / 3600) * 100 + (tasksCompleted * 50));
  };

  const reward = calculateReward();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-6 md:p-12 cursor-default"
    >
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />
         {[...Array(20)].map((_, i) => (
           <motion.div
             key={i}
             className="absolute w-1 h-1 bg-white rounded-full opacity-20"
             style={{ 
               top: `${Math.random() * 100}%`, 
               left: `${Math.random() * 100}%` 
             }}
             animate={{ opacity: [0.1, 0.4, 0.1] }}
             transition={{ duration: 2 + Math.random() * 4, repeat: Infinity }}
           />
         ))}
      </div>

      <div className="w-full max-w-2xl bg-neutral-950 border border-white/5 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-12 relative overflow-y-auto max-h-[90vh] text-center custom-scrollbar">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="p-6 bg-purple-500/10 rounded-[2.5rem] inline-block mb-4">
                 <Moon className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter">Night Ops Initiated</h2>
              <p className="text-white/60 text-lg">System scan complete. Reviewing your daily field data, Hunter.</p>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                 <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                    <span className="text-3xl font-mono font-black text-white">{Math.round(todayFocus / 3600)}h</span>
                    <p className="text-[10px] text-white/30 uppercase font-bold mt-1">Focus Time</p>
                 </div>
                 <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                    <span className="text-3xl font-mono font-black text-white">{tasksCompleted}</span>
                    <p className="text-[10px] text-white/30 uppercase font-bold mt-1">Missions</p>
                 </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-6 bg-purple-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(139,92,246,0.4)]"
              >
                Sync Data
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              <div className="p-6 bg-green-500/10 rounded-[2.5rem] inline-block">
                 <ShieldCheck className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter">Debrief Successful</h2>
              
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                   <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-md-primary" />
                      <span className="text-sm font-bold text-white">Daily Focus Goal</span>
                   </div>
                   <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5 opacity-50">
                   <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-bold text-white">No-Fap Bonus</span>
                   </div>
                   <span className="text-[10px] text-white/50 uppercase font-bold">Standard</span>
                </div>
              </div>

              <div className="py-8">
                 <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Total Quantum Earned</p>
                 <span className="text-6xl font-mono font-black text-md-primary">+{reward} XP</span>
              </div>

              <button 
                onClick={() => setStep(3)}
                className="w-full py-6 bg-md-primary text-md-on-primary rounded-[2rem] font-black uppercase tracking-widest text-sm"
              >
                Collect Rewards
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="p-8 bg-amber-500/10 rounded-full inline-block relative">
                 <Sparkles className="w-12 h-12 text-amber-500 animate-pulse" />
              </div>
              <h2 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter">Systems Resting</h2>
              <p className="text-white/60 text-lg">You have fought well today. Recovery protocol initiated. Resume training at 05:00.</p>
              
              <div className="flex justify-center gap-4 py-8">
                 <div className="w-12 h-1 bg-white/10 rounded-full" />
                 <div className="w-12 h-1 bg-white/10 rounded-full" />
                 <div className="w-12 h-1 bg-md-primary rounded-full" />
              </div>

              <button 
                onClick={() => onComplete(reward)}
                className="w-full py-6 bg-neutral-900 text-white border border-white/10 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-neutral-800 transition-colors"
              >
                Enter Void (Sleep)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
