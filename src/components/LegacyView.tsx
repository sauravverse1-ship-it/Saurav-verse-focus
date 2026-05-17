import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  History, 
  Mail, 
  BarChart3, 
  Award, 
  Map, 
  Calendar,
  Lock,
  MessageSquare,
  PenTool,
  Clock,
  Zap,
  Target,
  FileText,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { UserLegacy, LegacyMilestone, FutureLetter } from '../types';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface LegacyViewProps {
  legacy: UserLegacy;
  onWriteLetter: (content: string, openDate: number) => void;
}

export const LegacyView: React.FC<LegacyViewProps> = ({ legacy, onWriteLetter }) => {
  const [activeSection, setActiveSection] = useState<'timeline' | 'stats' | 'achievements' | 'letters'>('timeline');
  const [isWritingLetter, setIsWritingLetter] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const [openDate, setOpenDate] = useState(format(new Date(new Date().getFullYear() + 1, 0, 1), 'yyyy-MM-dd'));

  const sortedMilestones = [...legacy.milestones].sort((a, b) => b.date - a.date);

  const stats = [
    { label: 'Total Focus Time', value: `${legacy.totalFocusHours}h`, icon: Clock, color: 'text-md-primary' },
    { label: 'Total Sessions', value: legacy.totalSessions, icon: Target, color: 'text-orange-400' },
    { label: 'Tasks Mastered', value: legacy.totalTasksCompleted, icon: Zap, color: 'text-amber-400' },
    { label: 'Max Streak', value: `${legacy.longestStreak}d`, icon: Award, color: 'text-red-400' },
    { label: 'Dimensions', value: `${legacy.dimensionsUnlocked}/5`, icon: Map, color: 'text-purple-400' },
    { label: 'XP Earned', value: (legacy.totalXpEarned / 1000).toFixed(1) + 'k', icon: BarChart3, color: 'text-blue-400' }
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-6 px-4 md:px-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-md-primary/10 flex items-center justify-center border border-md-primary/20 shadow-[0_0_20px_rgba(0,255,224,0.1)]">
               <History className="w-5 h-5 text-md-primary" />
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Quantum Legacy</h1>
         </div>
         <p className="text-white/40 text-xs font-mono uppercase tracking-[0.2em]">Permanent combat records authorized by HQ</p>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
         {[
           { id: 'timeline', label: 'Timeline', icon: Calendar },
           { id: 'stats', label: 'Numbers', icon: BarChart3 },
           { id: 'achievements', label: 'Hall of Fame', icon: Trophy },
           { id: 'letters', label: 'Future Self', icon: Mail },
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveSection(tab.id as any)}
             className={cn(
               "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap border-2",
               activeSection === tab.id 
                 ? "bg-md-primary border-md-primary text-md-on-primary shadow-lg shadow-md-primary/20" 
                 : "bg-white/5 border-transparent text-white/40 hover:bg-white/10"
             )}
           >
             <tab.icon className="w-4 h-4" />
             <span className="text-[10px] uppercase font-black tracking-widest">{tab.label}</span>
           </button>
         ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-8">
        <AnimatePresence mode="wait">
          {activeSection === 'timeline' && (
            <motion.div 
              key="timeline"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="relative"
            >
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-md-primary/50 via-md-primary/10 to-transparent rounded-full" />
              
              <div className="space-y-12">
                {sortedMilestones.length === 0 ? (
                  <div className="pl-16 py-12 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                     <History className="w-12 h-12" />
                     <p className="font-mono text-center px-8">No records found. Complete elite missions to begin your legacy.</p>
                  </div>
                ) : (
                  sortedMilestones.map((m, i) => (
                    <motion.div 
                      key={m.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative pl-16 group"
                    >
                      <div className="absolute left-[29px] top-4 w-4 h-4 rounded-full bg-md-surface-2 border-2 border-md-primary shadow-[0_0_15px_rgba(0,255,224,0.5)] z-10 group-hover:scale-125 transition-transform" />
                      
                      <div className="glass-card hover:border-md-primary/30 transition-all p-6 group-hover:translate-x-2">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-black font-mono text-md-primary uppercase tracking-[0.2em]">
                            {format(m.date, 'MMM dd, yyyy')}
                          </span>
                          {m.statValue && (
                            <span className="px-3 py-1 rounded-full bg-md-primary/10 text-md-primary text-[10px] font-black uppercase ring-1 ring-md-primary/20">
                              {m.statValue}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-black italic uppercase tracking-tighter mb-1 text-white group-hover:text-md-primary transition-colors">{m.title}</h3>
                        <p className="text-white/60 text-sm leading-relaxed">{m.description}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeSection === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {stats.map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-6 flex flex-col items-center justify-center text-center gap-3 group hover:border-md-primary/40"
                >
                  <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform", stat.color)}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-3xl font-black italic tracking-tighter text-white mb-1">{stat.value}</div>
                    <div className="text-[10px] uppercase font-black tracking-widest text-white/40">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeSection === 'achievements' && (
            <motion.div 
              key="achievements"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
               {/* Achievements display here - assuming global ACHIEVEMENTS constant exists or pass it in */}
               <div className="col-span-full font-mono text-center text-white/40 border-2 border-dashed border-white/5 p-12 rounded-3xl">
                  Hall of Fame synchronization required. View Hall of Achievements in Profile for full details.
               </div>
            </motion.div>
          )}

          {activeSection === 'letters' && (
            <motion.div 
              key="letters"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
               <div className="p-8 glass-card bg-md-primary/5 border-md-primary/20 border-dashed flex flex-col items-center text-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-md-primary/10 flex items-center justify-center border border-md-primary/20">
                     <Mail className="w-8 h-8 text-md-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tight mb-2">Letter to Future Self</h3>
                    <p className="text-white/60 text-sm max-w-md mx-auto">
                      Seal a message to be opened on your most critical day — Exam Result Day. 
                      Stored in zero-knowledge encrypted vaults until the timeline reaches its destination.
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsWritingLetter(true)}
                    className="px-8 py-3 bg-md-primary text-md-on-primary rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-md-primary/20"
                  >
                    Forge New Letter
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {legacy.futureLetters.map(letter => (
                    <div key={letter.id} className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <PenTool className="w-12 h-12" />
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                            <Lock className="w-5 h-5" />
                         </div>
                         <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Sealed On</div>
                            <div className="text-sm font-bold text-white">{format(letter.createdAt, 'PP')}</div>
                         </div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Unlocks On</div>
                        <div className="text-lg font-black text-md-primary italic uppercase tracking-tighter">{format(letter.openDate, 'PP')}</div>
                      </div>
                      <button 
                        disabled={!letter.isOpened && letter.openDate > Date.now()}
                        className={cn(
                          "w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] border-2 transition-all",
                          letter.isOpened || letter.openDate <= Date.now() 
                            ? "bg-md-primary border-md-primary text-md-on-primary" 
                            : "bg-white/5 border-transparent text-white/20 cursor-not-allowed"
                        )}
                      >
                         {letter.isOpened || letter.openDate <= Date.now() ? "Open Vault" : "Temporal Lock Active"}
                      </button>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Letter Writing Modal */}
      <AnimatePresence>
        {isWritingLetter && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWritingLetter(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-md-surface p-8 rounded-[40px] border border-white/10 shadow-2xl flex flex-col gap-6"
            >
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <PenTool className="w-6 h-6 text-md-primary" />
                     <h2 className="text-2xl font-black italic uppercase tracking-tighter">Forge Legacy Letter</h2>
                  </div>
                  <button onClick={() => setIsWritingLetter(false)} className="p-2 opacity-50 hover:opacity-100">
                    <History className="w-5 h-5 rotate-45" />
                  </button>
               </div>

               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Message for the Future</label>
                     <textarea 
                        value={letterContent}
                        onChange={(e) => setLetterContent(e.target.value)}
                        placeholder="Write something that your future self will need to hear after the final battle..."
                        className="w-full h-48 bg-white/5 border-2 border-white/5 focus:border-md-primary/50 rounded-3xl p-6 text-white placeholder:text-white/20 outline-none transition-all resize-none font-mono text-sm leading-relaxed"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Target Opening Date (e.g., Result Day)</label>
                     <input 
                        type="date"
                        value={openDate}
                        onChange={(e) => setOpenDate(e.target.value)}
                        className="w-full bg-white/5 border-2 border-white/5 focus:border-md-primary/50 rounded-2xl p-4 text-white outline-none transition-all font-mono"
                     />
                  </div>
               </div>

               <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => setIsWritingLetter(false)}
                    className="flex-1 py-4 px-6 rounded-3xl font-black uppercase tracking-widest text-[10px] border-2 border-white/5 hover:bg-white/5 transition-all"
                  >
                    Discard Draft
                  </button>
                  <button 
                    onClick={() => {
                      if (!letterContent.trim()) return;
                      onWriteLetter(letterContent, new Date(openDate).getTime());
                      setIsWritingLetter(false);
                      setLetterContent('');
                    }}
                    className="flex-[2] py-4 px-6 rounded-3xl bg-md-primary text-md-on-primary font-black uppercase tracking-widest text-[10px] shadow-lg shadow-md-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Seal Letter
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Export Button */}
      <button className="fixed bottom-[calc(90px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 md:bottom-12 md:left-auto md:right-12 px-8 h-14 bg-white text-black rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all z-20">
         <FileText className="w-5 h-5" />
         Export Legacy PDF
      </button>
    </div>
  );
};
