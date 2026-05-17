import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  Tag, 
  Brain, 
  Sparkles, 
  Clock, 
  Link as LinkIcon, 
  BookOpen, 
  HelpCircle, 
  Zap, 
  ChevronRight,
  Filter,
  Download,
  Share2,
  Lock,
  MessageSquare,
  Binary
} from 'lucide-react';
import { SmartNote, Subject } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface SmartNotesProps {
  notes: SmartNote[];
  subjects: Subject[];
  onSaveNote: (note: Partial<SmartNote>) => void;
  onDeleteNote: (id: string) => void;
}

export const SmartNotes: React.FC<SmartNotesProps> = ({ notes, subjects, onSaveNote, onDeleteNote }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | 'all'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<SmartNote> | null>(null);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === 'all' || n.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    }).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, searchQuery, selectedSubject]);

  const handleCreate = () => {
    setCurrentNote({
      id: `note-${Date.now()}`,
      title: '',
      content: '',
      type: 'study',
      tags: [],
      linkedNoteIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (currentNote) {
      onSaveNote({ ...currentNote, updatedAt: Date.now() });
      setIsEditing(false);
      setCurrentNote(null);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-6 px-4 md:px-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-md-primary/10 flex items-center justify-center border border-md-primary/20">
                 <FileText className="w-5 h-5 text-md-primary" />
              </div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Smart Notes Engine</h1>
           </div>
           <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] font-mono">Linked research & cognitive capture</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           <div className="relative flex-1 md:min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search notes, subjects, atoms..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:border-md-primary/40 outline-none transition-all"
              />
           </div>
           <button 
             onClick={handleCreate}
             className="px-6 py-3 bg-md-primary text-md-on-primary rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-md-primary/20"
           >
              <Plus className="w-4 h-4" /> New Molecule
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        {/* Main Content Area */}
        <div className="space-y-6">
           {/* Subject Filter Bar */}
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setSelectedSubject('all')}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                  selectedSubject === 'all' ? "bg-white border-white text-black" : "bg-white/5 border-transparent text-white/40"
                )}
              >
                All Entities
              </button>
              {subjects.map(s => (
                <button 
                  key={s.id}
                  onClick={() => setSelectedSubject(s.name)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 flex items-center gap-2",
                    selectedSubject === s.name ? "bg-white border-white text-black" : "bg-white/5 border-transparent text-white/40"
                  )}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                </button>
              ))}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.length === 0 ? (
                <div className="col-span-full py-20 text-center glass-card border-dashed flex flex-col items-center justify-center gap-4 opacity-40">
                   <Zap className="w-10 h-10" />
                   <p className="text-[10px] uppercase font-black tracking-widest">No matching insights found</p>
                </div>
              ) : (
                filteredNotes.map(note => (
                  <motion.div 
                    key={note.id}
                    layoutId={note.id}
                    onClick={() => {
                      setCurrentNote(note);
                      setIsEditing(true);
                    }}
                    className="glass-card p-6 flex flex-col justify-between hover:border-md-primary/40 transition-all cursor-pointer group relative overflow-hidden"
                  >
                     <div className="space-y-3">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-2">
                              {note.type === 'study' && <BookOpen className="w-4 h-4 text-blue-400" />}
                              {note.type === 'insight' && <Sparkles className="w-4 h-4 text-amber-400" />}
                              {note.type === 'question' && <HelpCircle className="w-4 h-4 text-purple-400" />}
                              {note.type === 'formula' && <Binary className="w-4 h-4 text-red-400" />}
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{note.type}</span>
                           </div>
                           <span className="text-[9px] font-mono text-white/10 uppercase">{format(note.updatedAt, 'MMM dd')}</span>
                        </div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-white group-hover:text-md-primary transition-colors leading-tight">{note.title || "Untitled Insight"}</h3>
                        <p className="text-white/40 text-xs line-clamp-3 leading-relaxed">{note.content || "Breath data recorded in current temporal window..."}</p>
                     </div>

                     <div className="flex flex-wrap gap-1.5 mt-6 pt-4 border-t border-white/5">
                        {note.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-white/40">
                             #{tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && <span className="text-[8px] text-white/20 font-black">+{note.tags.length - 3} MORE</span>}
                     </div>
                  </motion.div>
                ))
              )}
           </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-8">
           <div className="glass-card p-6 space-y-6">
              <div className="flex items-center gap-2">
                 <Brain className="w-5 h-5 text-md-primary" />
                 <h3 className="text-xs font-black uppercase tracking-widest text-white">Neural Connections</h3>
              </div>
              <div className="flex flex-col gap-4">
                 <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Knowledge Surface</div>
                    <div className="text-2xl font-black italic text-white tracking-tighter">{notes.length} Atoms</div>
                 </div>
                 <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Active Sessions Link</div>
                    <div className="text-2xl font-black italic text-md-primary tracking-tighter">84% Sync</div>
                 </div>
              </div>
              <div className="p-4 bg-md-primary/5 rounded-2xl border border-md-primary/10 flex items-start gap-4">
                 <Sparkles className="w-5 h-5 text-md-primary shrink-0" />
                 <p className="text-[10px] text-md-primary/80 leading-relaxed font-bold uppercase tracking-tight italic">
                    AI detects heavy activity in "Thermodynamics". Focus sessions there have 3x more insights.
                 </p>
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex items-center gap-2 text-white/40 px-2 transition-opacity hover:opacity-100">
                 <Clock className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Recent Activity</span>
              </div>
              <div className="space-y-2">
                 {notes.slice(0, 3).map(n => (
                   <div key={n.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1 hover:bg-white/10 transition-all cursor-pointer">
                      <div className="text-[9px] font-bold text-md-primary uppercase tracking-widest">{format(n.updatedAt, 'p')}</div>
                      <div className="text-xs font-black uppercase italic text-white/80 line-clamp-1">{n.title}</div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Editor Overlay */}
      <AnimatePresence>
        {isEditing && currentNote && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsEditing(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               layoutId={currentNote.id || 'new'}
               className="relative w-full max-w-4xl h-[90vh] bg-md-surface p-10 md:p-14 rounded-[48px] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
             >
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-md-primary/10 rounded-2xl border border-md-primary/20">
                         <FileText className="w-6 h-6 text-md-primary" />
                      </div>
                      <div>
                         <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Atomic Capture</div>
                         <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Smart Engine Editor</h2>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <button className="p-3 bg-white/5 rounded-2xl text-white/40 hover:bg-white/10 transition-all"><Share2 className="w-5 h-5" /></button>
                      <button className="p-3 bg-white/5 rounded-2xl text-white/40 hover:bg-white/10 transition-all"><Download className="w-5 h-5" /></button>
                      <button onClick={() => setIsEditing(false)} className="p-2 opacity-30 hover:opacity-100 transition-opacity"><Trash2 className="w-6 h-6 rotate-45" /></button>
                   </div>
                </div>

                <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-4 scrollbar-hide">
                   <div className="space-y-4">
                      <div className="flex items-center gap-4 flex-wrap">
                         <select 
                           value={currentNote.type} 
                           onChange={e => setCurrentNote({...currentNote, type: e.target.value as any})}
                           className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-md-primary outline-none"
                         >
                            <option value="study">Study Note</option>
                            <option value="insight">Insight</option>
                            <option value="question">Question</option>
                            <option value="formula">Formula</option>
                         </select>
                         <select 
                           value={currentNote.subject} 
                           onChange={e => setCurrentNote({...currentNote, subject: e.target.value})}
                           className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 outline-none"
                         >
                            <option value="">No Subject</option>
                            {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                         </select>
                      </div>
                      <input 
                        value={currentNote.title}
                        onChange={e => setCurrentNote({...currentNote, title: e.target.value})}
                        placeholder="ATOM TITLE..."
                        className="w-full bg-transparent text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white placeholder:text-white/10 outline-none border-b-2 border-white/5 pb-4"
                      />
                   </div>

                   <textarea 
                     value={currentNote.content}
                     onChange={e => setCurrentNote({...currentNote, content: e.target.value})}
                     placeholder="Deploy neural patterns here... (Markdown supported)"
                     className="w-full flex-1 bg-transparent text-lg text-white/80 placeholder:text-white/10 outline-none resize-none font-serif leading-relaxed"
                   />

                   <div className="space-y-4 pt-10 mt-10 border-t border-white/5">
                      <div className="flex items-center gap-3">
                         <Tag className="w-4 h-4 text-white/20" />
                         <input 
                           placeholder="ADD TAGS (ENTER)..."
                           onKeyDown={e => {
                             if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                               const val = (e.target as HTMLInputElement).value;
                               if (!currentNote.tags) currentNote.tags = [];
                               if (!currentNote.tags.includes(val)) {
                                 setCurrentNote({...currentNote, tags: [...currentNote.tags, val]});
                               }
                               (e.target as HTMLInputElement).value = '';
                             }
                           }}
                           className="bg-transparent text-[10px] font-black uppercase tracking-widest text-white placeholder:text-white/20 outline-none"
                         />
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {currentNote.tags?.map(tag => (
                           <span key={tag} className="flex items-center gap-2 px-3 py-1 bg-md-primary/10 border border-md-primary/20 rounded-full text-[9px] font-black uppercase tracking-widest text-md-primary">
                              #{tag}
                              <button onClick={() => setCurrentNote({...currentNote, tags: currentNote.tags!.filter(t => t !== tag)})}>
                                 <Plus className="w-3 h-3 rotate-45" />
                              </button>
                           </span>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5 flex gap-4">
                   <button 
                     onClick={() => setIsEditing(false)}
                     className="flex-1 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all"
                   >
                     Discard Draft
                   </button>
                   <button 
                     onClick={handleSave}
                     className="flex-[2] py-5 bg-md-primary text-md-on-primary rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-md-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                   >
                     Synthesize Atom
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
