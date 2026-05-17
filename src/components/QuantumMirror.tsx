import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, X, Trophy, Zap, Clock, Calendar, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile, SessionLog } from '../types';
import { format } from 'date-fns';

interface QuantumMirrorProps {
  profile: UserProfile;
  sessions: SessionLog[];
  onClose: () => void;
}

export const QuantumMirror: React.FC<QuantumMirrorProps> = ({ profile, sessions, onClose }) => {
  const totalFocus = sessions.reduce((acc, s) => acc + s.duration, 0);
  const avgFocus = sessions.length > 0 ? totalFocus / sessions.length : 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, rotateY: 10 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        className="w-full max-w-lg aspect-[9/16] md:max-w-md bg-gradient-to-br from-[#0c0d12] to-[#1a1c25] rounded-[3rem] p-8 border-4 border-white/10 relative overflow-hidden flex flex-col items-center justify-between shadow-[0_0_100px_rgba(123,95,232,0.3)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,var(--md-primary),transparent_60%)]" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 translate-x-1/4 translate-y-1/4 bg-[radial-gradient(circle_at_center,var(--md-secondary),transparent_60%)]" />
        </div>

        <div className="w-full space-y-8 relative z-10">
           <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full border-4 border-md-primary p-1">
                 <img src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`} className="w-full h-full rounded-full object-cover" alt="User" />
              </div>
              <div className="text-center">
                 <h2 className="text-3xl font-display font-black text-white italic tracking-tighter uppercase leading-tight">Quantum Mirror</h2>
                 <p className="text-[10px] font-black uppercase text-md-primary tracking-[0.4em] mt-1">Reflecting Excellence v2.3</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex flex-col items-center gap-2">
                 <Zap className="w-6 h-6 text-yellow-400" />
                 <span className="text-2xl font-black text-white">{profile.level}</span>
                 <span className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none">Rank Attained</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex flex-col items-center gap-2">
                 <Clock className="w-6 h-6 text-blue-400" />
                 <span className="text-2xl font-black text-white">{Math.floor(totalFocus / 3600)}h</span>
                 <span className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none">Focus Exported</span>
              </div>
           </div>

           <div className="space-y-4">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Focus Frequency</p>
              <div className="flex gap-1 justify-center h-20 items-end">
                 {[40, 70, 45, 90, 65, 80, 50, 95, 30, 85].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05 }}
                      className="w-4 bg-gradient-to-t from-md-primary to-md-secondary rounded-full"
                    />
                 ))}
              </div>
           </div>

           <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] text-center">
              <p className="text-[10px] font-black italic text-white/60 mb-2">"The only way to win is to never stop grinding. You are currently in the Top 2% of Global Focus Hunters."</p>
              <div className="flex items-center justify-center gap-2">
                 <Sparkles className="w-3 h-3 text-md-primary" />
                 <span className="text-[8px] font-black text-md-primary uppercase tracking-widest">AI Certified Performance</span>
              </div>
           </div>
        </div>

        <div className="w-full space-y-4 relative z-10">
           <button className="w-full py-5 bg-white text-black rounded-full font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-105 transition-transform active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.2)]">
              <Share2 className="w-5 h-5" /> Export Mirror Image
           </button>
           <button onClick={onClose} className="w-full py-4 text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em]">
              Close Observation
           </button>
        </div>

        {/* QR Code Simulation */}
        <div className="absolute top-8 right-8 w-12 h-12 bg-white p-1 rounded-lg opacity-20">
           <div className="w-full h-full bg-black" />
        </div>
      </motion.div>
    </motion.div>
  );
};
