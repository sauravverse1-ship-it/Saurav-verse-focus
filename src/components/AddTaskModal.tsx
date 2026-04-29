import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Target, Flame, Terminal, Clock, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, category: 'study' | 'health' | 'personal', urgent: boolean, sessions: number, subject?: string | string[], isRevision?: boolean) => void;
  defaultCategory?: 'study' | 'health' | 'personal';
  defaultIsRevision?: boolean;
  subjects?: {id: string, name: string, color: string}[];
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd, defaultCategory, defaultIsRevision = false, subjects = [] }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'study' | 'health' | 'personal'>(defaultCategory || 'study');
  const [urgent, setUrgent] = useState(false);
  const [sessions, setSessions] = useState(1);
  const [isRevision, setIsRevision] = useState(defaultIsRevision);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setTitle('');
      setCategory(defaultCategory || 'study');
      setUrgent(false);
      setSessions(1);
      setIsRevision(defaultIsRevision);
      setSelectedSubjects([]);
    }
  }, [isOpen, defaultIsRevision, defaultCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, category, urgent, sessions, selectedSubjects.length > 0 ? selectedSubjects : undefined, isRevision);
    setTitle('');
    setUrgent(false);
    setSessions(1);
    setIsRevision(false);
    setSelectedSubjects([]);
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
            onDragEnd={(info: any) => {
              if (info.offset.y > 100) onClose();
            }}
            className="fixed bottom-0 left-0 right-0 md:top-auto md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:max-w-lg md:w-full z-[1000] bg-black/40 backdrop-blur-3xl md:rounded-[2.5rem] rounded-t-[2rem] md:border border-white/10 shadow-[0_32px_120px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="flex flex-col max-h-[85vh]">
            <div className="w-full flex justify-center pt-5 pb-2 shrink-0">
               <div className="w-12 h-1.5 bg-white/30 rounded-full" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                      <Terminal className="w-6 h-6 text-md-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-display uppercase tracking-widest text-white leading-tight">Initialize Mission</h2>
                      <p className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em]">Android 17 Core Engine</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-90"><X className="w-5 h-5 text-white/60" /></button>
               </div>

               <form id="add-task-form" onSubmit={handleSubmit} className="space-y-8">
                  <div className="relative group">
                    <input 
                      autoFocus
                      required
                      value={title}
                      id="mission-title"
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder=" "
                      className="peer w-full bg-white/5 border border-white/10 rounded-3xl px-6 pb-4 pt-8 focus:border-md-primary/50 focus:bg-white/10 outline-none transition-all text-white placeholder-transparent text-lg font-medium shadow-inner"
                    />
                    <label htmlFor="mission-title" className="absolute left-6 top-5 text-sm text-white/40 transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-lg peer-focus:top-3 peer-focus:text-xs peer-focus:text-md-primary font-bold uppercase tracking-widest">Mission Title</label>
                    <div className="absolute inset-0 rounded-3xl border border-md-primary/0 peer-focus:border-md-primary/20 pointer-events-none transition-all" />
                  </div>

                  {subjects.length > 0 && (
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2">Sector Allocation</label>
                       <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide px-1">
                         <button
                           type="button"
                           onClick={() => setSelectedSubjects([])}
                           className={cn(
                             "shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all",
                             selectedSubjects.length === 0 ? "bg-white/20 border-white/30 text-white shadow-xl" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                           )}
                         >
                           Universal
                         </button>
                         {subjects.map(sub => {
                           const isSelected = selectedSubjects.includes(sub.id);
                           return (
                             <button
                               key={sub.id}
                               type="button"
                               onClick={() => setSelectedSubjects(prev => 
                                 isSelected ? prev.filter(id => id !== sub.id) : [...prev, sub.id]
                               )}
                               style={{ 
                                 backgroundColor: isSelected ? `${sub.color}44` : 'rgba(255,255,255,0.03)',
                                 borderColor: isSelected ? sub.color : 'rgba(255,255,255,0.05)',
                                 color: isSelected ? '#fff' : 'rgba(255,255,255,0.4)',
                                 boxShadow: isSelected ? `0 10px 20px -5px ${sub.color}66` : 'none'
                               }}
                               className={cn(
                                 "shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95",
                                 !isSelected && "hover:bg-white/10"
                               )}
                             >
                               {sub.name}
                             </button>
                           );
                         })}
                       </div>
                    </div>
                  )}

                  <div className="flex bg-white/5 rounded-[2rem] border border-white/5 p-1 shadow-inner overflow-hidden">
                    {(['study', 'health', 'personal'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={cn(
                          "flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden",
                          category === cat ? "text-white" : "text-white/30 hover:bg-white/5"
                        )}
                      >
                        {category === cat && (
                          <motion.div 
                            layoutId="cat-active-bg"
                            className="absolute inset-0 bg-white/10 shadow-xl"
                          />
                        )}
                        <span className="relative z-10">{cat}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setUrgent(!urgent)}
                      className={cn(
                        "flex-1 h-14 rounded-3xl border flex items-center justify-center gap-3 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-inner",
                        urgent ? "bg-red-500/10 border-red-500/40 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]" : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10"
                      )}
                    >
                      <Zap className={cn("w-5 h-5", urgent && "fill-red-500")} />
                      <span>Priority Alpha</span>
                    </button>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] space-y-6">
                     <div className="flex justify-between items-center leading-none">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Target Intensity</label>
                        <span className="text-2xl font-black italic text-md-primary">{sessions} <span className="text-[10px] not-italic opacity-40">SLOTS</span></span>
                     </div>
                     <div className="relative pt-6">
                       <input 
                          type="range"
                          min="1"
                          max="8"
                          step="1"
                          value={sessions}
                          onChange={(e) => setSessions(parseInt(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-md-primary"
                       />
                       <div className="flex justify-between w-full px-1 mt-4">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                            <div key={n} className={cn("w-1 h-1 rounded-full transition-all", n <= sessions ? "bg-md-primary shadow-[0_0_8px_var(--md-primary)]" : "bg-white/10")} />
                          ))}
                       </div>
                     </div>
                  </div>
               </form>
            </div>
            
            <div className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] border-t border-white/5 bg-transparent shrink-0">
               <button 
                 type="submit"
                 form="add-task-form"
                 className="w-full py-5 bg-md-primary rounded-[2rem] text-md-on-primary font-black uppercase tracking-[0.3em] text-xs hover:bg-md-primary/90 active:scale-95 transition-all shadow-2xl shadow-md-primary/30 border border-white/10"
               >
                 Deploy Protocol
               </button>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
