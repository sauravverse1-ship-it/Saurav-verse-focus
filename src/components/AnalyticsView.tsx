import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SessionLog, UserProfile } from '../types';
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, YAxis } from 'recharts';
import { Activity, Flame, Download, Award, Clock, Target, CalendarDays, TrendingUp, Sparkles, BookOpen, Skull, Zap, Swords, CheckCircle, ChevronDown, ChevronUp, History, Brain, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { Clock3D } from './Clock3D';
import { JEE_SYLLABUS } from '../lib/syllabus';
import { HabitHeatMap } from './HabitStats';

interface AnalyticsViewProps {
  sessionLogs: SessionLog[];
  allSubjects: { id: string; name: string; color: string }[];
  activeTimerSeconds?: number;
  profile?: UserProfile | null;
  onToggleChapter?: (chapter: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ sessionLogs = [], allSubjects = [], activeTimerSeconds = 0, profile, onToggleChapter }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [showHistory, setShowHistory] = useState(false);
  const [expandedSyllabus, setExpandedSyllabus] = useState<string | null>(null);

  const { todayLogs, filteredLogs, totalFocusToday, pomodorosToday, completionRate, streak } = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayLogs = sessionLogs.filter(log => log.timestamp >= startOfToday);
    
    const startOfRange = new Date();
    if (timeRange === 'week') startOfRange.setDate(now.getDate() - 7);
    else if (timeRange === 'month') startOfRange.setMonth(now.getMonth() - 1);
    else startOfRange.setTime(0);

    const filteredLogs = sessionLogs.filter(log => log.timestamp >= startOfRange.getTime());
    
    const calculatedFocusToday = todayLogs.reduce((sum, log) => sum + Math.floor(log.duration), 0) + activeTimerSeconds;
    const totalFocusToday = Math.max(calculatedFocusToday, profile?.dailyFocusSeconds || 0);
    const pomodorosToday = Math.max(todayLogs.filter(l => l.completed).length, profile?.dailySessions || 0);
    
    const completionRate = sessionLogs.length === 0 ? 0 : Math.round((sessionLogs.filter(l => l.completed).length / sessionLogs.length) * 100);
    
    let streakCount = 0;
    if (sessionLogs.length > 0) {
        const dates = Array.from(new Set(sessionLogs.map(l => new Date(l.timestamp).toDateString()))).sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
        const todayStr = new Date().toDateString();
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (dates[0] === todayStr || dates[0] === yesterdayStr) {
            streakCount = 1;
            for (let i = 1; i < dates.length; i++) {
                const prevDate = new Date(dates[i-1]);
                const currDate = new Date(dates[i]);
                const diffTime = Math.abs(prevDate.getTime() - currDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) streakCount++;
                else break;
            }
        }
    }

    return { todayLogs, filteredLogs, totalFocusToday, pomodorosToday, completionRate, streak: streakCount };
  }, [sessionLogs, activeTimerSeconds, timeRange]);

  const subjectData = useMemo(() => {
      const data: Record<string, number> = {};
      filteredLogs.forEach(log => {
          const sub = log.subject || 'General';
          data[sub] = (data[sub] || 0) + Math.floor(log.duration / 60);
      });
      return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [filteredLogs]);

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
     a.download = 'quantum_sessions.csv';
     a.click();
  };

  const activityDates = useMemo(() => {
    return Array.from(new Set(sessionLogs.map(l => new Date(l.timestamp).toDateString())));
  }, [sessionLogs]);

  const skills = [
    { name: 'Focus Depth', val: profile?.skills?.focus || 0, icon: Target, color: 'text-blue-400' },
    { name: 'Neural Fortitude', val: profile?.skills?.discipline || 0, icon: ShieldCheck, color: 'text-orange-400' },
    { name: 'Consistency Sync', val: profile?.skills?.consistency || 0, icon: Flame, color: 'text-red-400' },
  ];

  return (
    <div className="space-y-12 relative pb-24 font-sans">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_10%,rgba(249,115,22,0.05),transparent_40%)] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-end justify-between border-l-4 border-orange-600 pl-6 py-2">
              <div>
                <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Neural Archive</h1>
                <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/30">Subject: {profile?.displayName?.toUpperCase() || 'ASPIRANT'} • Protocol Status: Optimal</p>
              </div>
              <button onClick={exportCSV} className="hidden md:flex px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all items-center gap-2">
                <Download className="w-3.5 h-3.5" /> Synchronize Logs
              </button>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Today Focus" value={`${Math.floor(totalFocusToday / 3600)}H ${Math.floor((totalFocusToday % 3600) / 60)}M`} sub="Active Sync" icon={Clock} color="orange" />
              <StatCard label="Missions" value={pomodorosToday} sub="Slayed Today" icon={Skull} color="red" />
              <StatCard label="Daily Streak" value={`${streak} DAYS`} sub="Neural Rhythm" icon={Flame} color="amber" />
              <StatCard label="Success Rate" value={`${completionRate}%`} sub="Mission Control" icon={Award} color="emerald" />
           </div>

           <div className="glass-card p-10 rounded-[3rem] border-white/5 relative group">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-xl font-black uppercase tracking-widest text-white/90 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-orange-500" /> Focus Trajectory & Intensity
                 </h3>
                 <div className="flex gap-2 p-1 bg-white/5 rounded-full">
                    {(['week', 'month', 'all'] as const).map(tr => (
                       <button 
                         key={tr}
                         onClick={() => setTimeRange(tr)}
                         className={cn(
                           "px-6 py-2 rounded-full text-[10px] font-bold uppercase transition-all",
                           timeRange === tr ? "bg-orange-600 text-white shadow-lg" : "text-white/30 hover:text-white/60"
                         )}
                       >
                         {tr}
                       </button>
                    ))}
                 </div>
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} dy={15} />
                      <YAxis hide domain={[0, 'auto']} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px' }}
                        itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="mins" stroke="#f97316" strokeWidth={4} fill="url(#focusGrad)" animationDuration={1000} />
                   </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="glass-card p-10 rounded-[3rem] border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden h-72">
              <Clock3D />
              <div className="relative z-10 space-y-2">
                 <h4 className="text-4xl font-mono font-black text-white tracking-widest">{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</h4>
                 <p className="text-[10px] uppercase font-black tracking-[0.5em] text-white/30">System Time</p>
              </div>
           </div>

           <div className="glass-card p-8 rounded-[3rem] border-orange-500/20 bg-orange-500/5 space-y-6">
              <div className="flex items-center gap-2 text-orange-500">
                 <Sparkles className="w-5 h-5" />
                 <h4 className="text-xs font-black uppercase tracking-widest">Cognitive Peak</h4>
              </div>
              <p className="text-sm text-white/70 leading-relaxed font-serif italic">
                Neural analysis suggests your efficiency scales to <span className="text-white font-black">100%</span> around <span className="text-orange-500 font-black">{bestFocusHour}</span>. 
                Prioritize your <span className="underline decoration-orange-500/30">most lethal</span> tasks then.
              </p>
           </div>

           <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-4">Neural Skill Development</h4>
              <div className="space-y-3">
                 {skills.map(skill => (
                    <div key={skill.name} className="glass-card p-5 rounded-[2rem] border-white/5 hover:bg-white/5 transition-all">
                       <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest leading-none">
                          <div className="flex items-center gap-2">
                             <skill.icon className={cn("w-4 h-4", skill.color)} />
                             <span className="text-white/60">{skill.name}</span>
                          </div>
                          <span className="text-white/20 italic">LVL {Math.floor(skill.val / 100) + 1}</span>
                       </div>
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.val % 100}%` }}
                            className={cn("h-full", skill.color.replace('text-', 'bg-'))}
                          />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         <div className="space-y-6">
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
               <CalendarDays className="w-6 h-6 text-emerald-500" /> Activity Matrix
            </h3>
            <div className="glass-card p-10 rounded-[3rem] border-white/5 flex items-center justify-center overflow-x-auto min-h-[220px]">
               <HabitHeatMap completedDates={activityDates} />
            </div>
         </div>

         {profile?.examPreference === 'JEE' && (
            <div className="space-y-6">
               <h3 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-500" /> Syllabus Intelligence
               </h3>
               <div className="glass-card p-10 rounded-[3rem] border-white/5 space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                     {(['physics', 'chemistry', 'math'] as const).map(sub => {
                        const chapters = JEE_SYLLABUS[sub];
                        const completedCount = chapters.filter((c: string) => profile?.jee?.completedChapters?.includes(c)).length;
                        const percentage = Math.round((completedCount / chapters.length) * 100);
                        return (
                           <div key={sub} className="space-y-3 cursor-pointer group" onClick={() => setExpandedSyllabus(expandedSyllabus === sub ? null : sub)}>
                              <div className="flex justify-between items-end">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{sub}</span>
                                 <span className="text-xs font-black text-white">{percentage}%</span>
                              </div>
                              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                 <motion.div animate={{ width: `${percentage}%` }} className="h-full bg-md-primary" />
                              </div>
                           </div>
                        );
                     })}
                  </div>
                  
                  {expandedSyllabus && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }} 
                       animate={{ opacity: 1, height: 'auto' }} 
                       className="pt-6 border-t border-white/5 space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-4 font-mono text-[11px]"
                     >
                        {JEE_SYLLABUS[expandedSyllabus as keyof typeof JEE_SYLLABUS].map((chap: string) => {
                           const isDone = profile?.jee?.completedChapters?.includes(chap);
                           return (
                              <div key={chap} onClick={() => onToggleChapter?.(chap)} className="group flex items-center justify-between py-1 border-b border-white/5 cursor-pointer hover:bg-white/5 px-2 rounded -mx-2 transition-all">
                                 <span className={cn("transition-colors", isDone ? "text-white/20 line-through" : "text-white/60 group-hover:text-white")}>{chap}</span>
                                 {isDone && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                              </div>
                           );
                        })}
                     </motion.div>
                  )}
               </div>
            </div>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="glass-card p-10 rounded-[3rem] border-white/5 space-y-8">
            <h3 className="text-lg font-black uppercase tracking-widest text-white/90 flex items-center gap-2">
               <Activity className="w-5 h-5 text-md-primary" /> Sector Allocation
            </h3>
            <div className="h-64 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={subjectData}
                        cx="50%" cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                     >
                        {subjectData.map((entry, index) => {
                           const sub = allSubjects?.find(s => s.id === entry.name);
                           return <Cell key={`cell-${index}`} fill={sub ? sub.color : '#f97316'} />
                        })}
                     </Pie>
                     <RechartsTooltip contentStyle={{ backgroundColor: '#09090b', borderRadius: '12px', border: 'none' }} />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Primary</p>
                  <p className="text-xl font-display font-black text-white italic truncate max-w-[120px]">{subjectData[0]?.name || 'GENERAL'}</p>
               </div>
            </div>
         </div>

         <div className="glass-card p-10 rounded-[3rem] border-white/5 space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-lg font-black uppercase tracking-widest text-white/90 flex items-center gap-2">
                  <History className="w-5 h-5 text-orange-500" /> Recent Operations
               </h3>
               <button onClick={() => setShowHistory(!showHistory)} className="text-[10px] font-black uppercase text-white/30 hover:text-white transition-colors">
                  {showHistory ? 'View Stats' : 'View All'}
               </button>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
               {sessionLogs.slice(0, 15).map(log => {
                  const subColor = allSubjects.find(s => s.id === log.subject)?.color || 'rgba(255,255,255,0.2)';
                  return (
                     <div key={log.id} className="group p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:border-white/20 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: subColor }} />
                           <div>
                              <p className="text-xs font-black uppercase tracking-widest text-white group-hover:text-md-primary transition-colors">{log.missionTitle || 'Focus Session'}</p>
                              <p className="text-[10px] font-mono text-white/30 uppercase">{new Date(log.timestamp).toLocaleDateString()} • {Math.floor(log.duration / 60)}M</p>
                           </div>
                        </div>
                        {log.completed ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Skull className="w-5 h-5 text-white/10" />}
                     </div>
                  )
               })}
            </div>
         </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, sub: string, icon: any, color: 'orange' | 'red' | 'emerald' | 'amber' }> = ({ label, value, sub, icon: Icon, color }) => {
   const colors = {
      orange: "text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-orange-500/10",
      red: "text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/10",
      emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10",
      amber: "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10",
   };

   return (
      <div className={cn("glass-card p-6 rounded-[2.5rem] border flex flex-col justify-between aspect-square group overflow-hidden relative", colors[color])}>
         <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
         <div className="relative z-10 space-y-1">
            <Icon className="w-5 h-5 mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none">{label}</p>
         </div>
         <div className="relative z-10">
            <h4 className="text-3xl font-display font-black italic tracking-tighter text-white mb-1">{value}</h4>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-30">{sub}</p>
         </div>
      </div>
   );
};
