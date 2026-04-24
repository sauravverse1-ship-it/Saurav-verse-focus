import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Target, Flame, Terminal, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, category: 'study' | 'health' | 'personal', urgent: boolean, sessions: number) => void;
  defaultCategory?: 'study' | 'health' | 'personal';
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd, defaultCategory }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'study' | 'health' | 'personal'>(defaultCategory || 'study');
  const [urgent, setUrgent] = useState(false);
  const [sessions, setSessions] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, category, urgent, sessions);
    setTitle('');
    setUrgent(false);
    setSessions(1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100]"
          />
          <motion.div 
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }}
            exit={{ y: "100%", opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 max-w-lg w-full z-[101] bg-md-surface-2 md:rounded-t-[2.5rem] rounded-t-[2rem] border-t border-x border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.5)] outline outline-1 outline-white/5"
          >
            <div className="w-full flex justify-center pt-4 pb-2">
               <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>
            <div className="p-8 relative overflow-hidden">
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-md-primary-container flex items-center justify-center">
                      <Terminal className="w-5 h-5 text-md-primary" />
                    </div>
                    <h2 className="text-xl font-display uppercase tracking-widest text-white">Initialize Mission</h2>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5 opacity-40 text-white" /></button>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 ml-4 font-mono text-white">Mission Title</label>
                    <input 
                      autoFocus
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. CORE DIRECTIVE"
                      className="w-full bg-md-surface-3 border border-white/10 rounded-[1.5rem] px-6 py-4 focus:border-md-primary outline-none transition-all font-bold placeholder:opacity-20 uppercase text-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {(['study', 'health', 'personal'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={cn(
                          "py-3 rounded-2xl border transition-all text-[10px] font-bold uppercase tracking-widest",
                          category === cat ? "bg-md-primary-container text-md-on-primary-cont border-md-primary/50 shadow-lg" : "bg-md-surface-3 border-transparent hover:border-white/20 text-white opacity-40 hover:opacity-100"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setUrgent(!urgent)}
                      className={cn(
                        "flex-1 py-4 rounded-2xl border flex items-center justify-center gap-3 transition-all",
                        urgent ? "bg-red-500/20 border-red-500/40 text-red-500" : "bg-md-surface-3 border-transparent opacity-40 text-white"
                      )}
                    >
                      <Zap className={cn("w-4 h-4", urgent && "fill-red-500")} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Urgent Protocol</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-center px-4 leading-none">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 font-mono text-white">Target Cycles</label>
                        <span className="text-xl font-bold font-mono text-md-primary">{sessions}</span>
                     </div>
                     <input 
                        type="range"
                        min="1"
                        max="8"
                        value={sessions}
                        onChange={(e) => setSessions(parseInt(e.target.value))}
                        className="w-full accent-md-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                     />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-6 bg-md-primary text-md-on-primary rounded-[2.5rem] font-bold uppercase tracking-[0.5em] text-xs shadow-xl shadow-md-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                  >
                    Deploy Protocol
                  </button>
               </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
