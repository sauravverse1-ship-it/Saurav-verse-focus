import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { CheckCircle, Circle, Calendar, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Task } from '../types';
import { playTick, playBell } from '../lib/audio';

interface WeeklyPlannerProps {
  tasks: Task[];
}

export const WeeklyPlanner = ({ tasks }: WeeklyPlannerProps) => {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const [objectives, setObjectives] = useState<{id: string, text: string, completed: boolean}[]>([
    { id: '1', text: 'Complete Physics Mechanics', completed: false },
    { id: '2', text: 'Revise Chemistry Thermodynamics', completed: false },
    { id: '3', text: 'Practice 50 Maths PYQs', completed: false }
  ]);
  const [newObjective, setNewObjective] = useState('');

  const toggleObjective = (id: string) => {
    setObjectives(prev => prev.map(o => o.id === id ? { ...o, completed: !o.completed } : o));
    playTick();
  };

  const addObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjective.trim()) return;
    setObjectives(prev => [...prev, { id: Math.random().toString(), text: newObjective, completed: false }]);
    setNewObjective('');
    playBell();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
          <Calendar className="w-3 h-3" /> Weekly Mission Grid
        </h4>
        <span className="text-[10px] font-bold text-md-primary uppercase">Week of {format(weekStart, 'MMM d')}</span>
      </div>

      {/* Daily Progress Grid */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        <div className="grid grid-cols-7 gap-1 md:gap-1.5 min-w-[300px] md:min-w-0">
          {weekDays.map((day) => {
          const isToday = isSameDay(day, today);
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter(t => t.completed && t.completedAt && format(new Date(t.completedAt), 'yyyy-MM-dd') === dateStr);
          const hasActivity = dayTasks.length > 0;

          return (
            <div key={dateStr} className="flex flex-col items-center gap-1 md:gap-2">
              <span className={cn(
                "text-[8px] md:text-[9px] font-black uppercase tracking-tighter transition-colors",
                isToday ? "text-md-primary" : "text-white/20"
              )}>
                {format(day, 'EEE')}
              </span>
              <div 
                className={cn(
                   "w-full aspect-square rounded-lg md:rounded-xl border flex flex-col items-center justify-center gap-0.5 md:gap-1 transition-all",
                   isToday ? "bg-md-primary/10 border-md-primary/30" : "bg-white/5 border-white/5",
                   hasActivity && "bg-md-primary/20 border-md-primary/40 shadow-[0_0_15px_rgba(0,255,224,0.1)]"
                )}
              >
                {hasActivity ? (
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-md-primary" />
                ) : (
                  <Circle className="w-3 h-3 md:w-4 md:h-4 opacity-10" />
                )}
                <span className="text-[7px] md:text-[8px] font-bold opacity-40">{dayTasks.length}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>

      {/* Tick List Section */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Weekly Planner Tick-List</span>
          <span className="text-[9px] font-bold text-md-primary">{objectives.filter(o => o.completed).length}/{objectives.length} DONE</span>
        </div>

        <div className="space-y-1.5">
          {objectives.map(obj => (
            <div 
              key={obj.id} 
              onClick={() => toggleObjective(obj.id)}
              className={cn(
                "p-2.5 px-3 rounded-xl flex items-center justify-between cursor-pointer transition-all border group",
                obj.completed ? "bg-md-primary/5 border-md-primary/20 opacity-60" : "bg-white/5 border-white/5 hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-2.5">
                {obj.completed ? (
                  <CheckCircle className="w-4 h-4 text-md-primary" />
                ) : (
                  <Circle className="w-4 h-4 opacity-20" />
                )}
                <span className={cn("text-[11px] font-medium", obj.completed && "line-through opacity-50")}>{obj.text}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setObjectives(prev => prev.filter(o => o.id !== obj.id));
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={addObjective} className="flex gap-2">
          <input 
            type="text"
            value={newObjective}
            onChange={e => setNewObjective(e.target.value)}
            placeholder="Add weekly target..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] outline-none focus:border-md-primary transition-all"
          />
          <button type="submit" className="bg-md-primary text-md-on-primary px-3 py-2 rounded-xl">
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
