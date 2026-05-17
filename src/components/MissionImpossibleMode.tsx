import React from 'react';
import { motion } from 'motion/react';
import { Skull, Target, Zap, ShieldAlert, X, ChevronRight, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Mission {
  id: string;
  title: string;
  desc: string;
  duration: string;
  requirements: string[];
  reward: string;
  stakes: string;
  difficulty: 'EX' | 'SSS' | 'S';
}

const MISSIONS: Mission[] = [
  {
    id: 'monk',
    title: 'THE MONK',
    desc: 'Absolute focus for 7 consecutive days. No breaks allowed during sessions.',
    duration: '7 DAYS',
    requirements: [
      'Zero pauses in any session',
      'Min 2h focus daily',
      'All habits completed daily'
    ],
    reward: '3,000 XP + "MONK" Rank',
    stakes: 'Mission fails if one signal is missed.',
    difficulty: 'S'
  },
  {
    id: 'grinder',
    title: 'THE GRINDER',
    desc: 'Execute maximum intensity for a month. No gaps allowed.',
    duration: '30 DAYS',
    requirements: [
      'Minimum 2h focus daily',
      'No day gaps allowed',
      '7 sessions per week min'
    ],
    reward: '10,000 XP + "LEGENDARY" Badge',
    stakes: '3-day lock on new missions if failed.',
    difficulty: 'SSS'
  },
  {
    id: 'perfectionist',
    title: 'PERFECTIONIST',
    desc: 'A week of perfect execution. All tasks, all habits, zero broken sessions.',
    duration: '7 DAYS',
    requirements: [
      'All daily tasks complete',
      'All daily habits complete',
      'Min 1 Flow State daily'
    ],
    reward: '5,000 XP + Pochita Evolution',
    stakes: 'Resets to Day 0 on first failure.',
    difficulty: 'EX'
  }
];

interface MissionImpossibleProps {
  onAccept: (mission: Mission) => void;
  onClose: () => void;
}

export const MissionImpossibleMode: React.FC<MissionImpossibleProps> = ({ onAccept, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-3xl overflow-y-auto p-8"
    >
      <div className="max-w-6xl mx-auto space-y-12 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-600 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                     <ShieldAlert className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-6xl md:text-8xl font-display font-black text-white italic tracking-tighter uppercase leading-none">High Stakes</h1>
               </div>
               <p className="text-red-500 font-mono text-[10px] md:text-xs uppercase font-black tracking-[0.4em]">Mission Impossible Protocol // Code Red</p>
            </div>
            <button 
              onClick={onClose} 
              className="group p-6 bg-white/5 border border-white/10 rounded-full hover:bg-white hover:border-white transition-all transform active:scale-95"
            >
              <X className="w-8 h-8 text-white group-hover:text-black transition-colors" />
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {MISSIONS.map(mission => (
             <motion.div 
               key={mission.id}
               whileHover={{ y: -10 }}
               className="group relative flex flex-col h-full"
             >
                <div className="absolute inset-0 bg-red-600/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex-1 bg-neutral-900 border border-neutral-800 rounded-[3rem] p-10 flex flex-col group-hover:border-red-600/40 transition-all">
                  <div className="flex justify-between items-start mb-8">
                     <div className="px-4 py-1 bg-red-950 border border-red-500 text-red-500 font-black text-[10px] rounded-full uppercase">
                        Rank {mission.difficulty}
                     </div>
                     <Skull className="w-6 h-6 text-white/20 group-hover:text-red-600 transition-colors" />
                  </div>

                  <h3 className="text-3xl font-display font-black text-white italic tracking-tight uppercase mb-4">{mission.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed mb-8">{mission.desc}</p>

                  <div className="space-y-6 mb-12">
                     <div>
                        <p className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-3">Requirements</p>
                        <ul className="space-y-2">
                           {mission.requirements.map((req, i) => (
                             <li key={i} className="text-[10px] text-white/60 flex items-center gap-2">
                                <div className="w-1 h-1 bg-red-500 rounded-full" /> {req}
                             </li>
                           ))}
                        </ul>
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-3">Stakes</p>
                        <p className="text-[10px] text-red-400 italic">{mission.stakes}</p>
                     </div>
                  </div>

                  <div className="mt-auto space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Reward</span>
                        <span className="text-[10px] font-black uppercase text-emerald-400">{mission.reward}</span>
                    </div>
                    <button 
                      onClick={() => onAccept(mission)}
                      className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-red-600 hover:text-white transition-all transform group-active:scale-95"
                    >
                      Accept Contract
                    </button>
                  </div>
                </div>
             </motion.div>
           ))}
        </div>

        <div className="p-12 border-4 border-dashed border-white/5 rounded-[4rem] text-center space-y-4">
           <ShieldAlert className="w-12 h-12 text-white/20 mx-auto" />
           <h4 className="text-2xl font-display font-black text-white italic tracking-tighter uppercase opacity-40">More Missions Classified</h4>
           <p className="text-xs text-white/20 uppercase font-black tracking-widest">Reach Level 5 to unlock Omega-tier tasks</p>
        </div>
      </div>
    </motion.div>
  );
};
