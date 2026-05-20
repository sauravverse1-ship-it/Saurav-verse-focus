import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Beaker, 
  FlaskConical, 
  Microscope, 
  Zap, 
  Music, 
  VolumeX, 
  Sunrise, 
  Sunset, 
  Clock, 
  Clock3,
  Lightbulb,
  TrendingUp,
  Brain,
  Sparkles,
  Info,
  ChevronRight,
  Plus
} from 'lucide-react';
import { FocusExperiment, SessionLog } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface FocusLabProps {
  experiments: FocusExperiment[];
  sessionLogs: SessionLog[];
  onStartExperiment: (experiment: Partial<FocusExperiment>) => void;
  onAbortExperiment: (experimentId: string) => void;
}

const EXPERIMENT_TEMPLATES = [
  {
    id: 'music-silence',
    title: 'Sonic Alchemy',
    hypothesis: 'Music vs Silence: Which creates deep flow?',
    variable: 'sound' as const,
    conditionA: 'Ambient / Music',
    conditionB: 'Pure Silence',
    durationDays: 14,
    icon: Music,
    color: 'text-md-primary'
  },
  {
    id: 'morning-evening',
    title: 'Circadian Peak',
    hypothesis: 'Morning vs Night: When is your neural capacity highest?',
    variable: 'time' as const,
    conditionA: 'Morning (Before 12PM)',
    conditionB: 'Night (After 8PM)',
    durationDays: 14,
    icon: Sunrise,
    color: 'text-orange-400'
  },
  {
    id: 'pomodoro-long',
    title: 'Duration Optimization',
    hypothesis: '25 min vs 50 min: Which minimizes cognitive fatigue?',
    variable: 'duration' as const,
    conditionA: '25 Minute Sprints',
    conditionB: '50 Minute Marathons',
    durationDays: 21,
    icon: Clock,
    color: 'text-purple-400'
  }
];

