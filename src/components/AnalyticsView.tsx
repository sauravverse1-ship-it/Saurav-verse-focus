import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SessionLog } from '../types';
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, YAxis } from 'recharts';
import { Activity, Flame, Download, Award, Clock, Target, CalendarDays, TrendingUp, Sparkles, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

interface AnalyticsViewProps {
  sessionLogs: SessionLog[];
  allSubjects: { id: string; name: string; color: string }[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ sessionLogs, allSubjects }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  const filteredLogs = useMemo(() => {
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;
    
    return sessionLogs.filter(log => {
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
  const totalFocusFiltered = filteredLogs.reduce((sum, log) => sum + Math.floor(log.duration), 0);
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

  // Timeline Data for Area Chart
  const timelineData = useMemo(() => {
    const now = new Date();
    const daysStr = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const data = [];
    
    for (let i = daysStr - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toDateString();
        const mins = sessionLogs
          .filter(l => new Date(l.timestamp).toDateString() === dateStr)
          .reduce((acc, l) => acc + Math.floor(l.duration / 60), 0);
        data.push({
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            mins
        });
    }
    return data;
  }, [sessionLogs, timeRange]);

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
                 checkDate.setDate(checkDate.getDate() - 1); 
                 continue;
             }
             break;
         }
     }
     return currentStreak;
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
        <h3 className="text-2xl font-display font-black tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> Analysis
        </h3>
        <button onClick={exportCSV} className="px-4 py-2 bg-white/5 hover:bg-white/10 transition-colors rounded-full text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 border border-white/5">
            <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Motivational Insight */}
      <div className="bg-gradient-to-r from-primary/20 to-transparent border border-primary/20 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center gap-4 relative overflow-hidden backdrop-blur-sm">
         <div className="absolute right-0 top-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
         <div className="p-3 bg-primary text-white rounded-2xl shrink-0 shadow-lg shadow-primary/20 z-10">
             <Sparkles className="w-5 h-5" />
         </div>
         <div className="z-10">
             <p className="text-sm font-black uppercase tracking-widest text-primary/80 mb-1">AI Insight</p>
             <p className="text-sm text-white/80 font-medium leading-relaxed">
                 You focus best around <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-md inline-block mx-1">{bestFocusHour}</span>. 
                 Try scheduling deep work sessions during this peak productivity window.
             </p>
         </div>
      </div>

      <div className="flex p-1 bg-black/40 border border-white/5 rounded-full inline-flex w-full overflow-hidden backdrop-blur-md">
         {(['week', 'month', 'all'] as const).map(tr => (
            <button 
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={cn(
                  "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300",
                  timeRange === tr 
                    ? "bg-white text-black shadow-lg scale-[0.98]" 
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
              )}
            >
              {tr}
            </button>
         ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-5 rounded-[2rem] flex flex-col justify-between aspect-square relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-tight z-10">Total Focus<br/>(Today)</p>
            <div className="z-10">
               <p className="text-3xl font-display font-black text-white tracking-tighter">
                 {Math.floor(totalFocusToday / 3600)}<span className="text-lg text-white/50 tracking-normal">h</span> {Math.floor((totalFocusToday % 3600) / 60)}<span className="text-lg text-white/50 tracking-normal">m</span>
               </p>
            </div>
        </div>
        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-5 rounded-[2rem] flex flex-col justify-between aspect-square relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-tight z-10">Pomodoros<br/>(Today)</p>
            <div className="flex items-end justify-between z-10">
               <p className="text-4xl font-display font-black text-primary tracking-tighter">{pomodorosToday}</p>
               <span className="text-2xl grayscale group-hover:grayscale-0 transition-all duration-500 origin-bottom hover:scale-110">🍅</span>
            </div>
        </div>
        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-5 rounded-[2rem] flex flex-col justify-between aspect-square relative overflow-hidden group">
            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-tight z-10">Daily<br/>Streak</p>
            <div className="flex items-end justify-between z-10">
               <p className="text-4xl font-display font-black text-[#FFAB76] tracking-tighter">{streak}</p>
               <Flame className="w-7 h-7 text-[#FFAB76] animate-pulse" />
            </div>
        </div>
        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-5 rounded-[2rem] flex flex-col justify-between aspect-square relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-tight z-10">Completion<br/>Rate</p>
            <div className="flex items-end justify-between z-10">
               <p className="text-4xl font-display font-black text-[#A5D6A7] tracking-tighter">{completionRate}<span className="text-xl">%</span></p>
               <Award className="w-7 h-7 text-[#A5D6A7]" />
            </div>
        </div>
      </div>

      {/* Area Chart: Focus Trend */}
      <div className="bg-black/40 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
              <div>
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Focus Duration Trend</p>
                 <p className="text-2xl font-display font-black text-white mt-1">
                     {Math.floor(totalFocusFiltered / 3600)}h {Math.floor((totalFocusFiltered % 3600) / 60)}m
                 </p>
              </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={timelineData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5C8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00E5C8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 800 }} 
                      dy={10}
                      minTickGap={20}
                  />
                  <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 800 }} 
                  />
                  <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1A1C1E', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                      itemStyle={{ fontSize: '14px', fontWeight: 'bold', color: '#00E5C8' }}
                      labelStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                      formatter={(value: number) => [`${value} mins`, 'Focus Time']}
                  />
                  <Area 
                      type="monotone" 
                      dataKey="mins" 
                      stroke="#00E5C8" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorMins)" 
                      animationDuration={1500}
                      animationEasing="ease-out"
                  />
               </AreaChart>
            </ResponsiveContainer>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subject Breakdown Donut */}
          <div className="bg-black/40 border border-white/10 p-6 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-full text-left mb-2">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Subject Distribution</p>
              </div>
              {subjectData.length > 0 ? (
                <>
                  <div className="h-48 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={subjectData}
                                cx="50%" cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {subjectData.map((entry, index) => {
                                    const sub = allSubjects.find(s => s.id === entry.name);
                                    return <Cell key={`cell-${index}`} fill={sub ? sub.color : '#4ade80'} />
                                })}
                            </Pie>
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#1A1C1E', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">Top</p>
                        <p className="text-xl font-display font-black text-white truncate max-w-[80px] text-center mt-1">
                            {allSubjects.find(s => s.id === subjectData[0].name)?.name || 'General'}
                        </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-3">
                       <Target className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">No Data Yet</p>
                </div>
              )}
          </div>

          {/* Subject Legend */}
          <div className="bg-black/40 border border-white/10 p-6 rounded-[2.5rem] space-y-3 flex flex-col overflow-y-auto max-h-[300px]">
             {subjectData.length > 0 ? subjectData.map((d, i) => {
                  const sub = allSubjects.find(s => s.id === d.name);
                  const isTop = i === 0;
                  return (
                      <div key={d.name} className={cn(
                          "flex items-center justify-between px-5 py-3 rounded-2xl transition-all",
                          isTop ? "bg-white/10 border border-white/10" : "bg-white/5 border border-transparent hover:bg-white/10"
                      )}>
                          <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: sub ? sub.color : '#4ade80' }} />
                              <span className={cn("text-sm font-bold", isTop ? "text-white" : "text-white/80")}>{sub ? sub.name : 'General'}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-white/60 bg-black/20 px-2 py-1 rounded-lg">{d.value}m</span>
                      </div>
                  );
              }) : (
                 <div className="flex flex-col items-center justify-center h-full opacity-40 text-center">
                    <BookOpen className="w-8 h-8 mb-3" />
                    <p className="text-xs font-black uppercase tracking-widest">Record sessions to see subjects</p>
                 </div>
              )}
          </div>
      </div>

    </div>
  );
};

