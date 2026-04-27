import React, { useState, useEffect } from 'react';
import { AppDB, dbSave } from '../lib/appDb';
import { Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, startOfWeek, addDays } from 'date-fns';

export const WeeklyPlanner = ({ awardXP, playSound }: any) => {
    const [selectedDay, setSelectedDay] = useState(new Date().toDateString());
    const [tasks, setTasks] = useState(AppDB.weeklyTasks[selectedDay] || []);
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        setTasks(AppDB.weeklyTasks[selectedDay] || []);
    }, [selectedDay]);

    const addWPTask = () => {
        if (!newTask.trim()) return;
        const task = { id: Date.now(), text: newTask, done: false, xpAwarded: false };
        if (!AppDB.weeklyTasks[selectedDay]) AppDB.weeklyTasks[selectedDay] = [];
        AppDB.weeklyTasks[selectedDay].push(task);
        dbSave();
        setNewTask('');
        setTasks([...AppDB.weeklyTasks[selectedDay]]);
    };

    const completeWPTask = (id: number) => {
        const task = AppDB.weeklyTasks[selectedDay].find((t: any) => t.id === id);
        if (!task || task.done) return;
        task.done = true;
        if (!task.xpAwarded) {
            task.xpAwarded = true;
            awardXP(20, 'TASK DONE ✓');
            playSound('success');
        }
        dbSave();
        setTasks([...AppDB.weeklyTasks[selectedDay]]);
    };

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(new Date()), i));

    return (
        <div id="weekly-planner">
            <div className="wp-header">
                <span className="wp-title">WEEKLY PLANNER</span>
            </div>
            <div className="wp-day-strip">
                {weekDays.map(d => {
                    const key = d.toDateString();
                    return <button key={key} className={cn("wp-day-pill", selectedDay===key && "active")} onClick={() => setSelectedDay(key)}>
                        <div className="wp-day-name">{format(d, 'EEE')}</div>
                        <div className="wp-day-num">{d.getDate()}</div>
                    </button>;
                })}
            </div>
            <div className="wp-task-list">
                {tasks.map((task: any) => (
                    <div key={task.id} className={cn("wp-task-item", task.done && "done")} onClick={() => completeWPTask(task.id)}>
                        <div className={cn("wp-check", task.done && "done")}></div>
                        <span className="wp-task-text">{task.text}</span>
                    </div>
                ))}
            </div>
            <div className="wp-add-row">
                <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add task..." />
                <button onClick={addWPTask}><Plus /></button>
            </div>
        </div>
    );
};
