import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SessionLog } from '../types';
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, YAxis } from 'recharts';
import { Activity, Flame, Download, Award, Clock, Target, CalendarDays, TrendingUp, Sparkles, BookOpen, Skull, Zap, Swords } from 'lucide-react';
import { cn } from '../lib/utils';
import { Clock3D } from './Clock3D';

interface AnalyticsViewProps {
  sessionLogs: SessionLog[];
  allSubjects: { id: string; name: string; color: string }[];
  activeTimerSeconds?: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ sessionLogs = [], allSubjects = [], activeTimerSeconds = 0 }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  const { todayLogs, filteredLogs, totalFocusToday, pomodorosToday, completionRate, streak } = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayLogs = sessionLogs.filter(log => log.timestamp >= startOfToday);
    
    // Time range filter
    const startOfRange = new Date();
    if (timeRange === 'week') startOfRange.setDate(now.getDate() - 7);
    else if (timeRange === 'month') startOfRange.setMonth(now.getMonth() - 1);
    else startOfRange.setTime(0); // All time

    const filteredLogs = sessionLogs.filter(log => log.timestamp >= startOfRange.getTime());
    
    const totalFocusToday = todayLogs.reduce((sum, log) => sum + Math.floor(log.duration), 0) + activeTimerSeconds;
    const pomodorosToday = todayLogs.filter(l => l.completed).length;
    
    const completionRate = sessionLogs.length === 0 ? 0 : Math.round((sessionLogs.filter(l => l.completed).length / sessionLogs.length) * 100);
    
    // Daily Streak
    let streak = 0;
    if (sessionLogs.length > 0) {
        const dates = Array.from(new Set(sessionLogs.map(l => new Date(l.timestamp).toDateString()))).sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const todayStr = new Date().toDateString();
        const yesterdayStr = yesterday.toDateString();
        
        if (dates[0] === todayStr || dates[0] === yesterdayStr) {
            streak = 1;
            for (let i = 1; i < dates.length; i++) {
                const prevDate = new Date(dates[i-1]);
                const currDate = new Date(dates[i]);
                const diffTime = Math.abs(prevDate.getTime() - currDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) streak++;
                else break;
            }
        }
    }

    return { todayLogs, filteredLogs, totalFocusToday, pomodorosToday, completionRate, streak };
  }, [sessionLogs, activeTimerSeconds, timeRange]);

  const totalFocusFiltered = filteredLogs.reduce((sum, log) => sum + Math.floor(log.duration), 0);
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
        
        const activeMins = (i === 0) ? Math.floor(activeTimerSeconds / 60) : 0;
        
        data.push({
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            mins: mins + activeMins
        });
    }
    return data;
  }, [sessionLogs, timeRange, activeTimerSeconds]);

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
     if (!allSubjects) return;
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
    <div className="space-y-8 relative pb-20">
      {/* Anime Background Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-red-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="flex items-center justify-between relative z-10 border-l-4 border-orange-600 pl-4 py-2">
        <h3 className="text-4xl font-display font-black italic tracking-tighter text-white flex items-center gap-3 uppercase">
            <Skull className="w-10 h-10 text-orange-500 animate-jitter shadow-orange-500/50" /> Combat Intel
        </h3>
        <button onClick={exportCSV} className="px-6 py-2.5 bg-orange-600 text-white hover:bg-red-700 transition-all rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-[0_0_20px_rgba(234,88,12,0.3)] border border-white/20">
            <Download className="w-3.5 h-3.5" /> Data Reel
        </button>
      </div>

      <div className="relative group overflow-hidden bg-black border-2 border-orange-500/20 p-8 rounded-[2rem] min-h-[300px] flex items-center justify-center shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-20" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-600/20 rounded-full blur-3xl animate-pulse" />
        <Clock3D />
        <div className="relative z-10 text-center">
            <p className="text-[11px] font-black text-orange-500 uppercase tracking-[0.6em] mb-4 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">Temporal Coordinates</p>
            <h4 className="text-6xl font-display font-black text-white tracking-widest mb-2 italic" id="live-clock-text">
                {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </h4>
            <div className="h-1 w-full max-w-[200px] mx-auto bg-gradient-to-r from-transparent via-orange-600 to-transparent my-4" />
            <p className="text-white/40 text-xs font-black uppercase tracking-widest">Breathing Synchronized</p>
        </div>
        {/* Slashing Animation Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-0 w-[200%] h-1 bg-white/20 animate-slash -rotate-12" />
            <div className="absolute top-3/4 left-0 w-[200%] h-1 bg-red-600/20 animate-slash -rotate-12 blur-sm" />
        </div>
      </div>

      <div className="bg-neutral-900 border-2 border-red-900/30 p-6 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent" />
         <div className="p-4 bg-red-600 text-white rounded-2xl shrink-0 shadow-[0_0_30px_rgba(220,38,38,0.4)] z-10 animate-jitter">
             <Zap className="w-6 h-6 fill-current" />
         </div>
         <div className="z-10">
             <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500 mb-2">Tactical Assessment</p>
             <p className="text-base text-white/90 font-bold leading-relaxed italic">
                 Your focus reaches a <span className="text-orange-500 border-b-2 border-orange-500">Peak State</span> around <span className="text-white font-black bg-white/10 px-3 py-1 rounded-md mx-1">{bestFocusHour}</span>. 
                 Deploy your lethal skills during this window.
             </p>
         </div>
         <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700">
             <Swords className="w-48 h-48 text-white" />
         </div>
      </div>

      <div className="flex p-2 bg-neutral-900 border border-white/5 rounded-2xl inline-flex w-full overflow-hidden mb-4">
         {(['week', 'month', 'all'] as const).map(tr => (
            <button 
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={cn(
                  "flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                  timeRange === tr 
                    ? "bg-red-600 text-white shadow-xl italic skew-x-[-12deg]" 
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
              )}
            >
              <span className={timeRange === tr ? "block skew-x-[12deg]" : ""}>{tr}</span>
            </button>
         ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between aspect-square relative overflow-hidden group hover:border-orange-500/50 transition-all">
            <div className="absolute inset-0 bg-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[11px] font-black text-white/40 uppercase tracking-widest leading-tight z-10">Grind Duration<br/>(Today)</p>
            <div className="z-10">
               <p className="text-4xl font-display font-black text-white italic tracking-tighter">
                 {Math.floor(totalFocusToday / 3600)}<span className="text-xl text-orange-500">H</span> {Math.floor((totalFocusToday % 3600) / 60)}<span className="text-xl text-orange-500">M</span> {totalFocusToday % 60}<span className="text-xl text-orange-500">S</span>
               </p>
            </div>
            <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Clock className="w-12 h-12" />
            </div>
        </div>
        <div className="bg-neutral-900 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between aspect-square relative overflow-hidden group hover:border-red-500/50 transition-all">
            <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[11px] font-black text-white/40 uppercase tracking-widest leading-tight z-10">Demons Slayed<br/>(Today)</p>
            <div className="flex items-end justify-between z-10">
               <p className="text-6xl font-display font-black text-red-600 italic tracking-tighter drop-shadow-lg">{pomodorosToday}</p>
               <Skull className="w-8 h-8 text-white/20 group-hover:text-red-500 group-hover:animate-jitter transition-all" />
            </div>
        </div>
        <div className="bg-neutral-900 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between aspect-square relative overflow-hidden group hover:border-yellow-500/50 transition-all">
            <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[11px] font-black text-white/40 uppercase tracking-widest leading-tight z-10">Breathing<br/>Mastery</p>
            <div className="flex items-end justify-between z-10">
               <p className="text-6xl font-display font-black text-yellow-500 italic tracking-tighter">{streak}</p>
               <Zap className="w-8 h-8 text-yellow-500 animate-pulse" />
            </div>
        </div>
        <div className="bg-neutral-900 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between aspect-square relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[11px] font-black text-white/40 uppercase tracking-widest leading-tight z-10">Mission Success<br/>Rate</p>
            <div className="flex items-end justify-between z-10">
               <p className="text-5xl font-display font-black text-emerald-500 italic tracking-tighter">{completionRate}<span className="text-xl">%</span></p>
               <Award className="w-8 h-8 text-emerald-500 group-hover:scale-125 transition-transform" />
            </div>
        </div>
      </div>

      {/* Area Chart: Focus Trend */}
      <div className="bg-neutral-900 border-2 border-white/5 p-8 rounded-[3rem] shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
          <div className="flex justify-between items-center mb-8">
              <div>
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">Performance History</p>
                 <p className="text-3xl font-display font-black text-white italic">
                     {Math.floor(totalFocusFiltered / 3600)}H {Math.floor((totalFocusFiltered % 3600) / 60)}M <span className="text-sm font-black text-orange-500 uppercase ml-2 not-italic tracking-widest">Total Slayed</span>
                 </p>
              </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={timelineData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} 
                      dy={10}
                      minTickGap={20}
                  />
                  <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} 
                  />
                  <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#000', borderRadius: '4px', border: '2px solid #ea580c', color: '#fff', padding: '12px' }}
                      itemStyle={{ fontSize: '14px', fontWeight: '900', color: '#ea580c', textTransform: 'uppercase' }}
                      labelStyle={{ fontSize: '10px', fontWeight: '900', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase' }}
                      formatter={(value: number) => [`${value} MINS`, 'FOCUS POTENTIAL']}
                  />
                  <Area 
                      type="stepAfter" 
                      dataKey="mins" 
                      stroke="#ea580c" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorMins)" 
                      animationDuration={2000}
                  />
               </AreaChart>
            </ResponsiveContainer>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subject Breakdown Donut */}
          <div className="bg-neutral-900 border border-white/5 p-8 rounded-[3rem] flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden group">
              <div className="absolute top-4 left-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-500" />
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Specialty Mastery</p>
              </div>
              {subjectData.length > 0 ? (
                <>
                  <div className="h-56 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={subjectData}
                                cx="50%" cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {subjectData.map((entry, index) => {
                                    const sub = allSubjects?.find(s => s.id === entry.name);
                                    return <Cell key={`cell-${index}`} fill={sub ? sub.color : '#ea580c'} />
                                })}
                            </Pie>
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#000', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] leading-none mb-1">Primary</p>
                        <p className="text-2xl font-display font-black text-white italic truncate max-w-[120px] text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            {allSubjects?.find(s => s.id === subjectData[0].name)?.name || 'General'}
                        </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center mb-4 animate-breathing">
                       <Target className="w-8 h-8" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.5em]">No Missions Recorded</p>
                </div>
              )}
          </div>

          {/* Subject Legend */}
          <div className="bg-neutral-900 border border-white/5 p-8 rounded-[3rem] space-y-4 flex flex-col overflow-y-auto max-h-[350px] relative">
             {subjectData.length > 0 ? subjectData.map((d, i) => {
                  const sub = allSubjects?.find(s => s.id === d.name);
                  const isTop = i === 0;
                  return (
                      <div key={d.name} className={cn(
                          "group flex items-center justify-between px-6 py-4 rounded-2xl transition-all relative overflow-hidden",
                          isTop ? "bg-orange-600/20 border-2 border-orange-600/50 italic shadow-[0_0_20px_rgba(234,88,12,0.1)]" : "bg-white/5 border border-transparent hover:bg-white/10"
                      )}>
                          {isTop && <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-transparent" />}
                          <div className="flex items-center gap-4 relative z-10">
                              <div className="w-5 h-5 rounded-sm rotate-45 shadow-lg group-hover:rotate-[225deg] transition-transform duration-500" style={{ backgroundColor: sub ? sub.color : '#ea580c' }} />
                              <span className={cn("text-base font-black tracking-tight", isTop ? "text-orange-500" : "text-white/80")}>{sub ? sub.name : 'General'}</span>
                          </div>
                          <div className="flex items-center gap-2 relative z-10">
                              <span className="text-[10px] font-mono font-black text-white/50">{d.value}</span>
                              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">MINS</span>
                          </div>
                      </div>
                  );
              }) : (
                 <div className="flex flex-col items-center justify-center h-full opacity-20 text-center">
                    <BookOpen className="w-10 h-10 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">Inventory Empty</p>
                 </div>
              )}
          </div>
      </div>

    </div>
  );
};

