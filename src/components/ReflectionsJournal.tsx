import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trophy,
  Zap,
  Clock,
  CheckCircle,
  Heart,
  Flame,
  ArrowRight
} from 'lucide-react';
import { JournalEntry, UserProfile } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface ReflectionsJournalProps {
  entries: JournalEntry[];
  onSaveEntry: (entry: Partial<JournalEntry>) => void;
  profile: UserProfile;
  dayCount: number;
  habits: any[];
  todayStats: {
    focusMins: number;
    sessions: number;
    habitsCompleted: number;
    habitsTotal: number;
    xpEarned: number;
    avgFocusScore: number;
  };
}

export const ReflectionsJournal: React.FC<ReflectionsJournalProps> = ({ 
  entries, 
  onSaveEntry, 
  profile, 
  dayCount, 
  habits,
  todayStats
}) => {
  const [isWriting, setIsWriting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  
  const [newEntry, setNewEntry] = useState({
    mood: '🔥' as JournalEntry['mood'],
    learned: '',
    slowdowns: '',
    intention: ''
  });

  const moods: { id: JournalEntry['mood'], emoji: string, label: string }[] = [
    { id: '🔥', emoji: '🔥', label: 'On Fire' },
    { id: '😤', emoji: '😤', label: 'Grinding' },
    { id: '😴', emoji: '😴', label: 'Tired' },
    { id: '😊', emoji: '😊', label: 'Great Day' },
    { id: '💪', emoji: '💪', label: 'Powerful' },
  ];

  const filteredEntries = entries.filter(e => {
    const matchesSearch = (e.content?.learned?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.content?.intention?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMood = moodFilter ? e.mood === moodFilter : true;
    return matchesSearch && matchesMood;
  }).sort((a, b) => b.date - a.date);

  const handleSave = () => {
    if (!newEntry.learned && !newEntry.intention) return;

    onSaveEntry({
      date: Date.now(),
      dayCount,
      mood: newEntry.mood,
      content: {
        learned: newEntry.learned,
        slowdowns: newEntry.slowdowns,
        intention: newEntry.intention
      },
      stats: {
        focusTime: todayStats.focusMins, 
        sessions: todayStats.sessions,
        habitsDone: todayStats.habitsCompleted,
        xpEarned: 30, // App.tsx will handle the actual bonus logic
        avgFocusScore: todayStats.avgFocusScore
      }
    });
    setIsWriting(false);
    setNewEntry({ mood: '🔥', learned: '', slowdowns: '', intention: '' });
  };

  const handleExport = () => {
    const originalTitle = document.title;
    document.title = "My Quantum Journey";
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-6 px-4 md:px-8 space-y-8 max-w-5xl mx-auto font-sans print:p-0 print:m-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');
        .font-journal { font-family: 'Cormorant Garamond', serif; }
        .notebook-lines {
          background-image: linear-gradient(#ffffff0a 1px, transparent 1px);
          background-size: 100% 2rem;
          line-height: 2rem;
        }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .glass-card { background: white !important; border: 1px solid #eee !important; color: black !important; }
          .text-white { color: black !important; }
          .text-white\\/40 { color: #888 !important; }
          .text-white\\/90 { color: #222 !important; }
          .text-white\\/70 { color: #444 !important; }
          .notebook-lines { background-image: linear-gradient(#0000001a 1px, transparent 1px) !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div className="space-y-1">
           <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
              <Book className="w-8 h-8 text-md-primary" />
              REFLECTIONS
           </h1>
           <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.3em]">Neural Integration Journal • Day {dayCount}</p>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={handleExport}
             className="p-3 bg-white/5 text-white/40 rounded-full hover:bg-white/10 hover:text-white transition-all group"
             title="Export Journal"
           >
              <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
           </button>
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-md-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search memories..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-md-primary/40 focus:bg-white/10 transition-all w-full md:w-64"
              />
           </div>
           <button 
             onClick={() => setIsWriting(true)}
             className="px-6 py-3 bg-md-primary text-md-on-primary rounded-full font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
           >
              <Plus className="w-4 h-4" /> New Entry
           </button>
        </div>
      </div>

      {/* Writing Mode */}
      <AnimatePresence>
        {isWriting && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 backdrop-blur-xl bg-black/80"
          >
             <div className="glass-card w-full max-w-3xl rounded-[3rem] border-white/10 overflow-hidden flex flex-col max-h-full">
                <div className="p-8 md:p-12 space-y-8 overflow-y-auto">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                         <h2 className="text-sm font-black uppercase tracking-widest text-md-primary">Entry Configuration</h2>
                         <p className="text-white/40 font-mono text-[10px]">TIMESTAMP: {format(new Date(), 'HH:mm:ss')}</p>
                      </div>
                      <div className="text-right">
                         <div className="text-2xl font-journal italic text-white/80">{format(new Date(), 'MMMM d, yyyy')}</div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Journey Day {dayCount}</div>
                      </div>
                   </div>

                   {/* Mood Selector */}
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Current State of Mind</label>
                      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                         {moods.map(mood => (
                           <button 
                             key={mood.id}
                             onClick={() => setNewEntry({ ...newEntry, mood: mood.id })}
                             className={cn(
                               "px-4 py-3 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap border",
                               newEntry.mood === mood.id 
                                ? "bg-md-primary text-md-on-primary border-md-primary shadow-lg" 
                                : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                             )}
                           >
                              <span className="text-xl">{mood.emoji}</span>
                              <span className="text-[10px] font-black uppercase tracking-widest">{mood.label}</span>
                           </button>
                         ))}
                      </div>
                   </div>

                   {/* Stats Row */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-1">
                         <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Focus Mins</span>
                         <span className="text-xl font-black text-md-primary font-mono">{todayStats.focusMins}m</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-1">
                         <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Sessions</span>
                         <span className="text-xl font-black text-md-primary font-mono">{todayStats.sessions}</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-1">
                         <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Habits</span>
                         <span className="text-xl font-black text-md-primary font-mono">{todayStats.habitsCompleted}/{todayStats.habitsTotal}</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-1">
                         <span className="text-[8px] font-black uppercase tracking-widest text-white/30">XP Gain</span>
                         <span className="text-xl font-black text-md-primary font-mono">{todayStats.xpEarned} XP</span>
                      </div>
                   </div>

                   <div className="space-y-8 font-journal text-xl">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 font-sans">What I learned today</label>
                         <textarea 
                           placeholder="Type your synthesis here..."
                           value={newEntry.learned}
                           onChange={e => setNewEntry({ ...newEntry, learned: e.target.value })}
                           className="w-full bg-transparent border-none focus:ring-0 text-white leading-relaxed resize-none h-32 notebook-lines placeholder:text-white/10"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 font-sans">What slowed me down</label>
                         <textarea 
                           placeholder="Identify the friction..."
                           value={newEntry.slowdowns}
                           onChange={e => setNewEntry({ ...newEntry, slowdowns: e.target.value })}
                           className="w-full bg-transparent border-none focus:ring-0 text-white/60 leading-relaxed resize-none h-24 notebook-lines placeholder:text-white/10 italic"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 font-sans">Tomorrow's intention</label>
                         <input 
                           type="text"
                           placeholder="The prime objective..."
                           value={newEntry.intention}
                           onChange={e => setNewEntry({ ...newEntry, intention: e.target.value })}
                           className="w-full bg-transparent border-none focus:ring-0 text-md-primary font-black uppercase tracking-widest text-lg notebook-lines placeholder:text-white/10 underline decoration-md-primary/20"
                         />
                      </div>
                   </div>
                </div>

                <div className="p-8 bg-white/5 border-t border-white/10 flex items-center justify-between">
                   <button 
                     onClick={() => setIsWriting(false)}
                     className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                   >
                      Discard Draft
                   </button>
                   <button 
                     onClick={handleSave}
                     className="px-10 py-5 bg-md-primary text-md-on-primary rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3"
                   >
                      Seal Entry <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* mood filter chips */}
      <div className="flex gap-2 pb-4 overflow-x-auto no-scrollbar">
         <button 
           onClick={() => setMoodFilter(null)}
           className={cn(
             "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
             !moodFilter ? "bg-white text-black" : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
           )}
         >
            All Moods
         </button>
         {moods.map(mood => (
           <button 
             key={mood.id}
             onClick={() => setMoodFilter(mood.id)}
             className={cn(
               "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all min-w-[3rem]",
               moodFilter === mood.id ? "bg-md-primary text-md-on-primary" : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
             )}
           >
              {mood.emoji}
           </button>
         ))}
      </div>

      {/* History timeline */}
      <div className="space-y-6">
         {filteredEntries.map((entry, idx) => (
           <motion.div 
             key={entry.id}
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: idx * 0.1 }}
             className="relative pl-12 group"
           >
              {/* Timeline Connector */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10 group-last:bottom-auto group-last:h-8" />
              <div className="absolute left-1.5 top-8 w-6 h-6 rounded-full bg-black border-2 border-white/20 flex items-center justify-center text-[10px] group-hover:border-md-primary/50 transition-colors">
                 {entry.mood}
              </div>

              <div className="glass-card p-8 md:p-10 rounded-[2.5rem] border-white/5 hover:border-white/20 transition-all space-y-6">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                       <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Day {entry.dayCount}</div>
                       <h3 className="text-xl font-journal text-white/90">{format(entry.date, 'EEEE, MMMM do')}</h3>
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-mono text-white/30 uppercase tracking-widest bg-white/5 px-6 py-2 rounded-full">
                       <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-md-primary" /> {entry.stats.focusTime}H</span>
                       <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-orange-500" /> +{entry.stats.xpEarned}XP</span>
                       <span className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-green-500" /> {entry.stats.habitsDone}H</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <p className="font-journal text-xl text-white/70 leading-relaxed italic border-l-2 border-md-primary/20 pl-6">
                       "{entry.content.learned}"
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                       <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-1">INTENTION</span>
                          <span className="text-xs font-black uppercase tracking-widest text-md-primary">{entry.content.intention}</span>
                       </div>
                    </div>
                 </div>
              </div>
           </motion.div>
         ))}

         {filteredEntries.length === 0 && (
           <div className="py-20 flex flex-col items-center justify-center gap-6 opacity-20">
              <Book className="w-16 h-16" />
              <div className="text-center">
                 <h3 className="text-xl font-black uppercase tracking-tighter text-white">The Void is Silent</h3>
                 <p className="text-sm font-serif italic italic">Start your journey by capturing your first reflection tonight.</p>
              </div>
           </div>
         )}
      </div>

      <div className="pt-20 text-center opacity-10">
         <div className="text-[10px] font-black uppercase tracking-[0.5em]">The Quantum Journey Continues</div>
      </div>
    </div>
  );
};
