import React, { useState, useEffect } from 'react';
import { Utensils, Plus } from 'lucide-react';
import { motion } from 'motion/react';

const FOODS = [
    { name: 'Eggs', protein: 6 },
    { name: 'Chicken', protein: 25 },
    { name: 'Milk', protein: 8 },
    { name: 'Whey', protein: 20 },
    { name: 'Dal', protein: 7 },
    { name: 'Paneer', protein: 18 },
    { name: 'Curd', protein: 5 },
    { name: 'Almonds', protein: 6 },
];

export const ProteinTracker: React.FC = () => {
    const [protein, setProtein] = useState(0);
    const [goal] = useState(150);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const saved = localStorage.getItem(`protein_${today}`);
        if(saved) setProtein(parseInt(saved));
    }, [today]);

    const addProtein = (amount: number) => {
        const next = protein + amount;
        setProtein(next);
        localStorage.setItem(`protein_${today}`, next.toString());
    };

    const progress = Math.min((protein / goal) * 100, 100);

    return (
        <div className="glass p-6 rounded-[2rem] flex flex-col items-center">
            <div className="text-xs font-bold uppercase tracking-widest text-pink-400 mb-2 flex items-center gap-2"><Utensils className="w-4 h-4"/>Protein Intake</div>
            <div className="relative w-24 h-24 mb-4">
                <svg className="w-full h-full -rotate-90">
                    <circle cx="48" cy="48" r="40" className="stroke-white/10" strokeWidth="8" fill="none" />
                    <circle cx="48" cy="48" r="40" className="stroke-pink-400" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset={251 - (251 * progress / 100)} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-black">{protein}</span>
                    <span className="text-[10px] opacity-40 uppercase">/ {goal}g</span>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-2 w-full">
                {FOODS.map(f => (
                    <button key={f.name} onClick={() => addProtein(f.protein)} className="text-[10px] bg-white/5 p-2 rounded-lg hover:bg-pink-500/10">
                        {f.name}
                    </button>
                ))}
            </div>
        </div>
    );
};
