import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User, signOut, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, onSnapshot, addDoc, updateDoc, increment, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, CheckCircle, Home, Timer, BarChart2, User as UserIcon, 
  Plus, Settings, Volume2, VolumeX, Maximize2, Minimize2, Award, Zap, 
  CloudRain, Coffee, Wind, LogOut, BookOpen, Heart, Activity, Calendar, 
  Trash2, Edit, ChevronRight, Hash, Clock, Brain, Target, Flame, Sparkles, MessageSquare, Battery, Droplets, Moon, Utensils, ShieldCheck, ThumbsUp, ThumbsDown, SkipForward, Star, Music, AlertCircle
} from 'lucide-react';
import { getAICoachResponse, getAIQuote, getAIHabitSuggestions } from './services/geminiService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTranslation } from 'react-i18next';
import './i18n';
import firebaseConfig from '../firebase-applet-config.json';
import { Howl } from 'howler';
import { HeroSection, StorySection } from './components/CinematicSections';
import { HabitsSection } from './components/HabitsSection';
import { DeveloperSection } from './components/DeveloperSection';
import { TiltCard, MagneticButton } from './components/CinematicLayout';
import { CustomCursor } from './components/CustomCursor';
import { ChatInput } from './components/ChatInput';
import { HabitHeatMap, HabitStreakInfo } from './components/HabitStats';
import { AddTaskModal } from './components/AddTaskModal';
import { AddHabitModal } from './components/AddHabitModal';
import { AdaptiveWidgetGrid } from './components/AdaptiveWidgets';
import { RankUpCeremony, AchievementUnlock, XPLabel, ComboDisplay, ConfettiCanvas, launchConfetti, LegendText, TickingNumber } from './components/GamificationOverlay';
import { useGamification } from './lib/useGamification';
import { getRank, getXPProgress, getDailyChallenges, ACHIEVEMENTS } from './lib/gamification';
import { StreakWidget, ChallengesWidget, AchievementsModal } from './components/GamificationWidgets';
import { playTick, playWhoosh, playBell } from './lib/audio';
import { cn } from './lib/utils';
import { UserProfile, Task, Habit, FocusSession } from './types';

// --- Firebase Init ---
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Constants moved to types.ts or used directly


// --- Constants ---
const XP_PER_POMODORO = 15;
const XP_PER_HABIT = 5;
const STREAK_THRESHOLD = 4;

const CATEGORIES = {
  study: {
    label: 'Study',
    icon: 'BookOpen',
    gradient: 'from-blue-500 to-indigo-600',
    light: 'bg-blue-50 text-blue-600 border-blue-100',
    subtle: 'bg-blue-50/50'
  },
  personal: {
    label: 'Personal',
    icon: 'User',
    gradient: 'from-emerald-500 to-teal-600',
    light: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    subtle: 'bg-emerald-50/50'
  },
  health: {
    label: 'Health',
    icon: 'Heart',
    gradient: 'from-rose-500 to-pink-600',
    light: 'bg-rose-50 text-rose-600 border-rose-100',
    subtle: 'bg-rose-50/50'
  }
};

// --- Ambient Sounds ---
interface AmbientTrack {
  id: string;
  label: string;
  category: 'nature' | 'focus' | 'atmosphere';
  icon: string;
  url: string;
}

const AMBIENT_CATEGORIES = [
  { id: 'nature', label: 'Nature', icon: 'CloudRain' },
  { id: 'focus', label: 'Focus', icon: 'Brain' },
  { id: 'atmosphere', label: 'Atmosphere', icon: 'Music' }
];

