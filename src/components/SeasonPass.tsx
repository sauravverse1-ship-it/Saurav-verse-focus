import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Lock, 
  CheckCircle, 
  Flame, 
  Zap, 
  Star, 
  Crown, 
  ChevronRight,
  Clock,
  Layout,
  Palette,
  ShieldCheck,
  Target
} from 'lucide-react';
import { SeasonPass, SeasonMission, UserProfile } from '../types';
import { cn } from '../lib/utils';

interface SeasonPassUIProps {
  seasonPass: SeasonPass;
  profile: UserProfile;
  onClaimReward: (tier: number) => void;
}

export const SeasonPassUI: React.FC<SeasonPassUIProps> = ({ seasonPass, profile, onClaimReward }) => {
  const tiers = Array.from({ length: 50 }, (_, i) => i + 1);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const getRewardIcon = (tier: number) => {
    if (tier % 10 === 0) return Crown;
    if (tier % 5 === 0) return Trophy;
    if (tier % 3 === 0) return Palette;
    return Star;
  };

  const getRewardText = (tier: number) => {
    if (tier === 5) return "New Pochita Skin (Glasses)";
    if (tier === 10) return "Exclusive 'SEASON 1' Badge";
    if (tier === 15) return "New Ring Color (Crimson Gold)";
    if (tier === 20) return "Dimension Early Access";
    if (tier === 30) return "'SEASON VETERAN' Title";
    if (tier === 50) return "SEASON CHAMPION CEREMONY";
    return `+${tier * 10} Focus Shards`;
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-6 px-4 md:px-8 space-y-12 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative glass-card bg-[#05070a] p-10 md:p-14 rounded-[3rem] border border-white/5 overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
         {/* Neural Background Effect */}
         <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
               {[...Array(20)].map((_, i) => (
                  <motion.circle
                     key={i}
                     cx={Math.random() * 100}
                     cy={Math.random() * 100}
                     r="0.5"
                     fill="#f59e0b"
                     animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.5, 1]
                     }}
                     transition={{
                        duration: 2 + Math.random() * 3,
                        repeat: Infinity,
                        ease: "linear"
                     }}
                  />
               ))}
               {[...Array(15)].map((_, i) => (
                  <motion.line
                     key={i}
                     x1={Math.random() * 100}
                     y1={Math.random() * 100}
                     x2={Math.random() * 100}
                     y2={Math.random() * 100}
                     stroke="#f59e0b"
                     strokeWidth="0.05"
                     animate={{ opacity: [0, 0.1, 0] }}
                     transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
                  />
               ))}
            </svg>
         </div>

         <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:rotate-12 transition-transform duration-1000">
            <Trophy className="w-96 h-96 text-amber-500" />
         </div>
         
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3 space-y-6">
               <div className="flex items-center gap-4">
                  <div className="px-4 py-1.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                     Season 1: The Awakening
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full">
                     <Clock className="w-3 h-3 text-amber-500" /> Ends in 12 days
                  </div>
               </div>
               <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-[0.85] drop-shadow-2xl">
                 NEURAL <span className="text-amber-500">PASS</span>
               </h1>
               <p className="text-white/60 text-lg font-serif italic max-w-md border-l-2 border-amber-500/30 pl-6 py-2">
                 50 Tiers of elite focus rewards. Fuel your evolution by completing daily protocols.
               </p>
               
               <div className="pt-6 flex flex-wrap items-center gap-10">
                  <div className="space-y-1">
                     <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Current Tier</div>
                     <div className="flex items-baseline gap-2">
                        <div className="text-5xl font-black text-amber-500 italic">50</div>
                        <div className="text-xs font-black text-white/20 uppercase tracking-widest">/ 50</div>
                     </div>
                  </div>
                  <div className="flex-1 min-w-[200px] space-y-3 bg-white/5 p-6 rounded-[2rem] border border-white/5">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                        <span className="flex items-center gap-2">
                           <Zap className="w-3 h-3 text-amber-500" /> XP Progress
                        </span>
                        <span className="text-amber-500">{seasonPass.currentXP} <span className="text-white/20">/ 1000</span></span>
                     </div>
                     <div className="h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <motion.div 
                          className="h-full bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${(seasonPass.currentXP / 1000) * 100}%` }}
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Daily Missions */}
            <div className="lg:col-span-2 glass-card bg-[#0a0c10] p-8 rounded-[2.5rem] border-white/10 space-y-6 shadow-2xl relative overflow-hidden group/missions">
               <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover/missions:opacity-100 transition-opacity duration-700" />
               <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center justify-between">
                  <span className="flex items-center gap-2"><Target className="w-4 h-4 text-amber-500" /> Daily Protocols</span>
                  <span className="text-[10px] text-white/20 font-mono">RESETS 00:00</span>
               </h2>
               <div className="space-y-4 relative z-10">
                  {seasonPass.dailyMissions.map(mission => (
                    <div key={mission.id} className="flex items-start gap-4 p-5 rounded-3xl bg-[#05070a] border border-white/5 group/mission hover:border-amber-500/30 transition-all">
                       <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner",
                         mission.completed ? "bg-green-500/20 text-green-500" : "bg-white/5 text-white/20"
                       )}>
                          {mission.completed ? <CheckCircle className="w-6 h-6" /> : <Zap className="w-6 h-6 animate-pulse" />}
                       </div>
                       <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-center">
                             <span className={cn("text-xs font-black uppercase tracking-widest", mission.completed ? "text-white/40 line-through" : "text-white/80")}>
                                {mission.text}
                             </span>
                             <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/10 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                                +{mission.tierReward} T
                             </div>
                          </div>
                          <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                             <motion.div 
                               className="h-full bg-gradient-to-r from-amber-500/40 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                               initial={{ width: 0 }}
                               animate={{ width: `${(mission.currentValue / mission.requirement) * 100}%` }}
                             />
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Reward Track */}
      <div className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
               <Layout className="w-6 h-6 text-amber-500" />
               Vanguard Track
            </h2>
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Scroll to explore rewards</p>
         </div>

         <div 
           ref={scrollRef}
           className="flex gap-4 overflow-x-auto pb-12 pt-4 no-scrollbar -mx-4 px-4 mask-fade-edges"
         >
            {tiers.map(tier => {
              const isLocked = tier > seasonPass.currentTier;
              const isClaimed = seasonPass.unlockedTiers.includes(tier);
              const RewardIcon = getRewardIcon(tier);
              const rewardText = getRewardText(tier);

              return (
                <div key={tier} className="flex flex-col gap-6 items-center flex-shrink-0 w-48">
                   <div className="relative">
                      {/* Tier Number Bubble */}
                      <div className={cn(
                        "absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black z-20 transition-all",
                        isLocked ? "bg-white/5 text-white/20" : "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                      )}>
                         TIER {tier}
                      </div>

                      <motion.button 
                        whileHover={!isLocked && !isClaimed ? { y: -10, scale: 1.05 } : {}}
                        onClick={() => !isLocked && !isClaimed && onClaimReward(tier)}
                        className={cn(
                          "w-48 h-64 rounded-[2.5rem] border flex flex-col items-center justify-center gap-6 transition-all relative overflow-hidden group/card",
                          isLocked 
                            ? "bg-white/5 border-white/5" 
                            : isClaimed 
                               ? "bg-green-500/10 border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.1)]" 
                               : "bg-gradient-to-b from-amber-500/20 to-transparent border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.1)]"
                        )}
                      >
                         <div className={cn(
                           "w-20 h-20 rounded-3xl flex items-center justify-center transition-all",
                           isLocked ? "bg-white/5 text-white/10" : "bg-white text-black"
                         )}>
                            <RewardIcon className="w-10 h-10" />
                         </div>
                         
                         <div className="text-center px-6">
                            <div className={cn(
                              "text-[10px] font-black uppercase tracking-widest mb-1",
                              isLocked ? "text-white/20" : "text-amber-500/60"
                            )}>
                               Reward
                            </div>
                            <div className={cn(
                              "text-xs font-black uppercase tracking-widest leading-tight",
                              isLocked ? "text-white/40" : "text-white"
                            )}>
                               {rewardText}
                            </div>
                         </div>

                         {isClaimed && (
                           <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                              <ShieldCheck className="w-12 h-12 text-green-500" />
                           </div>
                         )}

                         {isLocked && (
                            <div className="absolute bottom-6 p-2 rounded-full bg-white/5">
                               <Lock className="w-3 h-3 text-white/20" />
                            </div>
                         )}
                      </motion.button>
                   </div>
                   
                   {/* Progress Line */}
                   {tier < 50 && (
                     <div className="h-px w-20 bg-white/5 mt-4" />
                   )}
                </div>
              );
            })}
         </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-4">
            <Flame className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-black italic uppercase tracking-tight text-white leading-tight">Daily Missions</h3>
            <p className="text-xs text-white/40 leading-relaxed">Three new protocols arrive at midnight. Complete them to fast-track your season progress.</p>
         </div>
         <div className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-4">
            <Palette className="w-6 h-6 text-md-primary" />
            <h3 className="text-lg font-black italic uppercase tracking-tight text-white leading-tight">Elite Cosmetics</h3>
            <p className="text-xs text-white/40 leading-relaxed">Unlock legendary skins, dimension keys, and holographic rank frames available only during Season 1.</p>
         </div>
         <div className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-4">
            <ShieldCheck className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-black italic uppercase tracking-tight text-white leading-tight">Season Veteran</h3>
            <p className="text-xs text-white/40 leading-relaxed">Reach Tier 50 to permanently immortalize your legacy as a Season 1 Champion on the global leaderboard.</p>
         </div>
      </div>
    </div>
  );
};
