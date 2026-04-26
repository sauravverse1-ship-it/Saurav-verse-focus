import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Droplets, Utensils, Moon, Dumbbell, Smile } from 'lucide-react';
import { WaterTracker } from './WaterTracker';
import { ProteinTracker } from './ProteinTracker';
import { SleepTracker } from './SleepTracker';

export const VitalitySection: React.FC = () => {
    const [expanded, setExpanded] = useState(false);

    return (
        <section className="space-y-4">
            <button onClick={() => setExpanded(!expanded)} className="flex justify-between items-center w-full px-2">
                <h3 className="text-sm font-black uppercase tracking-widest opacity-40">Vitality Base</h3>
                <motion.div animate={{rotate: expanded ? 180 : 0}}><ChevronDown className="w-5 h-5 opacity-40"/></motion.div>
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <WaterTracker />
                        <ProteinTracker />
                        <SleepTracker />
                        <div className="glass p-6 rounded-[2rem] flex flex-col gap-2">
                             <div className="text-xs font-bold uppercase tracking-widest text-orange-400 flex items-center gap-2 mb-2"><Dumbbell className="w-4 h-4"/>Exercise</div>
                             <div className="grid grid-cols-3 gap-2">
                                {['Walk', 'Gym', 'Yoga', 'Sports', 'Stretch'].map(act => (
                                    <button key={act} className="text-[10px] bg-white/5 py-1 px-2 rounded-lg">{act}</button>
                                ))}
                             </div>
                        </div>
                        <div className="glass p-6 rounded-[2rem] flex flex-col gap-2">
                             <div className="text-xs font-bold uppercase tracking-widest text-green-400 flex items-center gap-2 mb-2"><Smile className="w-4 h-4"/>Mood</div>
                             <div className="flex justify-between text-2xl">
                                {['😴', '😟', '😐', '🙂', '⚡'].map(m => <button key={m}>{m}</button>)}
                             </div>
                        </div>
                        <div className="glass p-6 rounded-[2rem] flex flex-col gap-2 md:col-span-2">
                             <div className="text-xs font-bold uppercase tracking-widest text-yellow-400 flex items-center gap-2 mb-2">Supplement Reminders</div>
                             <div className="text-[10px] opacity-40">No reminders added yet.</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {!expanded && (
                <div className="grid grid-cols-3 gap-3">
                    {/* Simplified quick view */}
                    <div className="glass p-4 rounded-[2rem] flex flex-col items-center gap-2"><Droplets className="w-5 h-5 text-blue-400" /></div>
                    <div className="glass p-4 rounded-[2rem] flex flex-col items-center gap-2"><Utensils className="w-5 h-5 text-pink-400" /></div>
                    <div className="glass p-4 rounded-[2rem] flex flex-col items-center gap-2"><Moon className="w-5 h-5 text-purple-400" /></div>
                </div>
            )}
        </section>
    );
};
