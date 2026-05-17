import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Target, Clock, TrendingUp } from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile | null;
}

export const ExamCountdown: React.FC<Props> = ({ profile }) => {
  const examDate = profile?.examDate ? new Date(profile.examDate) : new Date('2027-01-24');
  const now = new Date();
  const diffTime = Math.abs(examDate.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Projection logic
  const avgFocusPerDay = profile?.totalFocusSeconds && profile?.pomodorosCompleted 
    ? (profile.totalFocusSeconds / 3600) / (profile.pomodorosCompleted > 0 ? profile.pomodorosCompleted : 1)
    : 2; // Default 2 hours if new

  const projectedHours = diffDays * Math.max(avgFocusPerDay, 2);

  return (
    <div className="bg-neutral-950 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-md-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
             <div className="p-2 bg-md-primary/20 rounded-xl">
               <Target className="w-5 h-5 text-md-primary" />
             </div>
             <h3 className="font-display font-black text-white italic uppercase tracking-tighter text-xl">
               {profile?.examPreference || 'JEE MAINS'} 2027
             </h3>
          </div>
          
          <div className="flex items-baseline gap-2 justify-center md:justify-start">
            <span className="text-6xl font-black font-mono tracking-tighter text-white">{diffDays}</span>
            <span className="text-xl font-display italic font-black text-white/40 uppercase">Days Remaining</span>
          </div>
          
          <p className="text-sm text-white/50 italic">"Every session counts. The system remembers your grind."</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-1 hover:border-md-primary/50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3 h-3 text-md-primary" />
              <span className="text-[10px] text-white/40 uppercase font-black">Projection</span>
            </div>
            <span className="text-xl font-mono font-black text-white">~{Math.round(projectedHours)}h</span>
            <span className="text-[10px] text-white/30 uppercase font-bold">Focus Hours</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-1 hover:border-md-primary/50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3 h-3 text-md-primary" />
              <span className="text-[10px] text-white/40 uppercase font-black">Pace</span>
            </div>
            <span className="text-xl font-mono font-black text-white">{Math.round(diffDays)}</span>
            <span className="text-[10px] text-white/30 uppercase font-bold">Sessions Left</span>
          </div>
        </div>
      </div>

      <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-md-primary"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(10, 100 - (diffDays / 365) * 100)}%` }}
        />
      </div>
    </div>
  );
};
