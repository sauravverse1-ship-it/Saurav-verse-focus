import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Trash2, CheckCircle2, Skull, ScrollText, Flame } from 'lucide-react';
import { cn } from '../lib/utils';
import { DevilContract } from '../types';

interface DevilContractCardProps {
  contract: DevilContract;
  onBreak: (id: string) => void;
}

export const DevilContractCard: React.FC<DevilContractCardProps> = ({ contract, onBreak }) => {
  const daysPassed = Math.floor((Date.now() - contract.startDate) / (1000 * 60 * 60 * 24));
  const progressPercent = Math.min(100, (contract.progress / contract.goal) * 100);
  const isBleeding = contract.status === 'active' && daysPassed > 0 && contract.progress < (contract.goal * (daysPassed / contract.durationDays));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative p-6 rounded-[2.5rem] border-2 overflow-hidden transition-all duration-500",
        contract.status === 'active' ? "bg-neutral-950 border-red-900/50" : 
        contract.status === 'completed' ? "bg-neutral-950 border-emerald-900/50" : 
        "bg-neutral-950 border-neutral-800"
      )}
    >
      {/* Background Texture/Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.2),transparent_70%)]" />
        {isBleeding && (
          <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-red-600/20"
          />
        )}
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-2xl border",
              contract.status === 'active' ? "bg-red-500/10 border-red-500/20 text-red-500" :
              contract.status === 'completed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
              "bg-white/5 border-white/10 text-white/40"
            )}>
              {contract.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <ScrollText className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-xl font-display font-black text-white italic tracking-tighter uppercase">{contract.title}</h3>
              <p className="text-[10px] text-red-500/60 font-black uppercase tracking-widest">{contract.type.replace('_', ' ')}</p>
            </div>
          </div>
          {contract.status === 'active' && (
             <button 
               onClick={() => onBreak(contract.id)}
               className="p-2 text-white/20 hover:text-red-500 transition-colors"
               title="Break Contract"
             >
               <Skull className="w-5 h-5" />
             </button>
          )}
        </div>

        <p className="text-sm text-white/60 mb-6 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
          {contract.description}
        </p>

        <div className="space-y-4">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
            <span>Progress</span>
            <span>{Math.round(contract.progress)} / {contract.goal}</span>
          </div>
          
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className={cn(
                "h-full relative",
                contract.status === 'active' ? (isBleeding ? "bg-red-600" : "bg-red-500") :
                contract.status === 'completed' ? "bg-emerald-500" : "bg-neutral-800"
              )}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shimmer" />
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
             <div className="bg-white/5 p-4 rounded-[1.5rem] border border-white/10">
                <span className="block text-[8px] text-white/30 uppercase font-bold mb-1">CONTRACT REWARD</span>
                <span className="text-lg font-mono font-black text-emerald-400">+{contract.rewardXP} XP</span>
             </div>
             <div className="bg-white/5 p-4 rounded-[1.5rem] border border-white/10">
                <span className="block text-[8px] text-white/30 uppercase font-bold mb-1">FAILURE PENALTY</span>
                <span className="text-lg font-mono font-black text-red-600">-{contract.penaltyXP} XP</span>
             </div>
          </div>
        </div>

        {contract.status === 'active' && (
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-500/80">
               <Flame className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Contract Standing: {isBleeding ? 'FAILING' : 'SECURE'}</span>
            </div>
            <span className="text-[10px] font-mono opacity-40">{contract.durationDays - daysPassed} Days Remaining</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
