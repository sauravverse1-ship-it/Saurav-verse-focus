import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Swords, 
  Users, 
  Target, 
  Zap, 
  Timer, 
  Medal, 
  Skull,
  Search,
  ChevronRight,
  Flame,
  Award,
  Lock,
  Eye,
  Activity,
  History,
  CheckCircle2
} from 'lucide-react';
import { ArenaTournament, UserProfile } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface AIArenaProps {
  tournaments: ArenaTournament[];
  profiles: UserProfile[]; // Top players
  currentProfile: UserProfile;
  onJoinTournament?: (tournamentId: string) => void;
}

export const AIArena: React.FC<AIArenaProps> = ({ tournaments, profiles, currentProfile, onJoinTournament }) => {
  const activeTourney = tournaments.find(t => t.status !== 'results');
  const pastTournaments = tournaments.filter(t => t.status === 'results').sort((a, b) => b.weekStart.localeCompare(a.weekStart));

  const isInTourney = activeTourney?.participantsTier1.includes(currentProfile.uid);

  const rounds = [
    { id: 1, name: 'Qualifier', desc: 'Focus 5h+', participants: activeTourney?.participantsTier1 || [], requirement: 'Top 32' },
    { id: 2, name: 'Quarter-Final', desc: '8h Focus Day', participants: activeTourney?.participantsTier2 || [], requirement: 'Top 16' },
    { id: 3, name: 'Semi-Final', desc: '10 Flawless Sessions', participants: activeTourney?.participantsTier3 || [], requirement: 'Top 4' },
    { id: 4, name: 'GRAND FINAL', desc: 'Ultimate Marathon', participants: activeTourney?.participantsTier4 || [], requirement: 'Champion' }
  ];

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 md:px-8 space-y-10 max-w-7xl mx-auto overflow-hidden">
      {/* Hero Tournament Section */}
      <div className="relative glass-card bg-gradient-to-br from-red-600/20 via-black to-zinc-950 p-10 md:p-20 rounded-[4rem] border border-red-500/30 overflow-hidden group shadow-[0_0_80px_rgba(220,38,38,0.15)]">
         {/* Animated Grid Background */}
         <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(220,38,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
         
         <div className="absolute top-0 right-0 p-16 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000 pointer-events-none">
            <Trophy className="w-96 h-96 text-red-500" />
         </div>
         
         <div className="relative z-10 space-y-10 max-w-3xl">
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="px-5 py-2 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.6)]">
                     Live Tournament
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <Timer className="w-4 h-4 text-red-500" />
                    <span className="text-white/60 text-[10px] font-mono uppercase tracking-[0.2em]">Resets in 2d 14h</span>
                  </div>
               </div>
               <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-[0.85] filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                 <span className="text-red-500">ULTIMATE</span><br />FOCUS ARENA
               </h1>
               <p className="text-white/50 text-xl font-serif italic leading-relaxed max-w-xl">
                 Forge your iron will in the crucible of battle. Only those with unbreakable concentration will ascend to the Hall of Eternal Focus.
               </p>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
               {isInTourney ? (
                 <div className="px-10 py-5 bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-3">
                   <CheckCircle2 className="w-5 h-5" /> Enrolled in Division 4
                 </div>
               ) : (
                 <button 
                   onClick={() => activeTourney && onJoinTournament?.(activeTourney.id)}
                   className="px-12 py-6 bg-red-600 text-white rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(220,38,38,0.4)] border border-red-500/50"
                 >
                    Join Battlefield
                 </button>
               )}
               <button className="px-10 py-5 bg-white/5 text-white rounded-full font-black uppercase tracking-widest text-xs border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 group">
                  <Eye className="w-4 h-4 group-hover:text-red-500 transition-colors" /> Watch Livestream
               </button>
            </div>
         </div>

         {/* Tournament Stats */}
         <div className="absolute bottom-12 right-12 flex flex-col items-end gap-2 text-right hidden md:flex">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Total Combatants</div>
            <div className="flex -space-x-4 mb-4">
               {profiles.slice(0, 5).map((p, i) => (
                 <img key={i} src={p.photoURL} className="w-10 h-10 rounded-full border-2 border-black" />
               ))}
               <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-black flex items-center justify-center text-[10px] font-black text-white">+{activeTourney?.participantsTier1.length || 0}</div>
            </div>
         </div>
      </div>

      {/* Bracket Progress */}
      <div className="space-y-8">
         <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black italic uppercase tracking-tight flex items-center gap-4">
               <Activity className="w-8 h-8 text-red-500" />
               Combat Bracket
            </h2>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[10px] font-mono font-black text-white/60 uppercase tracking-widest">Division: Void</span>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {rounds.map((round, idx) => {
              const isCurrent = idx === 0; // Simplified
              const isPast = false;
              return (
                <div 
                  key={round.id}
                  className={cn(
                    "relative glass-card p-8 flex flex-col justify-between min-h-[220px] transition-all duration-500 group overflow-hidden",
                    isCurrent 
                      ? "border-red-500 bg-red-500/5 shadow-[0_0_40px_rgba(220,38,38,0.1)]" 
                      : "border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100"
                  )}
                >
                   {/* Background Number */}
                   <span className="absolute -top-4 -right-4 text-9xl font-black italic text-white/[0.02] group-hover:text-white/[0.05] transition-colors pointer-events-none">{round.id}</span>
                   
                   <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-start">
                         <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-xl transition-transform group-hover:scale-110", isCurrent ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-white/5 text-white/40")}>
                            {round.id}
                         </div>
                         {idx > 0 && <Lock className="w-4 h-4 text-white/20" />}
                      </div>
                      
                      <div>
                         <h3 className="text-lg font-black uppercase tracking-widest text-white mb-1">{round.name}</h3>
                         <p className="text-xs text-white/40 font-medium leading-relaxed">{round.desc}</p>
                      </div>
                   </div>

                   <div className="relative z-10 flex justify-between items-center pt-4 border-t border-white/10 mt-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Requirement</span>
                        <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">{round.requirement}</span>
                      </div>
                      <div className="flex -space-x-2">
                        {round.participants.slice(0, 3).map((p, i) => (
                           <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-950" />
                        ))}
                      </div>
                   </div>
                </div>
              );
            })}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-12">
         {/* Live Tournament Feed */}
         <div className="space-y-8">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-4">
                  <Swords className="w-7 h-7 text-red-500" />
                  Live Battlefield
               </h2>
               <div className="flex items-center gap-6 px-5 py-2.5 bg-red-600/10 border border-red-500/20 rounded-full">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">3,241 Spectators</span>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,1)]" />
               </div>
            </div>

            <div className="space-y-4">
               {profiles.length === 0 ? (
                  <div className="p-20 glass-card border-dashed border-white/10 text-center space-y-6">
                     <Skull className="w-16 h-16 text-white/10 mx-auto" />
                     <p className="text-sm font-black uppercase tracking-widest text-white/30">Strategic assessment in progress...</p>
                  </div>
               ) : (
                  profiles.slice(0, 6).map((player, i) => (
                    <motion.div 
                      key={player.uid} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card p-6 flex items-center justify-between group hover:bg-white/5 hover:border-red-500/30 transition-all cursor-pointer relative overflow-hidden"
                    >
                       <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/[0.02] to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                       
                       <div className="flex items-center gap-6 relative z-10">
                          <span className="text-lg font-black italic text-white/10 w-8 group-hover:text-red-500/40 transition-colors">#0{i+1}</span>
                          <div className="relative group/avatar">
                             <img 
                               src={player.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.uid}`} 
                               className="w-14 h-14 rounded-2xl border-2 border-white/10 group-hover:border-red-500/50 transition-all object-cover"
                               alt={player.displayName}
                             />
                             <div className="absolute -bottom-2 -right-2 p-1 bg-zinc-950 rounded-xl border border-white/10">
                                <Flame className="w-3.5 h-3.5 text-orange-500" />
                             </div>
                          </div>
                          <div>
                             <div className="text-lg font-black text-white group-hover:text-red-500 transition-colors">{player.displayName}</div>
                             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white/60">{player.rank || 'Focus Initiate'}</div>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-10 relative z-10">
                          <div className="text-right">
                             <div className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Combat Time</div>
                             <div className="text-xl font-black italic text-red-500 shadow-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                               {Math.floor(Math.random() * 60)}:21
                             </div>
                          </div>
                          <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500 hover:border-red-400 hover:text-white transition-all flex items-center justify-center text-white/20 opacity-0 group-hover:opacity-100 shadow-xl group-hover:shadow-red-500/20">
                             <Flame className="w-5 h-5" />
                          </button>
                       </div>
                    </motion.div>
                  ))
               )}
            </div>
         </div>

         {/* Past Hall of Fame */}
         <div className="space-y-8">
            <h2 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-4">
               <History className="w-7 h-7 text-white/40" />
               Arena Legacy
            </h2>
            
            <div className="space-y-5">
               {pastTournaments.length === 0 ? (
                 <div className="p-16 border-2 border-dashed border-white/5 rounded-[3rem] text-center opacity-30 bg-white/[0.02]">
                    <Skull className="w-10 h-10 text-white/20 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No legends recorded in this era</p>
                 </div>
               ) : (
                 pastTournaments.map((t, idx) => (
                   <motion.div 
                     key={t.id} 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.1 }}
                     className="glass-card p-10 flex flex-col gap-6 relative overflow-hidden group hover:bg-white/[0.05] transition-all"
                   >
                      <div className="absolute top-0 right-0 p-8 opacity-5 scale-125 group-hover:scale-150 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                         <Medal className="w-24 h-24 text-amber-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Week {format(new Date(t.weekStart), 'MMM dd')}</div>
                        <div className="px-3 py-1 bg-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-500/30">Archive</div>
                      </div>
                      <div className="flex items-center gap-5">
                         <div className="relative">
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.winnerId || 'winner'}`} 
                              className="w-14 h-14 rounded-full border-2 border-amber-500/50 p-0.5" 
                            />
                            <div className="absolute -top-1 -right-1">
                               <Trophy className="w-5 h-5 text-amber-500" />
                            </div>
                         </div>
                         <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1 leading-none italic">Eternal Champion</div>
                            <div className="text-xl font-black text-white leading-none tracking-tight">FocusMaster_X</div>
                         </div>
                      </div>
                   </motion.div>
                 ))
               )}
            </div>
         </div>
      </div>

      {/* Rewards Footer */}
      <div className="p-8 glass-card border-dashed border-red-500/20 bg-red-500/5 flex flex-col md:flex-row items-center gap-8 justify-between">
         <div className="flex items-center gap-6">
            <div className="p-4 rounded-3xl bg-red-600/10 text-red-600 border border-red-600/20">
               <Award className="w-8 h-8" />
            </div>
            <div>
               <h4 className="text-lg font-black italic uppercase tracking-tight">Champion's Bounty</h4>
               <p className="text-xs text-white/40 max-w-sm">ARENA CHAMPION badge (7d), +5000 XP, Exclusive Crimson Shadow theme, and "MASTER" status on social feed.</p>
            </div>
         </div>
         <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center opacity-30">
                 <Lock className="w-4 h-4" />
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};
