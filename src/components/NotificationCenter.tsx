import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Zap, Trophy, ShieldAlert, X } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'achievement' | 'alert' | 'xp';
  time: string;
}

interface Props {
  notifications: Notification[];
  onClose: () => void;
  onClear: () => void;
}

export const NotificationCenter: React.FC<Props> = ({ notifications, onClose, onClear }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed top-24 right-6 w-full max-w-sm z-[80] glass-card rounded-[2.5rem] bg-background/95 border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[600px]"
    >
      <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-md-primary" />
          <h3 className="font-display font-black text-white italic uppercase tracking-tighter">System Feed</h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-4 h-4 text-white/50" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="py-20 text-center space-y-4">
             <Bell className="w-12 h-12 text-white/10 mx-auto" />
             <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">No active transmissions</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors group relative">
               <div className="flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    n.type === 'xp' ? "bg-md-primary/10 text-md-primary" :
                    n.type === 'achievement' ? "bg-amber-500/10 text-amber-500" :
                    n.type === 'alert' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {n.type === 'xp' ? <Zap className="w-5 h-5" /> :
                     n.type === 'achievement' ? <Trophy className="w-5 h-5" /> :
                     n.type === 'alert' ? <ShieldAlert className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-tight">{n.title}</h4>
                    <p className="text-[11px] text-white/50 mt-1 leading-tight">{n.message}</p>
                    <span className="text-[8px] font-mono text-white/20 uppercase mt-2 block">{n.time}</span>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <button 
          onClick={onClear}
          className="p-4 text-[10px] uppercase font-black tracking-widest text-white/20 hover:text-red-400 transition-colors border-t border-white/5"
        >
          Clear Memory Cache
        </button>
      )}
    </motion.div>
  );
};
