import React, { useState, useEffect } from 'react';
import { Moon } from 'lucide-react';
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
    const color = hours < 6 ? 'text-red-400' : hours < 8 ? 'text-yellow-400' : 'text-green-400';

    return (
        <div className="glass p-6 rounded-[2rem]">
            <div className="flex items-center gap-2 mb-4">
                <Moon className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Sleep Log</span>
            </div>
            <div className="flex gap-4">
                <input type="time" value={sleptAt} onChange={e => setSleptAt(e.target.value)} className="bg-white/5 p-2 rounded-lg text-sm" />
                <input type="time" value={wokeAt} onChange={e => setWokeAt(e.target.value)} className="bg-white/5 p-2 rounded-lg text-sm" />
            </div>
            <div className={cn("text-3xl font-black mt-4", color)}>{hours}h</div>
        </div>
    );
};
