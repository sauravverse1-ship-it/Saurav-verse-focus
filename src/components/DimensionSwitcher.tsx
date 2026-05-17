import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Box, Globe2, Skull, Sparkles, Lock, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

export const DIMENSIONS = {
  void: {
    id: 'void',
    name: 'Dimension I: The Void',
    primary: '#444444',
    secondary: '#222222',
    bg: '#000000',
    font: 'font-mono',
    icon: Layers,
    conditionDesc: 'Available from the start',
    req: () => true
  },
  grid: {
    id: 'grid',
    name: 'Dimension II: The Grid',
    primary: '#00ffe0',
    secondary: '#0088cc',
    bg: '#050a14',
    font: 'font-mono',
    icon: Box,
    conditionDesc: 'Reach a 7-day streak',
    req: (p: UserProfile) => p.streak >= 7
  },
  cosmos: {
    id: 'cosmos',
    name: 'Dimension III: The Cosmos',
    primary: '#ff8a00',
    secondary: '#da1b60',
    bg: '#1a0d0d',
    font: 'font-display',
    icon: Globe2,
    conditionDesc: 'Reach a 30-day streak',
    req: (p: UserProfile) => p.streak >= 30
  },
  chainsaw: {
    id: 'chainsaw',
    name: 'Dimension IV: Chainsaw Realm',
    primary: '#ff3e3e',
    secondary: '#ff7e3e',
    bg: '#0a0505',
    font: 'font-display',
    icon: Skull,
    conditionDesc: 'Complete 5 Devil Contracts',
    req: (p: UserProfile) => false // We can implement tracking for contracts later
  },
  legend: {
    id: 'legend',
    name: 'Dimension V: Legend Plane',
    primary: '#ffffff',
    secondary: '#dddddd',
    bg: '#ffffff',
    font: 'font-display',
    icon: Sparkles,
    conditionDesc: 'Reach LEGEND rank',
    req: (p: UserProfile) => p.rank === 'Legend'
  },
};

interface DimensionSwitcherProps {
  currentDimension: string;
  onSelect: (dimensionId: string) => void;
  onClose: () => void;
  profile: UserProfile | null;
}

export const DimensionSwitcher: React.FC<DimensionSwitcherProps> = ({ currentDimension, onSelect, onClose, profile }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-lg glass rounded-[3rem] p-8 md:p-12 border border-white/10 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-12">
            <div>
                <h3 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase leading-none">Dimension Gate</h3>
                <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mt-2">Alter application reality</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-all">
                <X className="w-6 h-6 text-white/40" />
            </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {Object.values(DIMENSIONS).map((dim) => {
               const isUnlocked = profile ? dim.req(profile) : dim.id === 'void';
               
               return (
               <button
                 key={dim.id}
                 onClick={() => isUnlocked && onSelect(dim.id)}
                 className={cn(
                    "flex flex-col gap-2 p-5 rounded-2xl border transition-all text-left group overflow-hidden relative",
                    currentDimension === dim.id 
                        ? "bg-white/10 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                        : (isUnlocked ? "bg-white/5 border-white/5 hover:border-white/20" : "bg-black/50 border-white/5 cursor-not-allowed grayscale")
                 )}
               >
                  <div className="flex items-center gap-4 relative z-10 w-full">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                        style={isUnlocked ? { backgroundColor: `${dim.primary}20`, color: dim.primary } : {backgroundColor: '#333', color: '#666'}}
                      >
                         {isUnlocked ? <dim.icon className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                         <span className={cn("text-[13px] font-black uppercase tracking-widest block font-display", currentDimension === dim.id ? "text-white" : (isUnlocked ? "text-white/60" : "text-white/30"))}>
                            {dim.name}
                         </span>
                         {!isUnlocked && (
                            <p className="text-[10px] text-white/40 mt-1 uppercase font-black tracking-widest bg-black/40 px-2 py-1 rounded inline-block">{dim.conditionDesc}</p>
                         )}
                      </div>
                  </div>
               </button>
            )})}
        </div>
      </motion.div>
    </motion.div>
  );
};
