import React, { useState } from 'react';
import { AppDB, dbSaveImmediate } from '../lib/appDb';
import { cn } from '../lib/utils';
import { gsap } from 'gsap';
import { ShieldAlert, Brain, Loader2 } from 'lucide-react';
import { callAIBackend } from '../services/geminiService';

export const Timetable = ({ playSound }: any) => {
    const [slots, setSlots] = useState(AppDB.timetable || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

    const openModal = () => {
        setIsModalOpen(true);
        playSound('tap');
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const saveTTSlot = () => {
        const subject = (document.getElementById('tt-subject') as HTMLInputElement)?.value.trim();
        const start = (document.getElementById('tt-start') as HTMLInputElement)?.value;
        const end = (document.getElementById('tt-end') as HTMLInputElement)?.value;

        if (!subject) return;
        if (!start || !end || start >= end) return;

        const newSlot = {
            id: Date.now(),
            subject,
            emoji: '📚',
            color: '#00ffe0',
            startTime: start,
            endTime: end,
            days: [selectedDayIndex],
            tickLog: [],
            createdAt: new Date().toISOString()
        };

        const updatedSlots = [...AppDB.timetable, newSlot];
        AppDB.timetable = updatedSlots;
        setSlots(updatedSlots);
        dbSaveImmediate();
        closeModal();
        playSound('success');
    };

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        playSound('tap');

        try {
            const rawText = await callAIBackend(`Context: You are an AI study assistant. 
Input Description: "${aiPrompt}"
Objective: Create a structured study/work schedule.
Constraints: 
- Use 24-hour HH:mm format for times.
- Subjects should be specific but concise.
- Output MUST be valid JSON array of objects.
- Schema: [{ "subject": string, "startTime": string, "endTime": string, "emoji": string, "color": string }]
- Colors should be high-contrast hex (e.g. #FF5555, #55FF55).
- Ensure times do not overlap excessively.`, {
                responseMimeType: "application/json",
            });

            let generatedSlots = [];
            try {
                generatedSlots = JSON.parse(rawText || "[]");
            } catch (e) {
                // If it fails, try cleaning possible markdown
                const clean = (rawText || "").replace(/```json|```/g, "").trim();
                generatedSlots = JSON.parse(clean || "[]");
            }
            
            if (!Array.isArray(generatedSlots)) {
                console.error("AI returned non-array response", generatedSlots);
                throw new Error("AI did not return a valid list");
            }
            
            const newSlots = generatedSlots.map((s: any, idx: number) => ({
                id: Date.now() + idx,
                subject: s.subject,
                emoji: s.emoji || '📚',
                color: s.color || '#00ffe0',
                startTime: s.startTime,
                endTime: s.endTime,
                days: [selectedDayIndex],
                tickLog: [],
                createdAt: new Date().toISOString()
            }));

            const updatedSlots = [...AppDB.timetable, ...newSlots];
            AppDB.timetable = updatedSlots;
            setSlots(updatedSlots);
            dbSaveImmediate();
            setIsAIModalOpen(false);
            setAiPrompt('');
            playSound('success');
        } catch (error) {
            console.error("AI Generation failed", error);
            playSound('error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <div id="timetable-section" className="mt-5 mb-5 mx-4 bg-black border border-white/8 rounded-xl overflow-hidden shadow-xl">
                <div className="tt-header flex items-center justify-between p-4 border-b border-white/6 bg-black">
                    <div className="tt-header-left flex items-center gap-2">
                        <span className="tt-icon text-base">🕐</span>
                        <span className="tt-title font-mono text-[10px] tracking-widest text-white/40 uppercase">TIMETABLE</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            className="tt-ai-btn flex items-center gap-1.5 font-mono text-[9px] text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded-full px-3 py-1 hover:bg-orange-400/20 transition-all font-black italic"
                            onClick={() => { setIsAIModalOpen(true); playSound('tap'); }}
                        >
                            <ShieldAlert className="w-3 h-3" />
                            MISSION INTEL
                        </button>
                        <button className="tt-new-btn font-mono text-[9px] text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1" onClick={openModal}>+ NEW SLOT</button>
                    </div>
                </div>
                <div className="tt-day-tabs flex bg-black border-b border-white/5 p-2 gap-1">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
                        <button key={day} className={cn("tt-day-tab flex-1 p-2 text-center font-mono text-[9px] text-white/30 rounded-md uppercase", selectedDayIndex === i && "bg-primary/10 text-primary border border-primary/25")} onClick={() => setSelectedDayIndex(i)}>{day}</button>
                    ))}
                </div>
                <div className="tt-grid bg-black flex flex-col max-h-[420px] overflow-y-auto">
                    {slots.filter(s => s.days.includes(selectedDayIndex)).map(slot => (
                        <div key={slot.id} className="tt-row flex items-center border-b border-white/4 min-h-[52px]">
                            <div className="tt-time-col w-[52px] text-center font-mono text-[9px] text-white/20 border-r border-white/4 p-2">{slot.startTime}</div>
                            <div className="tt-content-col flex-1 p-2 flex items-center gap-2">
                                <div className="tt-slot flex-1 flex items-center gap-2 p-2 rounded-lg border-l-2 bg-white/3" style={{ borderLeftColor: slot.color }}>
                                    <span className="tt-slot-emoji text-base">{slot.emoji}</span>
                                    <div className="tt-slot-info flex-1">
                                        <div className="tt-slot-name font-mono text-[11px] font-bold text-white">{slot.subject}</div>
                                        <div className="tt-slot-time font-mono text-[8px] text-white/30">{slot.startTime} - {slot.endTime}</div>
                                    </div>
                                    <button className="tt-tick-btn w-7 h-7 rounded-full bg-primary/10 border border-primary/20 text-primary">✓</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="bg-neutral-900 border border-white/10 p-6 rounded-3xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="text-white font-black text-lg mb-4">NEW TIME SLOT</div>
                        <div className="flex gap-2 mb-4">
                            <input type="time" id="tt-start" className="bg-neutral-800 p-2 rounded font-mono text-primary w-full" defaultValue="09:00" />
                            <input type="time" id="tt-end" className="bg-neutral-800 p-2 rounded font-mono text-primary w-full" defaultValue="10:00" />
                        </div>
                        <input id="tt-subject" type="text" className="bg-neutral-800 p-2 rounded font-mono text-white w-full mb-4" placeholder="Subject..." />
                        <div className="flex justify-end gap-2">
                            <button className="bg-neutral-800 text-white px-4 py-2 rounded-full font-mono text-xs" onClick={closeModal}>Cancel</button>
                            <button className="bg-primary text-black px-4 py-2 rounded-full font-mono text-xs" onClick={saveTTSlot}>Add Slot</button>
                        </div>
                    </div>
                </div>
            )}

            {isAIModalOpen && (
                <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-4" onClick={() => !isGenerating && setIsAIModalOpen(false)}>
                    <div className="bg-neutral-900 border border-orange-500/30 p-6 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(249,115,22,0.1)]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-5 h-5 text-orange-400" />
                            <div className="text-white font-black text-lg uppercase tracking-tight">AI TIMETABLE MAGIC</div>
                        </div>
                        <p className="text-[10px] text-white/40 mb-4 font-mono uppercase tracking-widest">Describe your day and I'll form your schedule.</p>
                        
                        <textarea 
                            className="w-full h-32 bg-neutral-800 border border-white/5 rounded-2xl p-4 text-white text-sm font-mono focus:border-orange-500/50 outline-none transition-all resize-none mb-4"
                            placeholder="e.g. My school starts at 8 AM and ends at 2 PM. Then I go to the gym from 4 to 5:30. I study physics from 7 to 9 PM."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            disabled={isGenerating}
                        />

                        <div className="flex justify-end gap-2">
                            <button 
                                className="bg-neutral-800 text-white px-4 py-2 rounded-full font-mono text-xs disabled:opacity-50" 
                                onClick={() => setIsAIModalOpen(false)}
                                disabled={isGenerating}
                            >
                                Cancel
                            </button>
                            <button 
                                className="bg-orange-500 text-white px-6 py-2 rounded-full font-mono text-xs flex items-center gap-2 disabled:bg-orange-500/50"
                                onClick={handleAIGenerate}
                                disabled={isGenerating || aiPrompt.length < 5}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        GENERATING...
                                    </>
                                ) : (
                                    'GENERATE NOW'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
