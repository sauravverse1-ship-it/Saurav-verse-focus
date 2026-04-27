import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TiltCard } from '../CinematicLayout';

type Exam = {
    id: string;
    name: string;
    session: string;
    date: Date;
    color: string;
    subjects: string[];
    tagline?: string;
};

const INITIAL_EXAMS: Exam[] = [
    { id: 'jm1', name: 'JEE', session: 'Mains Session 1', date: new Date('2027-01-24'), color: 'blue', subjects: ['Physics', 'Chem', 'Math'] },
    { id: 'jm2', name: 'JEE', session: 'Mains Session 2', date: new Date('2027-04-10'), color: 'cyan', subjects: ['Physics', 'Chem', 'Math'] },
    { id: 'ja', name: 'JEE', session: 'Advanced', date: new Date('2027-05-25'), color: 'amber', subjects: ['Physics', 'Chem', 'Math'], tagline: 'The final frontier' },
    { id: 'neet', name: 'NEET', session: '2027', date: new Date('2027-05-03'), color: 'emerald', subjects: ['Biology', 'Physics', 'Chem'], tagline: 'Future Doctor Mission' },
];

export const ExamCard: React.FC<{ preference: 'JEE' | 'NEET' | 'None', onNavigateToTasks: () => void }> = ({ preference, onNavigateToTasks }) => {
    const exams = INITIAL_EXAMS.filter(e => preference === 'None' ? true : e.name === preference);
    const [expandedId, setExpandedId] = useState<string | null>(exams[0]?.id || null);

    if (preference === 'None') return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map(exam => (
                <ExamWidget key={exam.id} exam={exam} isExpanded={expandedId === exam.id} onToggle={() => setExpandedId(expandedId === exam.id ? null : exam.id)} onNavigateToTasks={onNavigateToTasks} />
            ))}
        </div>
    );
};

const ExamWidget: React.FC<{ exam: Exam, isExpanded: boolean, onToggle: () => void, onNavigateToTasks: () => void }> = ({ exam, isExpanded, onToggle, onNavigateToTasks }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const diff = exam.date.getTime() - now.getTime();
            
            if (diff <= 0) {
                setIsCompleted(true);
                clearInterval(timer);
                return;
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / 1000 / 60) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [exam.date]);

    if (isCompleted) {
        return (
            <div className="glass p-6 rounded-[2rem] flex flex-col items-center justify-center border-2 border-yellow-500/50">
                <Trophy className="w-12 h-12 text-yellow-500 mb-2" />
                <span className="font-black">COMPLETED</span>
            </div>
        );
    }

    return (
        <motion.div layout onClick={onToggle} className="cursor-pointer">
            <TiltCard intensity={10} className="w-full">
                <div className={cn("glass p-6 rounded-[2rem] border transition-all", isExpanded ? "border-primary" : "border-white/5")}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="font-black text-lg">{exam.name}</h4>
                            <span className={cn("text-[10px] font-bold uppercase", `text-${exam.color}-400`)}>{exam.session}</span>
                        </div>
                        <div className="flex gap-1">
                            {exam.subjects.map(s => <span key={s} className="text-[8px] bg-white/10 px-2 py-1 rounded-full uppercase">{s[0]}</span>)}
                        </div>
                    </div>

                    <div className="text-4xl font-black mb-4">{timeLeft.days} DAYS</div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs opacity-60 font-mono mb-4">
                        <div>{String(timeLeft.hours).padStart(2, '0')}h</div>
                        <div>{String(timeLeft.minutes).padStart(2, '0')}m</div>
                        <div>{String(timeLeft.seconds).padStart(2, '0')}s</div>
                    </div>
                     
                    {exam.tagline && isExpanded && (
                        <p className="text-[10px] italic opacity-50 mt-2 mb-4 text-center">"{exam.tagline}"</p>
                    )}
                    
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-sm pt-4 border-t border-white/5 space-y-3">
                                <div>
                                    <h5 className="font-bold mb-2">Suggested Focus:</h5>
                                    <ul className="text-[11px] opacity-70 list-disc list-inside space-y-1">
                                        {exam.subjects.map(s => <li key={s}>{s}: Review core concepts</li>)}
                                    </ul>
                                </div>
                                <button onClick={onNavigateToTasks} className="text-primary font-bold text-xs uppercase underline w-full text-left">Go to Tasks →</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </TiltCard>
        </motion.div>
    );
};
