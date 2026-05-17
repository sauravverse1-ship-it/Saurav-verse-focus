import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldAlert, Cpu, HeartPulse, Brain, Target, CalendarDays, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile, Task, Habit, SessionLog } from '../types';
import { getAICoachResponse, getAIHabitSuggestions, getAIProductivityDirectives, callAI } from '../services/geminiService';
import { ChatInput } from './ChatInput';

interface AIAssistantViewProps {
  profile: UserProfile | null;
  tasks: Task[];
  habits: Habit[];
  sessionLogs: SessionLog[];
  onAddTask: (title: string, priority: 'high' | 'medium' | 'low', subject?: string) => void;
  onAddHabit: (title: string, icon: string) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ profile, tasks, habits, sessionLogs, onAddTask, onAddHabit }) => {
  const [messages, setMessages] = useState<{ 
    role: 'user' | 'ai', 
    text: string, 
    tasks?: {title: string, priority: string, subject?: string}[],
    habits?: {title: string, icon: string, description: string}[],
    directives?: string[]
  }[]>([
    { role: 'ai', text: 'Public Safety HQ System Online. I am your devil hunting handler. Submit your query or request a mission plan.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [installedIds, setInstalledIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendToAI = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsTyping(true);

    const context = {
      profile,
      pendingTasks: tasks.filter(t => !t.completed).length,
      habitStreak: habits.reduce((acc, h) => Math.max(acc, h.streak), 0),
      sessionCount: sessionLogs.length
    };

    try {
      const lower = text.toLowerCase();
      // Detect specific triggers
      if (lower.includes('plan') || lower.includes('suggest task') || lower.includes('exam in')) {
        const aiText = await callAI("Generate a study plan as a JSON array of tasks with 'title', 'priority' (high/medium/low), and 'subject'. Provide 3 tasks.", {
          systemInstruction: `You are an AI Study Assistant for a student. Context: ${JSON.stringify(context)}.`,
          responseMimeType: "application/json",
        });
        const parsed = JSON.parse(aiText);
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: "Here is your recommended study plan. Add these to your focus queue:",
          tasks: Array.isArray(parsed) ? parsed : [] 
        }]);
      } else if (lower.includes('review') || lower.includes('sunday')) {
        const aiText = await callAI("Generate a weekly productivity review based on my session data.", {
           systemInstruction: `Analyze this data: ${JSON.stringify(context)}. Be motivating but strict.`
        });
        setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
      } else if (lower.includes('mood') || lower.includes('feeling')) {
        const aiText = await callAI("The user is expressing their mood. Suggest exactly one session length (e.g. 25 min) and subject they should work on, plus a short motivation.", {
           systemInstruction: `Student mood analyzer.`
        });
        setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
      } else {
        // General Q&A / Subject logic via existing getAICoachResponse
        const response = await getAICoachResponse(text, context);
        setMessages(prev => [...prev, { role: 'ai', text: response }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: "Systems overloaded. Let's focus on the basics." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      <div className="p-6 md:p-8 flex items-center gap-4 z-10 shrink-0 border-b border-white/5 bg-surface/50 backdrop-blur-xl">
        <div className="p-3 bg-orange-500/20 rounded-2xl border border-orange-500/30">
          <ShieldAlert className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-black text-white italic tracking-tighter uppercase">Public Safety HQ</h2>
          <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest">Handler AI Terminal</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10">
        <div className="flex gap-2 flex-wrap mb-4">
          <button onClick={() => sendToAI("I have a Physics exam in 3 days. Make a plan.")} className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs rounded-full hover:bg-blue-500/20">
             Smart Task Plan
          </button>
          <button onClick={() => sendToAI("Generate a weekly review for me.")} className="px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs rounded-full hover:bg-purple-500/20">
             Weekly Review
          </button>
          <button onClick={() => sendToAI("I'm feeling a bit tired today.")} className="px-4 py-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs rounded-full hover:bg-orange-500/20">
             Mood Matcher
          </button>
          <button 
             onClick={() => sendToAI("Generate a Psychological Focus Assessment as the character Makima. Analyze my progress data: " + JSON.stringify({ profile, tasks, habits, sessionLogs }) + " and give a cold, dominant directive.")} 
             className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 text-xs rounded-full hover:bg-red-500/20"
          >
             Makima's Directive
          </button>
          <button onClick={() => sendToAI("Explain Newton's Second Law.")} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-full hover:bg-emerald-500/20">
             Subject Q&A
          </button>
        </div>

        {messages.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "max-w-[85%] rounded-3xl p-4 md:p-5",
              m.role === 'ai' ? "self-start bg-surface-variant flex flex-col gap-3" : "self-end bg-md-primary text-md-on-primary ml-auto"
            )}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
            
            {m.tasks && m.tasks.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                {m.tasks.map((task, tIndex) => (
                  <div key={tIndex} className="bg-black/20 p-3 rounded-xl flex items-center justify-between border border-white/5">
                    <div>
                      <span className="font-bold text-sm block">{task.title}</span>
                      <span className="text-[10px] uppercase text-white/50">{task.subject || 'General'} • {task.priority}</span>
                    </div>
                    <button 
                      onClick={() => {
                        onAddTask(task.title, task.priority as any, task.subject);
                        setInstalledIds(prev => [...prev, `task-${tIndex}`]);
                      }}
                      disabled={installedIds.includes(`task-${tIndex}`)}
                      className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border", 
                        installedIds.includes(`task-${tIndex}`) 
                          ? "bg-green-500/20 text-green-400 border-green-500/30" 
                          : "bg-white/10 text-white hover:bg-white/20 border-white/10"
                      )}
                    >
                      {installedIds.includes(`task-${tIndex}`) ? "Added" : "+ Add"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
        {isTyping && (
          <div className="self-start flex gap-1 p-4 bg-surface-variant rounded-3xl w-fit">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:p-6 shrink-0 z-10 border-t border-white/5 bg-surface/80 backdrop-blur-xl">
        <ChatInput onSend={sendToAI} />
      </div>
    </div>
  );
};