const AMBIENT_DATA: AmbientTrack[] = [
  { id: 'rain', label: 'Rainfall', category: 'nature', icon: 'CloudRain', url: 'https://actions.google.com/sounds/v1/water/rain_on_roof.ogg' },
  { id: 'forest', label: 'Forest', category: 'nature', icon: 'Activity', url: 'https://actions.google.com/sounds/v1/ambiences/morning_forest.ogg' },
  { id: 'ocean', label: 'Waves', category: 'nature', icon: 'Droplets', url: 'https://actions.google.com/sounds/v1/water/waves_clashing.ogg' },
  { id: 'stream', label: 'Stream', category: 'nature', icon: 'Droplets', url: 'https://actions.google.com/sounds/v1/water/mountain_stream.ogg' },
  { id: 'birds', label: 'Birds', category: 'nature', icon: 'Activity', url: 'https://actions.google.com/sounds/v1/ambiences/morning_forest.ogg' },
  { id: 'lofi', label: 'Lofi Cafe', category: 'atmosphere', icon: 'Coffee', url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg' },
  { id: 'jazz', label: 'Jazz Bar', category: 'atmosphere', icon: 'Music', url: 'https://actions.google.com/sounds/v1/ambiences/quiet_restaurant.ogg' },
  { id: 'study', label: 'Industrial', category: 'focus', icon: 'Hash', url: 'https://actions.google.com/sounds/v1/ambiences/industrial_hum_loop.ogg' },
  { id: 'white', label: 'White Noise', category: 'focus', icon: 'Wind', url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg' },
  { id: 'cyberpunk', label: 'Synth Hum', category: 'atmosphere', icon: 'Zap', url: 'https://actions.google.com/sounds/v1/science_fiction/teleport_beam.ogg' },
];

const AMBIENT_TRACKS = AMBIENT_DATA.reduce((acc, track) => {
  acc[track.id] = track.url;
  return acc;
}, {} as Record<string, string>);

// --- Components ---

const XPBar = ({ profile }: { profile: UserProfile | null }) => {
  if (!profile) return null;
  const rank = getRank(profile.xp);
  const { currentXP, nextLevelXP, progress } = getXPProgress(profile.xp);

  return (
    <div className="w-full px-2 py-4 space-y-2 mt-auto">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">{rank.icon}</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono leading-none tracking-tighter opacity-50 uppercase">Current Rank</span>
            <span className="font-display text-sm uppercase text-white leading-tight">
              {rank.id === 'legend' ? <LegendText text={rank.name} className="text-sm" /> : rank.name}
            </span>
          </div>
        </div>
        <span className="font-mono text-[10px] opacity-60"><TickingNumber value={Math.round(progress)} />%</span>
      </div>
      
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative group">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={cn("h-full relative z-10", rank.id === 'legend' ? 'animate-hue-rotate' : '')}
          style={{ background: rank.id === 'legend' ? 'linear-gradient(90deg, #7b5fe8, #00ffe0, #ff4060, #d4a843)' : rank.color }}
        />
        <div className="absolute inset-0 bg-white/5 blur-[2px]" />
      </div>
      
      <div className="flex justify-between items-center px-1">
        <span className="text-[9px] font-mono opacity-40"><TickingNumber value={currentXP} /> XP</span>
        <span className="text-[9px] font-mono opacity-40"><TickingNumber value={nextLevelXP} /> XP</span>
      </div>
    </div>
  );
};

const Button = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={cn("material-button-primary", className)} {...props}>
    {children}
  </button>
);

const NavButton = ({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) => (
  <button 
    onClick={() => { playTick(); onClick(); }}
    onMouseEnter={playTick}
    className={cn(
      "group relative flex items-center md:flex-row flex-col gap-1 md:gap-4 md:w-full md:px-4 md:py-3 transition-all duration-300 h-16 md:h-auto justify-center md:justify-start px-2",
      "md:w-full"
    )}
  >
    <div className={cn(
      "relative z-10 w-12 h-8 md:w-16 md:h-10 flex items-center justify-center rounded-full transition-all duration-300 nav-icon-wrap",
      active ? "bg-md-primary-container text-md-primary" : "text-md-on-surface-variant group-hover:text-white"
    )}>
      {active && (
        <motion.div 
          layoutId="nav-pill-bg"
          className="absolute inset-0 bg-md-primary-container rounded-full shadow-[0_0_20px_rgba(0,255,224,0.2)] -z-10"
        />
      )}
      <Icon className={cn("w-5 h-5 transition-transform duration-300", active && "scale-110 drop-shadow-[0_0_10px_var(--md-primary)]")} strokeWidth={active ? 2.5 : 2} />
    </div>
    <span className={cn(
      "text-[8px] md:text-sm font-mono uppercase tracking-[0.1em] font-bold transition-all duration-300 whitespace-nowrap",
      active ? "text-white opacity-100" : "text-md-on-surface-variant md:opacity-60 md:group-hover:opacity-100 opacity-60"
    )}>
      {label}
    </span>
  </button>
);

export default function App() {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState<'cinematic' | 'dashboard'>('cinematic');

  const handleDashboardTransition = () => {
    playWhoosh();
    setView('dashboard');
  };

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'timer' | 'stats' | 'profile' | 'developer'>('home');
  const [loading, setLoading] = useState(true);

  // AI Coach State
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [coachMessages, setCoachMessages] = useState<{ role: 'user' | 'ai', text: string, habitSuggestions?: {title: string, icon: string, description: string}[] }[]>([
    { role: 'ai', text: 'Quantum systems initialized. Ready to grind? I have analyzed your schedule for JEE 2026.' }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  const [dailyQuote, setDailyQuote] = useState('');
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);

  useEffect(() => {
    async function fetchQuote() {
      setIsQuoteLoading(true);
      const quote = await getAIQuote();
      setDailyQuote(quote);
      setIsQuoteLoading(false);
    }
    fetchQuote();
  }, []);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(50 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'study' | 'shortBreak' | 'longBreak'>('study');
  const [sessionCount, setSessionCount] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [dailyGoalMins, setDailyGoalMins] = useState(120);
  const [totalFocusToday, setTotalFocusToday] = useState(0);
  const [isPlayingTick, setIsPlayingTick] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [addTaskCategory, setAddTaskCategory] = useState<'study' | 'health' | 'personal'>('study');
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
  const [streakAchieved, setStreakAchieved] = useState<number | null>(null);
  const [taskSortKey, setTaskSortKey] = useState<'deadline' | 'priority' | 'urgent'>('priority');
  const [sessionIntention, setSessionIntention] = useState("");
  const [showIntentionInput, setShowIntentionInput] = useState(false);
  const [distractions, setDistractions] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [focusScore, setFocusScore] = useState<number | null>(null);
  const [breakActivity, setBreakActivity] = useState<string>("");

  const { 
    xpLabels, 
    awardXP, 
    rankUp, 
    setRankUp, 
    unlockedAchievement, 
    setUnlockedAchievement, 
    combo,
    awardBonus 
  } = useGamification(profile, setProfile);

  const [showAchievements, setShowAchievements] = useState(false);

  const openAddTaskModal = (cat: 'study' | 'health' | 'personal' = 'study') => {
    setAddTaskCategory(cat);
    setIsAddTaskModalOpen(true);
  };
  const [ambientSound, setAmbientSound] = useState<string>('none');
  const [ambientVolume, setAmbientVolume] = useState(0.5);
  const [activeAmbientCategory, setActiveAmbientCategory] = useState<string>('nature');
  const soundRef = useRef<Howl | null>(null);

  // --- Auth & Data Sync ---
  useEffect(() => {
    let unsubTasks: () => void = () => {};
    let unsubHabits: () => void = () => {};

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      console.log("Auth state changed:", u?.uid || "null");
      if (u) {
        setUser(u);
        // Sync Profile
        try {
          const userDoc = doc(db, 'users', u.uid);
          const snap = await getDoc(userDoc);
          if (snap.exists()) {
            console.log("Profile found:", snap.id);
            const data = snap.data() as UserProfile;
            const today = new Date().toISOString().split('T')[0];
            
            // Remove the specific annoying photo if it's set as DP
            const annoyingPhotoURL = 'https://storage.googleapis.com/bit-p-storage-v1-production-09c0/865131783853/ais-attachments/8b4952d7-9ea8-4b72-9721-e37604f86d63/1745589410141.png';
            if (data.photoURL === annoyingPhotoURL) {
              const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`;
              await updateDoc(userDoc, { photoURL: newAvatar });
              data.photoURL = newAvatar;
            }

            if (data.lastActiveDate !== today) {
              const newChallenges = getDailyChallenges(today);
              await updateDoc(userDoc, { 
                dailyChallenges: newChallenges,
                lastActiveDate: today 
              });
              data.dailyChallenges = newChallenges;
              data.lastActiveDate = today;
            }
            setProfile(data);
          } else {
            console.log("Creating new profile for:", u.uid);
            const newProfile: UserProfile = {
              uid: u.uid,
              displayName: u.isAnonymous ? 'Guest User' : (u.displayName || 'User'),
              photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`,
              xp: 0,
              level: 1,
              streak: 0,
              rank: 'Novice',
              allTimeXP: 0,
              unlockedAchievements: [],
              dailyChallenges: getDailyChallenges(new Date().toISOString().split('T')[0]),
              streakShields: 0,
              lastActiveDate: new Date().toISOString().split('T')[0],
              totalFocusTime: 0,
              pomodorosCompleted: 0,
              health: {
                water: 0,
                protein: 0,
                sleep: 0,
              },
              skills: {
                focus: 0,
                discipline: 0,
                consistency: 0,
              },
              jee: {
                targetAIR: 100,
                weakChapters: [],
                strongChapters: []
              },
              settings: {
                workDuration: 50,
                breakDuration: 10,
                ambientSound: 'none',
                notificationSound: 'default',
                autoStartNextSession: false
              }
            };
            await setDoc(userDoc, newProfile);
            setProfile(newProfile);
          }

          // Sync Tasks
          console.log("Syncing tasks...");
          const q = query(collection(db, 'users', u.uid, 'tasks'), orderBy('createdAt', 'desc'));
          unsubTasks = onSnapshot(q, (s) => {
            setTasks(s.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
          });

          // Sync Habits
          console.log("Syncing habits...");
          const hQ = query(collection(db, 'users', u.uid, 'habits'), orderBy('createdAt', 'desc'));
          unsubHabits = onSnapshot(hQ, (s) => {
            setHabits(s.docs.map(d => ({ id: d.id, ...d.data() } as Habit)));
          });
        } catch (err) {
          console.error("Data sync error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      unsubTasks();
      unsubHabits();
    };
  }, []);

  // --- Timer Logic ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Ambient Sound Logic
  useEffect(() => {
    let sound: Howl | null = null;
    if (ambientSound !== 'none') {
      sound = new Howl({
        src: [AMBIENT_TRACKS[ambientSound]],
        loop: true,
        volume: ambientVolume,
        html5: true,
        onplayerror: () => {
          sound?.once('unlock', () => sound?.play());
        }
      });
      sound.play();
      soundRef.current = sound;
    }
    return () => {
      sound?.stop();
      sound?.unload();
    };
  }, [ambientSound]);

  // Update volume in real-time
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(ambientVolume);
    }
  }, [ambientVolume]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    const score = calculateFocusScore();
    setFocusScore(score);
    
    if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
    if (profile?.settings?.notificationSound === 'bell') {
      playBell();
    } else if (profile?.settings?.notificationSound !== 'none') {
      playWhoosh(); // default
    }
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Saurav Focus Engine', {
        body: mode === 'study' ? '🎯 Focus session complete! Time to recharge.' : '⚡ Break over. Ready to dominate.',
      });
    }

    try {
      if (mode === 'study') {
        // Suggest activity based on stats
        const water = profile?.health?.water || 0;
        const sleep = profile?.health?.sleep || 0;
        if (water < 8) setBreakActivity("Hydration Low! Drink 500ml water.");
        else if (sleep < 6) setBreakActivity("Fatigue Alert! Try a 15-min power nap.");
        else setBreakActivity("Focus high! Do 10 pushups to keep blood flowing.");

        const xpEarned = 100 + (score * 2);
        await awardXP(xpEarned, 'focus', score > 90 ? 'FLAWLESS FOCUS' : 'SESSION COMPLETE');
        launchConfetti({ origin: { x: 0.5, y: 0.4 }, count: 60 });

        const focusDuration = profile?.settings?.workDuration || 50;
        setTotalFocusToday(prev => prev + focusDuration);
        setSessionCount(prev => prev + 1);

        if (user && profile) {
          const newFocus = (profile.skills?.focus || 0) + 2;
          const newCons = (profile.skills?.consistency || 0) + 1;

          const userDoc = doc(db, 'users', user.uid);
          await updateDoc(userDoc, {
            pomodorosCompleted: increment(1),
            totalFocusTime: increment(focusDuration),
            'skills.focus': newFocus,
            'skills.consistency': newCons
          });

          await addDoc(collection(db, 'users', user.uid, 'sessions'), {
            userId: user.uid,
            taskId: selectedTaskId,
            duration: focusDuration,
            timestamp: Date.now(),
            xpEarned: xpEarned
          });

          if (selectedTaskId) {
            const taskDoc = doc(db, 'users', user.uid, 'tasks', selectedTaskId);
            await updateDoc(taskDoc, { sessions: increment(1) });
          }
        }

        // Check if Long Break or Short Break
        if ((sessionCount + 1) % 4 === 0) {
          setMode('longBreak');
          setTimeLeft((profile?.settings?.breakDuration || 15) * 60 + 5 * 60); // Long break default 15+5
        } else {
          setMode('shortBreak');
          setTimeLeft((profile?.settings?.breakDuration || 5) * 60);
        }

      } else {
        // Break Completed
        if (mode === 'longBreak') {
          setCycleCount(prev => prev + 1);
          setSessionCount(0);
        }

        setMode('study');
        setTimeLeft(profile?.settings?.workDuration ? profile.settings.workDuration * 60 : 50 * 60);
        
        if (user && profile) {
          const userDoc = doc(db, 'users', user.uid);
          await updateDoc(userDoc, {
            'skills.discipline': (profile.skills?.discipline || 0) + 2
          });
        }
      }
    } catch (error) {
      console.error("Timer completion updates failed:", error);
    } finally {
      if (profile?.settings?.autoStartNextSession) {
        // Ensure state is updated before starting
        setTimeout(() => setIsRunning(true), 500);
      }
    }
  };

  const toggleTimer = () => {
    if (!isRunning) {
      if (mode === 'study' && !sessionIntention && !isFocusMode) {
        setShowIntentionInput(true);
        return;
      }
      setSessionStartTime(Date.now());
      setIsRunning(true);
      playTick();
    } else {
      setIsRunning(false);
      playTick();
    }
  };

  const logDistraction = () => {
    setDistractions(prev => prev + 1);
    if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const calculateFocusScore = () => {
    if (!sessionStartTime) return 0;
    const durationMinutes = (Date.now() - sessionStartTime) / (1000 * 60);
    const expectedMinutes = mode === 'study' ? (profile?.settings?.workDuration || 50) : (profile?.settings?.breakDuration || 10);
    const timeRatio = Math.min(durationMinutes / expectedMinutes, 1);
    const score = Math.max(0, Math.round((timeRatio * 100) - (distractions * 5)));
    return score;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'study' ? (profile?.settings?.workDuration || 50) * 60 : (profile?.settings?.breakDuration || 10) * 60);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      } else if (e.code === 'KeyS') {
        // Only trigger Skip on 's' press
        handleTimerComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, mode, selectedTaskId, tasks, profile]);

  // --- Task Actions ---
  const addTask = async (title: string, category: 'study' | 'personal' | 'health' = 'study', urgent: boolean = false, sessions: number = 1) => {
    if (!user || !title.trim()) return;
    await addDoc(collection(db, 'users', user.uid, 'tasks'), {
      userId: user.uid,
      title,
      description: '',
      completed: false,
      urgent,
      sessions: 0,
      expectedSessions: sessions,
      category,
      priority: urgent ? 'high' : 'medium',
      createdAt: Date.now()
    });
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    const taskDoc = doc(db, 'users', user.uid, 'tasks', taskId);
    await deleteDoc(taskDoc);
    if (selectedTaskId === taskId) setSelectedTaskId(null);
  };

  const toggleTask = async (task: Task) => {
    if (!user) return;
    const taskDoc = doc(db, 'users', user.uid, 'tasks', task.id);
    await updateDoc(taskDoc, { completed: !task.completed });
    // Award XP
    if (!task.completed) {
      awardXP(15, 'tasks', 'OBJECTIVE SECURED');
      launchConfetti({ origin: { x: 0.5, y: 0.2 }, count: 30 });
    }
  };

  // --- Habit Actions ---
  const addHabit = async (title: string, icon: string = 'Zap') => {
    if (!user || !title.trim()) return;
    await addDoc(collection(db, 'users', user.uid, 'habits'), {
      userId: user.uid,
      title,
      description: '',
      icon,
      streak: 0,
      streakBest: 0,
      completedDates: [],
      createdAt: Date.now()
    });
  };

  const toggleHabit = async (habit: Habit) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const completedDates = habit.completedDates || [];
    const isCompleted = completedDates.includes(today);
    const habitDoc = doc(db, 'users', user.uid, 'habits', habit.id);

    if (isCompleted) {
      const newDates = completedDates.filter(d => d !== today);
      await updateDoc(habitDoc, { completedDates: newDates });
    } else {
      const newDates = [...completedDates, today];
      
      // Calculate streak (simple version)
      let currentStreak = 1;
      const sortedDates = [...newDates].sort((a, b) => b.localeCompare(a));
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const d1 = new Date(sortedDates[i]);
        const d2 = new Date(sortedDates[i+1]);
        const diff = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
        if (diff === 1) currentStreak++;
        else break;
      }

      await updateDoc(habitDoc, { 
        completedDates: newDates,
        streak: currentStreak,
        streakBest: Math.max(habit.streakBest || 0, currentStreak)
      });
      
      // Bonus XP for milestones
      let bonusXp = 0;
      if (currentStreak % 7 === 0) bonusXp += 50; // Bonus every week
      if (currentStreak === 30) bonusXp += 200;
      
      const newBest = currentStreak > (habit.streakBest || 0);
      if (newBest && currentStreak >= 3) {
         setStreakAchieved(currentStreak);
         setTimeout(() => setStreakAchieved(null), 3000);
      }

      // Award XP
      const labels = ['PROTOCOL SECURED', 'HABIT MARKED', 'CONSISTENCY +1'];
      const randomLabel = labels[Math.floor(Math.random() * labels.length)];
      awardXP(20, 'habits', bonusXp > 0 ? 'STREAK BONUS' : randomLabel);
      if (bonusXp > 0) {
        launchConfetti({ count: 50 });
      }
    }
  };

  // --- AI Coach Logic ---
  const sendToCoach = async (message: string) => {
    if (!user || !message.trim()) return;
    setCoachMessages(prev => [...prev, { role: 'user', text: message }]);
    setIsAiTyping(true);

    const context = {
      profile,
      pendingTasks: tasks.filter(t => !t.completed).length,
      habitStreak: habits.reduce((acc, h) => Math.max(acc, h.streak), 0)
    };

    const response = await getAICoachResponse(message, context);
    
    // Check if the user is asking for suggestions
    let habitSuggestions = undefined;
    if (message.toLowerCase().includes('habit') || message.toLowerCase().includes('suggest')) {
      habitSuggestions = await getAIHabitSuggestions(context);
    }

    setCoachMessages(prev => [...prev, { role: 'ai', text: response || '', habitSuggestions }]);
    setIsAiTyping(false);
  };

  // --- Health Actions ---
  const logHealth = async (type: 'water' | 'protein' | 'sleep', value: number) => {
    if (!user || !profile) return;
    const userDoc = doc(db, 'users', user.uid);
    const currentValue = profile.health?.[type] || 0;
    await updateDoc(userDoc, {
      [`health.${type}`]: currentValue + value,
      xp: increment(2)
    });
  };

  const getEnergyScore = () => {
    if (!profile) return 0;
    const { water, protein, sleep } = profile.health || { water: 0, protein: 0, sleep: 0 };
    // Normalized scores
    const wS = Math.min(100, ((water || 0) / 15) * 100); // 15 glasses
    const pS = Math.min(100, ((protein || 0) / 100) * 100); // 100g
    const sS = Math.min(100, ((sleep || 0) / 7) * 100); // 7 hours
    return Math.floor((wS + pS + sS) / 3);
  };

  // --- Render Helpers ---
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-16 h-16 bg-primary rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-white/10"
      >
        <Zap className="w-8 h-8 text-white fill-white" />
      </motion.div>
      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="text-primary font-mono text-[10px] uppercase tracking-[0.4em] font-black animate-pulse">
          Quantum Initializing
        </p>
        <div className="h-0.5 w-40 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="h-full w-1/2 bg-primary"
          />
        </div>
      </div>
    </div>
  );

  if (!user && view === 'dashboard') return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-10 max-w-md w-full"
      >
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/30">
          <Zap className="w-10 h-10 text-white fill-white" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-wider text-white uppercase italic">Quantum</h1>
          <p className="text-zinc-400 text-sm leading-relaxed px-4">
            The ultimate productivity companion for JEE aspirants.
          </p>
        </div>
        
        <div className="space-y-4 pt-4">
          <button 
            onClick={() => signInWithPopup(auth, googleProvider).catch(e => {
               console.error("Popup failed, trying redirect or anonymous", e);
               signInAnonymously(auth).catch((anonErr) => {
                 alert("Authentication failed. Please open the app in a new tab to use Google Sign-in, or ensure Anonymous Auth is enabled in Firebase.");
               });
            })}
            className="w-full h-14 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <UserIcon className="w-5 h-5" />
            Sign in with Google
          </button>
          
          <button 
            onClick={() => signInAnonymously(auth).catch((anonErr) => {
               alert("Guest login failed. Please ensure Anonymous Auth is enabled in Firebase Console: Authentication > Sign-in method.");
            })}
            className="w-full h-14 bg-zinc-800 text-white font-bold rounded-2xl active:scale-95 transition-all"
          >
            Continue as Guest
          </button>
        </div>
        
        <p className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] font-bold">
          Protected by Quantum Encryption
        </p>
      </motion.div>
    </div>
  );

  return (
    <div className={cn(
      "min-h-screen bg-background text-on-background page-content overflow-x-hidden selection:bg-primary/30",
      profile?.settings?.isDopamineDetox && "grayscale-sm contrast-sm"
    )}>
      {/* Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="cinematic-grid" />
        <div className="grain-overlay" />
      </div>
      
      {profile?.settings?.isDopamineDetox && (
        <div className="fixed inset-0 pointer-events-none z-[100] bg-zinc-900/10 backdrop-grayscale-[0.5]" />
      )}

      <div className="cinematic-vignette" />
      <CustomCursor />
      <AnimatePresence mode="wait">
        {view === 'cinematic' ? (
          <motion.div 
            key="cinematic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <HeroSection onExplore={handleDashboardTransition} />
            <StorySection onExplore={handleDashboardTransition} />
            <HabitsSection
              habits={habits}
              onAdd={() => setIsAddHabitModalOpen(true)}
              onMark={async (id) => {
                 if(!user) return;
                 const h = habits.find(habit => habit.id === id);
                 if(!h) return;
                 const today = new Date().toISOString().split('T')[0];
                 if(h.completedDates?.includes(today)) return;
                 await updateDoc(doc(db, 'users', user.uid, 'habits', id), {
                   completedDates: [...(h.completedDates || []), today],
                   streak: increment(1)
                 });
                 if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate([100, 100, 100]);
                 setStreakAchieved((h.streak || 0) + 1);
              }}
            />
            <DeveloperSection />
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen md:ml-64 flex flex-col"
          >
            {/* Header / Stats Overlay */}
            <header className="p-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30">
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => setView('cinematic')}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 cursor-pointer hover:scale-110 transition-transform"
                  style={{ borderColor: getRank(profile?.allTimeXP || 0).color }}
                >
                  <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                   <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-sm">Hello, {user?.displayName?.split(' ')[0] || 'Aspirant'}</h2>
                      <span 
                        className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border", getRank(profile?.allTimeXP || 0).name === 'LEGEND' ? 'text-legend' : '')}
                        style={getRank(profile?.allTimeXP || 0).name !== 'LEGEND' ? { color: getRank(profile?.allTimeXP || 0).color, borderColor: `${getRank(profile?.allTimeXP || 0).color}40` } : {}}
                      >
                         {getRank(profile?.allTimeXP || 0).name}
                      </span>
                   </div>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center justify-between w-32">
                        <span className="text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-widest">{profile?.allTimeXP || 0} Total XP</span>
                        <span className="text-[8px] font-bold text-md-primary">{Math.floor(getXPProgress(profile?.allTimeXP || 0).progress)}%</span>
                    </div>
                    <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${getXPProgress(profile?.allTimeXP || 0).progress}%` }}
                          className="h-full bg-md-primary shadow-[0_0_8px_var(--md-primary)]"
                        />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MagneticButton 
                  onClick={() => setActiveTab('profile')}
                  className="p-3 bg-white/5 text-on-surface-variant rounded-2xl border border-white/10"
                >
                   <Settings className="w-5 h-5" />
                </MagneticButton>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="p-6 max-w-2xl mx-auto space-y-12">
              <AnimatePresence mode="wait">
                {activeTab === 'home' && (
                  <motion.div 
                    key="home"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-8"
                  >
                    {/* AI Quick Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                      <div className="h-32">
                        <TiltCard intensity={5} className="w-full h-full">
                          <button 
                            onClick={() => setIsCoachOpen(true)}
                            className="w-full h-full glass p-4 flex items-center gap-4 text-left rounded-[2rem]"
                          >
                            <div className="p-3 bg-blue-500/20 rounded-2xl">
                              <Sparkles className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Coach Insight</p>
                              <p className="text-xs font-semibold leading-relaxed mt-1">"Your discipline is your edge. Keep the streak alive."</p>
                            </div>
                          </button>
                        </TiltCard>
                      </div>
                      
                      <div className="h-32">
                        <TiltCard intensity={5} className="w-full h-full">
                          <div className="w-full h-full glass p-4 flex items-center gap-4 text-left rounded-[2rem]">
                            <div className="p-3 bg-pink-500/20 rounded-2xl">
                              <Flame className="w-6 h-6 text-pink-400" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-pink-400">JEE 2026 Countdown</p>
                              <p className="text-lg font-black tracking-tighter">428 DAYS</p>
                            </div>
                          </div>
                        </TiltCard>
                      </div>
                    </div>

                    {/* AI Daily Quote */}
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="relative overflow-hidden rounded-[2.5rem] bg-md-surface-2 border border-white/5 shadow-2xl p-6 md:p-8 flex flex-col gap-4 group"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl group-hover:opacity-30 transition-opacity duration-1000 -z-10 bg-gradient-to-br from-md-primary to-md-secondary mix-blend-screen mix-blend-color-dodge rounded-full w-48 h-48 translate-x-1/3 -translate-y-1/3" />
                      
                      <div className="flex items-center gap-3">
                         <div className="bg-md-primary/20 w-10 h-10 rounded-full flex items-center justify-center border border-md-primary/30">
                           <Sparkles className="w-5 h-5 text-md-primary" />
                         </div>
                         <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-md-primary opacity-80">Daily Directive</span>
                      </div>
                      
                      <div className="flex-1">
                        {isQuoteLoading ? (
                          <div className="space-y-3 mt-2 animate-pulse">
                            <div className="h-6 bg-white/5 rounded-full w-full" />
                            <div className="h-6 bg-white/5 rounded-full w-2/3" />
                          </div>
                        ) : (
                          <p className="text-xl md:text-2xl font-serif italic text-white/90 leading-relaxed font-medium">"{dailyQuote}"</p>
                        )}
                      </div>
                    </motion.div>

                    {/* Daily Challenges */}
                    <section className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black uppercase tracking-widest opacity-40">Daily Directives</h3>
                        <div className="bg-amber-400/20 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                           EXPIRES IN 14H
                        </div>
                      </div>
                      <div className="space-y-2">
                        {(profile?.dailyChallenges || []).map(challenge => (
                          <div key={challenge.id} className="glass p-4 rounded-[1.5rem] flex items-center justify-between group overflow-hidden relative">
                            <div className="absolute inset-y-0 left-0 w-1 bg-amber-400/20 group-hover:bg-amber-400 transition-colors" />
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-xs">{challenge.id.split('_').join(' ').toUpperCase()}</span>
                              <div className="flex items-center gap-2">
                                 <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                                   <div className="h-full bg-amber-400/60" style={{ width: `${(challenge.progress / challenge.goal) * 100}%` }} />
                                 </div>
                                 <span className="text-[9px] opacity-40 font-bold">{challenge.progress}/{challenge.goal}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                               <div className="text-amber-400 font-mono font-bold text-[10px]">+{challenge.xp || 150} XP</div>
                               {challenge.completed ? (
                                 <CheckCircle className="w-4 h-4 text-green-400" />
                               ) : (
                                 <Star className="w-4 h-4 text-white/20" />
                               )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                    
                    {/* Stats Grid */}
                    <section className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest opacity-40 px-2">Quantum Dashboard</h3>
                      <AdaptiveWidgetGrid 
                        timeLeft={timeLeft}
                        isRunning={isRunning}
                        mode={mode}
                        currentTask={selectedTaskId}
                        tasks={tasks}
                        onToggleTimer={() => setIsRunning(!isRunning)}
                        onResetTimer={() => setTimeLeft(mode === 'study' ? (profile?.settings?.workDuration || 50) * 60 : (profile?.settings?.breakDuration || 5) * 60)}
                        formatTime={formatTime}
                      />
                    </section>

                    <div className="grid grid-cols-2 gap-4">
                      <TiltCard intensity={10}>
                        <div className="animated-border p-5 md:p-6 rounded-[2.5rem] relative group md:ml-[2px] md:mt-[2px] w-full h-[calc(100%-4px)] flex cursor-default">
                           <div className="relative z-10 w-full h-full bg-md-surface-2 rounded-[2.3rem] p-4">
                              <div className="flex items-center justify-between mb-2">
                                <Battery className={cn("w-5 h-5", getEnergyScore() > 70 ? "text-green-400" : "text-amber-400")} />
                                <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">Energy</span>
                              </div>
                              <h4 className="text-3xl font-black">{getEnergyScore()}%</h4>
                              <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${getEnergyScore()}%` }}
                                  className={cn("h-full", getEnergyScore() > 70 ? "bg-green-400" : "bg-amber-400")}
                                />
                              </div>
                           </div>
                        </div>
                      </TiltCard>

                      <TiltCard intensity={10}>
                        <div className="animated-border p-5 md:p-6 rounded-[2.5rem] relative group md:ml-[2px] md:mt-[2px] w-full h-[calc(100%-4px)] flex cursor-default">
                           <div className="relative z-10 w-full h-full bg-md-surface-2 rounded-[2.3rem] p-4">
                              <div className="flex items-center justify-between mb-2">
                                <Brain className="w-5 h-5 text-blue-400" />
                                <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">Focus Skill</span>
                              </div>
                              <h4 className="text-3xl font-black italic">Rank {Math.floor((profile?.skills?.focus || 0) / 10) + 1}</h4>
                              <p className="text-[10px] opacity-40 mt-1 uppercase font-black">{profile?.skills?.focus || 0} / 100 XP</p>
                           </div>
                        </div>
                      </TiltCard>
                    </div>

                    {/* Health Tracker Quick Log */}
                    <section className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest opacity-40 px-2">Vitality Base</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <MagneticButton 
                          onClick={() => logHealth('water', 1)}
                          className="glass p-4 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-blue-500/5 group"
                        >
                          <Droplets className="w-5 h-5 text-blue-400 group-hover:scale-125 transition-transform" />
                          <span className="text-xs font-bold">{profile?.health?.water || 0}</span>
                        </MagneticButton>
                        <MagneticButton 
                          onClick={() => logHealth('protein', 10)}
                          className="glass p-4 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-pink-500/5 group"
                        >
                          <Utensils className="w-5 h-5 text-pink-400 group-hover:scale-125 transition-transform" />
                          <span className="text-xs font-bold">{profile?.health?.protein || 0}g</span>
                        </MagneticButton>
                        <MagneticButton 
                          onClick={() => logHealth('sleep', 0.5)}
                          className="glass p-4 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-purple-500/5 group"
                        >
                          <Moon className="w-5 h-5 text-purple-400 group-hover:scale-125 transition-transform" />
                          <span className="text-xs font-bold">{profile?.health?.sleep || 0}h</span>
                        </MagneticButton>
                      </div>
                    </section>

                    {/* Daily Challenges */}
                    <section className="space-y-4">
                      <ChallengesWidget profile={profile} />
                    </section>

                    {/* Habits Section */}
                    <section className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black uppercase tracking-widest opacity-40">{t('habits')}</h3>
                        <button onClick={() => setIsAddHabitModalOpen(true)} className="text-[10px] font-black text-primary uppercase tracking-widest">+ Initialize</button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-6 px-2">
                        {habits.map(habit => {
                          const today = new Date().toISOString().split('T')[0];
                          const isDone = (habit.completedDates || []).includes(today);
                          return (
                            <div key={habit.id} className="w-full">
                              <TiltCard intensity={15} className="w-full h-full">
                                <motion.div
                                  className={cn(
                                    "w-full rounded-[2.5rem] p-6 flex flex-col gap-4 border transition-all relative overflow-hidden glass",
                                    isDone ? "border-primary/20" : "border-white/5"
                                  )}
                              >
                                 <div className="flex justify-between items-start">
                                    <div className={cn("p-3 rounded-2xl", isDone ? "bg-primary text-white" : "bg-white/5 text-primary")}>
                                      <Zap className={cn("w-6 h-6", isDone && "fill-white")} />
                                    </div>
                                    <button 
                                      onClick={() => toggleHabit(habit)}
                                      className={cn(
                                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                                        isDone ? "bg-green-500 border-green-500" : "border-white/20"
                                      )}
                                    >
                                      {isDone && <CheckCircle className="w-4 h-4 text-white" />}
                                    </button>
                                 </div>
                                 
                                 <div>
                                    <span className="text-sm font-black uppercase tracking-tight block truncate italic">{habit.title}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Flame className="w-3 h-3 text-amber-500" />
                                      <span className="text-[9px] font-bold opacity-60 uppercase">{habit.streak} DAY STREAK</span>
                                    </div>
                                 </div>

                                 <HabitHeatMap completedDates={habit.completedDates || []} />
                              </motion.div>
                            </TiltCard>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    {/* Mission Categories */}
                    <section className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest opacity-40 px-2">Mission Sectors</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(CATEGORIES).map(([id, cat]) => {
                          const Icon = (cat.icon === 'BookOpen' ? BookOpen : cat.icon === 'Heart' ? Heart : UserIcon) as any;
                          const count = tasks.filter(t => t.category === id && !t.completed).length;
                          return (
                            <TiltCard key={id} intensity={10}>
                              <button 
                                onClick={() => openAddTaskModal(id as any)}
                                className={cn("w-full p-4 glass rounded-[2rem] flex flex-col items-center gap-2 border-b-2 hover:brightness-110 active:scale-95 transition-all text-center", 
                                  id === 'study' ? "border-blue-500/50" : id === 'health' ? "border-pink-500/50" : "border-emerald-500/50"
                                )}
                              >
                                 <Icon className={cn("w-5 h-5", id === 'study' ? "text-blue-400" : id === 'health' ? "text-pink-400" : "text-emerald-400")} />
                                 <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{cat.label}</p>
                                    <p className="text-[9px] font-bold opacity-40 uppercase">{count} Active</p>
                                 </div>
                              </button>
                            </TiltCard>
                          );
                        })}
                      </div>
                    </section>

                    {/* Mission Roster */}
                    <section className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex flex-col gap-3 w-full">
                           <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Tactical Roster</h3>
                           <div className="flex bg-md-surface-3 rounded-full p-1 border border-white/5 w-fit">
                             {(['priority', 'urgent', 'deadline'] as const).map((key) => (
                               <button 
                                 key={key}
                                 onClick={() => setTaskSortKey(key)} 
                                 className={cn(
                                   "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                                   taskSortKey === key ? "bg-md-secondary-cont text-md-on-secondary-cont shadow-sm" : "text-white/40 hover:text-white"
                                 )}
                               >
                                 {key === 'priority' ? 'PRIO' : key === 'urgent' ? 'URGENT' : 'DUE'}
                               </button>
                             ))}
                           </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {tasks.filter(t => !t.completed).sort((a, b) => {
                          if (taskSortKey === 'priority') {
                            const prio = { high: 3, medium: 2, low: 1 };
                            return prio[b.priority] - prio[a.priority];
                          } else if (taskSortKey === 'urgent') {
                            return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
                          } else {
                            return (a.deadline || '9999').localeCompare(b.deadline || '9999');
                          }
                        }).map((task) => {
                          const cat = CATEGORIES[task.category as keyof typeof CATEGORIES];
                          return (
                            <motion.div 
                              key={task.id}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={() => setSelectedTaskId(task.id === selectedTaskId ? null : task.id)}
                              className={cn(
                                "glass-card group flex items-center justify-between p-5 rounded-[2rem] border transition-colors cursor-pointer",
                                task.id === selectedTaskId ? "border-primary shadow-[0_0_20px_rgba(59,130,246,0.2)] bg-primary/5" : "border-white/5 hover:border-white/10"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toggleTask(task); }}
                                  className={cn(
                                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                    task.completed ? "bg-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "border-white/20"
                                  )}
                                >
                                  {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                                </button>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className={cn("font-bold text-sm", task.completed && "line-through opacity-40")}>{task.title}</h4>
                                    {task.urgent && (
                                      <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse border border-red-500/30">
                                        {t('urgent')}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 italic">{task.category}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {task.sessions > 0 && <span className="text-[10px] font-bold opacity-40">{task.sessions} slots</span>}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                        {tasks.filter(t => !t.completed).length === 0 && (
                          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem] opacity-30">
                            <p className="text-xs font-black uppercase tracking-[0.3em]">No Active Deployments</p>
                          </div>
                        )}
                      </div>
                    </section>
                  </motion.div>
                )}

          {activeTab === 'timer' && (
            <motion.div 
              key="timer"
              id="timer-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "page-content flex flex-col items-center w-full max-w-4xl mx-auto transition-all duration-700 px-4",
                isFocusMode ? "bg-zinc-950 fixed inset-0 z-[60] py-12 justify-center" : "relative"
              )}
            >
              {/* Session Context Row */}
              {!isFocusMode && (
                <div className="w-full flex items-center justify-between mb-8 opacity-60 px-4">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest">Active Streak</span>
                      <div className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-500" />
                        <span className="text-xs font-bold">{profile?.streak || 0} Sessions</span>
                      </div>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest">Efficiency</span>
                      <span className="text-xs font-bold text-md-primary">x{(1 + (profile?.level || 1) * 0.1).toFixed(1)} MULTI</span>
                   </div>
                </div>
              )}

              {/* Mode Toggle - Modern Pill */}
              {!isFocusMode && (
                <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl mb-8 relative z-10 scale-90 md:scale-100">
                  <button 
                    onClick={() => { setMode('study'); setTimeLeft((profile?.settings?.workDuration || 50) * 60); setIsRunning(false); setFocusScore(null); setDistractions(0); }}
                    className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all", mode === 'study' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white/60")}
                  >
                    Deep Work
                  </button>
                  <button 
                    onClick={() => { setMode('break'); setTimeLeft((profile?.settings?.breakDuration || 10) * 60); setIsRunning(false); setFocusScore(null); }}
                    className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all", mode === 'break' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-white/40 hover:text-white/60")}
                  >
                    Rest
                  </button>
                </div>
              )}

              {/* Centered Timer Visual */}
              <div id="timer-main" className="relative flex flex-col items-center justify-center">
                {mode === 'break' && breakActivity && !isFocusMode && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-12 bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 rounded-full whitespace-nowrap"
                  >
                     <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Protocol: {breakActivity}</span>
                  </motion.div>
                )}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    className="relative"
                  >
                    <svg className="w-72 h-72 md:w-96 md:h-96 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                      <circle cx="50%" cy="50%" r="45%" fill="none" stroke="currentColor" className="text-white/5" strokeWidth="12" />
                      <motion.circle 
                        cx="50%" cy="50%" r="45%" fill="none" stroke="currentColor" strokeWidth="12"
                        strokeDasharray="100 100"
                        strokeDashoffset={100 - (timeLeft / (mode === 'study' ? (profile?.settings?.workDuration || 50) * 60 : (profile?.settings?.breakDuration || 10) * 60) * 100)}
                        strokeLinecap="round"
                        className={cn("timer-progress transition-colors duration-500 focus-ring-glow", mode === 'study' ? "text-primary" : "text-emerald-500")}
                        pathLength="100"
                      />
                      <text x="50%" y="54%" textAnchor="middle" className="text-7xl md:text-8xl font-black fill-white font-mono tracking-tighter filter drop-shadow-md">
                        {formatTime(timeLeft)}
                      </text>
                      <text x="50%" y="65%" textAnchor="middle" className={cn("text-[10px] md:text-xs uppercase tracking-[0.4em] font-black opacity-60", mode === 'study' ? "fill-primary" : "fill-emerald-500")}>
                        {mode === 'study' ? 'System Focus' : 'Recovery Active'}
                      </text>
                    </svg>
                    
                    {/* Focus Score Float */}
                    {focusScore !== null && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 whitespace-nowrap"
                      >
                         <span className="text-[10px] font-black uppercase text-md-primary">Focus Score: {focusScore}%</span>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Cycle Indicators */}
                {!isFocusMode && (
                  <div className="mt-6 flex gap-3 justify-center">
                     {[0, 1, 2, 3].map(dot => (
                       <div key={dot} className={cn(
                         "w-2.5 h-2.5 rounded-full transition-all duration-500 border border-white/5",
                         sessionCount > dot ? "bg-primary shadow-[0_0_15px_rgba(0,255,224,0.6)] scale-110" : "bg-white/10"
                       )} />
                     ))}
                  </div>
                )}
              </div>

              {/* Primary Controls */}
              <div id="timer-controls-row" className="flex items-center gap-8 relative z-10">
                <MagneticButton 
                  onClick={resetTimer}
                  className="p-5 rounded-3xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                >
                  <RotateCcw className="w-6 h-6" />
                </MagneticButton>
                <div className="relative group">
                  <motion.div 
                    animate={isRunning ? { scale: [1, 1.05, 1], opacity: [0, 0.2, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-primary blur-2xl rounded-full"
                  />
                  <button 
                    onClick={toggleTimer}
                    className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative z-10",
                      isRunning ? "bg-zinc-900 text-white border-2 border-white/10" : "bg-white text-black scale-110 hover:scale-115 active:scale-95"
                    )}
                  >
                    {isRunning ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
                  </button>
                </div>
                <MagneticButton 
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className={cn("p-5 rounded-3xl transition-all active:scale-90", isFocusMode ? "bg-white text-black" : "bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10")}
                >
                  {isFocusMode ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
                </MagneticButton>
              </div>

              {/* Distraction Logger (FAB Replacement equivalent during session) */}
              <AnimatePresence>
                {isRunning && mode === 'study' && !isFocusMode && (
                   <motion.button 
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 0, opacity: 0 }}
                     onClick={logDistraction}
                     className="mb-8 flex items-center gap-3 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/20 active:scale-90 transition-all distraction-pulse"
                   >
                     <AlertCircle className="w-4 h-4" />
                     Log Distraction ({distractions})
                   </motion.button>
                )}
              </AnimatePresence>

              {/* Session Intention Input Modal/Overlay */}
              <AnimatePresence>
                {showIntentionInput && (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                   >
                     <motion.div 
                       initial={{ y: 100 }}
                       animate={{ y: 0 }}
                       className="w-full max-w-md glass p-8 rounded-[3rem] space-y-6 shadow-2xl border border-white/10"
                     >
                        <div className="space-y-2">
                           <h3 className="text-xl font-black uppercase italic tracking-tighter">Set Your Intention</h3>
                           <p className="text-xs text-white/40 font-bold">What will you accomplish in this 50-minute block?</p>
                        </div>
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="e.g. Solving 10 PHY problems"
                          value={sessionIntention}
                          onChange={(e) => setSessionIntention(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sessionIntention.length > 2 && (setShowIntentionInput(false), setIsRunning(true), setSessionStartTime(Date.now()))}
                          className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl text-sm font-bold focus:border-primary focus:outline-none transition-colors"
                        />
                        <button 
                          disabled={sessionIntention.length < 3}
                          onClick={() => { setShowIntentionInput(false); setIsRunning(true); setSessionStartTime(Date.now()); }}
                          className="w-full py-5 bg-primary text-md-on-primary font-black uppercase text-xs tracking-[0.2em] rounded-3xl disabled:opacity-30 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,255,224,0.3)]"
                        >
                          Initialize Protocol
                        </button>
                     </motion.div>
                   </motion.div>
                )}
              </AnimatePresence>

              {/* Atmosphere Control Center */}
              {!isFocusMode && (
                <div className="w-full space-y-12 mt-12 flex-1 page-content">
                  <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[3rem] backdrop-blur-3xl shadow-2xl space-y-10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex flex-col italic">
                        <h4 className="text-xl font-black text-white">Atmosphere</h4>
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Enhanced Soundscapes</p>
                      </div>
                      <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
                        {AMBIENT_CATEGORIES.map(cat => {
                          const IconComp = (cat.id === 'nature' ? CloudRain : cat.id === 'focus' ? Brain : Music);
                          return (
                            <button
                              key={cat.id}
                              onClick={() => setActiveAmbientCategory(cat.id)}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeAmbientCategory === cat.id ? "bg-primary text-white" : "text-white/40 hover:text-white/60"
                              )}
                            >
                              <IconComp className="w-3 h-3" />
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      {AMBIENT_DATA.filter(t => t.category === activeAmbientCategory).map(track => {
                        const isSelected = ambientSound === track.id;
                        const IconComponent = (
                          track.icon === 'CloudRain' ? CloudRain :
                          track.icon === 'Activity' ? Activity :
                          track.icon === 'Droplets' ? Droplets :
                          track.icon === 'Coffee' ? Coffee :
                          track.icon === 'Music' ? Music :
                          track.icon === 'Hash' ? Hash :
                          track.icon === 'Wind' ? Wind :
                          track.icon === 'Zap' ? Zap : Music
                        );
                        return (
                          <button
                            key={track.id}
                            onClick={() => setAmbientSound(isSelected ? 'none' : track.id)}
                            className={cn(
                              "group relative flex flex-col items-center justify-center gap-3 p-6 rounded-[2.5rem] border transition-all duration-500",
                              isSelected ? "bg-primary shadow-[0_0_20px_rgba(0,255,224,0.3)] border-primary" : "bg-white/5 border-white/10 opacity-40 hover:opacity-100 hover:scale-105"
                            )}
                          >
                            <div className={cn("p-4 rounded-2xl transition-all duration-500", isSelected ? "bg-md-on-primary-cont text-md-primary scale-110" : "bg-white/10 text-white group-hover:bg-white/20")}>
                              <IconComponent className="w-6 h-6" />
                              {isSelected && (
                                <motion.div 
                                  layoutId="active-dot" 
                                  className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse"
                                />
                              )}
                            </div>
                            <span className={cn("text-[10px] font-black uppercase tracking-tighter transition-colors", isSelected ? "text-primary" : "text-white/60")}>{track.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-4 min-w-[140px]">
                        <div className="p-3 rounded-2xl bg-white/5 text-white/40">
                           {ambientVolume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black opacity-40 uppercase">Volume</span>
                          <span className="text-sm font-bold tabular-nums">{Math.round(ambientVolume * 100)}%</span>
                        </div>
                      </div>
                      <div className="flex-1 w-full relative">
                         <input 
                            type="range" min="0" max="1" step="0.01" value={ambientVolume}
                            onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary focus:outline-none"
                          />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Island / Current Task HUD */}
              <AnimatePresence>
                {selectedTaskId && (
                  <motion.div 
                    layoutId="dynamic-island"
                    initial={{ y: -50, scale: 0.8, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: -50, scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="fixed top-8 left-1/2 -translate-x-1/2 bg-md-surface-2 px-6 py-3 rounded-full flex items-center justify-center gap-4 shadow-[0_16px_32px_rgba(0,0,0,0.5)] border border-white/10 whitespace-nowrap z-[100] backdrop-blur-3xl 
                               md:top-8 md:-translate-x-1/2 md:left-1/2 overflow-hidden mx-auto max-w-[90vw]"
                  >
                    <div className="absolute inset-0 bg-md-primary/5 opacity-50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-md-primary animate-pulse shadow-[0_0_8px_var(--md-primary)] shrink-0" />
                    <div className="flex flex-col relative z-10 truncate">
                       <span className="text-[9px] font-mono opacity-50 uppercase tracking-[0.3em] font-bold">Active Directive</span>
                       <span className="font-bold text-sm text-white uppercase tracking-wider truncate max-w-[200px] md:max-w-[300px]">{tasks.find(t => t.id === selectedTaskId)?.title}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div 
              key="tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Quantum Tasks</h3>
                <button 
                  onClick={() => openAddTaskModal('study')}
                  className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="flex gap-2 p-1 bg-surface-variant rounded-2xl w-fit">
                {['Pending', 'Completed'].map(f => (
                  <button key={f} className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    {f}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                 {/* Reusing task card logic but in a dedicated view */}
                 {tasks.map(task => (
                    <div key={task.id} className="glass-card flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <CheckCircle 
                            onClick={() => toggleTask(task)}
                            className={cn("w-6 h-6 cursor-pointer transition-colors", task.completed ? "text-green-500 fill-green-500/20" : "text-on-surface-variant/40")} 
                          />
                          <div>
                             <p className={cn("font-bold text-sm", task.completed && "line-through opacity-50")}>{task.title}</p>
                             <p className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-widest">{task.category}</p>
                          </div>
                       </div>
                       <button onClick={() => deleteTask(task.id)}><Trash2 className="w-4 h-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" /></button>
                    </div>
                 ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold">Progress</h3>
              
               <div className="grid grid-cols-2 gap-4">
                <div className="material-card space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">{t('best_streak')}</p>
                  <p className="text-3xl font-bold">{habits.reduce((max, h) => Math.max(max, h.streakBest || 0), 0)}</p>
                </div>
                <div className="material-card space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">{t('streak')}</p>
                  <p className="text-3xl font-bold">{habits.reduce((max, h) => Math.max(max, h.streak || 0), 0)}</p>
                </div>
              </div>

              {habits.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest opacity-40 px-2">Global Heatmap</h4>
                  <div className="glass p-6 rounded-[2.5rem]">
                    <HabitHeatMap completedDates={Array.from(new Set(habits.flatMap(h => h.completedDates || [])))} />
                  </div>
                </div>
              )}

              <div className="material-card h-64 w-full">
                <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mb-4">Activity (Weekly)</p>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={[
                    { day: 'M', sessions: 4 },
                    { day: 'T', sessions: 6 },
                    { day: 'W', sessions: 3 },
                    { day: 'T', sessions: 8 },
                    { day: 'F', sessions: 5 },
                    { day: 'S', sessions: 2 },
                    { day: 'S', sessions: 4 },
                  ]}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="sessions" fill="var(--primary)" radius={[4, 4, 4, 4]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Skill Tree */}
              <div className="space-y-4">
                <h4 className="font-bold flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  Skill Progression
                </h4>
                <div className="space-y-4">
                  {[
                    { name: 'Focus', val: profile?.skills?.focus || 0, icon: Target },
                    { name: 'Discipline', val: profile?.skills?.discipline || 0, icon: ShieldCheck },
                    { name: 'Consistency', val: profile?.skills?.consistency || 0, icon: Flame },
                  ].map(skill => (
                    <div key={skill.name} className="glass-card p-4">
                      <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-2">
                            <skill.icon className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest">{skill.name}</span>
                         </div>
                         <span className="text-[10px] font-bold">LVL {Math.floor(skill.val / 10) + 1}</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${skill.val % 100}%` }}
                           className="h-full bg-primary shadow-[0_0_8px_var(--primary)]"
                         />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="font-bold flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Achievements
                  </h4>
                  <span className="text-[10px] font-black opacity-40">{(profile?.unlockedAchievements?.length || 0)} / 20 UNLOCKED</span>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {ACHIEVEMENTS.map(ach => {
                    const isUnlocked = profile?.unlockedAchievements?.includes(ach.id);
                    return (
                      <motion.div 
                        key={ach.id} 
                        whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
                        className={cn(
                          "glass p-4 flex flex-col items-center justify-center text-center gap-2 rounded-[1.5rem] relative group border transition-all duration-500",
                          isUnlocked ? "border-amber-400/30 bg-amber-400/5 shadow-[0_0_20px_rgba(212,168,67,0.1)]" : "opacity-30 grayscale border-white/5"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-1",
                          isUnlocked ? "bg-amber-400/20" : "bg-white/5"
                        )}>
                          {ach.icon}
                        </div>
                        <span className="text-[10px] font-bold line-clamp-1">{ach.name}</span>
                        {isUnlocked && (
                          <div className="absolute top-2 right-2">
                            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/80 rounded-[1.5rem] p-4">
                           <p className="text-[8px] font-bold leading-tight">{ach.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 max-w-4xl mx-auto w-full px-4 md:px-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <motion.div 
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-surface shadow-2xl rotate-3"
                >
                  <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="profile" className="w-full h-full object-cover" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold">{user.displayName}</h3>
                  <p className="text-on-surface-variant/60">{user.email}</p>
                </div>
              </div>

              <div className="material-card space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-amber-500" />
                    <span className="font-bold uppercase tracking-widest">
                      {getRank(profile?.allTimeXP || 0).id === 'legend' ? 
                        <LegendText text={getRank(profile?.allTimeXP || 0).name} className="text-xl" /> : 
                        getRank(profile?.allTimeXP || 0).name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant/40"><TickingNumber value={profile?.allTimeXP || 0} /> XP TOTAL</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold opacity-40 uppercase tracking-widest">
                     <span>Rank Progress</span>
                     <span>{Math.floor(getXPProgress(profile?.allTimeXP || 0).progress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${getXPProgress(profile?.allTimeXP || 0).progress}%` }}
                      className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={async () => {
                    if(!user) return;
                    const userDoc = doc(db, 'users', user.uid);
                    const current = profile?.settings?.autoStartNextSession || false;
                    setProfile(prev => prev ? { ...prev, settings: { ...prev.settings, autoStartNextSession: !current } } : prev);
                    await updateDoc(userDoc, { 'settings.autoStartNextSession': !current });
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-5 rounded-3xl font-bold transition-all border border-transparent",
                    profile?.settings?.autoStartNextSession ? "bg-primary/10 border-primary text-primary" : "bg-surface-variant text-on-surface"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Timer className="w-5 h-5" />
                    <span>Auto-Start Next Session</span>
                  </div>
                  <div className={cn("w-10 h-5 rounded-full relative transition-colors", profile?.settings?.autoStartNextSession ? "bg-primary" : "bg-outline")}>
                    <motion.div 
                      animate={{ x: profile?.settings?.autoStartNextSession ? 20 : 0 }}
                      className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"
                    />
                  </div>
                </button>

                {/* Granular Timer Settings */}
                <div className="glass-card p-5 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-80">
                      <span>Work Duration</span>
                      <span>{profile?.settings?.workDuration || 50} min</span>
                    </div>
                    <input 
                      type="range" min="10" max="120" step="5"
                      value={profile?.settings?.workDuration || 50}
                      onChange={async (e) => {
                         if(!user) return;
                         const val = parseInt(e.target.value);
                         setProfile(p => p ? {...p, settings: {...p.settings, workDuration: val}} : p);
                         await updateDoc(doc(db, 'users', user.uid), { 'settings.workDuration': val });
                      }}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-80">
                      <span>Break Duration</span>
                      <span>{profile?.settings?.breakDuration || 10} min</span>
                    </div>
                    <input 
                      type="range" min="5" max="30" step="5"
                      value={profile?.settings?.breakDuration || 10}
                      onChange={async (e) => {
                         if(!user) return;
                         const val = parseInt(e.target.value);
                         setProfile(p => p ? {...p, settings: {...p.settings, breakDuration: val}} : p);
                         await updateDoc(doc(db, 'users', user.uid), { 'settings.breakDuration': val });
                      }}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>

                {/* Sound & Notifications */}
                <div className="glass-card p-5 space-y-6 flex flex-col gap-2">
                   <div className="space-y-3">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Notification Sound</span>
                     <div className="grid grid-cols-3 gap-2">
                       {['default', 'bell', 'none'].map((snd) => (
                          <button 
                            key={snd}
                            onClick={async () => {
                               if(!user) return;
                               await updateDoc(doc(db, 'users', user.uid), { 'settings.notificationSound': snd });
                               setProfile(p => p ? {...p, settings: {...p.settings, notificationSound: snd as any}} : p);
                               if (snd === 'bell') playBell();
                               if (snd === 'default') playWhoosh();
                            }}
                            className={cn("px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all", 
                              profile?.settings?.notificationSound === snd || (!profile?.settings?.notificationSound && snd === 'default') ? "bg-primary border-primary text-white" : "bg-white/5 border-white/5 opacity-60 hover:opacity-100"
                            )}
                          >
                            {snd}
                          </button>
                       ))}
                     </div>
                   </div>
                   
                   <div className="space-y-3">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Default Ambient Mode</span>
                     <div className="grid grid-cols-2 gap-2">
                       {['none', 'rain', 'lofi', 'white'].map((amb) => (
                          <button 
                            key={amb}
                            onClick={async () => {
                               if(!user) return;
                               await updateDoc(doc(db, 'users', user.uid), { 'settings.ambientSound': amb });
                               setProfile(p => p ? {...p, settings: {...p.settings, ambientSound: amb as any}} : p);
                               setAmbientSound(amb as any);
                            }}
                            className={cn("px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all", 
                              profile?.settings?.ambientSound === amb || (!profile?.settings?.ambientSound && amb === 'none') ? "bg-primary border-primary text-white" : "bg-white/5 border-white/5 opacity-60 hover:opacity-100"
                            )}
                          >
                            {amb}
                          </button>
                       ))}
                     </div>
                   </div>
                </div>

                <button 
                  onClick={() => signOut(auth)}
                  className="w-full flex items-center justify-between p-5 rounded-3xl bg-red-950/20 text-red-400 font-bold active:scale-95 transition-transform border border-red-900/10"
                >
                  <span>Sign Out</span>
                  <LogOut className="w-5 h-5" />
                </button>

                <div className="pt-4 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">Danger Zone</h4>
                  <button 
                    onClick={async () => {
                      if (!user) return;
                      const conf = window.confirm("Are you sure you want to completely wipe out all your data? This cannot be undone.");
                      if (conf) {
                         const userDoc = doc(db, 'users', user.uid);
                         await updateDoc(userDoc, {
                           xp: 0,
                           level: 1,
                           pomodorosCompleted: 0,
                           totalFocusTime: 0,
                           streak: 0,
                           'skills.focus': 0,
                           'skills.consistency': 0,
                           'skills.discipline': 0
                         });
                         setProfile(p => p ? {...p, xp: 0, level: 1, pomodorosCompleted: 0, totalFocusTime: 0, streak: 0, skills: {focus: 0, consistency: 0, discipline: 0}} : p);
                      }
                    }}
                    className="w-full py-4 rounded-3xl bg-red-950 text-red-500 font-bold active:scale-95 transition-transform border border-red-900 shadow-xl uppercase tracking-widest text-[10px]"
                  >
                    Reset All Data
                  </button>
                </div>

                <div className="pt-4 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">{t('language')}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'ru', label: 'Русский' },
                      { code: 'fr', label: 'Français' },
                      { code: 'es', label: 'Español' }
                    ].map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className={cn(
                          "px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                          i18n.language === lang.code ? "bg-primary border-primary text-white shadow-lg shadow-blue-500/20" : "bg-white/5 border-white/5 opacity-60 hover:opacity-100"
                        )}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'developer' && (
            <motion.div
              key="developer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12"
            >
              <div className="-mx-6">
                 <DeveloperSection />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Adaptive FAB */}
      {!isFocusMode && (
        <button 
          onClick={() => openAddTaskModal()}
          onMouseEnter={playTick}
          className="fixed bottom-28 right-6 md:bottom-8 md:right-8 bg-md-primary-container text-md-on-primary-cont hover:bg-md-primary transition-colors flex items-center justify-center gap-2 overflow-hidden shadow-[0_8px_24px_rgba(0,80,74,0.4)] z-40 group md:h-14 md:px-6 rounded-full h-14 w-14 md:w-auto"
        >
           <Plus className="w-6 h-6 min-w-[24px]" strokeWidth={2.5} />
           <span className="hidden md:block font-mono font-bold text-xs uppercase tracking-widest whitespace-nowrap">Deploy Mission</span>
        </button>
      )}

      {/* Bottom Navigation / M3 Rail */}
      {!isFocusMode && (
        <>
          {/* Desktop Nav Rail */}
          <nav className="hidden md:flex fixed left-0 top-0 bottom-0 h-screen w-64 border-r border-white/5 bg-md-surface/80 backdrop-blur-2xl z-40
                          flex-col items-start justify-start gap-1 px-4 py-8">
            <div className="w-full mb-8 flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-md-primary/10 flex items-center justify-center border border-md-primary/20">
                  <Play className="w-5 h-5 text-md-primary fill-md-primary" />
                </div>
                <h1 className="font-display text-2xl uppercase tracking-tighter">Mission</h1>
              </div>
              <StreakWidget profile={profile} mobile={true} />
            </div>

            <NavButton active={activeTab === 'home'} icon={Home} label={t('home')} onClick={() => setActiveTab('home')} />
            <NavButton active={activeTab === 'tasks'} icon={BarChart2} label={t('tasks')} onClick={() => setActiveTab('tasks')} />
            <NavButton active={activeTab === 'timer'} icon={Timer} label={t('timer')} onClick={() => setActiveTab('timer')} />
            {!profile?.settings?.isDopamineDetox && (
              <>
                <NavButton active={activeTab === 'stats'} icon={Activity} label={t('analytics')} onClick={() => setActiveTab('stats')} />
                <NavButton 
                  active={showAchievements} 
                  icon={Award} 
                  label="Trophies" 
                  onClick={() => setShowAchievements(true)} 
                />
                <NavButton active={activeTab === 'developer'} icon={Sparkles} label="Developer" onClick={() => setActiveTab('developer')} />
              </>
            )}
            <NavButton active={activeTab === 'profile'} icon={UserIcon} label={t('settings')} onClick={() => setActiveTab('profile')} />
            
            <XPBar profile={profile} />
          </nav>

          {/* Mobile Bottom Tab */}
          <nav id="mobile-nav">
            <NavButton active={activeTab === 'home'} icon={Home} label={t('home')} onClick={() => setActiveTab('home')} />
            <NavButton active={activeTab === 'tasks'} icon={BarChart2} label={t('tasks')} onClick={() => setActiveTab('tasks')} />
            <NavButton active={activeTab === 'timer'} icon={Timer} label={t('timer')} onClick={() => setActiveTab('timer')} />
            {!profile?.settings?.isDopamineDetox && (
              <NavButton active={activeTab === 'stats'} icon={Activity} label={t('analytics')} onClick={() => setActiveTab('stats')} />
            )}
            <NavButton active={activeTab === 'developer'} icon={Sparkles} label="Dev" onClick={() => setActiveTab('developer')} />
          </nav>
        </>
      )}

      {/* Focus Mode floating Close */}
      {isFocusMode && (
        <button 
          onClick={() => setIsFocusMode(false)}
          className="fixed top-8 right-8 p-3 bg-gray-100 rounded-full z-[60] active:scale-90 transition-transform"
        >
          <Minimize2 className="w-6 h-6" />
        </button>
      )}
      
      {/* Streak Achieved Animation */}
      <AnimatePresence>
        {streakAchieved && (
           <motion.div
             initial={{ opacity: 0, scale: 0.5, y: 50 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
             className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
           >
             <div className="glass-card flex flex-col items-center gap-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.5)]">
               <Flame className="w-12 h-12 text-amber-500 animate-pulse" />
               <h2 className="text-2xl font-black italic uppercase tracking-tighter text-amber-500">NEW BEST!</h2>
               <p className="text-white font-bold">{streakAchieved} DAYS STREAK</p>
             </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* AI Coach Overlay */}
      <AnimatePresence>
        {isCoachOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] glass-card rounded-none flex flex-col bg-background/90"
          >
            <header className="p-6 flex items-center justify-between border-b border-outline/20">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                 </div>
                 <div>
                    <h3 className="font-bold">Aether AI Coach</h3>
                    <p className="text-[10px] uppercase font-bold text-blue-400 tracking-widest">Quantum Engine Online</p>
                 </div>
              </div>
              <button 
                onClick={() => setIsCoachOpen(false)}
                className="p-2 rounded-full bg-surface-variant text-on-surface-variant"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {coachMessages.length === 1 && (
                <div className="flex flex-wrap gap-2 justify-center pb-4">
                  <button 
                    onClick={() => {
                        sendToCoach("Analyze my current performance, XP, health stats, and JEE targets to suggest 3 personalized micro-tasks to optimize my day.");
                    }}
                    className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                  >
                     Request Proactive Assessment
                  </button>
                  <button 
                    onClick={() => {
                        sendToCoach("How can I improve my focus system and discipline based on my stats?");
                    }}
                    className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                  >
                     System Optimization
                  </button>
                  <button 
                    onClick={async () => {
                        setIsAiTyping(true);
                        setCoachMessages(prev => [...prev, { role: 'user', text: "Suggest some micro-habits based on my goals and stats." }]);
                        const context = {
                          profile,
                          tasksAnalytics: {
                            pending: tasks.filter(t => !t.completed).length,
                            categories: tasks.reduce((acc, t) => {
                              if (!t.completed) {
                                acc[t.category] = (acc[t.category] || 0) + 1;
                              }
                              return acc;
                            }, {} as Record<string, number>),
                            urgent: tasks.filter(t => !t.completed && t.urgent).length
                          },
                          currentHabits: habits.map(h => ({ title: h.title, streak: h.streak })),
                          habitStreakMax: habits.reduce((acc, h) => Math.max(acc, h.streak || 0), 0)
                        };
                        const suggestions = await getAIHabitSuggestions(context);
                        setCoachMessages(prev => [...prev, { role: 'ai', text: "Based on your current trajectory, I highly recommend initializing these micro-habits to reinforce your discipline:", habitSuggestions: suggestions }]);
                        setIsAiTyping(false);
                    }}
                    className="px-4 py-2 bg-pink-500/10 text-pink-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-pink-500/20 hover:bg-pink-500/20 transition-colors"
                  >
                     Suggest Protocols
                  </button>
                </div>
              )}
              {coachMessages.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "max-w-[80%] rounded-3xl",
                    m.role === 'ai' ? "self-start flex flex-col gap-2" : "bg-primary text-white self-end ml-auto p-4"
                  )}
                >
                  {m.role === 'ai' ? (
                     <div className="bg-surface-variant/50 border border-outline/10 p-4 rounded-3xl">
                       <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                       {m.habitSuggestions && m.habitSuggestions.length > 0 && (
                         <div className="mt-4 flex flex-col gap-3">
                           {m.habitSuggestions.map((hs, hIndex) => (
                             <div key={hIndex} className="bg-background/50 border border-outline/10 p-3 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex justify-between items-start relative z-10 w-full">
                                  <div className="flex gap-2 items-center">
                                    <div className="p-2 bg-pink-500/20 rounded-xl text-pink-400">
                                      <Sparkles className="w-4 h-4" /> 
                                    </div>
                                    <span className="font-bold text-sm tracking-tight pt-1">{hs.title}</span>
                                  </div>
                                  <button 
                                    onClick={() => addHabit(hs.title, hs.icon || 'Zap')}
                                    className="text-[10px] font-black uppercase tracking-widest text-pink-400 bg-pink-500/10 px-3 py-1.5 rounded-full hover:bg-pink-500/20 whitespace-nowrap active:scale-95 transition-all"
                                  >
                                    Init
                                  </button>
                                </div>
                                <p className="text-xs text-white/60 leading-relaxed relative z-10">{hs.description}</p>
                             </div>
                           ))}
                         </div>
                       )}
                       {i > 0 && (
                         <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                           <button className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-green-400 transition-colors">
                             <ThumbsUp className="w-3.5 h-3.5" />
                           </button>
                           <button className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-red-400 transition-colors">
                             <ThumbsDown className="w-3.5 h-3.5" />
                           </button>
                         </div>
                       )}
                     </div>
                  ) : (
                     <p className="text-sm leading-relaxed">{m.text}</p>
                  )}
                </motion.div>
              ))}
              {isAiTyping && (
                <div className="flex gap-1 p-4 bg-surface-variant/30 rounded-full w-fit">
                   <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                   <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                   <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-outline/20 bg-background/50">
              <ChatInput onSend={sendToCoach} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      <AddTaskModal 
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAdd={addTask}
        defaultCategory={addTaskCategory}
      />
      <AddHabitModal
        isOpen={isAddHabitModalOpen}
        onClose={() => setIsAddHabitModalOpen(false)}
        onAdd={addHabit}
      />
      <AnimatePresence>
        {rankUp && (
          <RankUpCeremony 
            oldRank={rankUp.oldRank} 
            newRank={rankUp.newRank} 
            onComplete={() => setRankUp(null)} 
          />
        )}
        {unlockedAchievement && (
          <AchievementUnlock 
            achievement={unlockedAchievement} 
            onComplete={() => setUnlockedAchievement(null)} 
          />
        )}
        {xpLabels.map(label => (
          <XPLabel 
            key={label.id} 
            {...label}
          />
        ))}
      </AnimatePresence>
      <ComboDisplay combo={combo} />
      <ConfettiCanvas />
      <AnimatePresence>
        {showAchievements && (
          <AchievementsModal 
            isOpen={showAchievements} 
            onClose={() => setShowAchievements(false)} 
            profile={profile} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
