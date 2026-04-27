import React, { useState } from 'react';
import { AppDB, dbSaveImmediate } from '../lib/appDb';
import { cn } from '../lib/utils';
import { gsap } from 'gsap';

export const Timetable = ({ playSound }: any) => {
    const [slots, setSlots] = useState(AppDB.timetable || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    return (
        <>
            <div id="timetable-section" className="mt-5 mb-5 mx-4 bg-black border border-white/8 rounded-xl overflow-hidden shadow-xl">
                <div className="tt-header flex items-center justify-between p-4 border-b border-white/6 bg-black">
                    <div className="tt-header-left flex items-center gap-2">
                        <span className="tt-icon text-base">🕐</span>
                        <span className="tt-title font-mono text-[10px] tracking-widest text-white/40 uppercase">TIMETABLE</span>
                    </div>
                    <button className="tt-new-btn font-mono text-[9px] text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1" onClick={openModal}>+ NEW SLOT</button>
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
        </>
    );
};
