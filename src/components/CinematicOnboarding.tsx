import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Zap, Trophy, Brain, User, Check, Rocket, Flame, Skull } from 'lucide-react';
import { cn } from '../lib/utils';

interface OnboardingProps {
  onComplete: (data: any) => void;
}

export const CinematicOnboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    identity: '',
    dailyGoal: 120,
    displayName: '',
    examPreference: 'None' as 'JEE' | 'NEET' | 'None'
  });

  const nextStep = () => setStep(s => s + 1);

  const steps = [
    // Step 0: Logo Reveal
    <motion.div 
      key="step0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center text-center space-y-8"
    >
      <motion.div 
        animate={{ 
          scale: [0.9, 1.1, 1],
          rotate: [0, 5, -5, 0],
          filter: ["brightness(1)", "brightness(2)", "brightness(1)"]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="w-48 h-48 bg-md-primary rounded-[3rem] flex items-center justify-center shadow-[0_0_80px_rgba(0,255,224,0.4)]"
      >
        <span className="text-8xl font-display font-black text-black">Q</span>
      </motion.div>
      <div>
        <h1 className="text-6xl font-display font-black text-white italic tracking-tighter uppercase leading-none mb-2">Quantum Focus</h1>
        <p className="text-md-primary font-mono text-xs uppercase tracking-[0.4em] font-black">System Initialization v10.0</p>
      </div>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={nextStep}
        className="px-12 py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded-full hover:bg-md-primary transition-all hover:scale-110 active:scale-95"
      >
        Initialize Neural Link
      </motion.button>
    </motion.div>,

    // Step 1: Pick Identity
    <motion.div key="step1" className="max-w-xl w-full">
      <h2 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter mb-8 text-center">Establish Identity</h2>
      <div className="grid grid-cols-2 gap-4">
        {[
          { id: 'jee', label: 'JEE Aspirant', icon: <Rocket />, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50', pref: 'JEE' },
          { id: 'college', label: 'College Student', icon: <Brain />, color: 'bg-violet-500/20 text-violet-400 border-violet-500/50', pref: 'None' },
          { id: 'pro', label: 'Professional', icon: <Zap />, color: 'bg-amber-500/20 text-amber-400 border-amber-500/50', pref: 'None' },
          { id: 'self', label: 'Self Learner', icon: <Flame />, color: 'bg-rose-500/20 text-rose-400 border-rose-500/50', pref: 'None' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => {
              setFormData(prev => ({ ...prev, identity: item.id, examPreference: item.pref as any }));
              nextStep();
            }}
            className={cn(
              "p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 hover:scale-105 active:scale-95",
              formData.identity === item.id ? item.color.replace('20', '40') : "bg-white/5 border-white/5 hover:border-white/20"
            )}
          >
            <div className="p-4 rounded-2xl bg-white/5">{item.icon}</div>
            <span className="font-black uppercase tracking-widest text-[10px]">{item.label}</span>
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 2: Set Goal
    <motion.div key="step2" className="max-w-md w-full text-center">
       <h2 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter mb-4">Set Your Target</h2>
       <p className="text-white/40 text-xs mb-12 uppercase font-black tracking-widest">How many minutes of focus daily?</p>
       
       <div className="relative h-2 bg-white/5 rounded-full mb-12">
          <input 
            type="range" 
            min="30" 
            max="480" 
            step="15"
            value={formData.dailyGoal}
            onChange={(e) => setFormData(prev => ({ ...prev, dailyGoal: parseInt(e.target.value) }))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <motion.div 
            className="absolute left-0 top-0 h-full bg-md-primary rounded-full relative"
            style={{ width: `${(formData.dailyGoal - 30) / (480 - 30) * 100}%` }}
          >
             <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-[0_0_30px_rgba(0,255,224,0.8)]" />
          </motion.div>
       </div>

       <div className="text-8xl font-display font-black text-md-primary italic tracking-tighter mb-12">
          {formData.dailyGoal}<span className="text-2xl text-white/20 ml-2">MIN</span>
       </div>

       <button onClick={nextStep} className="w-full py-6 bg-white text-black font-black uppercase tracking-widest text-sm rounded-full hover:bg-white/90 transition-all">
          Lock Target
       </button>
    </motion.div>,

    // Step 3: Name
    <motion.div key="step3" className="max-w-md w-full">
       <h2 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter mb-4 text-center">Finalizing Link</h2>
       <p className="text-white/40 text-xs mb-12 uppercase font-black tracking-widest text-center">What is your designation?</p>
       
       <input 
         type="text" 
         placeholder="ENTER NAME..."
         value={formData.displayName}
         onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
         onKeyDown={(e) => {
           if (e.key === 'Enter' && formData.displayName) {
             onComplete(formData);
           }
         }}
         className="w-full bg-transparent border-b-4 border-white/10 text-center text-4xl font-display font-black text-white placeholder:text-white/5 p-4 focus:border-md-primary focus:outline-none transition-all uppercase italic"
       />

       <button 
         disabled={!formData.displayName}
         onClick={() => onComplete(formData)} 
         className="w-full py-6 mt-12 bg-md-primary text-black font-black uppercase tracking-widest text-sm rounded-full disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
       >
          Establish Neural Connection
       </button>
    </motion.div>
  ];

  return (
    <div className="fixed inset-0 z-[500] bg-black flex items-center justify-center p-8 overflow-hidden">
      {/* Background Particles Simulation */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div 
            key={i}
            animate={{ 
              y: [Math.random() * 1000, -100],
              x: [Math.random() * 1000, Math.random() * 1000],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 5 + Math.random() * 10, repeat: Infinity, ease: "linear" }}
            className="absolute w-1 h-1 bg-md-primary rounded-full"
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {steps[step]}
      </AnimatePresence>

      <div className="absolute bottom-12 flex gap-2">
        {steps.map((_, i) => (
          <div key={i} className={cn("w-2 h-2 rounded-full transition-all duration-500", i === step ? "bg-md-primary w-8" : "bg-white/20")} />
        ))}
      </div>
    </div>
  );
};
