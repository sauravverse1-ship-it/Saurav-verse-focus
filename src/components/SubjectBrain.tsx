import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Brain, Rocket, FlaskConical, Hash, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

const SYLLABUS = {
  physics: [
    "Units and Dimensions", "Kinematics", "Laws of Motion", "Work Power Energy",
    "Rotational Motion", "Gravitation", "Thermodynamics", "Electromagnetism",
    "Optics", "Modern Physics"
  ],
  chemistry: [
    "Atomic Structure", "Chemical Bonding", "Equilibrium", "Organic Chemistry",
    "Coordination Compounds", "Electrochemistry", "Polymers"
  ],
  math: [
    "Calculus", "Coordinate Geometry", "Algebra", "Trigonometry", 
    "Matrices and Determinants", "Probability", "Vectors"
  ]
};

interface SubjectBrainProps {
  profile: UserProfile;
  onUpdateChapter: (subject: string, chapter: string, isCompleted: boolean) => void;
}

export const SubjectBrain: React.FC<SubjectBrainProps> = ({ profile, onUpdateChapter }) => {
  const isJee = profile.examPreference === 'JEE';

  const getStats = (subject: string) => {
    const list = SYLLABUS[subject as keyof typeof SYLLABUS];
    const completedList = profile.jee?.completedChapters || [];
    const completed = list.filter(ch => completedList.includes(`${subject}:${ch}`)).length;
    const total = list.length;
    const percent = Math.round((completed / total) * 100);
    return { completed, total, percent };
  };

  const isCompleted = (subject: string, chapter: string) => {
    return profile.jee?.completedChapters?.includes(`${subject}:${chapter}`);
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase">Knowledge Neural Network</h2>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Mastery Tracking System v2.1</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'physics', label: 'Physics', icon: <Rocket />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { id: 'chemistry', label: 'Chemistry', icon: <FlaskConical />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { id: 'math', label: 'Mathematics', icon: <Hash />, color: 'text-amber-400', bg: 'bg-amber-500/10' }
        ].map(sub => {
          const stats = getStats(sub.id);
          return (
            <div key={sub.id} className="p-8 bg-white/5 border border-white/10 rounded-[3rem] hover:border-white/20 transition-all group">
              <div className="flex items-center gap-4 mb-6">
                 <div className={cn("p-4 rounded-2xl", sub.bg, sub.color)}>
                    {sub.icon}
                 </div>
                 <div>
                    <h3 className="font-display font-black text-2xl uppercase italic text-white">{sub.label}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{stats.percent}% COMPLETE</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.percent}%` }}
                      className={cn("h-full", sub.bg.replace('10', '100'))}
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2 pt-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-2xl font-display font-black text-white">{stats.completed}</p>
                       <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Mastered</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                       <p className="text-2xl font-display font-black text-white">{stats.total - stats.completed}</p>
                       <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Remaining</p>
                    </div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-white/5 border border-white/10 rounded-[3.5rem] p-10">
         <div className="flex items-center gap-4 mb-8">
            <Brain className="w-6 h-6 text-md-primary" />
            <h3 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter">Syllabus Breakdown</h3>
         </div>
         
         <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {Object.entries(SYLLABUS).map(([sub, chapters]) => (
              <div key={sub} className="break-inside-avoid">
                 <h4 className="text-xs font-black uppercase tracking-widest text-md-primary mb-4 border-b border-white/10 pb-2">{sub}</h4>
                 <div className="space-y-2">
                    {chapters.map((ch, i) => {
                      const completed = isCompleted(sub, ch);
                      return (
                        <div 
                          key={i} 
                          onClick={() => onUpdateChapter(sub, ch, !completed)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group",
                            completed ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/[0.02] border-transparent hover:bg-white/5 hover:border-white/10"
                          )}
                        >
                           <span className={cn(
                             "text-sm group-hover:text-white transition-colors",
                             completed ? "text-emerald-400 font-bold" : "text-white/60"
                           )}>{ch}</span>
                           <CheckCircle2 className={cn(
                             "w-4 h-4 transition-colors",
                             completed ? "text-emerald-500" : "text-white/10 group-hover:text-blue-500"
                           )} />
                        </div>
                      );
                    })}
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};
