import React, { useState, useEffect } from 'react';
import { Moon, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export const SleepTracker: React.FC = () => {
    const [sleptAt, setSleptAt] = useState('22:00');
    const [wokeAt, setWokeAt] = useState('06:00');
    
    const calculateHours = () => {
        const [h1, m1] = sleptAt.split(':').map(Number);
        const [h2, m2] = wokeAt.split(':').map(Number);
        let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (diff < 0) diff += 24 * 60;
        return (diff / 60).toFixed(1);
    };

    const hours = parseFloat(calculateHours());
    const color = hours < 6 ? '#f87171' : hours < 8 ? '#fbbf24' : '#34d399';
    const percentage = Math.min(100, (hours / 10) * 100);

    return (
        <div className="glass p-8 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Moon className="w-24 h-24 text-purple-400" />
            </div>
            
            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-500/20 rounded-xl">
                        <Moon className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Sleep Synchronization</span>
                </div>

                <div className="flex items-end justify-between">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase tracking-widest text-white/30">Target Cycle</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="time" 
                                    value={sleptAt} 
                                    onChange={e => setSleptAt(e.target.value)} 
                                    className="bg-white/5 border border-white/5 px-3 py-2 rounded-xl text-sm font-bold text-white outline-none focus:border-purple-500/50 transition-all" 
                                />
                                <ChevronRight className="w-4 h-4 text-white/20" />
                                <input 
                                    type="time" 
                                    value={wokeAt} 
                                    onChange={e => setWokeAt(e.target.value)} 
                                    className="bg-white/5 border border-white/5 px-3 py-2 rounded-xl text-sm font-bold text-white outline-none focus:border-purple-500/50 transition-all" 
                                />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black italic italic tracking-tighter text-white">{hours}</span>
                            <span className="text-xs font-black uppercase tracking-widest text-white/40 italic">Hours</span>
                        </div>
                    </div>

                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-white/5"
                            />
                            <motion.circle
                                cx="48"
                                cy="48"
                                r="40"
                                fill="transparent"
                                stroke={color}
                                strokeWidth="8"
                                strokeDasharray="251.2"
                                animate={{ strokeDashoffset: 251.2 - (251.2 * percentage) / 100 }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-black" style={{ color }}>{Math.round(percentage)}%</span>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20 mb-2">
                        <span>Restorative State</span>
                        <span>{hours < 7 ? 'DEPRIVATION' : 'OPTIMIZED'}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
