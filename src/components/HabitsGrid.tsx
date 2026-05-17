import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Zap, CheckCircle, Flame } from 'lucide-react';
import { HabitHeatMap } from './HabitStats';
import { TiltCard } from './CinematicLayout';
import { cn } from '../lib/utils';
import { Habit } from '../types';
import { format } from 'date-fns';

export const HabitsGrid: React.FC<{ habits: Habit[], onMark: (habit: Habit) => void, onDelete: (id: string) => void }> = ({ habits, onMark, onDelete }) => {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const startLongPress = (id: string) => {
    longPressTimer.current = setTimeout(() => {
        onDelete(id);
    }, 800);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 px-2">
      {habits.map(habit => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const isDone = (habit.completedDates || []).includes(today);
        return (
          <div 
            key={habit.id} 
            className="w-full"
            onMouseDown={() => startLongPress(habit.id)}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
            onTouchStart={() => startLongPress(habit.id)}
            onTouchEnd={cancelLongPress}
          >
            <TiltCard intensity={15} className="w-full h-full">
              <motion.div
                className={cn(
                  "w-full rounded-[2.5rem] p-6 flex flex-col gap-4 border transition-all relative overflow-hidden glass",
                  isDone ? "border-primary/20" : "border-white/5"
                )}
              >
                  <div className="flex justify-between items-start">
                    <div className={cn("p-3 rounded-2xl", isDone ? "bg-primary text-white" : "bg-white/5 text-primary")}>
                      <Zap className={cn("w-6 h-6", isDone && "fill-white")} />
                    </div>
                    <button 
                      onClick={() => onMark(habit)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                        isDone ? "bg-green-500 border-green-500" : "border-white/20"
                      )}
                    >
                      {isDone && <CheckCircle className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                  
                  <div>
                    <span className="text-sm font-black uppercase tracking-tight block truncate italic">{habit.title}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Flame className="w-3 h-3 text-amber-500" />
                      <span className="text-[9px] font-bold opacity-60 uppercase">{habit.streak} DAY STREAK</span>
                      <span className="text-[8px] font-bold opacity-30 uppercase ml-auto">BEST: {habit.streakBest || 0}</span>
                    </div>
                  </div>

                  <HabitHeatMap completedDates={habit.completedDates || []} />
              </motion.div>
            </TiltCard>
          </div>
        );
      })}
    </div>
  );
};
