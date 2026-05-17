import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, X, ScrollText, Flame, Zap, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { getAIGeneratedContracts } from '../services/geminiService';
import { UserProfile, Task } from '../types';

const INITIAL_TEMPLATES = [
  {
    type: 'daily_grind',
    title: 'The Blood Pact',
    description: 'Commit to 2 hours of focus every single day for 7 days.',
    goal: 120, // 120 mins daily
    durationDays: 7,
    rewardXP: 1000,
    penaltyXP: 500,
    icon: <Flame className="w-6 h-6" />
  },
  {
    type: 'marathon',
    title: 'The Endless Grind',
    description: 'Finish 50 focus sessions. No deadline, but you cannot sign another contract until this is done.',
    goal: 50,
    durationDays: 30, // flexible but max 30
    rewardXP: 2500,
    penaltyXP: 1000,
    icon: <Skull className="w-6 h-6" />
  },
  {
    type: 'habit_chain',
    title: 'Perfect Discipline',
    description: 'Complete all your habits for 5 days in a row.',
    goal: 5,
    durationDays: 5,
    rewardXP: 1200,
    penaltyXP: 600,
    icon: <ScrollText className="w-6 h-6" />
  },
  {
    type: 'exam_prep',
    title: 'Fox Devil Pact',
    description: 'Study highly difficult subjects for 5 hours in 48 hours.',
    goal: 300, 
    durationDays: 2,
    rewardXP: 1800,
    penaltyXP: 1500,
    icon: <Zap className="w-6 h-6" />
  },
  {
    type: 'marathon',
    title: 'Ghost Devil Contract',
    description: 'Focus flawlessly for 10 sessions. No failure allowed.',
    goal: 10,
    durationDays: 7,
    rewardXP: 3000,
    penaltyXP: 2000,
    icon: <ShieldAlert className="w-6 h-6" />
  }
];

interface SignContractModalProps {
  onSign: (contract: any) => void;
  onClose: () => void;
  profile?: UserProfile | null;
  tasks?: Task[];
}

export const SignContractModal: React.FC<SignContractModalProps> = ({ onSign, onClose, profile, tasks }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const aiTemplates = await getAIGeneratedContracts({ profile, tasks });
      if (aiTemplates && aiTemplates.length > 0) {
        const enrichedTemplates = aiTemplates.map((t: any) => ({
          ...t,
          icon: <Sparkles className="w-6 h-6 text-blue-400" />,
          isAI: true
        }));
        setTemplates([...enrichedTemplates, ...INITIAL_TEMPLATES]);
        setSelected(0); // Select the first AI generated one
      }
    } catch (e) {
      console.error("AI Generation failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
    >
      <div className="w-full max-w-lg bg-neutral-950 border border-red-900/40 rounded-[3.5rem] p-8 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Background Blood Drip Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8)]" />
        
        <div className="flex justify-between items-start mb-6">
           <div>
              <h2 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase leading-none">Sign a Devil Contract</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2">High Reward. Lethal Penalty.</p>
           </div>
           <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors">
              <X className="w-8 h-8" />
           </button>
        </div>

        <button
          onClick={handleGenerateAI}
          disabled={isGenerating}
          className="mb-6 w-full py-4 bg-blue-600/10 border border-blue-500/30 rounded-2xl flex items-center justify-center gap-3 group hover:bg-blue-600/20 transition-all font-black uppercase tracking-widest text-[10px] text-blue-400"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Manifesting Pacts...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 group-hover:scale-125 transition-transform" />
              Generate AI Pacts (Targeted Missions)
            </>
          )}
        </button>

        <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-red-900 flex-1">
           {templates.map((t, i) => (
             <motion.div
               key={i}
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => setSelected(i)}
               className={cn(
                 "p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 relative overflow-hidden",
                 selected === i ? "bg-red-500/10 border-red-500" : "bg-white/5 border-white/5 hover:border-white/20"
               )}
             >
               {(t as any).isAI && (
                 <div className="absolute top-0 right-0 px-3 py-1 bg-blue-500 text-[8px] font-black uppercase text-black italic">
                   AI Directive
                 </div>
               )}
               <div className="flex items-center gap-4 mb-4">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    selected === i ? "bg-red-500 text-black" : "bg-white/10 text-white"
                  )}>
                    {t.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xl uppercase italic text-white leading-tight">{t.title}</h3>
                    <p className="text-[9px] text-red-500/80 font-black uppercase tracking-widest">{t.type.replace('_', ' ')}</p>
                  </div>
               </div>
               <p className="text-sm text-white/60 mb-4 font-medium leading-relaxed">{t.description}</p>
               <div className="flex flex-wrap gap-2">
                  <div className="bg-emerald-500/10 text-emerald-500 text-[10px] px-3 py-1 rounded-full font-black">+{t.rewardXP} XP Reward</div>
                  <div className="bg-red-500/10 text-red-500 text-[10px] px-3 py-1 rounded-full font-black">-{t.penaltyXP} XP Penalty</div>
                  <div className="bg-white/5 text-white/40 text-[10px] px-3 py-1 rounded-full font-black">{t.durationDays} Days</div>
               </div>
             </motion.div>
           ))}
        </div>

        <div className="mt-8">
           <button
             disabled={selected === null || isGenerating}
             onClick={() => selected !== null && onSign(templates[selected])}
             className={cn(
               "w-full py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all duration-500",
               selected !== null && !isGenerating
                 ? "bg-red-600 text-white shadow-[0_0_40px_rgba(220,38,38,0.4)] hover:bg-red-500 hover:scale-[1.02]" 
                 : "bg-white/5 text-white/20 grayscale cursor-not-allowed"
             )}
           >
             {selected !== null ? 'Sign with Blood' : 'Select a Contract'}
           </button>
           <p className="text-center text-[9px] text-white/20 uppercase font-bold mt-4 tracking-tighter">By clicking sign, you agree to the penalty upon failure</p>
        </div>
      </div>
    </motion.div>
  );
};
