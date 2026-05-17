import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dream } from '../types';
import { 
  Sparkles, 
  Target, 
  Map, 
  Calendar, 
  ChevronRight, 
  Flame, 
  TrendingUp,
  Image as ImageIcon,
  PenTool
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface DreamBoardProps {
  dream: Dream | null;
  onSaveDream?: (dream: Partial<Dream>) => void;
  dayCount: number;
}

export const DreamBoard: React.FC<DreamBoardProps> = ({ dream, onSaveDream, dayCount }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(dream?.text || '');
  const [mantra, setMantra] = useState(dream?.mantra || '');
  const [targetDate, setTargetDate] = useState(dream?.targetDate || format(new Date(), 'yyyy-MM-dd'));

  const handleSave = () => {
    if (text && mantra && onSaveDream) {
      onSaveDream({ 
        text, 
        mantra, 
        targetDate,
        createdAt: Date.now() 
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="relative group">
      {/* Background Aurora Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-md-primary to-blue-600 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-1000 animate-pulse" />
      
      <motion.div 
        layout
        className="relative glass-card p-10 md:p-14 rounded-[3rem] border border-white/10 overflow-hidden bg-black/40 backdrop-blur-3xl"
      >
        <AnimatePresence mode="wait">
          {!dream || isEditing ? (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                 <p className="text-white/40 text-xs font-serif italic">What drives your focus? Define the final destination.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4">The Ultimate Dream</label>
                  <textarea 
                    value={text} 
                    onChange={e => setText(e.target.value)} 
                    placeholder="I want to crack JEE Advanced 2027 and get into IIT Bombay CSE... for my family."
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white text-xl md:text-2xl font-serif italic placeholder:text-white/10 min-h-[160px] outline-none focus:border-md-primary/40 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4">Current Mantra</label>
                    <input 
                      value={mantra} 
                      onChange={e => setMantra(e.target.value)} 
                      placeholder="One sentence that snaps you into focus..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-white/10 outline-none focus:border-md-primary/40 transition-all font-mono text-sm uppercase tracking-widest"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-4">Target Date (Encounter Day)</label>
                    <input 
                      type="date"
                      value={targetDate} 
                      onChange={e => setTargetDate(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-md-primary/40 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <button 
                  onClick={handleSave} 
                  className="flex-[2] py-5 bg-md-primary text-md-on-primary rounded-[2rem] font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-md-primary/20"
                >
                   Seal Your Dream
                </button>
                {dream && (
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="flex-1 py-5 bg-white/5 text-white/40 rounded-[2rem] font-black uppercase tracking-widest text-xs border border-white/5 hover:bg-white/10 transition-all"
                  >
                    Discard Changes
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="display"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative min-h-[400px] flex flex-col justify-between"
            >
               {/* Decorative elements */}
               <div className="absolute -top-10 -right-10 w-64 h-64 bg-md-primary/10 blur-[100px] rounded-full" />
               <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full" />

               <div className="space-y-12">
                  <div className="flex justify-between items-start">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <Sparkles className="w-4 h-4 text-amber-400" />
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">The Final Objective</span>
                        </div>
                        <p className="text-3xl md:text-5xl font-serif italic text-white leading-[1.1] max-w-4xl tracking-tight drop-shadow-2xl">
                          "{dream.text}"
                        </p>
                     </div>
                     <button 
                        onClick={() => setIsEditing(true)}
                        className="p-4 bg-white/5 border border-white/10 rounded-3xl text-white/20 hover:text-white transition-colors group"
                     >
                        <PenTool className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                     </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                     <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-1">Active Mantra</span>
                        <span className="text-md-primary font-mono text-xs font-black uppercase tracking-[0.2em]">{dream.mantra}</span>
                     </div>
                     <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                           <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-white/10 overflow-hidden">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=friend${i}`} alt="supporter" />
                           </div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-2 border-black bg-white/5 flex items-center justify-center text-[8px] font-bold text-white/40">
                           +12
                        </div>
                     </div>
                  </div>
               </div>

               <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                        <Flame className="w-4 h-4 text-orange-500" /> 
                        <span>Timeline Progress</span>
                     </div>
                     <div className="text-2xl font-black italic tracking-tighter text-white">Day {dayCount} <span className="text-white/20">toward this goal</span></div>
                  </div>

                  <div className="space-y-3 col-span-2">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-white/20">Cognitive Capacity Acquired</span>
                        <span className="text-md-primary">740h / 1000h</span>
                     </div>
                     <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-md-primary to-blue-400 shadow-[0_0_15px_rgba(0,255,224,0.5)]"
                          initial={{ width: 0 }}
                          animate={{ width: '74%' }}
                        />
                     </div>
                     <div className="flex justify-between text-[8px] font-mono font-black text-white/20 uppercase tracking-widest">
                        <span>Initiated {format(dream.createdAt, 'MMM yyyy')}</span>
                        <span>Estimated Arrival: {format(new Date(dream.targetDate), 'PP')}</span>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
