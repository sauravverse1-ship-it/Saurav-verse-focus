import React, { useState, useEffect } from 'react';
import { Droplets, Volume2 } from 'lucide-react';
import { Howl } from 'howler';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

// Placeholder sound
const waterSound = new Howl({
  src: ['https://actions.google.com/sounds/v1/water/glass_water_pour.ogg'],
  volume: 0.5,
});

export const WaterTracker: React.FC = () => {
    const today = new Date().toISOString().split('T')[0];
    const [glasses, setGlasses] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem(`water_${today}`);
        if(saved) setGlasses(parseInt(saved));
    }, [today]);

    const addGlass = () => {
        if(glasses < 8) {
            const next = glasses + 1;
            setGlasses(next);
            localStorage.setItem(`water_${today}`, next.toString());
            waterSound.play();
        }
    };

    return (
        <div className="glass p-6 rounded-[2rem]">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Water Intake</span>
                </div>
                <span className="text-sm font-black">{glasses} / 8 Glasses</span>
            </div>
            <div className="flex gap-2">
                {Array.from({length: 8}).map((_, i) => (
                    <motion.div 
                        key={i}
                        onClick={addGlass}
                        className={cn("h-12 w-full rounded-b-xl border-b-4 transition-colors cursor-pointer", i < glasses ? "bg-blue-500 border-blue-700" : "bg-white/5 border-white/10")}
                        whileTap={{scale: 0.95}}
                    />
                ))}
            </div>
            <div className="mt-2 text-[10px] opacity-40 uppercase font-medium">{glasses * 250}ml / 2000ml</div>
        </div>
    );
};
