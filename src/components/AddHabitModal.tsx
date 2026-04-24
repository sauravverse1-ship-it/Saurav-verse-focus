import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, icon: string) => void;
}

const HABIT_ICONS = ['BookOpen', 'Heart', 'Code', 'Dumbbell', 'Droplets', 'Wind', 'Coffee', 'Music', 'Sun', 'Moon'];

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose, onAdd }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('BookOpen');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, icon);
    setTitle('');
    setIcon('BookOpen');
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
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-amber-500" />
                    </div>
                    <h2 className="text-xl font-display uppercase tracking-widest text-white">{t('add_habit')}</h2>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5 opacity-40 text-white" /></button>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 ml-4 font-mono text-white">Habit Title</label>
                    <input 
                      autoFocus
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. READ 10 PAGES"
                      className="w-full bg-md-surface-3 border border-white/10 rounded-[1.5rem] px-6 py-4 focus:border-amber-500 outline-none transition-all font-bold placeholder:opacity-20 uppercase text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 ml-4 font-mono text-white">Icon</label>
                    <div className="grid grid-cols-5 gap-2">
                      {HABIT_ICONS.map(i => (
                         <button
                           type="button"
                           key={i}
                           onClick={() => setIcon(i)}
                           className={cn(
                             "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all text-sm font-bold",
                             icon === i ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20" : "bg-md-surface-3 border-transparent hover:border-white/20 text-white opacity-40 hover:opacity-100"
                           )}
                         >
                           {i.slice(0, 2).toUpperCase()}
                         </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-6 bg-amber-500 text-white rounded-[2.5rem] font-bold uppercase tracking-[0.5em] text-xs shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                  >
                    Build Protocol
                  </button>
               </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
