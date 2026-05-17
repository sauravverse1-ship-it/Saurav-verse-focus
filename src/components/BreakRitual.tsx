import React from 'react';
import { motion } from 'motion/react';
import { GlassWater, Wind, EyeOff, BrainCircuit, Heart, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface BreakRitualProps {
  onComplete: () => void;
}

export const BreakRitual: React.FC<BreakRitualProps> = ({ onComplete }) => {
  const steps = [
    { title: "Hydrate", icon: <GlassWater />, desc: "Drink 250ml water immediately." },
    { title: "Eye Rest", icon: <EyeOff />, desc: "Look at something 20ft away for 20s." },
    { title: "Breathe", icon: <Wind />, desc: "3 deep box breaths. Reset your nervous system." },
    { title: "Stretch", icon: <BrainCircuit />, desc: "Quick neck and shoulder release." }
  ];

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl">
      <div className="max-w-md w-full space-y-12">
        <div className="text-center space-y-4">
           <h2 className="text-5xl font-display font-black text-md-primary italic uppercase tracking-tighter">Break Ritual</h2>
           <p className="text-white/40 text-xs font-black uppercase tracking-[0.4em]">Recovery Protocol v4.0</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
           {steps.map((step, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center gap-6"
             >
                <div className="p-4 bg-md-primary/20 text-md-primary rounded-2xl">
                   {step.icon}
                </div>
                <div>
                   <p className="font-display font-black text-white italic uppercase">{step.title}</p>
                   <p className="text-xs text-white/40">{step.desc}</p>
                </div>
             </motion.div>
           ))}
        </div>

        <button 
          onClick={onComplete}
          className="w-full py-6 bg-white text-black font-black uppercase tracking-widest text-sm rounded-full hover:bg-md-primary transition-all group overflow-hidden relative shadow-[0_0_50px_rgba(255,255,255,0.2)]"
        >
          <span className="relative z-10">Ritual Complete</span>
          <div className="absolute inset-0 bg-md-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </button>
      </div>
    </div>
  );
};
