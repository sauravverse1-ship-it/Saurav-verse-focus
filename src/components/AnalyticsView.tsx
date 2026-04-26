import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { SessionLog } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Flame, Download, Award, Clock, Target } from 'lucide-react';

interface AnalyticsViewProps {
  sessionLogs: SessionLog[];
  allSubjects: { id: string; name: string; color: string }[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ sessionLogs, allSubjects }) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  const filteredLogs = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const day = 24 * 60 * 60 * 1000;
    
    return sessionLogs.filter(log => {
        if (timeRange === 'today') return log.timestamp >= startOfToday;
        if (timeRange === 'week') return now.getTime() - log.timestamp < 7 * day;
        if (timeRange === 'month') return now.getTime() - log.timestamp < 30 * day;
        return true;
    });
  }, [sessionLogs, timeRange]);

  const todayLogs = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return sessionLogs.filter(log => log.timestamp >= startOfToday);
  }, [sessionLogs]);

  const totalFocusToday = todayLogs.reduce((sum, log) => sum + Math.floor(log.duration), 0);
  const pomodorosToday = todayLogs.filter(l => l.completed).length;
  
  const completionRate = sessionLogs.length === 0 ? 0 : Math.round((sessionLogs.filter(l => l.completed).length / sessionLogs.length) * 100);
  const avgSessionSec = sessionLogs.length === 0 ? 0 : Math.round(sessionLogs.reduce((acc, l) => acc + l.duration, 0) / sessionLogs.length);
  const avgSessionStr = avgSessionSec >= 60 
    ? `${Math.floor(avgSessionSec / 60)}m ${avgSessionSec % 60}s`
    : `${avgSessionSec}s`;

  const subjectData = useMemo(() => {
      const data: Record<string, number> = {};
      filteredLogs.forEach(log => {
          const sub = log.subject || 'General';
          data[sub] = (data[sub] || 0) + Math.floor(log.duration / 60);
      });
      return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [filteredLogs]);

  // Daily Streak
  const streak = useMemo(() => {
     if (sessionLogs.length === 0) return 0;
     const dates = Array.from(new Set(sessionLogs.map(l => new Date(l.timestamp).toDateString()))).sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
     let currentStreak = 0;
     let checkDate = new Date();
     while (true) {
         if (dates.includes(checkDate.toDateString())) {
             currentStreak++;
             checkDate.setDate(checkDate.getDate() - 1);
         } else {
             if (currentStreak === 0 && checkDate.toDateString() === new Date().toDateString()) {
                 checkDate.setDate(checkDate.getDate() - 1); // allow missing today
                 continue;
             }
             break;
         }
     }
     return currentStreak;
  }, [sessionLogs]);

  // Heatmap Data (Last 7 days)
  const heatmapData = useMemo(() => {
      return Array.from({length: 7}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dateStr = d.toDateString();
          const mins = sessionLogs.filter(l => new Date(l.timestamp).toDateString() === dateStr).reduce((acc, l) => acc + Math.floor(l.duration / 60), 0);
          return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), mins };
      });
  }, [sessionLogs]);
  
  // Best Focus Hour
  const bestFocusHour = useMemo(() => {
     const hours = new Array(24).fill(0);
     sessionLogs.forEach(log => {
         const h = new Date(log.timestamp).getHours();
         hours[h] += Math.floor(log.duration / 60);
     });
     const maxHour = hours.indexOf(Math.max(...hours));
     return maxHour > 12 ? `${maxHour-12} PM` : maxHour === 12 ? '12 PM' : maxHour === 0 ? '12 AM' : `${maxHour} AM`;
  }, [sessionLogs]);

  const exportCSV = () => {
     const csv = ['Date,Time,Duration (sec),Subject,Mission,Completed'];
     sessionLogs.forEach(log => {
         const d = new Date(log.timestamp);
         const sub = allSubjects.find(s => s.id === log.subject)?.name || log.subject || 'General';
         csv.push(`${d.toLocaleDateString()},${d.toLocaleTimeString()},${log.duration},"${sub}","${log.missionTitle || ''}",${log.completed}`);
     });
     const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = 'pomodoro_sessions.csv';
     a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-bold text-white">Analytics</h3>
        <button onClick={exportCSV} className="px-4 py-2 bg-white/5 hover:bg-white/10 transition-colors rounded-full text-xs font-bold uppercase tracking-widest text-md-primary flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> Export DB
        </button>
      </div>

      {/* Motivational Insight */}
      <div className="bg-md-primary-container/20 border border-md-primary/20 p-4 rounded-3xl flex items-center gap-4">
         <div className="p-3 bg-md-primary text-md-on-primary rounded-2xl shrink-0 shadow-lg shadow-md-primary/20">
             <Activity className="w-5 h-5" />
         </div>
         <div>
             <p className="text-sm font-bold text-white">Insight</p>
             <p className="text-xs text-white/60 font-medium">You focus best around <span className="text-md-primary">{bestFocusHour}</span>. Try scheduling deep work then!</p>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-md-surface-2 border border-white/5 p-4 rounded-3xl flex flex-col justify-between aspect-square">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-tight">Total Focus (Today)</p>
            <div>
               <p className="text-2xl font-display text-white">
                 {Math.floor(totalFocusToday / 3600)}h {Math.floor((totalFocusToday % 3600) / 60)}m {totalFocusToday % 60}s
               </p>
            </div>
        </div>
        <div className="bg-md-surface-2 border border-white/5 p-4 rounded-3xl flex flex-col justify-between aspect-square">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-tight">Pomodoros (Today)</p>
            <div className="flex items-center justify-between">
               <p className="text-3xl font-display text-md-primary">{pomodorosToday}</p>
               <span className="text-2xl">🍅</span>
            </div>
        </div>
        <div className="bg-md-surface-2 border border-white/5 p-4 rounded-3xl flex flex-col justify-between aspect-square">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-tight">Daily Streak</p>
            <div className="flex items-center justify-between">
               <p className="text-3xl font-display text-[#FFAB76]">{streak}</p>
               <Flame className="w-6 h-6 text-[#FFAB76]" />
            </div>
        </div>
        <div className="bg-md-surface-2 border border-white/5 p-4 rounded-3xl flex flex-col justify-between aspect-square">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-tight">Completion Rate</p>
            <div className="flex items-center justify-between">
               <p className="text-3xl font-display text-[#A5D6A7]">{completionRate}%</p>
               <Award className="w-6 h-6 text-[#A5D6A7]" />
            </div>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="flex p-1 bg-md-surface-2 border border-white/5 rounded-full">
         {(['today', 'week', 'month', 'all'] as const).map(tr => (
            <button 
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-colors ${timeRange === tr ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              {tr}
            </button>
         ))}
      </div>

      {/* Weekly Heatmap Intensity */}
      <div className="bg-md-surface-2 border border-white/5 p-6 rounded-[2.5rem] space-y-4">
         <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Focus Intensity (7 Days)</p>
         <div className="flex justify-between items-end h-24 gap-1">
             {heatmapData.map((d, i) => {
                 const intensity = d.mins > 120 ? 1 : d.mins > 60 ? 0.7 : d.mins > 0 ? 0.3 : 0.05;
                 return (
                     <div key={i} className="flex-1 flex flex-col items-center gap-2">
                         <div className="w-full bg-md-primary rounded-full transition-all" style={{ height: Math.max(8, (d.mins/180)*100) + '%', opacity: intensity }} />
                         <span className="text-[10px] font-bold text-white/30 uppercase">{d.day.charAt(0)}</span>
                     </div>
                 )
             })}
         </div>
      </div>

      {/* Subject Breakdown Donut & Bar */}
      <div className="bg-md-surface-2 border border-white/5 p-6 rounded-[2.5rem] space-y-4">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Subject Breakdown</p>
          {subjectData.length > 0 ? (
            <>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={subjectData}
                            cx="50%" cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {subjectData.map((entry, index) => {
                                const sub = allSubjects.find(s => s.id === entry.name);
                                return <Cell key={`cell-${index}`} fill={sub ? sub.color : '#00E5C8'} />
                            })}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1A1C1E', borderRadius: '16px', border: 'none', color: '#fff' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                  {subjectData.map(d => {
                      const sub = allSubjects.find(s => s.id === d.name);
                      return (
                          <div key={d.name} className="flex items-center justify-between bg-white/5 px-4 py-2.5 rounded-2xl">
                              <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub ? sub.color : '#00E5C8' }} />
                                  <span className="text-sm font-bold text-white/80">{sub ? sub.name : 'General'}</span>
                              </div>
                              <span className="text-xs font-mono text-white/50">{d.value} mins</span>
                          </div>
                      );
                  })}
              </div>
            </>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center grey-filter opacity-40">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-2">
                   <Target className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest">No Data Yet</p>
            </div>
          )}
      </div>

      <div className="bg-md-surface-2 border border-white/5 p-5 rounded-[2rem] flex items-center gap-4">
         <div className="p-3 bg-white/5 text-white/60 rounded-xl">
             <Clock className="w-5 h-5" />
         </div>
         <div>
             <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Avg Session</p>
             <p className="text-lg font-bold text-white">{avgSessionStr}</p>
         </div>
      </div>
      
    </div>
  );
};
