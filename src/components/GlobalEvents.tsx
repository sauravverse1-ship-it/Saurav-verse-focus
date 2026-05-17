import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Trophy, 
  Clock, 
  MapPin, 
  Zap, 
  Target, 
  Skull, 
  CheckCircle2, 
  Flame,
  ArrowUpRight,
  TrendingUp,
  Award,
  Lock
} from 'lucide-react';
import { SectorEvent, UserProfile } from '../types';
import { cn } from '../lib/utils';

interface GlobalEventsProps {
  activeEvents: SectorEvent[];
  profile: UserProfile;
  onContribute: (eventId: string, amount: number) => void;
}

export const GlobalEvents: React.FC<GlobalEventsProps> = ({ activeEvents, profile, onContribute }) => {
  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-6 px-4 md:px-8 space-y-12 max-w-7xl mx-auto font-sans">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-1">
             <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
                <Users className="w-10 h-10 text-md-primary" />
                SECTOR EVENTS
             </h1>
             <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.4em]">Real-time Hive Synchronization Protocols</p>
          </div>

          <div className="flex gap-4">
             <div className="glass-card bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
                <TrendingUp className="w-4 h-4 text-md-primary" />
                <div className="flex flex-col">
                   <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Active Users</span>
                   <span className="text-sm font-black text-white">4,281</span>
                </div>
             </div>
             <div className="glass-card bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
                <Award className="w-4 h-4 text-amber-500" />
                <div className="flex flex-col">
                   <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Total Focus</span>
                   <span className="text-sm font-black text-white">82.4K Hours</span>
                </div>
             </div>
          </div>
       </div>

       {/* Featured Event Card */}
       {activeEvents.map(event => (
         <motion.div 
           key={event.id}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative group cursor-pointer"
         >
            <div className={cn(
              "glass-card p-10 md:p-14 rounded-[3.5rem] border overflow-hidden relative",
              event.type === 'boss_raid' ? "bg-gradient-to-br from-red-600/10 via-black to-black border-red-500/20 shadow-[0_0_80px_rgba(220,38,38,0.1)]" : 
              event.type === 'marathon' ? "bg-gradient-to-br from-md-primary/10 via-black to-black border-white/10" :
              "bg-gradient-to-br from-amber-500/10 via-black to-black border-amber-500/20"
            )}>
               {/* Background Icon Decoration */}
               <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 transform group-hover:scale-[1.7] group-hover:rotate-6 transition-transform duration-1000">
                  {event.type === 'boss_raid' ? <Skull className="w-96 h-96" /> : <TrendingUp className="w-96 h-96" />}
               </div>

               <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-7 space-y-8">
                     <div className="flex flex-wrap items-center gap-4">
                        <div className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                          event.type === 'boss_raid' ? "bg-red-600 text-white" : "bg-md-primary text-black"
                        )}>
                           {event.type === 'boss_raid' && <Skull className="w-3 h-3" />}
                           {event.type.replace('_', ' ')}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                           <Clock className="w-3 h-3" /> 
                           ENDS IN {Math.max(0, Math.ceil((event.endDate - Date.now()) / (1000 * 3600 * 24)))} DAYS
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-tight">
                           {event.title}
                        </h2>
                        <p className="text-white/60 text-lg font-serif italic max-w-xl">
                           {event.description}
                        </p>
                     </div>

                     {/* Progress Section */}
                     <div className="space-y-4 max-w-lg">
                        <div className="flex justify-between items-end">
                           <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Collective Impact</span>
                              <div className="text-2xl font-black text-white">
                                 {event.type === 'boss_raid' ? (
                                   `${event.hp?.toLocaleString()} / ${event.maxHp?.toLocaleString()} HP`
                                 ) : (
                                   `${event.currentValue.toLocaleString()} / ${event.goal.toLocaleString()} ${event.type === 'marathon' ? 'Hours' : 'Succeeded'}`
                                 )}
                              </div>
                           </div>
                           <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest bg-white/5 px-4 py-1 rounded-full">
                              {Math.floor((event.currentValue / event.goal) * 100)}% Synchronized
                           </div>
                        </div>
                        <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${(event.currentValue / event.goal) * 100}%` }}
                             className={cn(
                               "h-full relative",
                               event.type === 'boss_raid' ? "bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]" : "bg-md-primary"
                             )}
                           >
                              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:100px_100px] animate-[shimmer_2s_linear_infinite]" />
                           </motion.div>
                        </div>
                     </div>
                  </div>

                  {/* Rewards & Contribution */}
                  <div className="lg:col-span-5 glass-card bg-white/5 p-8 md:p-10 rounded-[3rem] border-white/10 space-y-8">
                     <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-3">
                           <Award className="w-4 h-4 text-amber-500" /> Synchronization Rewards
                        </h3>
                        <div className="space-y-4">
                           {event.rewards.map((reward, i) => {
                             const isUnlocked = event.currentValue >= reward.milestone;
                             return (
                               <div key={i} className={cn(
                                 "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                 isUnlocked ? "bg-md-primary/10 border-md-primary/20 text-md-primary" : "bg-white/5 border-white/5 text-white/20"
                               )}>
                                  <div className="flex items-center gap-4">
                                     <div className={cn(
                                       "w-10 h-10 rounded-xl flex items-center justify-center",
                                       isUnlocked ? "bg-md-primary/20" : "bg-white/5"
                                     )}>
                                        {isUnlocked ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                     </div>
                                     <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Milestone {i + 1}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest font-mono">@{reward.milestone.toLocaleString()}</span>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <span className="text-[10px] font-black uppercase tracking-widest">+{reward.rewardXP} XP</span>
                                  </div>
                               </div>
                             );
                           })}
                        </div>
                     </div>

                     <div className="pt-6 border-t border-white/5 space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                           <span className="text-white/40">Your Local Contribution</span>
                           <span className="text-md-primary">+{profile.eventContributions?.[event.id] || 0} Points</span>
                        </div>
                        <button className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2">
                           View Global Leaderboard <ArrowUpRight className="w-3 h-3" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </motion.div>
       ))}

       {/* Local Impact Stats */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-10 rounded-[3rem] border-white/5 space-y-6">
             <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                <Flame className="w-6 h-6" />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">Quantum Marathon</h3>
                <p className="text-sm text-white/40 font-serif italic">Every focus minute contributes to the collective shard. Unite for massive rewards.</p>
             </div>
             <div className="pt-4 flex items-center gap-8">
                <div className="space-y-1">
                   <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Sessions Contributing</div>
                   <div className="text-3xl font-black text-white">412</div>
                </div>
                <div className="space-y-1">
                   <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Global Efficiency</div>
                   <div className="text-3xl font-black text-md-primary">92.4%</div>
                </div>
             </div>
          </div>

          <div className="glass-card p-10 rounded-[3rem] border-white/5 space-y-6">
             <div className="w-12 h-12 rounded-2xl bg-red-600/20 flex items-center justify-center text-red-600">
                <Skull className="w-6 h-6" />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">Extermination Raid</h3>
                <p className="text-sm text-white/40 font-serif italic">The Procrastination Demon has manifested. Defeat it through disciplined hours.</p>
             </div>
             <div className="pt-4 flex items-center gap-8">
                <div className="space-y-1">
                   <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Your DMG Dealt</div>
                   <div className="text-3xl font-black text-red-500">850 HP</div>
                </div>
                <div className="space-y-1">
                   <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Total Hunters</div>
                   <div className="text-3xl font-black text-white">1.2K</div>
                </div>
             </div>
          </div>
       </div>

       <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
       `}</style>
    </div>
  );
};
