import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Users, 
  Swords, 
  Eye, 
  Trash2, 
  CheckCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Zap,
  Globe,
  Settings
} from 'lucide-react';
import { BroadcastSession, UserProfile } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface FocusStreamProps {
  activeSessions: BroadcastSession[];
  onStartBroadcast: (subject: string) => void;
  onJoinSession: (sessionId: string) => void;
  currentProfile: UserProfile;
}

export const FocusStream: React.FC<FocusStreamProps> = ({ activeSessions, onStartBroadcast, onJoinSession, currentProfile }) => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');

  const mySession = activeSessions.find(s => s.userId === currentProfile.uid);

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-6 px-4 md:px-8 space-y-10 max-w-7xl mx-auto">
      {/* Broadcast Control Hero */}
      <div className="relative glass-card bg-gradient-to-br from-md-primary/10 via-black to-black p-10 md:p-14 rounded-[3rem] border border-md-primary/20 overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <Radio className="w-96 h-96" />
         </div>
         
         <div className="relative z-10 space-y-8 max-w-2xl">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="px-4 py-1.5 rounded-full bg-md-primary text-md-on-primary text-[10px] font-black uppercase tracking-widest animate-pulse shadow-[0_0_20px_rgba(var(--md-primary-rgb),0.5)]">
                     Live Engine
                  </div>
                  <span className="text-white/40 text-[10px] font-mono uppercase tracking-[0.2em]">{activeSessions.length} Streams Active</span>
               </div>
               <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.9]">QUANTUM BROADCAST</h1>
               <p className="text-white/60 text-lg md:text-xl font-serif italic leading-relaxed">
                 Focus with the world. Go live with your session and join a global network of relentless students.
               </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
               {mySession ? (
                 <button className="px-10 py-5 bg-red-600 text-white rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl">
                    End Broadcast
                 </button>
               ) : (
                 <div className="flex gap-2 w-full md:w-auto">
                   <select 
                     value={selectedSubject} 
                     onChange={e => setSelectedSubject(e.target.value)}
                     className="bg-white text-black px-6 py-5 rounded-full font-black uppercase tracking-widest text-xs outline-none appearance-none cursor-pointer"
                   >
                      <option value="">Select Topic</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Math">Math</option>
                   </select>
                   <button 
                     onClick={() => onStartBroadcast(selectedSubject)}
                     disabled={!selectedSubject}
                     className="px-10 py-5 bg-md-primary text-md-on-primary rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50"
                   >
                      Go Live
                   </button>
                 </div>
               )}
               <button className="px-10 py-5 bg-white/5 text-white rounded-full font-black uppercase tracking-widest text-xs border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Global Feed
               </button>
            </div>
         </div>
      </div>

      {/* active Sessions Grid */}
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3 text-white">
               <Radio className="w-6 h-6 text-md-primary" />
               Live Focus Signals
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest">
               <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
               Real-time Sync
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSessions.map(session => (
              <motion.div 
                key={session.id}
                layout
                className="glass-card p-8 rounded-[2.5rem] border-white/10 hover:border-md-primary/40 transition-all group overflow-hidden relative"
              >
                 <div className="absolute top-0 right-0 px-6 py-4">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-red-600/10 text-red-500 rounded-full text-[8px] font-black uppercase tracking-widest">
                       <span className="w-1 h-1 rounded-full bg-red-600 animate-pulse" />
                       LIVE
                    </div>
                 </div>

                 <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                       <div className="relative">
                          <img 
                            src={session.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.userId}`} 
                            className="w-12 h-12 rounded-full border-2 border-white/10"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-md-primary p-1 rounded-full border-2 border-black">
                             <Zap className="w-2 h-2 text-md-on-primary" />
                          </div>
                       </div>
                       <div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-white group-hover:text-md-primary transition-colors">{session.displayName}</h3>
                          <p className="text-[10px] text-white/40 font-mono italic uppercase tracking-tight">{session.personaName || 'Relentless Scholar'}</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <div className="space-y-1">
                             <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Active Focus</div>
                             <div className="text-xl font-black italic tracking-tighter text-white">{session.subject}</div>
                          </div>
                          <div className="text-right">
                             <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Elapsed</div>
                             <div className="text-xl font-black italic tracking-tighter text-md-primary">
                                {Math.floor(session.timeLeftSeconds / 60)}:{(session.timeLeftSeconds % 60).toString().padStart(2, '0')}
                             </div>
                          </div>
                       </div>

                       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-md-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${(1 - session.timeLeftSeconds / (session.durationMins * 60)) * 100}%` }}
                          />
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                       <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-white/40 uppercase">
                             <Users className="w-3 h-3" /> {session.viewerCount}
                          </div>
                       </div>
                       <button 
                         onClick={() => onJoinSession(session.id)}
                         className="px-6 py-2 bg-white/5 text-white/60 hover:bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:border-white transition-all"
                       >
                          Join Study
                       </button>
                    </div>
                 </div>
              </motion.div>
            ))}

            {activeSessions.length === 0 && (
               <div className="col-span-full py-20 glass-card border-dashed flex flex-col items-center justify-center gap-6 opacity-30 text-center">
                  <Globe className="w-12 h-12" />
                  <div className="space-y-2">
                     <h3 className="text-xl font-black uppercase tracking-tighter text-white">Quiet World</h3>
                     <p className="text-sm font-serif italic max-w-xs">No active broadcasts detected. Launch yours to awaken the network.</p>
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* Spectator Insights */}
      <div className="p-10 glass-card border-dashed border-md-primary/20 bg-md-primary/5 rounded-[3rem] grid grid-cols-1 md:grid-cols-3 gap-10">
         <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-md-primary/10 w-fit">
               <Zap className="w-6 h-6 text-md-primary" />
            </div>
            <h4 className="text-lg font-black italic uppercase tracking-tight text-white leading-tight">Neural Synchronization</h4>
            <p className="text-xs text-white/40 leading-relaxed">Join a live session to sync your timer with a partner. Shared focus creates a 2.3x increase in deep work endurance.</p>
         </div>
         <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-blue-500/10 w-fit">
               <Eye className="w-6 h-6 text-blue-500" />
            </div>
            <h4 className="text-lg font-black italic uppercase tracking-tight text-white leading-tight">Silent Spectating</h4>
            <p className="text-xs text-white/40 leading-relaxed">Broadcasts are distraction-free. No video, no chat during sessions. Just pure data signals from fellow scholars.</p>
         </div>
         <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-amber-500/10 w-fit">
               <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <h4 className="text-lg font-black italic uppercase tracking-tight text-white leading-tight">Broadcaster Rewards</h4>
            <p className="text-xs text-white/40 leading-relaxed">Earn +100 XP per broadcast session and unlock the "Vanguard" badge by hosting consecutive focus marathons.</p>
         </div>
      </div>
    </div>
  );
};

const Trophy = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
    <path d="M4 22h16"></path>
    <path d="M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34"></path>
    <path d="M12 2v10"></path>
    <circle cx="12" cy="7" r="5"></circle>
  </svg>
);