export const FocusLab: React.FC<FocusLabProps> = ({ experiments, sessionLogs, onStartExperiment, onAbortExperiment }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'templates' | 'results'>('active');
  const activeExperiment = experiments.find(e => e.status === 'active');

  const getExperimentAnalysis = (experiment: FocusExperiment) => {
    const scoresA = experiment.data.filter(d => d.condition === 'A').map(d => d.sessionScore);
    const scoresB = experiment.data.filter(d => d.condition === 'B').map(d => d.sessionScore);
    
    if (scoresA.length === 0 || scoresB.length === 0) return "Gathering data...";
    
    const avgA = scoresA.reduce((a, b) => a + b, 0) / scoresA.length;
    const avgB = scoresB.reduce((a, b) => a + b, 0) / scoresB.length;
    
    const diff = Math.abs(avgA - avgB).toFixed(1);
    const winner = avgA > avgB ? experiment.conditionA : experiment.conditionB;
    
    if (Math.abs(avgA - avgB) < 2) return "Results are inconclusive. Neural patterns are balanced.";
    return `Your focus is ${diff}pts higher using ${winner}. Optimization recommended.`;
  };

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 md:px-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-md-primary/10 flex items-center justify-center border border-md-primary/20">
               <Beaker className="w-5 h-5 text-md-primary" />
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Neural Focus Lab</h1>
         </div>
         <p className="text-white/40 text-xs font-mono uppercase tracking-[0.2em]">Personal focus experiments & deep analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit">
         {[
           { id: 'active', label: 'In Progress' },
           { id: 'templates', label: 'New Experiment' },
           { id: 'results', label: 'Lab Archive' }
         ].map(tab => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={cn(
               "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
               activeTab === tab.id ? "bg-md-primary text-md-on-primary shadow-lg shadow-md-primary/20" : "text-white/40 hover:text-white"
             )}
           >
             {tab.label}
           </button>
         ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'active' && (
          <motion.div 
            key="active"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 gap-6"
          >
             {activeExperiment ? (
               <div className="glass-card p-10 flex flex-col md:flex-row gap-10 items-center overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <Brain className="w-48 h-48" />
                  </div>
                  
                  <div className="flex-1 space-y-6 relative z-10">
                     <div className="space-y-1">
                        <span className="text-[10px] font-black text-md-primary uppercase tracking-widest">Active Hypothesis</span>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter">{activeExperiment.title}</h2>
                        <p className="text-white/60 text-lg font-serif italic max-w-lg">"{activeExperiment.hypothesis}"</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className={cn(
                          "p-4 rounded-[2rem] border-2 transition-all",
                          activeExperiment.data.length % 2 === 0 ? "border-md-primary bg-md-primary/5" : "border-white/5 bg-white/5 opacity-50"
                        )}>
                           <div className="text-[10px] uppercase font-black tracking-widest mb-1">Condition A</div>
                           <div className="text-sm font-bold">{activeExperiment.conditionA}</div>
                        </div>
                        <div className={cn(
                          "p-4 rounded-[2rem] border-2 transition-all",
                          activeExperiment.data.length % 2 !== 0 ? "border-md-primary bg-md-primary/5" : "border-white/5 bg-white/5 opacity-50"
                        )}>
                           <div className="text-[10px] uppercase font-black tracking-widest mb-1">Condition B</div>
                           <div className="text-sm font-bold">{activeExperiment.conditionB}</div>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                           <span>Experiment Progress</span>
                           <span>{activeExperiment.data.length} Sessions Logged</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             className="h-full bg-md-primary"
                             initial={{ width: 0 }}
                             animate={{ width: `${Math.min(100, (activeExperiment.data.length / (activeExperiment.durationDays * 2)) * 100)}%` }}
                           />
                        </div>
                        <p className="text-[10px] text-white/40 italic">System automatically alternates conditions between sessions.</p>
                     </div>
                  </div>

                  <div className="w-full md:w-80 flex flex-col gap-4 relative z-10">
                     <div className="glass-card p-6 bg-white/5 border-white/5 text-center">
                        <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                        <h3 className="text-xs font-black uppercase tracking-widest mb-2">Preliminary Trend</h3>
                        <p className="text-sm font-bold text-white mb-4">{getExperimentAnalysis(activeExperiment)}</p>
                        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[9px] font-mono text-white/40 uppercase">
                           Neural Confidence: 64%
                        </div>
                     </div>
                     <button 
                        onClick={() => onAbortExperiment(activeExperiment.id)}
                        className="w-full py-4 bg-white/5 text-white/40 rounded-[2rem] border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
                     >
                        Abort Experiment
                     </button>
                  </div>
               </div>
             ) : (
               <div className="p-16 glass-card border-dashed flex flex-col items-center justify-center text-center gap-6 opacity-60">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border-2 border-dashed border-white/10">
                     <Microscope className="w-10 h-10 text-white/20" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">No Experiments Running</h2>
                    <p className="text-white/40 text-sm max-w-sm mx-auto">Launch your first neural focus experiment to discover your peak productivity variables.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('templates')}
                    className="px-8 py-3 bg-md-primary text-md-on-primary rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg shadow-md-primary/20"
                  >
                    Select Template
                  </button>
               </div>
             )}
          </motion.div>
        )}

        {activeTab === 'templates' && (
          <motion.div 
            key="templates"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
             {EXPERIMENT_TEMPLATES.map(template => (
               <div key={template.id} className="glass-card p-8 flex flex-col justify-between hover:border-md-primary/40 transition-all group">
                  <div className="space-y-4">
                     <div className={cn("p-4 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform", template.color)}>
                        <template.icon className="w-8 h-8" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">{template.title}</h3>
                        <p className="text-white/40 text-xs mt-1 uppercase font-bold tracking-widest">{template.variable} variable</p>
                     </div>
                     <p className="text-white/60 text-sm leading-relaxed">{template.hypothesis}</p>
                     
                     <div className="space-y-2 pt-4">
                        <div className="flex items-center gap-2 text-[10px] text-white/40">
                           <Clock3 className="w-3 h-3" /> <span>Duration: {template.durationDays} Days</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-white/40">
                           <TrendingUp className="w-3 h-3" /> <span>Metric: Neural Focus Score</span>
                        </div>
                     </div>
                  </div>

                  <button 
                    onClick={() => onStartExperiment(template)}
                    className="mt-8 w-full py-4 bg-md-primary text-md-on-primary rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-md-primary/10"
                  >
                    Start Experiment
                  </button>
               </div>
             ))}

             <button className="glass-card border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8 gap-4 opacity-50 hover:opacity-100 hover:bg-white/5 transition-all">
                <div className="p-4 rounded-full bg-white/5">
                   <Plus className="w-8 h-8" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest">Custom Hypothesis</div>
             </button>
          </motion.div>
        )}

        {activeTab === 'results' && (
          <motion.div 
            key="results"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
             {experiments.filter(e => e.status !== 'active').map(e => (
               <div key={e.id} className="glass-card p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="font-bold text-white">{e.title}</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{format(e.startDate, 'PP')}</p>
                     </div>
                     <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold text-white/40 uppercase border border-white/5">
                        Completed
                     </div>
                  </div>
                  <div className="p-4 bg-md-primary/5 rounded-2xl border border-md-primary/10">
                     <p className="text-xs font-medium text-md-primary italic">"{getExperimentAnalysis(e)}"</p>
                  </div>
               </div>
             ))}
             {experiments.filter(e => e.status !== 'active').length === 0 && (
               <div className="col-span-full py-20 text-center text-white/20 italic font-serif">
                  Archive empty. Complete your first experiment to see results here.
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 bg-amber-500/5 rounded-[2.5rem] border border-amber-500/10 flex gap-6 items-start">
         <div className="p-3 bg-amber-500/10 rounded-2xl flex-shrink-0">
            <Info className="w-5 h-5 text-amber-500" />
         </div>
         <div className="space-y-1">
            <h4 className="text-sm font-black uppercase tracking-widest text-white/80">How it works</h4>
            <p className="text-xs text-white/40 leading-relaxed max-w-3xl">
              Experiments run for a set duration. The system automatically toggles your environment conditions between focus sessions (e.g., Session 1: Lofi, Session 2: Silence). After collecting sufficient data, our neural engine calculates which condition maximizes your specific Focus Score.
            </p>
         </div>
      </div>
    </div>
  );
};
