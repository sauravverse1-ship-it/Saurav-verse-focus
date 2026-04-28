import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { playTick } from '../lib/audio';
import { cn } from '../lib/utils';
import { Trash2, Edit } from 'lucide-react';
import { HabitHeatMap } from './HabitStats';


export const HabitsSection: React.FC<{ habits: any[], onAdd: () => void, onMark: (id: string) => void, onDelete?: (id: string) => void, compact?: boolean }> = ({ habits, onAdd, onMark, onDelete, compact = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  const startPress = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    // Avoid right click
    if ('button' in e && e.button !== 0) return;
    
    pressTimer.current = setTimeout(() => {
      setDeletingId(id);
      if (typeof window !== 'undefined' && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 1000); // 1s for long press
  };

  const endPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  useGSAP(() => {
    const tl = gsap.timeline();
    // ScrollTrigger removed to prevent crashes
    
    tl.from('.habits-header', { y: 40, opacity: 0, duration: 1, ease: 'expo.out' }, 0)
      .from('.habits-stat', { y: 40, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, 0.2)
      .from('.habit-card', { x: 30, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' }, 0.3)
      .from('.habits-add-btn', { scale: 0.9, opacity: 0, duration: 0.5, ease: 'back.out(2)' }, 0.8);
  }, { scope: containerRef });

  const totalHabits = habits.length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  const perfectDays = 0; 

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    for(let i=6; i>=0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({
         dateStr: d.toISOString().split('T')[0],
         isToday: i === 0,
         dayName: ['S','M','T','W','T','F','S'][d.getDay()]
      });
    }
    return days;
  };

  const weekDays = getWeekDays();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <section id="habits" ref={containerRef} className={cn("relative w-full flex items-center justify-center border-t border-white/5", compact ? "py-8 bg-transparent" : "min-h-screen py-24 bg-md-surface grid-bg")}>
      {!compact && <div className="absolute inset-0 bg-gradient-to-b from-transparent to-md-surface pointer-events-none" />}
      
      <div className="relative z-10 max-w-7xl w-full px-6 flex flex-col md:flex-row gap-12 md:gap-20">
        
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-10">
          <div className="habits-header flex items-center justify-between">
            <div className="space-y-4">
              <span className="font-mono text-md-secondary uppercase tracking-[0.4em] text-xs font-bold block opacity-80">Act IV</span>
              <h3 className="text-5xl md:text-7xl font-display tracking-tight text-white leading-none">YOUR HABITS.</h3>
              <p className="text-lg md:text-xl font-serif italic text-md-on-surface-variant max-w-sm">
                Greatness is formed in the dark. Day by day, block by block. What you repeat is what you become.
              </p>
            </div>
            <button 
              onClick={() => setEditMode(!editMode)}
              className={cn("p-3 rounded-full transition-all", editMode ? "bg-md-error text-white" : "bg-white/5 hover:bg-white/10 text-white")}
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="habits-stat glass-card p-6 rounded-2xl border border-white/5 shadow-lg flex justify-between items-center">
              <span className="font-mono text-xs uppercase tracking-widest text-md-on-surface-variant">Total Habits</span>
              <span className="font-display text-3xl text-white">{totalHabits}</span>
            </div>
            <div className="habits-stat glass-card p-6 rounded-2xl border border-md-secondary/20 shadow-[0_0_20px_rgba(123,95,232,0.1)] flex justify-between items-center">
              <span className="font-mono text-xs uppercase tracking-widest text-md-secondary">Best Streak</span>
              <span className="font-display text-3xl text-white">{bestStreak} 🔥</span>
            </div>
            <div className="habits-stat glass-card p-6 rounded-2xl border border-white/5 shadow-lg flex justify-between items-center">
              <span className="font-mono text-xs uppercase tracking-widest text-md-on-surface-variant">Perfect Days</span>
              <span className="font-display text-3xl text-white">{perfectDays}</span>
            </div>
          </div>

          <button 
            onClick={onAdd}
            onMouseEnter={playTick}
            className="habits-add-btn align-self-start py-4 px-8 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 font-mono text-sm uppercase tracking-widest font-bold transition-all active:scale-95"
          >
            + Initialize
          </button>
        </div>

        {/* Right Column: Grid */}
        <div className="flex-[1.5] grid grid-cols-1 gap-6 items-start pb-20">
          {habits.map((habit) => {
             const isMarkedToday = habit.completedDates?.includes(todayStr);
             const isDeleting = deletingId === habit.id;

             return (
                 <div 
                   key={habit.id} 
                   onMouseDown={(e) => startPress(e, habit.id)}
                   onMouseUp={endPress}
                   onMouseLeave={endPress}
                   onTouchStart={(e) => startPress(e, habit.id)}
                   onTouchEnd={endPress}
                   onContextMenu={(e) => e.preventDefault()}
                   className="habit-card group w-full glass-card p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 shadow-xl hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                 >
                 {isDeleting && (
                   <div className="absolute inset-0 bg-red-500/10 backdrop-blur-md z-20 flex items-center justify-center gap-4 animate-in fade-in zoom-in duration-300">
                     <p className="font-black uppercase tracking-widest text-red-500 text-xs">Remove Habit?</p>
                     <button 
                       onClick={() => { onDelete?.(habit.id); setDeletingId(null); }}
                       className="px-4 py-2 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-500/30"
                     >
                       Confirm
                     </button>
                     <button 
                       onClick={() => setDeletingId(null)}
                       className="px-4 py-2 bg-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em]"
                     >
                       Cancel
                     </button>
                   </div>
                 )}

                 <div className="flex flex-col gap-6">
                    {/* Row 1 */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <span className="text-3xl">{habit.icon || '🔥'}</span>
                          {editMode && (
                            <button
                               onClick={() => onDelete?.(habit.id)}
                               className="absolute -top-2 -right-2 bg-md-error text-white rounded-full p-1 shadow-lg z-30"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg md:text-xl text-white">{habit.title}</h4>
                          <span className="font-mono text-[10px] text-md-primary tracking-widest uppercase opacity-80">Streak {habit.streak || 0}</span>
                        </div>
                      </div>
                      
                      <div className="hidden md:block">
                        <div className="flex gap-2">
                          {weekDays.map((d, i) => {
                            const done = habit.completedDates?.includes(d.dateStr);
                            return (
                              <div key={i} className="flex flex-col items-center gap-2">
                                <span className="font-mono text-[8px] text-zinc-500">{d.dayName}</span>
                                <div className={cn(
                                  "w-3 h-3 md:w-3.5 md:h-3.5 rounded-[3px] transition-all",
                                  done ? "bg-md-primary shadow-[0_0_8px_var(--md-primary)]" : 
                                  d.isToday ? "border border-md-primary/50 animate-pulse bg-transparent" : "bg-white/5"
                                )} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Activity Map (Proper) */}
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                      <HabitHeatMap completedDates={habit.completedDates || []} />
                    </div>

                    {/* Row 3 */}
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic group-hover:opacity-100 opacity-0 transition-opacity">Long press to remove</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); playTick(); onMark(habit.id); }}
                        disabled={isMarkedToday}
                        className={cn(
                          "px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-widest font-bold transition-all border",
                          isMarkedToday ? "bg-md-primary/20 text-md-primary border-transparent opacity-50 cursor-not-allowed" : "bg-md-primary text-md-on-primary border-none hover:shadow-[0_0_20px_rgba(0,255,224,0.4)] hover:scale-105 active:scale-95"
                        )}
                      >
                        {isMarkedToday ? "Completed" : "Mark Today"}
                      </button>
                    </div>
                 </div>
               </div>
             );
          })}
        </div>
      </div>
    </section>
  );
};
