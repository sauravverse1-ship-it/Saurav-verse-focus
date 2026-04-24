import React from 'react';
import { motion } from 'motion/react';
import { Habit } from '../types';
import { format, eachDayOfInterval, subDays, isSameDay, startOfWeek, endOfWeek, subMonths } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { Flame, Trophy, Calendar } from 'lucide-react';

interface HeatMapProps {
  completedDates: string[];
}

export const HabitHeatMap = ({ completedDates }: HeatMapProps) => {
  const today = new Date();
  const startDate = subMonths(today, 2); // Show 2 months
  const days = eachDayOfInterval({ start: startDate, end: today });
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Activity Map
        </span>
      </div>
      <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {days.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isDone = completedDates.includes(dateStr);
          const isToday = isSameDay(day, today);
          
          return (
            <motion.div
              key={dateStr}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.005 }}
              className={cn(
                "w-3 h-3 rounded-sm transition-colors",
                isDone ? "bg-primary shadow-[0_0_8px_rgba(59,130,246,0.3)]" : "bg-white/5",
                isToday && !isDone && "border border-primary/40"
              )}
              title={format(day, 'MMM d, yyyy')}
            />
          );
        })}
      </div>
    </div>
  );
};

export const HabitStreakInfo = ({ streak, streakBest }: { streak: number, streakBest: number }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="glass p-4 rounded-[1.5rem] flex flex-col gap-1 border border-white/5">
        <div className="flex items-center gap-2 text-amber-400">
          <Flame className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-tighter">{t('streak')}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black italic">{streak}</span>
          <span className="text-[10px] font-bold opacity-40 uppercase">Days</span>
        </div>
      </div>
      <div className="glass p-4 rounded-[1.5rem] flex flex-col gap-1 border border-white/5">
        <div className="flex items-center gap-2 text-primary">
          <Trophy className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-tighter">{t('best_streak')}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black italic">{streakBest}</span>
          <span className="text-[10px] font-bold opacity-40 uppercase">Days</span>
        </div>
      </div>
    </div>
  );
};
