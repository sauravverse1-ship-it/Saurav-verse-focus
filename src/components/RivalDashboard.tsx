import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Flame, Target, MessageSquare, ChevronRight, UserPlus, Info, Trophy } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, limit as firestoreLimit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface RivalDashboardProps {
  currentProfile: UserProfile;
  rivalIds: string[];
  rivalProfiles: UserProfile[];
  onAddRival?: (id: string) => void;
}

export const RivalDashboard: React.FC<RivalDashboardProps> = ({ currentProfile, rivalIds, rivalProfiles, onAddRival }) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);


  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    setLoading(true);
    try {
        // Direct ID check first
        if (searchQuery.length > 20 && !searchQuery.includes(' ')) {
           const d = await getDoc(doc(db, 'users', searchQuery.trim()));
           if (d.exists()) {
              const p = d.data() as UserProfile;
              if (p.uid !== currentProfile.uid && !rivalIds.includes(p.uid)) {
                 setSearchResults([p]);
                 setLoading(false);
                 setIsSearching(true);
                 return;
              }
           }
        }

        const q = query(
            collection(db, 'users'), 
            where('displayName', '>=', searchQuery), 
            where('displayName', '<=', searchQuery + '\uf8ff'),
            firestoreLimit(10)
        );
        const snap = await getDocs(q);
        const results = snap.docs.map(d => d.data() as UserProfile).filter(p => p.uid !== currentProfile.uid && !rivalIds.includes(p.uid));
        setSearchResults(results);
    } catch (e) {
        console.error("Search error:", e);
    } finally {
        setIsSearching(false);
        setLoading(false);
    }
  };

  const getRandomTrashTalk = (isWinning: boolean, rivalName: string) => {
    const winningMsgs = [
       "You're smoking them. Don't let up.",
       `${rivalName} is struggling to keep up. Finish them.`,
       "Flawless trajectory. Pure dominance.",
       "They're taking a break. You're taking the lead."
    ];
    const losingMsgs = [
       `${rivalName} just hit a new milestone. Embarrassing.`,
       "Are you really going to let them win?",
       "One session ahead. That's all they need.",
       "Neural patterns detected: ${rivalName} is in deep flow. Catch up."
    ];
    const msgs = isWinning ? winningMsgs : losingMsgs;
    return msgs[Math.floor(Math.random() * msgs.length)];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-600/20">
               <Swords className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Quantum Rivalry</h2>
         </div>
         <button 
            onClick={() => setIsSearching(!isSearching)}
            className={cn(
              "px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
              isSearching ? "bg-red-600 text-white" : "bg-white/5 border border-white/10 text-white/40 hover:text-white"
            )}
         >
            <UserPlus className="w-3 h-3" />
            {isSearching ? 'Close' : 'Add Rival'}
         </button>
      </div>

      <AnimatePresence mode="wait">
        {isSearching && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="overflow-hidden"
          >
             <div className="glass-card p-6 border-dashed border-red-500/20 bg-red-500/5 space-y-4">
                <div className="flex flex-col gap-2">
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1 px-1">Search by Name or User ID</p>
                   <div className="flex gap-2">
                    <input 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="e.g. Makima or 0x82f..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-red-500/40 transition-all font-mono"
                    />
                    <button 
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                    >
                        {loading ? '...' : 'Search'}
                    </button>
                   </div>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
                   {searchResults.map(p => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={p.uid} 
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                      >
                         <div className="flex items-center gap-3">
                            <img src={p.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.uid}`} className="w-10 h-10 rounded-full border border-white/10" />
                            <div>
                                <span className="text-xs font-bold text-white block">{p.displayName}</span>
                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">LVL {p.level || 1} • {p.rank || 'Initiate'}</span>
                            </div>
                         </div>
                         <button 
                            onClick={() => {
                                onAddRival && onAddRival(p.uid);
                                setIsSearching(false);
                                setSearchQuery('');
                            }}
                            className="bg-red-600 hover:bg-red-500 p-2.5 rounded-xl transition-all shadow-lg shadow-red-600/20"
                         >
                            <Plus className="w-3 h-3 text-white" />
                         </button>
                      </motion.div>
                   ))}
                   {searchQuery.length > 0 && !loading && searchResults.length === 0 && (
                      <div className="text-center py-6 opacity-40">
                         <Info className="w-6 h-6 mx-auto mb-2" />
                         <p className="text-[10px] font-black uppercase tracking-widest">No candidates found in this frequency</p>
                      </div>
                   )}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rivalProfiles.map(rival => {
            const isWinning = currentProfile.totalFocusSeconds >= rival.totalFocusSeconds;
            const total = Math.max(1, currentProfile.totalFocusSeconds + rival.totalFocusSeconds);
            const myHours = (currentProfile.totalFocusSeconds / 3600).toFixed(1);
            const rivalHours = (rival.totalFocusSeconds / 3600).toFixed(1);

            return (
              <motion.div 
                key={rival.uid}
                layout
                className="p-8 rounded-[3rem] bg-gradient-to-br from-red-950/20 via-black/80 to-black border border-red-600/10 relative overflow-hidden group shadow-2xl"
              >
                  <div className="absolute top-0 right-0 p-10 opacity-5 bg-red-600 blur-[100px] w-64 h-64 rounded-full" />
                  
                  <div className="flex justify-between items-center mb-8 relative z-10">
                     <span className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border shadow-xl transition-all",
                        isWinning 
                          ? "bg-green-600/20 text-green-400 border-green-500/20 shadow-green-500/10" 
                          : "bg-red-600/20 text-red-500 border-red-500/20 shadow-red-500/10 animate-pulse"
                     )}>
                        {isWinning ? 'DOMINATING' : 'FALLING BEHIND'}
                     </span>
                     <Flame className={cn("w-5 h-5", isWinning ? "text-green-500" : "text-red-500")} />
                  </div>

                  <div className="flex justify-between items-center mb-10 relative z-10 scale-110 md:scale-100">
                      <div className="text-center">
                          <div className="relative mb-3">
                             <img src={currentProfile.photoURL} alt="You" className="w-14 h-14 rounded-full border-2 border-white/20 mx-auto shadow-xl" />
                             {isWinning && <div className="absolute -top-1 -right-1 bg-amber-400 p-1 rounded-full"><Trophy className="w-3 h-3 text-black" /></div>}
                          </div>
                          <p className="text-xs font-black uppercase tracking-widest text-white">YOU</p>
                      </div>
                      
                      <div className="flex flex-col items-center">
                         <div className="text-sm font-black italic text-white/5 tracking-tighter scale-150">VS</div>
                      </div>

                      <div className="text-center">
                          <img src={rival.photoURL} alt="Rival" className="w-14 h-14 rounded-full border-2 border-red-500/50 mx-auto mb-3 shadow-[0_0_20px_rgba(239,68,68,0.3)]" />
                          <p className="text-xs font-black uppercase tracking-widest text-red-500 truncate max-w-[80px]">{rival.displayName.split(' ')[0]}</p>
                      </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                      <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                             <span>Focus Hours</span>
                             <span className="text-white">{myHours}h <span className="text-white/10 mx-1">/</span> <span className="text-red-500">{rivalHours}h</span></span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden flex">
                              <div style={{ width: `${(currentProfile.totalFocusSeconds / total) * 100}%` }} className="bg-white h-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                              <div style={{ flex: 1 }} className="bg-red-600 h-full" />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center transition-transform hover:scale-105">
                             <div className="text-[8px] uppercase font-black tracking-widest text-white/20 mb-1">Streak</div>
                             <div className="text-lg font-black italic tracking-tighter text-white">{currentProfile.streak} <span className="text-white/10">vs</span> <span className="text-red-500">{rival.streak}</span></div>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center transition-transform hover:scale-105">
                             <div className="text-[8px] uppercase font-black tracking-widest text-white/20 mb-1">Sessions</div>
                             <div className="text-lg font-black italic tracking-tighter text-white">{currentProfile.pomodorosCompleted} <span className="text-white/10">vs</span> <span className="text-red-500">{rival.pomodorosCompleted}</span></div>
                          </div>
                      </div>

                      <div className="pt-4 flex items-start gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                         <MessageSquare className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                         <p className="text-[10px] text-white/60 font-serif italic leading-relaxed">
                           "{getRandomTrashTalk(isWinning, rival.displayName.split(' ')[0])}"
                         </p>
                      </div>
                  </div>
              </motion.div>
            )
        })}

        {rivalProfiles.length === 0 && !isSearching && (
           <div className="col-span-full py-20 glass-card border-dashed flex flex-col items-center justify-center gap-6 opacity-30">
              <Swords className="w-12 h-12" />
              <div className="text-center space-y-2">
                 <h3 className="text-xl font-black uppercase tracking-tighter">No Active Rivallries</h3>
                 <p className="text-sm font-serif italic">The bracket is empty. Find a challenger to push your limits.</p>
              </div>
              <button 
                 onClick={() => setIsSearching(true)}
                 className="px-8 py-3 bg-white text-black rounded-full font-black uppercase tracking-widest text-[10px]"
              >
                 Recruit Rival
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

const Plus = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
