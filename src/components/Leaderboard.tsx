import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Crown, Zap, Flame, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface Props {
  profile: UserProfile | null;
  onChallenge?: (userId: string) => void;
}

export const Leaderboard: React.FC<Props> = ({ profile, onChallenge }) => {
  const [topPlayers, setTopPlayers] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (!profile) return;
    const fetchLeaderboard = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('xp', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const players: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          players.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });
        setTopPlayers(players);
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, 'users');
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-2xl">
            <Trophy className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter">Competitive Arena</h2>
            <p className="text-[10px] text-amber-500/50 uppercase font-black tracking-widest">Global Ranking</p>
          </div>
        </div>
        <div className="flex -space-x-2">
          {topPlayers.slice(0, 3).map((p, i) => (
            <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-surface flex items-center justify-center text-xl shadow-lg overflow-hidden">
              <img src={p.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.uid}`} alt={p.displayName} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-neutral-950 border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/5 grid grid-cols-[60px_1fr_100px_100px] text-[10px] font-black uppercase tracking-widest text-white/40">
          <span className="text-center">Pos</span>
          <span>Initiate</span>
          <span className="text-center">Challenge</span>
          <span className="text-right">Quantum XP</span>
        </div>
        
        <div className="divide-y divide-white/5">
          {topPlayers.map((player, i) => (
            <motion.div 
              key={player.uid}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "p-6 grid grid-cols-[60px_1fr_100px_100px] items-center transition-colors hover:bg-white/5",
                player.uid === profile?.uid ? "bg-md-primary/5" : ""
              )}
            >
              <div className="flex justify-center">
                {i === 0 ? <Crown className="w-6 h-6 text-amber-400" /> : 
                 i === 1 ? <Medal className="w-6 h-6 text-gray-400" /> :
                 i === 2 ? <Medal className="w-6 h-6 text-amber-600" /> :
                 <span className="font-mono font-black text-white/20 text-xl">#{i + 1}</span>}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-2xl border border-white/10 overflow-hidden">
                  <img src={player.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.uid}`} alt={player.displayName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white tracking-tight">
                       {player.displayName || 'Unknown'} 
                       {player.prestigeLevel ? <span className="text-amber-400 text-xs ml-1">♦{player.prestigeLevel}</span> : null}
                    </span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-white/10 text-white/60">{player.rank || 'Initiate'}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span className="text-[10px] font-mono font-bold text-orange-500">{player.streak || 0}D</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                 {player.uid !== profile?.uid && onChallenge && (!profile?.rivalIds?.includes(player.uid)) && (
                    <button 
                       onClick={() => onChallenge(player.uid)}
                       className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
                    >
                       Rival
                    </button>
                 )}
                 {profile?.rivalIds?.includes(player.uid) && (
                    <span className="text-[10px] font-black text-red-500 opacity-50 uppercase tracking-widest">Rivaled</span>
                 )}
              </div>

              <div className="text-right">
                <span className="text-xl font-mono font-black text-white tracking-tighter">
                  {(player.xp || 0).toLocaleString()}
                </span>
                <p className="text-[10px] text-white/30 uppercase font-bold">XP Points</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {profile && (
        <div className="bg-md-primary/10 border border-md-primary/30 p-6 rounded-[2rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-md-primary/20 flex items-center justify-center text-2xl border border-md-primary/30">
               👤
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-md-primary tracking-widest">Your Position</span>
              <h4 className="text-white font-bold tracking-tight">Current Standing</h4>
            </div>
          </div>
          <div className="text-right">
             <span className="text-xl font-mono font-black text-md-primary">{profile.xp || 0}</span>
             <p className="text-[10px] text-white/30 uppercase font-black">Total XP</p>
          </div>
        </div>
      )}
    </div>
  );
};
