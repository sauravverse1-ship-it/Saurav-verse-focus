import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { playTick } from '../lib/audio';
import { cn } from '../lib/utils';
import { TiltCard } from './CinematicLayout';

gsap.registerPlugin(ScrollTrigger);

export const HabitsSection: React.FC<{ habits: any[], onAdd: () => void, onMark: (id: string) => void }> = ({ habits, onAdd, onMark }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '#habits', start: 'top 75%' }
    });
    
    tl.from('.habits-header', { y: 40, opacity: 0, duration: 1, ease: 'expo.out' }, 0)
      .from('.habits-stat', { y: 40, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, 0.2)
      .from('.habit-card', { x: 30, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' }, 0.3)
      .from('.habits-add-btn', { scale: 0.9, opacity: 0, duration: 0.5, ease: 'back.out(2)' }, 0.8);
  }, { scope: containerRef });

  const totalHabits = habits.length;
  // Calculate streaks and perfect days based on actual habit records
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  const perfectDays = 0; // Requires full aggregation of daily logs across all habits

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
    <section id="habits" ref={containerRef} className="relative min-h-screen w-full flex items-center justify-center py-24 bg-md-surface grid-bg border-t border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-md-surface pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl w-full px-6 flex flex-col md:flex-row gap-12 md:gap-20">
        
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-10">
          <div className="habits-header space-y-4">
            <span className="font-mono text-md-secondary uppercase tracking-[0.4em] text-xs font-bold block opacity-80">Act IV</span>
            <h3 className="text-5xl md:text-7xl font-display tracking-tight text-white leading-none">YOUR HABITS.</h3>
            <p className="text-lg md:text-xl font-serif italic text-md-on-surface-variant max-w-sm">
              Greatness is formed in the dark. Day by day, block by block. What you repeat is what you become.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="habits-stat bg-md-surface-2 p-6 rounded-2xl border border-white/5 shadow-lg flex justify-between items-center">
              <span className="font-mono text-xs uppercase tracking-widest text-md-on-surface-variant">Total Habits</span>
              <span className="font-display text-3xl text-white">{totalHabits}</span>
            </div>
            <div className="habits-stat bg-md-surface-2 p-6 rounded-2xl border border-md-secondary/20 shadow-[0_0_20px_rgba(123,95,232,0.1)] flex justify-between items-center">
              <span className="font-mono text-xs uppercase tracking-widest text-md-secondary">Best Streak</span>
              <span className="font-display text-3xl text-white">{bestStreak} 🔥</span>
            </div>
            <div className="habits-stat bg-md-surface-2 p-6 rounded-2xl border border-white/5 shadow-lg flex justify-between items-center">
              <span className="font-mono text-xs uppercase tracking-widest text-md-on-surface-variant">Perfect Days</span>
              <span className="font-display text-3xl text-white">{perfectDays}</span>
            </div>
          </div>

          <button 
            onClick={onAdd}
            onMouseEnter={playTick}
            className="habits-add-btn align-self-start py-4 px-8 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 font-mono text-sm uppercase tracking-widest font-bold transition-all active:scale-95"
          >
            + Add Habit
          </button>
        </div>

        {/* Right Column: Grid */}
        <div className="flex-[1.5] grid grid-cols-1 gap-6 align-start">
          {habits.map((habit) => {
             const isMarkedToday = habit.completedDates?.includes(todayStr);

             return (
               <div key={habit.id} className="habit-card group w-full bg-md-surface-2 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 shadow-xl hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300">
                 <div className="flex flex-col gap-6">
                    
                    {/* Row 1 */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{habit.name.split(' ')[0] || '🔥'}</span>
                        <div>
                          <h4 className="font-bold text-lg md:text-xl text-white">{habit.name}</h4>
                          <span className="font-mono text-[10px] text-md-primary tracking-widest uppercase opacity-80">Streak {habit.streak || 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {weekDays.map((d, i) => {
                          const done = habit.completedDates?.includes(d.dateStr);
                          return (
                            <div key={i} className="flex flex-col items-center gap-2">
                               <span className="font-mono text-[8px] text-zinc-500">{d.dayName}</span>
                               <div className={cn(
                                 "w-3 h-3 md:w-4 md:h-4 rounded-full transition-all group-hover:scale-110",
                                 done ? "bg-md-primary shadow-[0_0_10px_var(--md-primary)]" : 
                                 d.isToday ? "border-2 border-md-primary/50 animate-pulse bg-transparent" : "bg-white/5"
                               )} />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Row 2: Progress */}
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-md-secondary w-[40%] transition-all" />
                    </div>

                    {/* Row 3 */}
                    <div className="flex justify-end">
                      <button 
                        onClick={() => { playTick(); onMark(habit.id); }}
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
