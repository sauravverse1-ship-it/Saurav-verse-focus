import { AtmosphereSheet } from './components/AtmosphereSheet';
import { playAmbientSound, stopAmbientSound, setMasterVolume } from './services/audioService';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from './lib/firebase';
import { signInWithPopup, onAuthStateChanged, User, signOut, signInAnonymously, getRedirectResult, signInWithRedirect, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, onSnapshot, addDoc, updateDoc, increment, orderBy, limit, deleteDoc, arrayUnion, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { Timetable } from './components/Timetable';
import { FireBreathingScene } from './components/FireBreathingScene';
import { FlaskConical, History, Play, Pause, RotateCcw, CheckCircle, Check, Home, Timer, BarChart2, User as UserIcon, 
  Plus, Settings, Volume2, VolumeX, Maximize2, Minimize2, Award, Zap, BellOff, Layout,
  CloudRain, Coffee, Wind, LogOut, Download, BookOpen, Heart, Activity, Calendar, 
  Trash2, Edit, ChevronRight, Hash, Clock, Brain, Target, Flame, Sparkles, MessageSquare, Battery, Droplets, Moon, Utensils, ShieldCheck, ShieldAlert, ThumbsUp, ThumbsDown, SkipForward, Star, Music, AlertCircle, Trophy, Loader2, Cpu, Users, Layers, Binary, Skull, X, Palette, Mic, Camera, Search, Swords, FileText, Beaker, MoreHorizontal, Lock, Globe, Network, Radio as RadioIcon, Shield, ShoppingBag, Fingerprint
} from 'lucide-react';
import { getAICoachResponse, getAIQuote, getAIHabitSuggestions, getAIProductivityDirectives } from './services/geminiService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTranslation } from 'react-i18next';
import { format, subDays, differenceInDays } from 'date-fns';
import './i18n';
import { Howl } from 'howler';
import { SimpleTimer } from './components/SimpleTimer';
import { HeroSection } from './components/CinematicSections';
import { ExamCountdown } from './components/ExamCountdown';
import { FormulaVault } from './components/FormulaVault';
import { Leaderboard } from './components/Leaderboard';
import { StudyRooms } from './components/StudyRooms';
import { NightRitual } from './components/NightRitual';
import { VitalitySection } from './components/Vitality/VitalitySection';
import { HabitsSection } from './components/HabitsSection';
import { HabitsGrid } from './components/HabitsGrid';
import { DeveloperSection } from './components/DeveloperSection';
import { TiltCard, MagneticButton } from './components/CinematicLayout';
import { CustomCursor } from './components/CustomCursor';
import { NameRequestModal } from './components/NameRequestModal';
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
import { UserProfile, Task, Habit, FocusSession, SessionLog, SocialPost, DevilContract, FlashcardDeck, Achievement, AmbientTrack, Subject, Dream, Persona, ResourceInventory, CraftedItem, CraftingRecipe, LegacyMilestone, FutureLetter, UserLegacy, JournalEntry, SeasonPass, SeasonMission, SectorEvent, StoreItem } from './types';
import { AnalyticsView } from './components/AnalyticsView';
import { AIAssistantView } from './components/AIAssistantView';
import { PochitaPet } from './components/PochitaPet';
import { DevilContractCard } from './components/DevilContractCard';
import { SignContractModal } from './components/SignContractModal';
import { QuantumMirror } from './components/QuantumMirror';
import { FlashcardArena } from './components/FlashcardArena';
import { CinematicOnboarding } from './components/CinematicOnboarding';
import { SubjectBrain } from './components/SubjectBrain';
import { BreakRitual } from './components/BreakRitual';
import { MissionImpossibleMode, Mission } from './components/MissionImpossibleMode';
import { SocialFeed } from './components/SocialFeed';
import { DreamBoard } from './components/DreamBoard';
import { PersonaLab } from './components/PersonaLab';
import { RivalDashboard } from './components/RivalDashboard';
import { LegacyView } from './components/LegacyView';
import { AlchemyView } from './components/AlchemyView';
import { FocusLab } from './components/FocusLab';
import { AIArena } from './components/AIArena';
import { SmartNotes } from './components/SmartNotes';
import { SmartNote, FocusExperiment, ArenaTournament, KnowledgeNode, DimensionType, BroadcastSession } from './types';
import { FocusStream } from './components/FocusStream';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { BUREAU_CHARACTERS } from './constants';
import { PublicSafetyBureau } from './components/PublicSafetyBureau';
import { ReflectionsJournal } from './components/ReflectionsJournal';
import { QuantumRadio } from './components/QuantumRadio';
import { fallbackStoreItems } from './lib/fallbackStoreItems';
import { SeasonPassUI } from './components/SeasonPass';
import { QuantumStore } from './components/QuantumStore';
import { GlobalEvents } from './components/GlobalEvents';
import { NeuralLink } from './components/NeuralLink';

const DIMENSIONS_CONFIG = {
  void: { name: 'The Void', unlock: 'Default', icon: '🌑', primary: '#7b5fe8', secondary: '#00ffe0', bg: '#080808' },
  grid: { name: 'The Grid', unlock: '7-Day Streak', icon: '🌐', primary: '#00ffe0', secondary: '#004d40', bg: '#001210' },
  cosmos: { name: 'The Cosmos', unlock: '30-Day Streak', icon: '🌌', primary: '#ff4060', secondary: '#d4a843', bg: '#080510' },
  chainsaw: { name: 'Chainsaw Realm', unlock: '5 Devil Contracts', icon: '🪚', primary: '#ff0000', secondary: '#400000', bg: '#100000' },
  legend: { name: 'Legend Plane', unlock: 'Reach Legend Rank', icon: '👑', primary: '#d4a843', secondary: '#7b5fe8', bg: '#050505' }
};

// Constants moved to types.ts or used directly


// --- Constants ---
const XP_PER_POMODORO = 50; // Increased from 15
const XP_PER_HABIT = 25; // Increased from 5
const XP_PER_TIER = 500; // Added constant, will use it
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

const AMBIENT_CATEGORIES = [
  { id: 'nature', label: 'Nature', icon: 'CloudRain' },
  { id: 'focus', label: 'Focus', icon: 'Brain' },
  { id: 'atmosphere', label: 'Atmosphere', icon: 'Music' }
];

const AMBIENT_DATA: AmbientTrack[] = [
  // Lofi
  { id: 'lofi', label: 'Lofi Beats', category: 'lofi', icon: 'Music' },
  { id: 'chillhop', label: 'Total Concentration', category: 'lofi', icon: 'Headphones' },
  { id: 'thunder-breathing', label: "Zenitsu's Clap", category: 'lofi', icon: 'Zap' },
  { id: 'lofi-study', label: 'Lofi Study', category: 'lofi', icon: 'Book' },
  // Focus
  { id: 'chainsaw-engine', label: 'Chainsaw Engine', category: 'focus', icon: 'Activity' },
  { id: 'deep-focus', label: 'Deep Focus', category: 'focus', icon: 'Brain' },
  { id: 'white-noise', label: 'Hollow Echo', category: 'focus', icon: 'Wind' },
  { id: 'binaural-beats', label: 'Binaural', category: 'focus', icon: 'Headphones' },
  // Nature
  { id: 'rain', label: 'Heavy Rain', category: 'nature', icon: 'CloudRain', url: 'https://actions.google.com/sounds/v1/water/rain_on_roof.ogg' },
  { id: 'forest', label: 'Wisteria Forest', category: 'nature', icon: 'Activity', url: 'https://actions.google.com/sounds/v1/ambiences/morning_forest.ogg' },
  { id: 'waves', label: 'Water Breathing', category: 'nature', icon: 'Droplets', url: 'https://actions.google.com/sounds/v1/water/waves_clashing.ogg' },
  { id: 'fire', label: 'Flame Breathing', category: 'nature', icon: 'Flame', url: 'https://actions.google.com/sounds/v1/ambiences/fire_crackling.ogg' },
  // Atmosphere
  { id: 'cafe', label: 'Public Safety', category: 'atmosphere', icon: 'Coffee' },
  { id: 'library', label: 'Zen Library', category: 'atmosphere', icon: 'BookOpen' },
];

const AMBIENT_TRACKS = AMBIENT_DATA.reduce((acc, track) => {
  if (track.url) acc[track.id] = track.url;
  return acc;
}, {} as Record<string, string>);

const DEFAULT_SUBJECTS = [
  { id: 'math', name: 'Mathematics', color: '#FFAB76' },
  { id: 'physics', name: 'Physics', color: '#4FC3F7' },
  { id: 'chemistry', name: 'Chemistry', color: '#A5D6A7' },
  { id: 'biology', name: 'Biology', color: '#F48FB1' },
];

// --- Components ---

const FloatingParticles: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            opacity: 0 
          }}
          animate={{ 
            y: [null, Math.random() * -200 - 100],
            opacity: [0, 0.4, 0],
            x: [null, (Math.random() - 0.5) * 100]
          }}
          transition={{ 
            duration: 10 + Math.random() * 20, 
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-white/20 blur-[1px] rounded-full"
        />
      ))}
    </div>
  );
};

const DevilHunt: React.FC<{ onBanish: (xp: number) => void }> = ({ onBanish }) => {
  const [stage, setStage] = useState<'intro' | 'active'>('intro');
  const [clicks, setClicks] = useState(0);
  const targetClicks = 15;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-red-950/40 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.8, rotate: -5 }}
        animate={{ scale: 1, rotate: 0 }}
        className="w-full max-w-md bg-black border-4 border-red-600 p-8 rounded-[3rem] text-center space-y-6 shadow-[0_0_100px_rgba(220,38,38,0.3)]"
      >
        {stage === 'intro' ? (
          <>
            <Skull className="w-20 h-20 text-red-600 mx-auto animate-bounce" />
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Devil Encounter!</h2>
            <p className="text-red-500 font-bold uppercase tracking-widest text-xs">The Procrastination Devil has manifested.</p>
            <button 
              onClick={() => setStage('active')}
              className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-red-500 transition-all shadow-lg"
            >
              Exterminate!
            </button>
          </>
        ) : (
          <div className="space-y-8">
            <div className="relative w-32 h-32 mx-auto">
               <motion.div 
                 animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                 transition={{ duration: 0.2, repeat: Infinity }}
                 className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full"
               />
               <Swords 
                 onClick={() => {
                   setClicks(prev => prev + 1);
                   if (clicks + 1 >= targetClicks) onBanish(200);
                 }}
                 className="w-full h-full text-red-600 cursor-pointer active:scale-75 transition-transform" 
               />
            </div>
            <div className="space-y-2">
               <div className="h-2 w-full bg-red-900/50 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${(clicks / targetClicks) * 100}%` }}
                    className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  />
               </div>
               <p className="text-[10px] font-black uppercase text-red-500/60">Successive strikes required: {targetClicks - clicks}</p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const NeuralMatrix: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <div className={cn(
      "absolute inset-0 pointer-events-none transition-opacity duration-1000",
      active ? "opacity-100" : "opacity-0"
    )}>
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05)_0%,transparent_70%)]" />
       <div className="grid grid-cols-12 h-full w-full opacity-10">
          {Array.from({ length: 48 }).map((_, i) => (
            <motion.div
              key={i}
              animate={active ? {
                opacity: [0.1, 0.5, 0.1],
                scale: [1, 1.1, 1],
              } : {}}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              className="h-full border-l border-t border-white/[0.05]"
            />
          ))}
       </div>
    </div>
  );
};

const XPBar = ({ profile, onPrestige }: { profile: UserProfile | null, onPrestige?: () => void }) => {
  if (!profile) return null;
  const rank = getRank(profile.xp);
  const { currentXP, nextLevelXP, progress } = getXPProgress(profile.xp);

  return (
    <div className="w-full px-2 py-4 space-y-2 mt-auto">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">{rank.icon}</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono leading-none tracking-tighter opacity-50 uppercase flex items-center gap-1">
               Current Rank 
               {profile.prestigeLevel ? <span className="text-amber-400">♦{profile.prestigeLevel}</span> : null}
            </span>
            <span className="font-display text-sm uppercase text-white leading-tight">
              {rank.id === 'legend' ? <LegendText text={rank.name} className="text-sm" /> : rank.name}
            </span>
          </div>
        </div>
        {rank.id === 'legend' && onPrestige ? (
           <button 
             onClick={onPrestige}
             className="px-2 py-1 bg-amber-500/20 text-amber-500 border border-amber-500/50 rounded text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-colors animate-pulse"
           >
             Prestige
           </button>
        ) : (
           <span className="font-mono text-[10px] opacity-60"><TickingNumber value={Math.round(progress)} />%</span>
        )}
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
        <span className="text-[9px] font-mono opacity-40">{nextLevelXP === Infinity ? 'MAX' : <><TickingNumber value={nextLevelXP} /> XP</>}</span>
      </div>
    </div>
  );
};

const Button = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={cn("material-button-primary", className)} {...props}>
    {children}
  </button>
);

const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const NavButton = ({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) => (
  <button 
    onClick={(e) => { 
      playTick(); 
      onClick(); 
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('app-touch-spark', { detail: { x: (e as any).clientX, y: (e as any).clientY } });
        window.dispatchEvent(event);
      }
    }}
    onMouseEnter={playTick}
    className={cn(
      "group relative flex items-center md:flex-row flex-col gap-0.5 md:gap-4 md:w-full md:px-4 md:py-3 transition-all duration-300 h-14 md:h-auto justify-center md:justify-start px-1 md:px-2 flex-1 md:flex-none",
      "md:w-full"
    )}
  >
    <div className={cn(
      "relative z-10 w-10 h-6 md:w-16 md:h-10 flex items-center justify-center rounded-full transition-all duration-300 nav-icon-wrap mb-0.5 md:mb-0",
      active ? "bg-md-primary-container text-md-primary shadow-[0_0_15px_rgba(var(--md-primary-rgb),0.3)]" : "text-md-on-surface-variant group-hover:text-white"
    )}>
      {active && (
        <motion.div 
          layoutId="nav-pill-bg"
          className="absolute inset-0 bg-md-primary-container rounded-full shadow-[0_0_20px_rgba(0,255,224,0.2)] -z-10"
        />
      )}
      <Icon className={cn("w-5 h-5 md:w-5 md:h-5 transition-transform duration-300", active && "scale-110")} strokeWidth={active ? 3 : 2} />
    </div>
    <span className={cn(
      "hidden md:block text-[7px] md:text-sm font-mono uppercase tracking-[0.05em] font-black transition-all duration-300 whitespace-nowrap truncate w-full text-center md:text-left",
      active ? "text-white opacity-100" : "text-md-on-surface-variant md:opacity-60 md:group-hover:opacity-100 opacity-40"
    )}>
      {label}
    </span>
  </button>
);

const MoreCard = ({ icon: Icon, label, sub, onClick, disabled = false, active = false }: { icon: any, label: string, sub: string, onClick: () => void, disabled?: boolean, active?: boolean }) => (
  <motion.button 
    whileHover={!disabled ? { y: -5, scale: 1.02 } : {}}
    whileTap={!disabled ? { scale: 0.98 } : {}}
    onClick={!disabled ? onClick : undefined}
    className={cn(
      "glass-card p-6 md:p-8 rounded-[2.5rem] border flex flex-col items-center justify-between gap-4 transition-all group",
      disabled ? "grayscale opacity-50 cursor-not-allowed border-white/5" : "hover:bg-white/5 border-white/5 cursor-pointer",
      active ? "bg-md-primary/10 border-md-primary/20" : ""
    )}
  >
     <div className={cn(
       "w-12 h-12 md:w-16 md:h-16 rounded-3xl flex items-center justify-center transition-all",
       disabled ? "bg-white/5" : active ? "bg-md-primary/20" : "bg-white/5 group-hover:bg-md-primary/20",
       active && "neural-glow"
     )}>
        <Icon className={cn(
          "w-6 h-6 md:w-8 md:h-8 transition-all",
          disabled ? "text-white/20" : active ? "text-md-primary" : "text-white/40 group-hover:text-md-primary"
        )} />
     </div>
     <div className="text-center">
        <div className={cn("text-xs md:text-sm font-black uppercase tracking-widest", disabled ? "text-white/20" : "text-white")}>{label}</div>
        <div className="text-[8px] md:text-[10px] text-white/20 uppercase tracking-[0.2em] mt-1">{sub}</div>
     </div>
  </motion.button>
);

const SEED_STORE_ITEMS: Partial<StoreItem>[] = [
  { id: 'pochita-skin-hat', name: 'Adventurer Hat', description: 'A cute tiny hat for your Pochita.', priceXP: 500, category: 'cosmetic', rarity: 'rare', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=hat&backgroundColor=b6e3f4' },
  { id: 'pochita-skin-glasses', name: 'Smart Glasses', description: 'Makes Pochita look like a scholar.', priceXP: 800, category: 'cosmetic', rarity: 'rare', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=glasses&backgroundColor=ffdfba' },
  { id: 'pochita-skin-devil', name: 'Devil Wings', description: 'Unleash the inner power.', priceXP: 2500, category: 'cosmetic', rarity: 'epic', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=wings&backgroundColor=ff4d4d' },
  { id: 'ring-crimson', name: 'Crimson Aura', description: 'A burning red focus ring.', priceXP: 1200, category: 'cosmetic', rarity: 'epic', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=crimson&backgroundColor=ff4d4d' },
  { id: 'ring-neon', name: 'Neon Pulse', description: 'Cybernetic focus ring.', priceXP: 1500, category: 'cosmetic', rarity: 'epic', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=neon&backgroundColor=00ffe0' },
  { id: 'streak-shield', name: 'Streak Shield', description: 'Prevents streak loss for 24 hours.', priceXP: 3000, category: 'powerup', rarity: 'rare', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=shield&backgroundColor=7bed9f' },
  { id: 'focus-potion', name: 'Focus Potion', description: 'Double XP for the next 2 sessions.', priceXP: 2500, category: 'powerup', rarity: 'epic', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=potion&backgroundColor=70a1ff' },
  { id: 'neural-upgrade-1', name: 'Neural Accelerator', description: 'Permanent 5% XP boost.', priceXP: 8000, category: 'powerup', rarity: 'legendary', image: 'https://api.dicebear.com/7.x/shapes/svg?seed=cpu&backgroundColor=d4a843' },
  { id: 'legend-denji', name: 'Denji (Hero)', description: 'Recruit the Chainsaw Man to your squad.', priceXP: 10000, category: 'special', rarity: 'legendary', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=denji' },
  { id: 'legend-makima', name: 'Makima (Control)', description: 'A mysterious and powerful ally.', priceXP: 15000, category: 'special', rarity: 'legendary', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=makima' },
  { id: 'legend-power', name: 'Power (Blood)', description: 'The absolute best buddy.', priceXP: 12000, category: 'special', rarity: 'legendary', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=power' },
];

export default function App() {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState<'cinematic' | 'dashboard'>('cinematic');
  const [touchSparks, setTouchSparks] = useState<{ id: number, x: number, y: number }[]>([]);

  useEffect(() => {
    const handleSpark = (e: any) => {
      // Ignore interactive elements
      if (e.target instanceof Element && e.target.closest('button, a, input, nav')) return;
      
      // If triggered via custom event, use detail. If click, use clientX/Y
      const targetX = e.detail?.x ?? e.clientX ?? (e.touches?.[0]?.clientX);
      const targetY = e.detail?.y ?? e.clientY ?? (e.touches?.[0]?.clientY);
      
      if (targetX === undefined || targetY === undefined || isNaN(targetX) || isNaN(targetY)) return;
      
      const id = Date.now() + Math.random();
      setTouchSparks(s => [...s, { id, x: targetX, y: targetY }]);
      setTimeout(() => {
        setTouchSparks(s => s.filter(spark => spark.id !== id));
      }, 600);
    };
    
    window.addEventListener('app-touch-spark', handleSpark as EventListener, { passive: true });
    window.addEventListener('pointerdown', handleSpark, { passive: true }); // Global listener
    
    return () => {
      window.removeEventListener('app-touch-spark', handleSpark as EventListener);
      window.removeEventListener('pointerdown', handleSpark);
    };
  }, []);

  const handleDashboardTransition = () => {
    playWhoosh();
    setView('dashboard');
  };

  const [user, setUser] = useState<User | null>(null);
  const userPath = useMemo(() => user ? `users/${user.uid}` : '', [user]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dream, setDream] = useState<Dream | null>(null);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const handleJoinTournament = async (tournamentId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'tournaments', tournamentId), {
        participantsTier1: arrayUnion(user.uid)
      });
      setFocusToastMsg("ARENA ENTRY GRANTED: VOID BRACKET UNLOCKED");
      setShowFocusToast(true);
      setTimeout(() => setShowFocusToast(false), 3000);
      playWhoosh();
    } catch (e) {
      console.error("Join tournament error:", e);
    }
  };

  const handleSelectBureauMission = async (mission: any) => {
    if (!user) return;
    try {
      const missionTitle = `Bureau directive: ${mission.title}`;
      addTask(missionTitle, 'study', true, 3);
      setFocusToastMsg("SPECIAL DIRECTIVE: TASK ASSIGNED");
      setShowFocusToast(true);
      setTimeout(() => setShowFocusToast(false), 3000);
      playTick();
    } catch (e) {
      console.error("Bureau mission error:", e);
    }
  };

  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'habits' | 'timer' | 'stats' | 'profile' | 'ai' | 'arena' | 'rooms' | 'sector' | 'legacy' | 'alchemy' | 'lab' | 'notes' | 'graph' | 'stream' | 'bureau' | 'events' | 'store' | 'neural' | 'contracts'>('home');
  const [pochitaEvent, setPochitaEvent] = useState<{ type: 'task_complete' | 'session_start' | 'xp_gain' | 'contract_signed', timestamp: number } | null>(null);
  const [showDevilHunt, setShowDevilHunt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installedHabitIds, setInstalledHabitIds] = useState<string[]>([]);
  const [taskSearch, setTaskSearch] = useState('');
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<'all' | 'study' | 'personal' | 'health'>('all');
  const [taskSortBy, setTaskSortBy] = useState<'priority' | 'deadline' | 'created'>('priority');
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isFormulaVaultOpen, setIsFormulaVaultOpen] = useState(false);
  const [isNightRitualOpen, setIsNightRitualOpen] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const hasShownNameModal = useRef(false);
 
  // --- New Feature State ---
  const [notes, setNotes] = useState<SmartNote[]>([]);
  const [experiments, setExperiments] = useState<FocusExperiment[]>([]);
  const [tournaments, setTournaments] = useState<ArenaTournament[]>([]);
  const [rivals, setRivals] = useState<UserProfile[]>([]);
  const [showDreamPrompt, setShowDreamPrompt] = useState(false);
  const [broadcasts, setBroadcasts] = useState<BroadcastSession[]>([]);
  const [longPressTimer, setLongPressTimer] = useState<any>(null);
  const [activeEvents, setActiveEvents] = useState<SectorEvent[]>([]);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const dbSaveTimeout = useRef<any>(null);
  // Consolidated refs moved to top

  const dbSave = useCallback((updates: Partial<UserProfile>) => {
    if (!user) return;
    if (dbSaveTimeout.current) clearTimeout(dbSaveTimeout.current);
    dbSaveTimeout.current = setTimeout(() => {
      updateDoc(doc(db, 'users', user.uid), updates).catch(e => console.error("DB Save Fail:", e));
    }, 1500);
  }, [user]);

  const dbSaveImmediate = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return;
    if (dbSaveTimeout.current) clearTimeout(dbSaveTimeout.current);
    await updateDoc(doc(db, 'users', user.uid), updates).catch(e => console.error("DB Immediate Save Fail:", e));
  }, [user]);

  useEffect(() => {
    if (user?.isAnonymous && profile && profile.displayName === 'Guest User' && !hasShownNameModal.current) {
      setShowNameModal(true);
      hasShownNameModal.current = true;
    }
  }, [user, profile]);

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      console.warn("Popup failed, trying redirect:", e);
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/cancelled-by-user') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (re: any) {
          setAuthError(re.message || "Authentication failed.");
          setIsAuthenticating(false);
        }
      } else {
        setAuthError(e.message || "Authentication failed.");
        setIsAuthenticating(false);
      }
    }
  };

  const handleAnonymousLogin = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      await signInAnonymously(auth);
    } catch (e: any) {
      setAuthError(e.message || "Anonymous login failed.");
      setIsAuthenticating(false);
    }
  };

  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isFlowState, setIsFlowState] = useState(false);
  const _sessionLocked = useRef(false);
  const isCompletingSessionRef = useRef(false);
  const sessionLockedRef = useRef(false); 
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [isSeasonPassOpen, setIsSeasonPassOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  
  // Dimension Unlocking Logic ... existing effect ...

  // Initialize Season Pass if missing
  useEffect(() => {
    if (!user || !profile || profile.seasonPass) return;
    
    const initialPass: SeasonPass = {
      currentTier: 1,
      currentXP: 0,
      seasonEndDate: Date.now() + (30 * 24 * 60 * 60 * 1000),
      unlockedTiers: [],
      dailyMissions: [
        { id: 'm1', type: 'timer', text: 'Complete 2 focus sessions', requirement: 2, currentValue: 0, completed: false, tierReward: 200 },
        { id: 'm2', type: 'habit', text: 'Stablish 3 daily rituals', requirement: 3, currentValue: 0, completed: false, tierReward: 150 },
        { id: 'm3', type: 'journal', text: 'Upload neural reflection', requirement: 1, currentValue: 0, completed: false, tierReward: 250 },
        { id: 'm4', type: 'social', text: 'Echo focus in the network', requirement: 1, currentValue: 0, completed: false, tierReward: 100 },
      ]
    };
    
    updateDoc(doc(db, 'users', user.uid), { seasonPass: initialPass });
  }, [user, profile]);

  const handleSaveJournalEntry = async (entry: Partial<JournalEntry>) => {
    if (!user) return;
    
    // Check if entry for today already exists to prevent double XP
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alreadyDone = journalEntries.some(e => {
      const entryDate = new Date(e.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    const finalEntry = {
      ...entry,
      userId: user.uid,
      id: `journal-${Date.now()}`,
      date: Date.now()
    };
    
    // Unified to subcollection
    await addDoc(collection(db, 'users', user.uid, 'journal'), finalEntry);

  // XP Rewards
    let bonusXP = alreadyDone ? 5 : 30; // Reduced XP if second entry today
    
    // Streak check: +50 XP bonus if written 7 days in a row
    // We look at the last 7 days of entries
    const sortedEntries = [...journalEntries, { ...finalEntry, id: 'temp' } as JournalEntry]
      .sort((a, b) => b.date - a.date);
    
    const uniqueDays = new Set();
    const consecutiveDays: number[] = [];
    
    for (const e of sortedEntries) {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      const time = d.getTime();
      if (!uniqueDays.has(time)) {
        uniqueDays.add(time);
        consecutiveDays.push(time);
      }
    }

    let streak = 0;
    const ONE_DAY = 24 * 60 * 60 * 1000;
    for (let i = 0; i < consecutiveDays.length - 1; i++) {
      if (consecutiveDays[i] - consecutiveDays[i + 1] <= ONE_DAY + 1000) { // allowance for slight variations
        streak++;
      } else {
        break;
      }
    }

    if (streak >= 6 && !alreadyDone) { // 7 days (current + 6 previous consecutive)
      bonusXP += 50;
      setFocusToastMsg(`+${bonusXP} XP • 7-DAY JOURNAL STREAK!`);
    } else {
      setFocusToastMsg(`+${bonusXP} XP • REFLECTION RECORDED`);
    }
    
    setShowFocusToast(true);
    setTimeout(() => setShowFocusToast(false), 3000);
    
    awardXP(bonusXP, 'study', 'DAILY REFLECTION');
    updateBPMissionProgress('journal', 1);
  };

  // Moved todayJournalStats below neuralScore
  const toggleNeuralLink = async () => {
    if (!user || !profile) return;
    const newState = !profile.neuralLinkEnabled;
    setProfile({ ...profile, neuralLinkEnabled: newState });
    await updateDoc(doc(db, 'users', user.uid), { neuralLinkEnabled: newState });
    setFocusToastMsg(`NEURAL LINK: ${newState ? 'CONNECTED' : 'DISCONNECTED'}`);
    setShowFocusToast(true);
    setTimeout(() => setShowFocusToast(false), 3000);
    playBell();
  };

  const handleRecruitCharacter = async (characterId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        recruitedCharacters: arrayUnion(characterId),
        [`characterBonds.${characterId}`]: 0
      });
      setFocusToastMsg("CONTRACT SEALED: CHARACTER RECRUITED");
      setShowFocusToast(true);
      setTimeout(() => setShowFocusToast(false), 3000);
      playBell();
    } catch (e) {
      console.error("Recruit error:", e);
    }
  };

  const handleSelectCharacter = async (characterId: string | null) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        activeCharacterId: characterId
      });
      setFocusToastMsg(characterId ? `PARTNER ASSIGNED: ${characterId.toUpperCase()}` : "PARTNER RELIEVED");
      setShowFocusToast(true);
      setTimeout(() => setShowFocusToast(false), 3000);
      playTick();
    } catch (e) {
      console.error("Select character error:", e);
    }
  };

  const updateBPMissionProgress = async (type: string, amount: number = 1) => {
    if (!user || !profile || !profile.seasonPass) return;

    const newMissions = profile.seasonPass.dailyMissions.map(m => {
       if (m.id === type || (m as any).type === type) {
          const newProgress = Math.min(m.currentValue + amount, m.requirement);
          return { ...m, currentValue: newProgress, completed: newProgress >= m.requirement };
       }
       return m;
    });

    let newXP = profile.seasonPass.currentXP || 0;
    
    // Check for just-completed missions
    newMissions.forEach(m => {
       if (m.completed && !profile.seasonPass!.dailyMissions.find(old => old.id === m.id)?.completed) {
         setFocusToastMsg(`MISSION COMPLETE: +${m.tierReward} BP XP`);
         setShowFocusToast(true);
         setTimeout(() => setShowFocusToast(false), 4000);
         playBell();
         // Actually add the BP XP!
         newXP += m.tierReward;
       }
    });

    const newTier = Math.floor(newXP / XP_PER_TIER) + 1; // Used XP_PER_TIER constant

    const newProfile = {
      ...profile,
      seasonPass: {
        ...profile.seasonPass,
        currentXP: newXP,
        currentTier: newTier,
        dailyMissions: newMissions
      }
    };
    
    setProfile(newProfile);
    await updateDoc(doc(db, 'users', user.uid), { seasonPass: newProfile.seasonPass });
  };

  const [coachMessages, setCoachMessages] = useState<{ 
    role: 'user' | 'ai', 
    text: string, 
    habitSuggestions?: {title: string, icon: string, description: string}[],
    directives?: string[]
  }[]>([
    { role: 'ai', text: 'Quantum systems initialized. Ready to grind? I have analyzed your schedule for 2027.' }
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
  const [sessionFinished, setSessionFinished] = useState(false);
  const [mode, setMode] = useState<'study' | 'shortBreak' | 'longBreak'>('study');
  const [pochitaLastXP, setPochitaLastXP] = useState(profile?.xp || 0);

  useEffect(() => {
    if (isRunning && mode === 'study') {
      setPochitaEvent({ type: 'session_start', timestamp: Date.now() });
    }
  }, [isRunning, mode]);

  useEffect(() => {
    if (profile?.xp !== undefined && profile.xp > pochitaLastXP) {
       setPochitaEvent({ type: 'xp_gain', timestamp: Date.now() });
    }
    if (profile?.xp !== undefined) {
      setPochitaLastXP(profile.xp);
    }
  }, [profile?.xp, pochitaLastXP]);
  const [sessionCount, setSessionCount] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [dailyGoalMins, setDailyGoalMins] = useState(120);
  const [isPlayingTick, setIsPlayingTick] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [customSubjects, setCustomSubjects] = useState<{ id: string; name: string; color: string }[]>([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');

  // Subjects combination
  const allSubjects = [...DEFAULT_SUBJECTS, ...customSubjects];
  const [showIntentPrompt, setShowIntentPrompt] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showFocusToast, setShowFocusToast] = useState(false);
  const [focusToastMsg, setFocusToastMsg] = useState("");
  const [isAtmosphereSheetOpen, setIsAtmosphereSheetOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [addTaskCategory, setAddTaskCategory] = useState<'study' | 'health' | 'personal'>('study');
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
  const [streakAchieved, setStreakAchieved] = useState<number | null>(null);
  const [taskSortKey, setTaskSortKey] = useState<'deadline' | 'priority' | 'urgent'>('priority');
  const [sessionIntention, setSessionIntention] = useState("");
  const [intentionError, setIntentionError] = useState('');
  const [showIntentionInput, setShowIntentionInput] = useState(false);
  const [distractions, setDistractions] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [focusScore, setFocusScore] = useState<number | null>(null);
  const [breakActivity, setBreakActivity] = useState<string>("");
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [isSimpleTimerMode, setIsSimpleTimerMode] = useState(false);
  const [isInStudyRoom, setIsInStudyRoom] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [hasSeenDreamPromptToday, setHasSeenDreamPromptToday] = useState(false);
  
  // Profile Editor state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState('');

  // Part 2 & 3 Timer States
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const ringContainerRef = useRef<HTMLDivElement>(null);
  const orbitDotRef = useRef<HTMLDivElement>(null);
  const orbitAngleRef = useRef(-60);
  const orbitSpeedRef = useRef(0.18);
  const containerSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (ringContainerRef.current) {
        const { width, height } = ringContainerRef.current.getBoundingClientRect();
        containerSizeRef.current = { width, height };
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  const totalTime = mode === 'study' ? (profile?.settings?.workDuration || 25) * 60 : (profile?.settings?.breakDuration || 5) * 60;
  const pomodoroProgress = Math.min(100, Math.max(0, ((totalTime - timeLeft) / totalTime) * 100));

  useEffect(() => {
    orbitSpeedRef.current = isRunning ? 0.35 : 0.18;
  }, [isRunning]);

  useEffect(() => {
    // Left intentionally empty removed ticker
  }, []);

  useEffect(() => {
    try {
        const logs = localStorage.getItem('pomodoro_sessions');
        if (logs) setSessionLogs(JSON.parse(logs));
    } catch (e) { console.error("Could not parse logs", e); }
  }, []);

  // Sync Firebase sessions for logged in users
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'sessions'), orderBy('timestamp', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fbSessions: SessionLog[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          duration: data.duration,
          timestamp: data.timestamp,
          type: 'focus',
          missionTitle: data.missionTitle || 'Focus Session',
          subject: data.subject || data.taskId ? tasksRef.current.find(t => t.id === data.taskId)?.subjects?.[0] : null,
          completed: true
        };
      });

      setSessionLogs(prev => {
        // Merge local logs (which might have breaks/incomplete sessions) with firebase focus sessions
        const localOnly = prev.filter(l => !l.completed || l.type === 'break');
        const merged = [...fbSessions, ...localOnly];
        // Remove duplicates by id
        const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
        return unique.sort((a,b) => b.timestamp - a.timestamp);
      });
    });
    return () => unsubscribe();
  }, [user]);

  const streak = useMemo(() => {
     if (sessionLogs.length === 0) return 0;
     const dates = Array.from(new Set(sessionLogs.filter(l => l.completed).map(l => new Date(l.timestamp).toDateString()))).sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
     let currentStreak = 0;
     let checkDate = new Date();
     while (true) {
         if (dates.includes(checkDate.toDateString())) {
             currentStreak++;
             checkDate.setDate(checkDate.getDate() - 1);
         } else {
             if (currentStreak === 0 && checkDate.toDateString() === new Date().toDateString()) {
                 checkDate.setDate(checkDate.getDate() - 1); // allow missing today
                 continue;
             }
             break;
         }
     }
     return currentStreak;
  }, [sessionLogs]);

  const awardResources = async (res: Partial<ResourceInventory>) => {
    if (!user) return;
    const resPath = `users/${user.uid}/inventory/data`;
    try {
      const updates: any = {};
      Object.entries(res).forEach(([key, val]) => {
        if (typeof val === 'number') {
          updates[key] = increment(val);
        }
      });
      await setDoc(doc(db, resPath), updates, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, resPath);
    }
  };

  const addLegacyMilestone = async (milestone: Omit<LegacyMilestone, 'id' | 'date'>) => {
    if (!user) return;
    const legacyPath = `users/${user.uid}/legacy/data`;
    const newMilestone: LegacyMilestone = {
      ...milestone,
      id: `milestone-${Date.now()}`,
      date: Date.now()
    };
    try {
      await updateDoc(doc(db, legacyPath), {
        milestones: arrayUnion(newMilestone)
      });
    } catch (e) {
      // If doc doesn't exist, create it
      try {
        await setDoc(doc(db, legacyPath), {
          milestones: [newMilestone],
          totalFocusHours: 0,
          totalSessions: 0,
          totalTasksCompleted: 0,
          totalHabitsCompleted: 0,
          totalXpEarned: 0,
          longestStreak: 0,
          bestFocusScore: 0,
          dimensionsUnlocked: 1,
          futureLetters: []
        }, { merge: true });
      } catch (innerE) {
        handleFirestoreError(innerE, OperationType.UPDATE, legacyPath);
      }
    }
  };
  
  const updateLegacyStats = async (stats: Partial<UserLegacy>) => {
    if (!user) return;
    const legacyPath = `users/${user.uid}/legacy/data`;
    try {
      await updateDoc(doc(db, legacyPath), stats);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, legacyPath);
    }
  };

  const handleCraft = async (recipe: CraftingRecipe) => {
    if (!user || !profile) return;
    const resPath = `users/${user.uid}/inventory/data`;
    const itemsPath = `users/${user.uid}/items`;

    try {
      // 1. Deduct resources
      const resUpdates: any = {};
      Object.entries(recipe.inputs).forEach(([key, val]) => {
        resUpdates[key] = increment(-(val || 0));
      });
      await updateDoc(doc(db, resPath), resUpdates);

      // 2. Add or increment item
      const itemQ = query(collection(db, itemsPath), where('type', '==', recipe.outputType));
      const snapshot = await getDocs(itemQ);
      
      if (!snapshot.empty) {
        const itemDoc = snapshot.docs[0];
        await updateDoc(doc(db, itemsPath, itemDoc.id), {
          quantity: increment(1)
        });
      } else {
        const newItem: CraftedItem = {
          id: `item-${Date.now()}`,
          name: recipe.name,
          type: recipe.outputType,
          quantity: 1
        };
        await setDoc(doc(db, itemsPath, newItem.id), newItem);
      }

      // Add to legacy
      addLegacyMilestone({
        title: `Forged ${recipe.name}`,
        description: `Successfully synthesized a ${recipe.rarity} ${recipe.name} in the alchemy workshop.`,
        type: 'milestone'
      });

    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, resPath);
    }
  };

  const handleUseItem = async (item: CraftedItem) => {
    if (!user || !profile || item.quantity <= 0) return;
    const itemsPath = `users/${user.uid}/items`;

    try {
      if (item.quantity === 1) {
        await deleteDoc(doc(db, itemsPath, item.id));
      } else {
        await updateDoc(doc(db, itemsPath, item.id), {
          quantity: increment(-1)
        });
      }

      switch (item.type) {
        case 'focus_shield':
          await updateDoc(doc(db, `users/${user.uid}`), { streakShields: increment(1) });
          setFocusToastMsg("FOCUS SHIELD ACTIVATED");
          setShowFocusToast(true);
          setTimeout(() => setShowFocusToast(false), 3000);
          break;
        case 'xp_amplifier':
          // Implementation of XP amp could set a persistent flag in profile
          setFocusToastMsg("XP AMPLIFIER ONLINE (2X NEXT)");
          setShowFocusToast(true);
          setTimeout(() => setShowFocusToast(false), 3000);
          break;
        case 'dimension_key':
          setFocusToastMsg("DIMENSION KEY ACQUIRED");
          setShowFocusToast(true);
          setTimeout(() => setShowFocusToast(false), 3000);
          break;
        // ... handle other item effects
      }
      playTick();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, itemsPath);
    }
  };

  const handleWriteLetter = async (content: string, openDate: number) => {
    if (!user) return;
    const legacyPath = `users/${user.uid}/legacy/data`;
    const letter: FutureLetter = {
       id: `letter-${Date.now()}`,
       content,
       createdAt: Date.now(),
       openDate,
       isOpened: false
    };

    try {
      await updateDoc(doc(db, legacyPath), {
        futureLetters: arrayUnion(letter)
      });
      setFocusToastMsg("LETTER SEALED FOR THE FUTURE");
      setShowFocusToast(true);
      setTimeout(() => setShowFocusToast(false), 3000);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, legacyPath);
    }
  };


  const { 
    xpLabels, 
    awardXP, 
    rankUp, 
    setRankUp, 
    unlockedAchievement, 
    setUnlockedAchievement, 
    combo,
    awardBonus 
  } = useGamification(profile, setProfile, awardResources, addLegacyMilestone);

  const [showAchievements, setShowAchievements] = useState(false);
  const [examPreference, setExamPreferenceState] = useState<'JEE' | 'NEET' | 'None'>('None');
  const examPrefRef = useRef<'JEE' | 'NEET' | 'None'>('None');
  
  const setExamPreference = (val: 'JEE' | 'NEET' | 'None') => {
    setExamPreferenceState(val);
    examPrefRef.current = val;
  };
  const openAddTaskModal = (cat: 'study' | 'health' | 'personal' = 'study', revision = false) => {
    setAddTaskCategory(cat);
    setIsAddTaskModalOpen(true);
  };
  const [ambientSound, setAmbientSound] = useState<string>('none');
  const [activeAmbientTrack, setActiveAmbientTrack] = useState<AmbientTrack | null>(null);
  const [ambientVolume, setAmbientVolume] = useState(0.5);
  const [activeAmbientCategory, setActiveAmbientCategory] = useState<string>('nature');
  const soundRef = useRef<Howl | null>(null);

  const [contracts, setContracts] = useState<DevilContract[]>([]);
  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [showMirror, setShowMirror] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isArenaOpen, setIsArenaOpen] = useState(false);
  const [showBrain, setShowBrain] = useState(false);
  const [showMissions, setShowMissions] = useState(false);

  const isOverlayOpen = isCoachOpen || isAddTaskModalOpen || isAddHabitModalOpen || isContractModalOpen || isArenaOpen || showMirror || showBrain || showMissions || isNightRitualOpen || isFormulaVaultOpen || showNameModal || showDreamPrompt || showAchievements;

  useEffect(() => {
    if (!user) return;
    const notesPath = `users/${user.uid}/notes`;
    const expPath = `users/${user.uid}/experiments`;
    const tourneyPath = `tournaments`;
    const streamPath = `broadcasts`;

    const unsubNotes = onSnapshot(collection(db, notesPath), (snap) => {
      setNotes(snap.docs.map(d => d.data() as SmartNote));
    });
    const unsubExp = onSnapshot(collection(db, expPath), (snap) => {
      setExperiments(snap.docs.map(d => d.data() as FocusExperiment));
    });
    const unsubTourney = onSnapshot(collection(db, tourneyPath), (snap) => {
      setTournaments(snap.docs.map(d => d.data() as ArenaTournament));
    });
    const unsubStream = onSnapshot(query(collection(db, streamPath), where('isLive', '==', true)), (snap) => {
      setBroadcasts(snap.docs.map(d => d.data() as BroadcastSession));
    });

    return () => {
      unsubNotes();
      unsubExp();
      unsubTourney();
      unsubStream();
    };
  }, [user]);

  const handleSaveNote = async (note: Partial<SmartNote>) => {
    if (!user || !note.id) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/notes`, note.id), { ...note, userId: user.uid }, { merge: true });
      awardXP(20, 'study', 'SMART NOTE SAVED');
    } catch (e) {
      console.error("Save note error:", e);
    }
  };

  const handleStartExperiment = async (exp: Partial<FocusExperiment>) => {
    if (!user) return;
    const id = `exp-${Date.now()}`;
    const active = experiments.find(e => e.status === 'active');
    if (active) {
       // Deactivate previous active experiment
       await updateDoc(doc(db, `users/${user.uid}/experiments`, active.id), { status: 'archived' });
    }

    try {
      await setDoc(doc(db, `users/${user.uid}/experiments`, id), {
        ...exp,
        id,
        userId: user.uid,
        startDate: Date.now(),
        status: 'active',
        data: []
      });
      setFocusToastMsg("NEURAL EXPERIMENT INITIALIZED");
      setShowFocusToast(true);
      setTimeout(() => setShowFocusToast(false), 3000);
      setActiveTab('lab');
    } catch (e) {
      console.error("Experiment start error:", e);
    }
  };

  const handleAbortExperiment = async (expId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, `users/${user.uid}/experiments`, expId), {
        status: 'aborted',
        endDate: Date.now()
      });
      setFocusToastMsg("EXPERIMENT ABORTED");
      setShowFocusToast(true);
      setTimeout(() => setShowFocusToast(false), 3000);
    } catch (e) {
      console.error("Abort experiment error:", e);
    }
  };

  const dayCount = profile?.createdAt ? Math.ceil((Date.now() - profile.createdAt) / (1000 * 60 * 60 * 24)) : 1;

  const handleAddRival = async (rivalId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        rivalIds: arrayUnion(rivalId)
      });
      setFocusToastMsg("RIVAL RECRUITED. COMMENCING COMPETITION.");
      setShowFocusToast(true);
      setTimeout(() => setShowFocusToast(false), 3000);
    } catch (e) {
      console.error("Add rival error:", e);
    }
  };

  const handleLongPressStart = () => {
    const timer = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50);
    }, 800);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) clearTimeout(longPressTimer);
  };

  const knowledgeNodes: KnowledgeNode[] = useMemo(() => {
    const nodes: KnowledgeNode[] = [];
    tasks.forEach(t => nodes.push({ id: t.id, label: t.title, type: 'task', subject: t.category, health: 100, lastActivity: t.createdAt, connections: [] }));
    notes.forEach(n => nodes.push({ id: n.id, label: n.title, type: 'note', subject: n.subject || 'General', health: 100, lastActivity: n.updatedAt, connections: n.linkedNoteIds || [] }));
    return nodes;
  }, [tasks, notes]);

  const handleBroadcast = async (subject: string) => {
    if (!user || !profile) return;
    const id = `stream-${user.uid}`;
    await setDoc(doc(db, 'broadcasts', id), {
      id,
      userId: user.uid,
      displayName: profile.displayName,
      photoURL: profile.photoURL,
      subject,
      personaName: profile.persona?.name || 'Scholar',
      durationMins: (profile.settings?.workDuration || 50),
      timeLeftSeconds: (profile.settings?.workDuration || 50) * 60,
      startTime: Date.now(),
      viewerCount: 0,
      isLive: true
    });
  };

  const handleJoinSession = (sessionId: string) => {
    setFocusToastMsg("SYNCING NEURAL SIGNAL WITH BROADCASTER...");
    setShowFocusToast(true);
    setTimeout(() => setShowFocusToast(false), 3000);
    setIsRunning(true);
  };

  const handlePurchase = async (item: StoreItem) => {
    if (!user || !profile) return;
    if (profile.xp < item.priceXP) {
       setFocusToastMsg("ERROR: INSUFFICIENT XP CAPITAL");
       setShowFocusToast(true);
       setTimeout(() => setShowFocusToast(false), 3000);
       return;
    }
    
    try {
      const updates: any = {
        xp: increment(-item.priceXP),
        'inventory.ownedItemIds': arrayUnion(item.id)
      };

      // Auto-equip if it's a pet
      if (item.type === 'pet') {
        updates.activePetId = item.id;
      }

      await updateDoc(doc(db, 'users', user.uid), updates);
      setFocusToastMsg(`PROTOCOL ACQUIRED: ${item.name.toUpperCase()}`);
      setShowFocusToast(true);
      setTimeout(() => setShowFocusToast(false), 3000);
      playBell();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleEquipPet = async (petId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        activePetId: petId
      });
      setFocusToastMsg("COMPANION PROTOCOL UPDATED");
      setShowFocusToast(true);
      setTimeout(() => setShowFocusToast(false), 3000);
    } catch (e) {
      console.error("Equip pet error:", e);
    }
  };

  const handleContribute = async (eventId: string, amount: number) => {
    if (!user || !profile) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        [`eventContributions.${eventId}`]: increment(amount)
      });
      await updateDoc(doc(db, 'events', eventId), {
        currentValue: increment(amount)
      });
    } catch (e) {
      console.error("Contribute error:", e);
    }
  };

  useEffect(() => {
    if (sessionFinished && mode === 'study' && user && profile && !_sessionLocked.current) {
      _sessionLocked.current = true;
      const finishTask = async () => {
         const duration = totalTime;
         const xp = Math.round(XP_PER_POMODORO * (isFlowState ? 1.5 : 1));
         
         // Record to active experiment if exists
         const activeExp = experiments.find(e => e.status === 'active');
         if (activeExp) {
            const condition = activeExp.data.length % 2 === 0 ? 'A' : 'B';
            await updateDoc(doc(db, `users/${user.uid}/experiments`, activeExp.id), {
               data: arrayUnion({
                  timestamp: Date.now(),
                  condition,
                  sessionScore: Math.round(neuralScore)
               })
            });
         }

         // Increase Bond if partner is active
         if (profile.activeCharacterId) {
            const bondIncrease = Math.floor(duration / 60); // 1 point per minute
            await updateDoc(doc(db, 'users', user.uid), {
               [`characterBonds.${profile.activeCharacterId}`]: increment(bondIncrease)
            });
            setFocusToastMsg(`BOND WITH ${profile.activeCharacterId.toUpperCase()} INCREASED`);
         }

         // Contribute to active events
         activeEvents.forEach(async (event) => {
            if (event.type === 'marathon') {
               handleContribute(event.id, Math.floor(duration / 60)); // focus minutes
            } else if (event.type === 'boss_raid') {
               handleContribute(event.id, Math.floor(duration / 300) * 10); // 10 dmg per 5 mins
            }
         });

         awardXP(xp, 'study', 'FOCUS SESSION COMPLETE');
         updateBPMissionProgress('timer', 1);
         
         // Re-lock safety delay
         setTimeout(() => {
           _sessionLocked.current = false;
           setSessionFinished(false);
         }, 2000);
      };
      finishTask();
    }
  }, [sessionFinished, user, profile, mode, isFlowState, activeEvents]);

  // Makima Surveillance
  useEffect(() => {
    if (!isRunning || mode !== 'study') return;
    
    const interval = setInterval(() => {
        if (Math.random() > 0.95) { // 5% chance every 2 mins
            const messages = [
                "I'm watching your progress. Don't disappoint me.",
                "Efficiency is the only language I understand.",
                "A devil hunter who doesn't focus is useless.",
                "Your heart rate is stable. Good.",
                "Recruit more allies. You'll need them for the raid."
            ];
            setFocusToastMsg(`MAKIMA: ${messages[Math.floor(Math.random() * messages.length)]}`);
            setShowFocusToast(true);
            setTimeout(() => setShowFocusToast(false), 5000);
        }
    }, 120000);
    return () => clearInterval(interval);
  }, [isRunning, mode]);
  const startSessionWithDreamCheck = () => {
    if (!isRunning && profile?.dream && !hasSeenDreamPromptToday) {
      setShowDreamPrompt(true);
    } else {
      setIsRunning(!isRunning);
    }
  };
  const [neuralScore, setNeuralScore] = useState(100);
  const [isFlowStateInside, setIsFlowStateInside] = useState(false); // Dummy to remove old position
  const [pauseCount, setPauseCount] = useState(0);

  const todayJournalStats = useMemo(() => {
    if (!profile) return { focusMins: 0, sessions: 0, habitsCompleted: 0, habitsTotal: 0, xpEarned: 0, avgFocusScore: 0 };
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const habitsCompleted = habits.filter(h => (h.completedDates || []).includes(today)).length;
    
    return {
       focusMins: Math.floor(profile.dailyFocusSeconds / 60),
       sessions: profile.dailySessions,
       habitsCompleted,
       habitsTotal: habits.length,
       xpEarned: 30, // Base journal XP
       avgFocusScore: Math.round(neuralScore)
    };
  }, [profile, habits, neuralScore]);
  const [sessionDistractions, setSessionDistractions] = useState(0);

  // --- Neural Focus Score Logic ---
  useEffect(() => {
    if (isRunning && mode === 'study') {
      const interval = setInterval(() => {
        setNeuralScore(prev => {
          // Decay score based on pauses and distractions
          let deduction = 0.01; // Base decay
          if (pauseCount > 0) deduction += pauseCount * 0.05;
          if (sessionDistractions > 0) deduction += sessionDistractions * 0.1;
          
          const newScore = Math.max(10, prev - deduction);
          return newScore;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning, mode, pauseCount, sessionDistractions]);

  // --- Rival Profile Mirroring ---
  useEffect(() => {
    if (!profile?.rivalIds || profile.rivalIds.length === 0) {
      setRivals([]);
      return;
    }
    const q = query(collection(db, 'users'), where('uid', 'in', profile.rivalIds));
    const unsubRivals = onSnapshot(q, (snap) => {
      setRivals(snap.docs.map(d => d.data() as UserProfile));
    });
    return () => unsubRivals();
  }, [profile?.rivalIds]);

  // --- Theme Application ---
  useEffect(() => {
    const dimensionId = profile?.settings?.currentTheme || 'void';
    const dim = DIMENSIONS_CONFIG[dimensionId as keyof typeof DIMENSIONS_CONFIG];
    if (dim) {
      document.documentElement.style.setProperty('--md-primary', dim.primary);
      document.documentElement.style.setProperty('--md-secondary', dim.secondary);
      document.documentElement.style.setProperty('--md-bg', dim.bg);
      document.body.style.backgroundColor = dim.bg;
    }
  }, [profile?.settings?.currentTheme]);

  // --- Devil Contract Expiration Check ---
  useEffect(() => {
    if (!user || contracts.length === 0) return;
    const checkExpirations = async () => {
      const now = Date.now();
      for (const contract of contracts) {
        if (contract.status === 'active') {
          const expirationTime = contract.signedAt + (contract.durationDays * 24 * 60 * 60 * 1000);
          if (now > expirationTime) {
            // FAILED CONTRACT
            try {
              await updateDoc(doc(db, `users/${user.uid}/contracts`, contract.id), {
                status: 'failed',
                failedAt: now
              });
              
              // Apply Penalty
              const penalty = contract.penaltyXP || 500;
              await updateDoc(doc(db, `users/${user.uid}`), {
                xp: increment(-penalty)
              });
              
              setCoachMessages(prev => [...prev, { 
                role: 'ai', 
                text: `CONTRACT BREACH: You failed "${contract.title}". The Procrastination Devil has claimed ${penalty} XP from your essence. Do not fail again.` 
              }]);
              playBell();
            } catch (e) {
              handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
            }
          }
        }
      }
    };
    
    checkExpirations();
  }, [contracts, user]);

  const handleThemeSelect = async (themeId: string) => {
    if (!user || !profile) return;
    try {
      await updateDoc(doc(db, `users/${user.uid}`), {
        'settings.currentTheme': themeId
      });
      setProfile(prev => prev ? { 
        ...prev, 
        settings: { ...prev.settings, currentTheme: themeId as any } 
      } : null);
      playTick();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleMissionAccept = async (mission: Mission) => {
    if (!user || !profile) return;
    // For now, missions are just a concept, but let's log it or create a contract
    const contractId = `mission-${mission.id}-${Date.now()}`;
    const newContract: DevilContract = {
      id: contractId,
      userId: user.uid,
      title: mission.title,
      description: `Accept this mission objective as a binding pact. Complete within ${mission.duration} days.`,
      type: 'marathon',
      goal: 100, // Placeholder
      progress: 0,
      startDate: Date.now(),
      durationDays: parseInt(mission.duration),
      status: 'active',
      rewardXP: parseInt(mission.reward.replace(/,/g, '')),
      penaltyXP: 500,
      signedAt: Date.now(),
    };

    try {
      await setDoc(doc(db, `users/${user.uid}/contracts`, contractId), newContract);
      setShowMissions(false);
      awardXP(50, 'special', 'MISSION REGISTERED');
      launchConfetti({ count: 100, colors: ['#ff0000', '#ffffff'] });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/contracts/${contractId}`);
    }
  };

  // --- Voice Command Engine ---
  const [isListening, setIsListening] = useState(false);
  
  const startVoiceCommand = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log("Voice Command:", command);
      
      if (command.includes('start focus') || command.includes('start session') || command.includes('protocol x') || command.includes('focus slay')) {
        setIsRunning(true);
        setMode('study');
        playTick();
        if (command.includes('protocol x')) {
           setNeuralScore(100);
           const ut = new SpeechSynthesisUtterance("Protocol X initialized. No distractions permitted.");
           window.speechSynthesis.speak(ut);
        }
      } else if (command.includes('pause') || command.includes('stop session') || command.includes('cease')) {
        setIsRunning(false);
        setPauseCount(prev => prev + 1);
        playTick();
      } else if (command.includes('add task')) {
        const title = command.replace('add task', '').trim();
        if (title) addTask(title, 'study');
      } else if (command.includes('status report') || command.includes('how much time')) {
        const text = `Guardian report: ${formatTime(timeLeft)} remaining. Neural Score at ${Math.floor(neuralScore)}%. ${neuralScore > 80 ? 'Optimal efficiency.' : 'Efficiency dropping.'}`;
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      } else if (command.includes('i am tired') || command.includes('i\'m tired') || command.includes('help me')) {
        sendToCoach("I am tired and losing focus. Give me a survival directive.");
      }
    };

    recognition.start();
  }, [timeLeft, mode, isRunning, profile]);

  const handleReactToPost = async (postId: string) => {
    if (!user) return;
    const post = socialPosts.find(p => p.id === postId);
    if (!post) return;
    
    const reactions = post.reactions || [];
    const newReactions = reactions.includes(user.uid) 
      ? reactions.filter(id => id !== user.uid)
      : [...reactions, user.uid];
      
    try {
      await updateDoc(doc(db, 'social', postId), { reactions: newReactions });
    } catch (e) {
      console.error("React failed:", e);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setTasks([]);
      setHabits([]);
      setSessionLogs([]);
      setView('dashboard');
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  // Unified Auth & Data Synchronization Engine
  useEffect(() => {
    getRedirectResult(auth).catch(console.error);

    // Global Error Guard (Phase 4A pattern)
    const handleError = (error: any) => {
      console.warn('System guard caught error:', error.message || error);
      // Optional: set a limited "safe mode" flag if errors are frequent
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    const sanitizeProfile = (data: any): UserProfile => {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Deep default ensuring - Phase 3A/3B Pattern
      const sanitized: UserProfile = {
        ...data,
        uid: data.uid || 'unknown',
        displayName: data.displayName || 'Aspirant',
        photoURL: data.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.uid || 'default'}`,
        xp: Number(data.xp) || 0,
        level: Number(data.level) || 1,
        streak: Number(data.streak) || 0,
        rank: data.rank || 'Novice',
        allTimeXP: Number(data.allTimeXP) || 0,
        unlockedAchievements: Array.isArray(data.unlockedAchievements) ? data.unlockedAchievements : [],
        dailyChallenges: Array.isArray(data.dailyChallenges) ? data.dailyChallenges : getDailyChallenges(today),
        streakShields: Number(data.streakShields) || 0,
        lastActiveDate: data.lastActiveDate || today,
        totalFocusSeconds: Number(data.totalFocusSeconds) || 0,
        dailyFocusSeconds: Number(data.dailyFocusSeconds) || 0,
        dailySessions: Number(data.dailySessions) || 0,
        pomodorosCompleted: Number(data.pomodorosCompleted) || 0,
        createdAt: data.createdAt || Date.now(),
        health: {
          water: Number(data.health?.water) || 0,
          protein: Number(data.health?.protein) || 0,
          sleep: Number(data.health?.sleep) || 0,
        },
        skills: {
          focus: Number(data.skills?.focus) || 0,
          discipline: Number(data.skills?.discipline) || 0,
          consistency: Number(data.skills?.consistency) || 0,
        },
        jee: {
          targetAIR: Number(data.jee?.targetAIR) || 100,
          weakChapters: Array.isArray(data.jee?.weakChapters) ? data.jee?.weakChapters : [],
          strongChapters: Array.isArray(data.jee?.strongChapters) ? data.jee?.strongChapters : [],
          completedChapters: Array.isArray(data.jee?.completedChapters) ? data.jee?.completedChapters : [],
        },
        settings: {
          workDuration: Number(data.settings?.workDuration) || 25,
          breakDuration: Number(data.settings?.breakDuration) || 5,
          longBreakDuration: Number(data.settings?.longBreakDuration) || 15,
          ambientSound: data.settings?.ambientSound || 'none',
          notificationSound: data.settings?.notificationSound || 'default',
          autoStartNextSession: !!data.settings?.autoStartNextSession,
          currentTheme: data.settings?.currentTheme || 'void',
          currentDimension: data.settings?.currentDimension || 'void',
        }
      };

      // Handle nested structures - Phase 3A
      if (!sanitized.inventory) sanitized.inventory = { ownedItemIds: [], powerUps: [] };
      if (!Array.isArray(sanitized.inventory.ownedItemIds)) sanitized.inventory.ownedItemIds = [];
      if (!Array.isArray(sanitized.inventory.powerUps)) sanitized.inventory.powerUps = [];
      if (!sanitized.eventContributions) sanitized.eventContributions = {};
      if (!Array.isArray(sanitized.recruitedCharacters)) sanitized.recruitedCharacters = [];
      if (!sanitized.characterBonds) sanitized.characterBonds = {};
      if (!Array.isArray(sanitized.unlockedDimensions)) sanitized.unlockedDimensions = [];
      if (!Array.isArray(sanitized.rivalIds)) sanitized.rivalIds = [];

      return sanitized;
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      console.log("Auth System Status:", u ? `LINKED [${u.uid}]` : "UNLINKED");
      if (u) {
        setUser(u);
        const userPath = `users/${u.uid}`;
        const userDocRef = doc(db, userPath);

        // 1. Core Profile Sync & Initialization
        const unsubProfile = onSnapshot(userDocRef, async (snap) => {
          if (snap.exists()) {
            let data = snap.data() as UserProfile;
            const today = format(new Date(), 'yyyy-MM-dd');
            
            // Initialization Logic (Internal updates if needed)
            let needsUpdate = false;
            const updates: any = {};
            const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

            if (data.lastActiveDate !== today) {
              updates.dailyChallenges = getDailyChallenges(today);
              
              // Streak check logic from user requirements
              if (data.lastActiveDate === yesterday) {
                // Streak continues - incrementing streak happen on first focus or login?
                // Usually logic is: did they hit DAILY GOAL yesterday?
                // For simplicity, if they were active yesterday, they don't lose it today.
              } else if (data.lastActiveDate !== today) {
                // Gap detected
                if ((data.streakShields || 0) > 0) {
                  updates.streakShields = data.streakShields - 1;
                  setFocusToastMsg('🛡 STREAK SHIELD CONSUMED');
                  setShowFocusToast(true);
                  setTimeout(() => setShowFocusToast(false), 3000);
                } else {
                  updates.streak = 0;
                  setFocusToastMsg('💔 STREAK BROKEN');
                  setShowFocusToast(true);
                  setTimeout(() => setShowFocusToast(false), 3000);
                }
              }

              updates.lastActiveDate = today;
              updates.dailyFocusSeconds = 0;
              updates.dailySessions = 0;
              needsUpdate = true;
            }

            // XP and Level boundary sanity check
            if (typeof data.xp !== 'number' || isNaN(data.xp)) {
               updates.xp = 0;
               needsUpdate = true;
            }

            if (needsUpdate) {
              await updateDoc(userDocRef, updates);
            }

            const sanitized = sanitizeProfile(data);
            setProfile(sanitized);
            if (sanitized.examPreference) setExamPreference(sanitized.examPreference);
            setDream(sanitized.dream || null);
            setCurrentPersona(sanitized.persona || null);
          } else {
            // New Profile Creation
            const newProfile: UserProfile = {
              uid: u.uid,
              displayName: u.isAnonymous ? 'Guest User' : (u.displayName || 'Aspirant'),
              photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`,
              xp: 0,
              level: 1,
              streak: 0,
              rank: 'Novice',
              allTimeXP: 0,
              unlockedAchievements: [],
              dailyChallenges: getDailyChallenges(format(new Date(), 'yyyy-MM-dd')),
              streakShields: 0,
              lastActiveDate: format(new Date(), 'yyyy-MM-dd'),
              totalFocusSeconds: 0,
              dailyFocusSeconds: 0,
              dailySessions: 0,
              pomodorosCompleted: 0,
              health: { water: 0, protein: 0, sleep: 0 },
              skills: { focus: 0, discipline: 0, consistency: 0 },
              jee: { targetAIR: 100, weakChapters: [], strongChapters: [], completedChapters: [] },
              settings: {
                workDuration: 25,
                breakDuration: 5,
                longBreakDuration: 15,
                ambientSound: 'none',
                notificationSound: 'default',
                autoStartNextSession: false
              }
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
          setLoading(false);
          
          // Seed Store if empty
          const storeRef = collection(db, 'store');
          const storeSnap = await getDocs(storeRef);
          if (storeSnap.empty) {
            for (const item of SEED_STORE_ITEMS) {
              await setDoc(doc(db, 'store', item.id!), item);
            }
          }
        }, (err) => handleFirestoreError(err, OperationType.GET, userPath));

        // 2. Collection Synchronizers
        const unsubTasks = onSnapshot(query(collection(db, userPath, 'tasks'), orderBy('createdAt', 'desc')), (s) => {
          setTasks(s.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
        }, (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/tasks`));

        const unsubHabits = onSnapshot(query(collection(db, userPath, 'habits'), orderBy('createdAt', 'desc')), (s) => {
          const habitsData = s.docs.map(d => ({ id: d.id, ...d.data() } as Habit));
          setHabits(habitsData);
          setInstalledHabitIds(habitsData.map(h => h.title));
        }, (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/habits`));

        const unsubContracts = onSnapshot(query(collection(db, userPath, 'contracts'), orderBy('signedAt', 'desc')), (s) => {
           setContracts(s.docs.map(d => ({ id: d.id, ...d.data() } as DevilContract)));
        }, (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/contracts`));

        const unsubDecks = onSnapshot(query(collection(db, userPath, 'decks'), orderBy('createdAt', 'desc')), (s) => {
           setFlashcardDecks(s.docs.map(d => ({ id: d.id, ...d.data() } as FlashcardDeck)));
        }, (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/decks`));

        const unsubResources = onSnapshot(doc(db, userPath, 'inventory', 'data'), (s) => {
          if (s.exists()) setResources(s.data() as ResourceInventory);
        }, (err) => handleFirestoreError(err, OperationType.GET, `${userPath}/inventory/data`));

        const unsubItems = onSnapshot(collection(db, userPath, 'items'), (s) => {
           setCraftedItems(s.docs.map(d => ({ id: d.id, ...d.data() } as CraftedItem)));
        }, (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/items`));

        const unsubJournal = onSnapshot(collection(db, userPath, 'journal'), (s) => {
           setJournalEntries(s.docs.map(d => ({ id: d.id, ...d.data() } as JournalEntry)));
        }, (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/journal`));

        const unsubSessions = onSnapshot(collection(db, userPath, 'sessions'), (snapshot) => {
            const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SessionLog));
            setSessionLogs(logs.sort((a,b) => b.timestamp - a.timestamp));
        }, (err) => handleFirestoreError(err, OperationType.LIST, `${userPath}/sessions`));

        const unsubEvents = onSnapshot(query(collection(db, 'events'), where('endDate', '>', Date.now())), (s) => {
           setActiveEvents(s.docs.map(d => ({ id: d.id, ...d.data() } as SectorEvent)));
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'events'));
        
        const unsubStore = onSnapshot(collection(db, 'store'), (s) => {
           setStoreItems(s.docs.map(d => ({ id: d.id, ...d.data() } as StoreItem)));
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'store'));

        // Store cleanups in a ref for the auth state change
        (u as any)._allUnsubs = [unsubProfile, unsubTasks, unsubHabits, unsubContracts, unsubDecks, unsubResources, unsubItems, unsubJournal, unsubSessions, unsubEvents, unsubStore];

      } else {
        setUser(null);
        setProfile(null);
        setTasks([]);
        setHabits([]);
        setLoading(false);
      }
    });

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      unsubscribeAuth();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
      if (user && (user as any)._allUnsubs) {
        (user as any)._allUnsubs.forEach((f: any) => f());
      }
    };
  }, []);

  // Global Sector Feed Synchronizer
  useEffect(() => {
    if (!user) return;
    const unsubSocial = onSnapshot(query(collection(db, 'social'), orderBy('timestamp', 'desc'), limit(30)), (s) => {
       setSocialPosts(s.docs.map(d => ({ id: d.id, ...d.data() } as SocialPost)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'social');
    });
    return () => unsubSocial();
  }, [user]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  useEffect(() => {
    if (!user || loading) return;
    const seedData = async () => {
      // Habit: Daily Physics Problem Solving
      if (!habits.some(h => h.title === 'Daily Physics Problem Solving')) {
        const id = `habit-${Date.now()}-physics`;
        await setDoc(doc(db, `users/${user.uid}/habits`, id), {
          id, userId: user.uid, title: 'Daily Physics Problem Solving', icon: 'Zap',
          streak: 0, streakBest: 0, completedDates: [], createdAt: Date.now()
        });
      }
      // Task: Review Chapter 5: Laws of Motion
      if (!tasks.some(t => t.title === 'Review Chapter 5: Laws of Motion')) {
        const id = `task-${Date.now()}-laws`;
        await setDoc(doc(db, `users/${user.uid}/tasks`, id), {
          id, userId: user.uid, title: 'Review Chapter 5: Laws of Motion', priority: 'high',
          category: 'study', expectedSessions: 3, sessions: 0, subjects: ['Physics'],
          completed: false, createdAt: Date.now()
        });
        setSelectedTaskId(id);
        setSessionIntention('Master the concepts of Force and Acceleration');
        setMode('study');
        setTimeLeft(25 * 60);
      }
    };
    seedData();
  }, [user, loading, tasks.length > 0, habits.length > 0]);

  const sendCoachOverwhelmedMessage = async () => {
    if (!user) return;
    const msg = "I'm feeling overwhelmed by my workload, can you suggest a focus strategy?";
    setCoachMessages(prev => [...prev, { role: 'user', text: msg }]);
    await sendToCoach(msg);
  };
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0);
  const [hasSentOverwhelmedMsg, setHasSentOverwhelmedMsg] = useState(false);

  // --- Quantum Alchemy & Legacy State ---
  const [resources, setResources] = useState<ResourceInventory>({
    crystals: 0,
    shards: 0,
    tokens: 0,
    bones: 0,
    dust: 0
  });
  const [craftedItems, setCraftedItems] = useState<CraftedItem[]>([]);
  const [legacy, setLegacy] = useState<UserLegacy>({
    milestones: [],
    totalFocusHours: 0,
    totalSessions: 0,
    totalTasksCompleted: 0,
    totalHabitsCompleted: 0,
    totalXpEarned: 0,
    longestStreak: 0,
    bestFocusScore: 0,
    dimensionsUnlocked: 1,
    futureLetters: []
  });

  const handleSaveDream = async (newDream: Partial<Dream>) => {
    if (!user || !profile) return;
    const finalDream: Dream = {
      id: dream?.id || `dream-${Date.now()}`,
      userId: user.uid,
      text: newDream.text || '',
      description: newDream.description || '',
      mantra: newDream.mantra || '',
      targetDate: newDream.targetDate || '',
      createdAt: dream?.createdAt || Date.now(),
    };
    try {
      setDream(finalDream);
      setProfile(prev => prev ? { ...prev, dream: finalDream } : prev);
      await updateDoc(doc(db, 'users', user.uid), { dream: finalDream });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleSavePersona = async (newPersona: Partial<Persona>) => {
    if (!user || !profile) return;
    const style = newPersona.visualStyle || 'neon';
    const auraColor = {
      neon: '#06b6d4',
      violet: '#a855f7',
      gold: '#eab308',
      crimson: '#ef4444',
      shadow: '#3f3f46'
    }[style] || '#06b6d4';

    const finalPersona: Persona = {
      id: currentPersona?.id || `persona-${Date.now()}`,
      userId: user.uid,
      name: newPersona.name || '',
      traits: newPersona.traits || [],
      visualStyle: style,
      auraColor: auraColor,
      signaturePhrase: newPersona.signaturePhrase || '',
      totalHours: currentPersona?.totalHours || 0,
      flawlessSessions: currentPersona?.flawlessSessions || 0,
      level: currentPersona?.level || 1,
      experience: currentPersona?.experience || 0,
    };
    try {
      setCurrentPersona(finalPersona);
      setProfile(prev => prev ? { ...prev, persona: finalPersona } : prev);
      await updateDoc(doc(db, 'users', user.uid), { persona: finalPersona });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const [taskView, setTaskView] = useState<'active' | 'completed'>('active');

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    if (taskSearch) {
      result = result.filter(t => t.title.toLowerCase().includes(taskSearch.toLowerCase()));
    }
    if (taskCategoryFilter !== 'all') {
      result = result.filter(t => t.category === taskCategoryFilter);
    }
    if (taskSortBy === 'priority') {
      const p: Record<string, number> = { 'high': 3, 'medium': 2, 'low': 1 };
      result.sort((a, b) => (p[b.priority] || 0) - (p[a.priority] || 0));
    } else if (taskSortBy === 'deadline') {
        result.sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''));
    } else {
        result.sort((a,b) => b.createdAt - a.createdAt);
    }
    return result;
  }, [tasks, taskSearch, taskCategoryFilter, taskSortBy]);

  useEffect(() => {
    if (user && profile && !hasSentOverwhelmedMsg && activeTab === 'ai') {
      sendCoachOverwhelmedMessage();
      setHasSentOverwhelmedMsg(true);
    }
  }, [user, profile, activeTab, hasSentOverwhelmedMsg]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const totalFocusSecondsToday = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const todaySecondsFromLogs = sessionLogs
      .filter(log => log.timestamp >= startOfToday)
      .reduce((acc, log) => acc + log.duration, 0);
      
    return todaySecondsFromLogs + currentSessionSeconds;
  }, [sessionLogs, currentSessionSeconds]);

  // --- Timer Logic ---
  useEffect(() => {
    let interval: any;
    let lastTick = Date.now();
    let accumulatedDrift = 0;

    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        // Option: pause or notify. Standard flow suggests pause for accuracy
        setIsRunning(false);
        setPauseCount(p => p + 1);
        setCoachMessages(m => [...m, { role: 'ai', text: "NEURAL LINK FRAGILE. Focus maintained in peripheral mode." }]);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        const now = Date.now();
        const delta = now - lastTick;
        lastTick = now;

        accumulatedDrift += delta;

        if (accumulatedDrift >= 1000) {
          const secondsPassed = Math.floor(accumulatedDrift / 1000);
          accumulatedDrift -= secondsPassed * 1000;

          setTimeLeft(t => {
            if (t <= secondsPassed) {
               return 0;
            }
            return t - secondsPassed;
          });

          if (mode === 'study') {
            setCurrentSessionSeconds(s => s + secondsPassed);
            // Calculate Neural Score based on focus time and simulation of flow
            setNeuralScore(prev => {
              let change = -0.01 * secondsPassed; // Base decay
              if (pauseCount > 0) change -= pauseCount * 0.05 * secondsPassed;
              if (sessionDistractions > 0) change -= sessionDistractions * 0.1 * secondsPassed;
              
              // Flow state recovery
              if (currentSessionSeconds > 900 && pauseCount === 0) change += 0.03 * secondsPassed;
              
              return Math.min(100, Math.max(10, prev + change));
            });

            // Detect Flow State
            if (currentSessionSeconds >= 45 * 60 && !isFlowState) {
               setIsFlowState(true);
               awardXP(100, 'special', 'FLOW STATE DETECTED');
               launchConfetti({ colors: ['#00ffe0', '#7b5fe8'], count: 50 });
            }
          }
        }
      }, 200); // Check 5 times a second to ensure smoothness and catch drift quickly
    } 
    
    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, mode, currentSessionSeconds, pauseCount, sessionDistractions, isFlowState, timeLeft]);

  // Handle timer completion separately
  useEffect(() => {
    if (timeLeft === 0 && isRunning && !isCompletingSessionRef.current) {
      handleTimerComplete();
    }
  }, [timeLeft, isRunning]);

  const handlePrestige = async () => {
    if (!user || !profile) return;
    const rank = getRank(profile.xp);
    if (rank.id !== 'legend') return;

    if (!window.confirm("PRESTIGE ACTIVATION: Are you sure? This will reset your rank and XP to zero, but you will earn a permanent Legacy Marker. This action cannot be undone.")) {
      return;
    }

    try {
      const userDoc = doc(db, userPath);
      const newPrestigeLevel = (profile.prestigeLevel || 0) + 1;
      
      await updateDoc(userDoc, {
        xp: 0,
        level: 1,
        prestigeLevel: newPrestigeLevel,
        rank: 'Novice'
      });
      
      setCoachMessages(prev => [...prev, {
          role: 'ai',
          text: `PRESTIGE ${newPrestigeLevel} ACHIEVED. You have sacrificed power for eternity. Your legacy is recorded.`
      }]);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, userPath);
    }
  };

  const handleChallengeRival = async (rivalId: string) => {
    if (!user || user.uid === rivalId) return;
    try {
      const userDoc = doc(db, userPath);
      const currentRivals = profile?.rivalIds || [];
      if (!currentRivals.includes(rivalId)) {
        await updateDoc(userDoc, {
          rivalIds: [...currentRivals, rivalId]
        });
        setCoachMessages(prev => [...prev, {
            role: 'ai',
            text: `Rivalry initiated. The arena is strictly PVP. Don't fall behind.`
        }]);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, userPath);
    }
  };

  // Sync focus time to profile occasionally
  useEffect(() => {
    if (currentSessionSeconds > 0 && currentSessionSeconds % 60 === 0 && user) {
      const updateFocus = async () => {
        const userDoc = doc(db, userPath);
        try {
          await updateDoc(userDoc, {
            totalFocusSeconds: increment(60)
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, userPath);
        }
      };
      updateFocus();
    }
  }, [currentSessionSeconds, user]);

  // Unified Ambient Sound Logic
  useEffect(() => {
    if (ambientSound !== 'none') {
      const track = AMBIENT_DATA.find(t => t.id === ambientSound);
      playAmbientSound(track?.url || track?.id, ambientSound);
    }
    
    return () => {
      if (ambientSound !== 'none') {
        stopAmbientSound(ambientSound);
      }
    };
  }, [ambientSound]);

  // Update volume in real-time
  useEffect(() => {
    setMasterVolume(ambientVolume);
  }, [ambientVolume]);

  // Removed duplicate state/ref declarations already moved to top

  // Recovery logic for unfinished sessions
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
       // already ok
    } else if ('Notification' in window && Notification.permission !== 'denied') {
       Notification.requestPermission();
    }

    const saved = localStorage.getItem('unfinished_session');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const age = Date.now() - data.timestamp;
        if (age < 30 * 60 * 1000) { // Only recover if less than 30 mins old
           setFocusToastMsg('RECOVERED UNFINISHED SESSION');
           setShowFocusToast(true);
           setTimeout(() => setShowFocusToast(false), 3000);
           // We don't necessarily restart the timer, but we could add the seconds to the pool
           // For now, let's just log it or notify.
        }
        localStorage.removeItem('unfinished_session');
      } catch (e) {
        console.error("Failed to recover session", e);
      }
    }

    const handleBeforeUnload = () => {
      if (isRunning && currentSessionSeconds > 0) {
        localStorage.setItem('unfinished_session', JSON.stringify({
          seconds: currentSessionSeconds,
          timeLeft: timeLeft,
          mode: mode,
          timestamp: Date.now()
        }));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRunning, currentSessionSeconds, timeLeft, mode]);

  const handleTimerComplete = async () => {
    if (isCompletingSessionRef.current || sessionLockedRef.current) return;
    sessionLockedRef.current = true;
    isCompletingSessionRef.current = true;
    
    // Stop any double-starts immediately
    setIsRunning(false);
    
    try {
      setPauseCount(0);
      setSessionDistractions(0);
      setNeuralScore(100);
      setSessionFinished(true);
      setTimeout(() => setSessionFinished(false), 5000);
      const score = calculateFocusScore();
      setFocusScore(score);
    
      if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
      if (profile?.settings?.notificationSound === 'bell') {
        playBell();
      } else if (profile?.settings?.notificationSound !== 'none') {
        playWhoosh(); // default
      }
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Quantum Focus', {
          body: mode === 'study' ? '🎯 Focus session complete! Time to recharge.' : '⚡ Break over. Ready to dominate.',
        });
      }

      if (mode === 'study') {
        const score = calculateFocusScore();
        setCurrentScore(score);
        setShowScoreCard(true);
        
        const xpEarned = 100 + (score * 2);
        await awardXP(xpEarned, 'focus', score > 90 ? 'FLAWLESS FOCUS' : 'SESSION COMPLETE');
        launchConfetti({ origin: { x: 0.5, y: 0.4 }, count: 60 });

        const recordedSeconds = currentSessionSeconds;
        setSessionCount(prev => prev + 1);

        const sessionId = Date.now().toString();
        const newSessionLog: SessionLog = {
           id: sessionId,
           duration: recordedSeconds,
           timestamp: Date.now(),
           type: 'focus',
           missionTitle: sessionIntention || 'Focus Session',
           subject: selectedTaskId ? tasks.find(t => t.id === selectedTaskId)?.subjects?.[0] : null,
           completed: true
        };
        
        setSessionLogs(prev => {
           const updated = [...prev, newSessionLog].slice(-200);
           localStorage.setItem('pomodoro_sessions', JSON.stringify(updated));
           return updated;
        });

        if (user && profile) {
          const userDoc = doc(db, userPath);
          try {
            await updateDoc(userDoc, {
              pomodorosCompleted: increment(1),
              totalFocusSeconds: increment(recordedSeconds),
              dailyFocusSeconds: increment(recordedSeconds),
              dailySessions: increment(1),
              'skills.focus': (profile.skills?.focus || 0) + 2,
              'skills.consistency': (profile.skills?.consistency || 0) + 1
            });

            await setDoc(doc(db, userPath, 'sessions', sessionId), {
              userId: user.uid,
              taskId: selectedTaskId,
              duration: recordedSeconds,
              timestamp: Date.now(),
              xpEarned: xpEarned,
              missionTitle: sessionIntention || 'Focus Session',
              subject: selectedTaskId ? tasks.find(t => t.id === selectedTaskId)?.subjects?.[0] : null,
            });
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, userPath);
          }

          if (selectedTaskId) {
            const taskPath = `${userPath}/tasks/${selectedTaskId}`;
            try {
              const taskDoc = doc(db, taskPath);
              await updateDoc(taskDoc, { sessions: increment(1) });
            } catch (e) {
              handleFirestoreError(e, OperationType.UPDATE, taskPath);
            }
          }

          // Quantum Alchemy: Focus Crystals
          const crystalsEarned = Math.floor(recordedSeconds / 60);
          if (crystalsEarned > 0) {
            awardResources({ crystals: crystalsEarned });
          }

          // Quantum Legacy: Session Milestone (for long sessions)
          if (recordedSeconds >= 1200) { // 20+ mins
            addLegacyMilestone({
              title: mode === 'study' ? 'Deep Dive Focus' : 'Deep Rest',
              description: `Maintained focus for ${Math.floor(recordedSeconds / 60)} minutes.`,
              statValue: `${Math.floor(recordedSeconds / 60)} min`,
              type: 'session'
            });
          }

          setCurrentSessionSeconds(0);
        }

        // Update Devil Contracts progress
        const activeContracts = contracts.filter(c => c.status === 'active');
        if (user) {
          for (const contract of activeContracts) {
            let progressIncrease = 0;
            if (contract.type === 'marathon') progressIncrease = 1; // sessions
            if (contract.type === 'daily_grind') progressIncrease = Math.floor(recordedSeconds / 60); // minutes
            
            if (progressIncrease > 0) {
              const newProgress = contract.progress + progressIncrease;
              const isCompleted = newProgress >= contract.goal;
              
              try {
                await updateDoc(doc(db, `users/${user.uid}/contracts`, contract.id), {
                  progress: newProgress,
                  status: isCompleted ? 'completed' : 'active',
                  completedAt: isCompleted ? Date.now() : null
                });
                if (isCompleted) {
                  awardXP(contract.rewardXP, 'achievement', `CONTRACT COMPLETED: ${contract.title}`);
                  awardResources({ bones: 15 }); // Award Devil Bones
                  addLegacyMilestone({
                    title: `Contract Manifested: ${contract.title}`,
                    description: `Completed the ${contract.title} challenge and claimed the prize.`,
                    statValue: `Goal: ${contract.goal}`,
                    type: 'milestone'
                  });
                  launchConfetti({ count: 150 });
                }
              } catch (e) {
                handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/contracts/${contract.id}`);
              }
            }
          }
        }

        // Auto-cycle logic
        setTimeout(() => {
          const isLongBreak = (sessionCount + 1) % 4 === 0;
          if (isLongBreak) {
            setMode('longBreak');
            setTimeLeft((profile?.settings?.longBreakDuration || 15) * 60);
          } else {
            setMode('shortBreak');
            setTimeLeft((profile?.settings?.breakDuration || 5) * 60);
          }
            if (profile?.settings?.autoStartNextSession) {
               setIsRunning(true);
            }
            isCompletingSessionRef.current = false;
            sessionLockedRef.current = false;
         }, 3000);

      } else {
         // Break Completed
         if (mode === 'longBreak') {
            setCycleCount(prev => prev + 1);
            setSessionCount(0);
         }

         setMode('study');
         setTimeLeft((profile?.settings?.workDuration || 25) * 60);
         
         if (user && profile) {
            try {
               const userDoc = doc(db, userPath);
               await updateDoc(userDoc, {
                  'skills.discipline': (profile.skills?.discipline || 0) + 2
               });
            } catch (e) {
               handleFirestoreError(e, OperationType.UPDATE, userPath);
            }
         }

         setTimeout(() => {
            if (profile?.settings?.autoStartNextSession) {
               setIsRunning(true);
            }
            isCompletingSessionRef.current = false;
            sessionLockedRef.current = false;
         }, 1500);
      }
    } catch (error) {
      console.error("Timer completion updates failed:", error);
      isCompletingSessionRef.current = false;
      sessionLockedRef.current = false;
    }
  };

  const toggleTimer = () => {
    if (!isRunning) {
      if (mode === 'study' && !sessionIntention) {
        setShowIntentionInput(true);
        return;
      }
      playWhoosh();
      setSessionStartTime(Date.now() - (currentSessionSeconds * 1000));
      setIsRunning(true);
    } else {
      setPauseCount(prev => prev + 1);
      setIsRunning(false);
      playWhoosh();
    }
  };

  const logDistraction = () => {
    setDistractions(prev => prev + 1);
    setSessionDistractions(prev => prev + 1);
    if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const calculateFocusScore = () => {
    if (!sessionStartTime) return 0;
    const durationSeconds = (Date.now() - sessionStartTime) / 1000;
    const expectedSeconds = totalTime;
    const timeRatio = Math.min(durationSeconds / expectedSeconds, 1);
    const score = Math.max(0, Math.round((timeRatio * 100) - (distractions * 5)));
    return score;
  };

  const resetTimer = async () => {
    if (mode === 'study' && currentSessionSeconds > 0) {
        const recordedSeconds = currentSessionSeconds;
        const newSessionLog: SessionLog = {
           id: Date.now().toString(),
           duration: recordedSeconds,
           timestamp: Date.now(),
           type: 'focus',
           missionTitle: sessionIntention || 'Focus Session',
           subject: selectedTaskId ? tasks.find(t => t.id === selectedTaskId)?.subjects?.[0] : null,
           completed: false // Manual reset means not completed the full timer
        };
        setSessionLogs(prev => {
           const updated = [...prev, newSessionLog].slice(-200);
           localStorage.setItem('pomodoro_sessions', JSON.stringify(updated));
           return updated;
        });
        
        if (user) {
          const userPath = `users/${user.uid}`;
          const sessionsPath = `${userPath}/sessions`;
          try {
            await updateDoc(doc(db, userPath), {
              totalFocusSeconds: increment(recordedSeconds)
            });
            // Also sync as a separate session log in Firestore
            await addDoc(collection(db, sessionsPath), {
              userId: user.uid,
              duration: recordedSeconds,
              timestamp: Date.now(),
              type: 'focus',
              missionTitle: sessionIntention || 'Focus Session',
              subject: selectedTaskId ? tasks.find(t => t.id === selectedTaskId)?.subjects?.[0] : null,
              completed: false
            });
          } catch (e) {
            handleFirestoreError(e, OperationType.UPDATE, userPath);
          }
        }
    }
    setIsRunning(false);
    const defaultTime = mode === 'study' ? 25 : (mode === 'shortBreak' ? 5 : 15);
    setTimeLeft((profile?.settings?.[mode === 'study' ? 'workDuration' : (mode === 'shortBreak' ? 'breakDuration' : 'longBreakDuration')] || defaultTime) * 60);
    setCurrentSessionSeconds(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      } else if (e.code === 'KeyS' && isRunning) {
        // Only trigger Skip on 's' press when timer is running
        handleTimerComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, mode, selectedTaskId, tasks, profile]);

  const installMission = (task: any, switchTab: boolean = false) => {
    if (!task) {
      setSelectedTaskId(null);
      setSessionIntention('');
      return;
    }
    
    // Check if we are toggling off
    if (selectedTaskId === task.id) {
      setSelectedTaskId(null);
      setSessionIntention('');
      return;
    }

    playWhoosh();
    setSelectedTaskId(task.id);
    setSessionIntention(task.title);
    if (switchTab) {
      setActiveTab('timer');
    }
    
    // Add a visual 'ping' or feedback if needed
    if (ringContainerRef.current) {
      ringContainerRef.current.classList.add('animate-pulse');
      setTimeout(() => ringContainerRef.current?.classList.remove('animate-pulse'), 1000);
    }
  };
  const toggleChapter = async (chapter: string) => {
    if (!user || !profile) return;
    const currentCompleted = profile.jee?.completedChapters || [];
    const isComplete = currentCompleted.includes(chapter);
    const newCompleted = isComplete
      ? currentCompleted.filter(c => c !== chapter)
      : [...currentCompleted, chapter];
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        'jee.completedChapters': newCompleted
      });
      // Optionally give some XP + confetti if completing new chapter
      if (!isComplete && profile) {
        awardXP(100, 'study', `CHAPTER UNLOCKED: ${chapter}`);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const addTask = async (title: string, category: 'study' | 'personal' | 'health' = 'study', urgent: boolean = false, sessions: number = 1, subjectId?: string | string[], isRevision?: boolean, priority: 'high' | 'medium' | 'low' = 'medium') => {
    if (!user || !title.trim()) return;
    const finalSubjects = Array.isArray(subjectId) ? subjectId : (subjectId ? [subjectId] : []);
    const tasksPath = `users/${user.uid}/tasks`;
    try {
      const docRef = await addDoc(collection(db, tasksPath), {
        userId: user.uid,
        title,
        description: '',
        completed: false,
        urgent,
        sessions: 0,
        expectedSessions: sessions,
        category,
        isRevision: isRevision ?? false,
        subjects: finalSubjects,
        priority: urgent ? 'high' : priority,
        createdAt: Date.now()
      });
      
      installMission({ id: docRef.id, title }, false);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, tasksPath);
    }
  };

  const updateTaskPriority = async (taskInput: string | Task, priority: 'high' | 'medium' | 'low') => {
    if (!user) return;
    const taskId = typeof taskInput === 'string' ? taskInput : taskInput.id;
    const taskPath = `users/${user.uid}/tasks/${taskId}`;
    try {
      await updateDoc(doc(db, taskPath), { 
        priority,
        urgent: priority === 'high'
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, taskPath);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    const taskPath = `users/${user.uid}/tasks/${taskId}`;
    try {
      const taskDoc = doc(db, taskPath);
      await deleteDoc(taskDoc);
      if (selectedTaskId === taskId) setSelectedTaskId(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, taskPath);
    }
  };

  const handleSignContract = async (template: any) => {
    if (!user) return;
    const contractId = Date.now().toString();
    const newContract: DevilContract = {
      id: contractId,
      userId: user.uid,
      title: template.title,
      type: template.type,
      goal: template.goal,
      description: template.description,
      progress: 0,
      startDate: Date.now(),
      durationDays: template.durationDays,
      status: 'active',
      rewardXP: template.rewardXP,
      penaltyXP: template.penaltyXP,
      signedAt: Date.now(),
    };

    try {
      await setDoc(doc(db, `users/${user.uid}/contracts`, contractId), newContract);
      setIsContractModalOpen(false);
      setPochitaEvent({ type: 'contract_signed', timestamp: Date.now() });
      launchConfetti({ count: 100, colors: ['#dc2626', '#000000', '#ffffff'] });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/contracts/${contractId}`);
    }
  };

  const handleBreakContract = async (id: string) => {
    if (!user || !profile) return;
    const contract = contracts.find(c => c.id === id);
    if (!contract) return;

    try {
      await updateDoc(doc(db, `users/${user.uid}/contracts`, id), {
        status: 'broken',
        brokenAt: Date.now()
      });
      // Penalty XP
      await awardXP(-contract.penaltyXP, 'achievement', 'CONTRACT BROKEN');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/contracts/${id}`);
    }
  };

  const handleArenaComplete = async (deckId: string, stats: any) => {
    if (!user) return;
    const deck = flashcardDecks.find(d => d.id === deckId);
    if (!deck) return;

    try {
      const newMastery = Math.min(100, (deck.masteryLevel || 0) + (stats.mastered * 2));
      await updateDoc(doc(db, `users/${user.uid}/decks`, deckId), {
        masteryLevel: newMastery,
        lastReviewed: Date.now()
      });
      
      const xpAmount = stats.mastered * 5;
      awardXP(xpAmount, 'study', 'ARENA MASTERED');
      setIsArenaOpen(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/decks/${deckId}`);
    }
  };

  const handleOnboardingComplete = async (data: any) => {
    if (!user || !profile) return;
    try {
      await updateDoc(doc(db, `users/${user.uid}`), {
        displayName: data.displayName,
        examPreference: data.examPreference,
        hasCompletedOnboarding: true,
        'settings.workDuration': Math.round(data.dailyGoal / 4)
      });
      setProfile(prev => prev ? { 
        ...prev, 
        displayName: data.displayName, 
        examPreference: data.examPreference, 
        hasCompletedOnboarding: true 
      } : null);
      launchConfetti({ count: 200 });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleCaptureSnapshot = async () => {
    if (!user || !profile) return;
    try {
      playTick();
      // Mocking image generation for simulation
      const mockImages = [
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
        "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80",
        "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=800&q=80",
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80"
      ];
      const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];
      
      const postId = `snap-${Date.now()}`;
      const newPost: SocialPost = {
        id: postId,
        userId: user.uid,
        userName: profile.displayName || 'Aspirant',
        userPhoto: profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        content: `Neural snapshot captured during deep focus. Efficiency is at maximal levels. #QuantumFocus`,
        type: 'snapshot',
        timestamp: Date.now(),
        imageUrl: randomImg,
        reactions: [],
        stats: {
          minutes: Math.floor(currentSessionSeconds / 60) || 15,
          xp: 100
        }
      };

      await setDoc(doc(db, 'social', postId), newPost);
      awardXP(100, 'special', 'REALITY CAPTURED');
      launchConfetti({ count: 100 });
      setCoachMessages(prev => [...prev, { role: 'ai', text: "Target locked. Reality snapshot has been broadcasted to the Sector. Slay on." }]);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'social');
    }
  };

  const handleUpdateChapter = async (subject: string, chapter: string, isCompleted: boolean) => {
    if (!user || !profile) return;
    const chapterId = `${subject}:${chapter}`;
    const currentCompleted = profile.jee?.completedChapters || [];
    const newCompleted = isCompleted 
      ? [...currentCompleted, chapterId]
      : currentCompleted.filter(id => id !== chapterId);

    try {
      await updateDoc(doc(db, `users/${user.uid}`), {
        'jee.completedChapters': newCompleted
      });
      setProfile(prev => prev ? { 
        ...prev, 
        jee: { ...prev.jee, completedChapters: newCompleted } 
      } : null);
      
      if (isCompleted) {
        awardXP(50, 'study', 'CHAPTER MASTERED');
        awardResources({ shards: 25 });
        updateBPMissionProgress('study', 1);
        launchConfetti({ count: 50, colors: ['#00ffe0', '#7b5fe8'] });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const toggleTask = async (task: Task) => {
    if (!user) return;
    const isComplete = !task.completed;
    const taskPath = `users/${user.uid}/tasks/${task.id}`;
    try {
      const taskDoc = doc(db, taskPath);
      await updateDoc(taskDoc, { 
        completed: isComplete,
        completedAt: isComplete ? Date.now() : null
      });
      // Award XP
      if (isComplete) {
        setPochitaEvent({ type: 'task_complete', timestamp: Date.now() });

        // BP XP contribution
        const priorityXp: Record<string, number> = { high: 100, medium: 50, low: 25 };
        const bpXp = priorityXp[task.priority || 'medium'] || 50;

        // Contract Progress
        const activeContracts = contracts.filter(c => c.status === 'active');
        for (const contract of activeContracts) {
           const newProgress = contract.progress + 1;
           const isGoalMet = newProgress >= contract.goal;
           
           if (isGoalMet) {
              await updateDoc(doc(db, `users/${user.uid}/contracts`, contract.id), {
                 progress: newProgress,
                 status: 'completed',
                 completedAt: Date.now()
              });
              awardXP(contract.rewardXP, 'special', 'CONTRACT FULFILLED');
              setCoachMessages(prev => [...prev, { 
                 role: 'ai', 
                 text: `MISSION SUCCESS: You have fulfilled the terms of "${contract.title}". Payment in soul-essence (${contract.rewardXP} XP) has been transferred.` 
              }]);
              launchConfetti({ count: 200, colors: ['#ffffff', '#dc2626'] });
           } else {
              await updateDoc(doc(db, `users/${user.uid}/contracts`, contract.id), {
                 progress: newProgress
              });
           }
        }

        if (task.category === 'study') {
          awardXP(50, 'study', 'CONCEPT MASTERED');
          awardResources({ shards: 10 }); // "tears" / shards
        } else {
          awardXP(25, 'tasks', 'OBJECTIVE SECURED');
          awardResources({ shards: 5 });
        }
        
        // Manual XP injection to season pass for tough tasks
        if (profile?.seasonPass) {
          const passXp = bpXp;
          const currentPassXP = profile.seasonPass.currentXP || 0;
          const newPassXP = currentPassXP + passXp;
          const newTier = Math.floor(newPassXP / XP_PER_TIER) + 1;
          
          await updateDoc(doc(db, `users/${user.uid}`), {
            'seasonPass.currentXP': newPassXP,
            'seasonPass.currentTier': newTier
          });
          
          setFocusToastMsg(`+${passXp} PASS XP [${task.priority?.toUpperCase() || 'NORMAL'}]`);
          setShowFocusToast(true);
          setTimeout(() => setShowFocusToast(false), 3000);
        }

        updateBPMissionProgress('task', 1);
        playBell();
        launchConfetti({ origin: { x: 0.5, y: 0.2 }, count: 30 });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, taskPath);
    }
  };


  // --- Habit Actions ---
  const addHabit = async (title: string, icon: string = 'Zap') => {
    if (!user || !title.trim()) return;
    const habitsPath = `users/${user.uid}/habits`;
    try {
      await addDoc(collection(db, habitsPath), {
        userId: user.uid,
        title,
        description: '',
        icon,
        streak: 0,
        streakBest: 0,
        completedDates: [],
        createdAt: Date.now()
      });
      playTick();
      if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(50);
    } catch (e) {
      console.error("Failed to add habit:", e);
      handleFirestoreError(e, OperationType.CREATE, habitsPath);
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!user) return;
    const habitPath = `users/${user.uid}/habits/${habitId}`;
    try {
      const habitDoc = doc(db, habitPath);
      await deleteDoc(habitDoc);
      playWhoosh();
    } catch (e) {
      console.error("Delete habit failed:", e);
      handleFirestoreError(e, OperationType.DELETE, habitPath);
    }
  };

  const toggleHabit = async (habit: Habit) => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const completedDates = habit.completedDates || [];
    const isCompleted = completedDates.includes(today);
    const habitPath = `users/${user.uid}/habits/${habit.id}`;
    const habitDoc = doc(db, habitPath);

    try {
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
        
        // Quantum Alchemy: Energy Shards
        awardResources({ shards: 5 }); 
        if (currentStreak === 1) {
          awardResources({ tokens: 1 }); // Flame Token for starting streak
        } else if (currentStreak % 10 === 0) {
          awardResources({ tokens: 5 }); // More tokens for milestones
        }

        if (bonusXp > 0) {
          launchConfetti({ count: 50 });
        }
        
        updateBPMissionProgress('habit', 1);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, habitPath);
    }
  };

  // --- AI Coach Logic ---
  const sendToCoach = async (message: string) => {
    if (!user || !message.trim()) return;
    setCoachMessages(prev => [...prev, { role: 'user', text: message }]);
    setIsAiTyping(true);

    const context = {
      profile,
      activePartner: profile?.activeCharacterId,
      pendingTasks: tasks.filter(t => !t.completed).length,
      tasks: tasks.filter(t => !t.completed).map(t => ({ title: t.title, priority: t.priority })),
      habitStreak: habits.reduce((acc, h) => Math.max(acc, h.streak), 0),
      sessionCount: sessionLogs.length,
      neuralScore,
      energyScore: getEnergyScore()
    };

    try {
        let text = '';
        let habitSuggestions = undefined;
        let directives = undefined;

        if (message.toLowerCase().includes('directives') || message.toLowerCase().includes('assessment')) {
            directives = await getAIProductivityDirectives(context);
            text = "Sector analyzed. Here are your high-priority survival directives:";
        } else if (message.toLowerCase().includes('habit') || message.toLowerCase().includes('suggest')) {
            habitSuggestions = await getAIHabitSuggestions(context);
            text = "Based on your combat record, I've drafted these survival protocols:";
        } else {
            text = await getAICoachResponse(message, context) || '';
        }

        setCoachMessages(prev => [...prev, { role: 'ai', text, habitSuggestions, directives }]);
    } catch (error) {
        setCoachMessages(prev => [...prev, { role: 'ai', text: "HQ comms disrupted. Rely on your base protocols." }]);
    } finally {
        setIsAiTyping(false);
    }
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
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 p-8 overflow-y-auto selection:bg-blue-500/30">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="cinematic-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-transparent to-transparent" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 text-center space-y-10 max-w-md w-full py-12"
      >
        <div className="relative w-24 h-24 mx-auto group">
           <div className="absolute inset-0 bg-blue-600 rounded-[2.2rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
           <div className="relative w-24 h-24 bg-blue-600 rounded-[2.2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 border border-white/10">
             <Zap className="w-12 h-12 text-white fill-white transform group-hover:scale-110 transition-transform" />
           </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex flex-col items-center justify-center">
            <span className="text-blue-500 font-mono text-[10px] tracking-[0.5em] font-black mb-2 animate-pulse">ESTABLISHING CONNECTION</span>
            <h1 className="text-5xl font-black tracking-tight text-white uppercase italic leading-none">Quantum</h1>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed px-8 font-serif italic opacity-60">
            "The distance between who you are and who you want to be is called what you do."
          </p>
        </div>

        <div className="glass-card p-6 border border-white/5 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-xl space-y-6">
           <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Primary Objective</p>
              <div className="grid grid-cols-2 gap-3">
                 {(['JEE', 'NEET'] as const).map(pref => (
                   <button
                     key={pref}
                     onClick={() => setExamPreference(pref)}
                     className={cn(
                       "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500",
                       examPreference === pref 
                        ? "bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]" 
                        : "bg-white/5 border-white/5 text-white/20 hover:bg-white/10"
                     )}
                   >
                     {pref}
                   </button>
                 ))}
              </div>
           </div>
           
           <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

           <div className="space-y-3">
              {authError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-500 font-bold uppercase tracking-wider text-center">
                  {authError}
                </div>
              )}
              <button 
                onClick={handleGoogleLogin}
                disabled={isAuthenticating}
                className={cn(
                  "w-full h-16 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl shadow-white/5",
                  isAuthenticating && "opacity-70 cursor-not-allowed"
                )}
              >
                {isAuthenticating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
                {isAuthenticating ? "Authenticating..." : "Authorize with Cloud"}
              </button>
              
              <button 
                onClick={handleAnonymousLogin}
                disabled={isAuthenticating}
                className={cn(
                  "w-full h-16 bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl active:scale-95 transition-all outline-none border border-white/5 hover:bg-zinc-800",
                  isAuthenticating && "opacity-70 cursor-not-allowed"
                )}
              >
                {isAuthenticating ? "WAIT..." : "Enter as Ghost"}
              </button>
           </div>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <div className="h-[1px] w-12 bg-blue-500/30" />
          <p className="text-[8px] text-zinc-600 uppercase tracking-[0.4em] font-black">
            End-to-End Quantum Security
          </p>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div 
      className={cn(
        "min-h-screen bg-background text-on-background page-content overflow-x-clip selection:bg-primary/30 relative",
        profile?.settings?.isDopamineDetox && "grayscale-sm contrast-sm",
        profile?.neuralLinkEnabled && "neural-link-active"
      )}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
    >
      
      


      {/* Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="cinematic-grid" />
        <div className="grain-overlay" />
      </div>
      
      {profile?.settings?.isDopamineDetox && (
        <div className="fixed inset-0 pointer-events-none z-[100] bg-zinc-900/10 backdrop-grayscale-[0.5]" />
      )}

      {profile?.prestigeLevel && profile.prestigeLevel > 0 ? (
        <div className="fixed inset-0 pointer-events-none z-[-1] animate-pulse opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(212, 168, 67, 0.4) 0%, transparent 70%)', mixBlendMode: 'screen' }} />
      ) : null}

      <div className="cinematic-vignette" />
      <CustomCursor />
      
      <AnimatePresence>
        {isSimpleTimerMode && (
            <SimpleTimer 
              timeLeft={timeLeft}
              isRunning={isRunning}
              mode={mode}
              totalTime={totalTime}
              intention={sessionIntention}
              persona={profile?.persona}
              onToggle={() => setIsRunning(!isRunning)}
              onReset={() => {
                 setIsRunning(false);
                 const base = mode === 'study' ? (profile?.settings?.workDuration || 25) : (profile?.settings?.breakDuration || 5);
                 setTimeLeft(base * 60);
              }}
              onClose={() => setIsSimpleTimerMode(false)}
            />
        )}
      </AnimatePresence>

      <FloatingParticles />
      <AnimatePresence mode="wait">
        {profile && !profile.hasCompletedOnboarding ? (
          <CinematicOnboarding onComplete={handleOnboardingComplete} />
        ) : view === 'cinematic' ? (
          <motion.div 
            key="cinematic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <HeroSection onExplore={handleDashboardTransition} />
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("min-h-screen flex flex-col transition-all duration-700", (!isFocusMode && !isSimpleTimerMode && !isOverlayOpen) && "md:ml-64")}
          >
            {/* Header / Stats Overlay */}
            {!isFocusMode && !isSimpleTimerMode && (
              <header className="fixed top-0 left-0 md:left-64 right-0 p-4 md:p-6 flex items-center justify-between bg-background/95 backdrop-blur-xl z-[60] border-b border-white/5 shadow-lg shadow-black/20">
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
                <div className="flex items-center gap-1 md:gap-2">
                  <MagneticButton 
                    onClick={() => setShowBrain(true)}
                    className="p-1.5 md:p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:bg-emerald-500/20 transition-all"
                    title="Neural Network (Syllabus)"
                   >
                      <Brain className="w-3.5 h-3.5 md:w-5 h-5" />
                   </MagneticButton>
                  <MagneticButton 
                    onClick={() => setShowMissions(true)}
                    className="p-1.5 md:p-2.5 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:bg-red-500/20 transition-all"
                    title="High Stakes Missions"
                   >
                      <Skull className="w-3.5 h-3.5 md:w-5 h-5" />
                   </MagneticButton>
                  <MagneticButton 
                    onClick={() => setShowAchievements(true)}
                    className="p-1.5 md:p-2.5 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:bg-blue-500/20 transition-all"
                    title="Achievements"
                  >
                     <Award className="w-3.5 h-3.5 md:w-5 h-5" />
                  </MagneticButton>
                  <MagneticButton 
                    onClick={() => setActiveTab('profile')}
                    className="p-1.5 md:p-2.5 bg-white/5 text-on-surface-variant rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
                    title="Systems Control"
                  >
                     <Settings className="w-3.5 h-3.5 md:w-5 h-5" />
                  </MagneticButton>
                </div>
              </header>
            )}

            {/* Main Content Area */}
            <main className={cn(
              "flex-1 overflow-x-hidden",
              isFocusMode || isSimpleTimerMode ? "p-0" : "px-6 pb-28 pt-24 md:px-12 md:pb-12 md:pt-32 max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-12 mb-20 md:mb-0 transition-all duration-500"
            )}>
              <AnimatePresence mode="wait">
                {(!profile || !user) && !loading && (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="flex flex-col items-center justify-center p-20 text-white/40 font-black uppercase tracking-widest italic animate-pulse"
                   >
                     SYNCHRONIZING QUANTUM LINKS...
                   </motion.div>
                )}
                {activeTab === 'home' && profile && user && (
                  <motion.div 
                    key="home"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-10 pb-24"
                  >
                    {/* Header: Persona Pulse */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                       <div className="lg:col-span-2">
                          <PersonaLab currentPersona={currentPersona} onSavePersona={handleSavePersona} />
                       </div>
                       <div className="flex flex-col gap-4">
                          <div className="glass-card border border-white/10 p-6 rounded-[2.5rem] flex flex-col justify-center gap-4 h-full">
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em]">Neural Load</span>
                                <span className="text-orange-500 text-xs font-black italic">{Math.round(neuralScore)}%</span>
                             </div>
                             <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${neuralScore}%` }}
                                   className="h-full bg-gradient-to-r from-orange-600 to-amber-400 shadow-[0_0_15px_rgba(234,88,12,0.5)]" 
                                />
                             </div>
                             <div className="flex gap-4 mt-2">
                                <div className="flex-1 flex flex-col">
                                   <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Streak</span>
                                   <span className="text-xl font-black italic text-white flex items-center gap-1">
                                      {streak}
                                      <Flame className="w-4 h-4 text-orange-500" />
                                   </span>
                                </div>
                                <div className="flex-1 flex flex-col border-l border-white/5 pl-4">
                                   <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Multiplier</span>
                                   <span className="text-xl font-black italic text-white flex items-center gap-1">
                                      ×{(1 + (profile?.level || 1) * 0.1).toFixed(1)}
                                      <Zap className="w-4 h-4 text-blue-400" />
                                   </span>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {/* Directives: Contracts & Missions */}
                       <div className="space-y-6">
                          <div className="flex items-center justify-between px-2">
                             <div className="flex items-center gap-2">
                                <Skull className="w-4 h-4 text-red-500" />
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] italic text-white/60">Active Directives</h3>
                             </div>
                             <button onClick={() => setActiveTab('contracts')} className="text-[9px] font-black uppercase text-red-500 hover:text-red-400 transition-colors">Manifest Pacts →</button>
                          </div>
                          
                          <div className="space-y-4">
                             {contracts.filter(c => c.status === 'active').slice(0, 2).map(contract => (
                               <div key={contract.id} className="p-5 border border-red-900/20 bg-red-950/5 rounded-[2rem] flex flex-col gap-3 group hover:border-red-500/40 transition-all">
                                  <div className="flex justify-between items-start">
                                     <h4 className="text-xs font-black uppercase italic tracking-tighter text-white">{contract.title}</h4>
                                     <span className="text-[8px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full font-black uppercase">{Math.round((contract.progress / contract.goal) * 100)}%</span>
                                  </div>
                                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                     <div className="h-full bg-red-600" style={{ width: `${(contract.progress / contract.goal) * 100}%` }} />
                                  </div>
                               </div>
                             ))}
                             {contracts.filter(c => c.status === 'active').length === 0 && (
                                <div className="p-8 border border-dashed border-white/5 bg-white/5 rounded-[2rem] text-center">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-white/10 italic">No Active Pacts. Your life is too safe.</p>
                                </div>
                             )}
                          </div>
                       </div>

                       {/* Objective Mirror */}
                       <div className="space-y-6">
                           <div className="flex items-center justify-between px-2">
                             <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-blue-400" />
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] italic text-white/60">Objective Queue</h3>
                             </div>
                             <button onClick={() => setActiveTab('tasks')} className="text-[9px] font-black uppercase text-blue-500 hover:text-blue-400 transition-colors">Deploy Mission →</button>
                          </div>

                          <div className="space-y-4">
                             {tasks.filter(t => !t.completed).slice(0, 3).map(task => (
                                <div key={task.id} className="p-4 glass rounded-[1.8rem] border border-white/5 flex items-center justify-between gap-4 group hover:bg-white/5 transition-all">
                                   <div className="flex items-center gap-3 truncate">
                                      <div className={cn("w-2 h-2 rounded-full shrink-0", task.priority === 'high' ? "bg-red-500 animate-pulse" : "bg-blue-400")} />
                                      <span className="text-sm font-bold truncate opacity-80 group-hover:opacity-100">{task.title}</span>
                                   </div>
                                   <button 
                                     onClick={() => toggleTask(task)}
                                     className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 group-hover:border-blue-400/50 transition-all"
                                   >
                                      <Check className="w-3 h-3 text-white/20 group-hover:text-blue-400" />
                                   </button>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* AI Assistant */}
                      <TiltCard intensity={5} className="h-32">
                        <button 
                          onClick={() => setActiveTab('ai')}
                          className="w-full h-full glass p-5 flex flex-col justify-between text-left rounded-[2rem] group border border-blue-500/10 hover:border-blue-500/40 transition-all"
                        >
                          <div className="p-3 bg-blue-500/20 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                            <MessageSquare className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                             <h3 className="font-display font-black text-white text-sm italic uppercase tracking-tighter">Synthetic Handler</h3>
                             <p className="text-[8px] text-blue-400/60 font-mono mt-1 uppercase tracking-widest">Context Synchronized</p>
                          </div>
                        </button>
                      </TiltCard>

                      {/* Combat Training (Arena) */}
                      <TiltCard intensity={5} className="h-32">
                        <button 
                          onClick={() => setActiveTab('arena')}
                          className="w-full h-full bg-amber-500/10 border border-amber-500/30 p-5 flex flex-col justify-between text-left rounded-[2rem] hover:bg-amber-500/20 transition-all group"
                        >
                          <div className="p-3 bg-amber-500/20 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                            <Swords className="w-5 h-5 text-amber-500" />
                          </div>
                          <div>
                             <h3 className="font-display font-black text-white text-sm italic uppercase tracking-tighter">AI Arena</h3>
                             <p className="text-[8px] text-amber-500/60 font-mono mt-1 uppercase tracking-widest">Open Combat</p>
                          </div>
                        </button>
                      </TiltCard>

                      {/* Flashcard Training */}
                      <TiltCard intensity={5} className="h-32">
                        <button 
                          onClick={() => setIsArenaOpen(true)}
                          className="w-full h-full bg-purple-500/10 border border-purple-500/30 p-5 flex flex-col justify-between text-left rounded-[2rem] hover:bg-purple-500/20 transition-all group"
                        >
                          <div className="p-3 bg-purple-500/20 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                            <Zap className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                             <h3 className="font-display font-black text-white text-sm italic uppercase tracking-tighter">Neural Flash</h3>
                             <p className="text-[8px] text-purple-400/60 font-mono mt-1 uppercase tracking-widest">Recall Drill</p>
                          </div>
                        </button>
                      </TiltCard>

                      {/* Mind Palace (Knowledge Graph) */}
                      <TiltCard intensity={5} className="h-32">
                        <button 
                          onClick={() => setActiveTab('graph')}
                          className="w-full h-full glass p-5 flex flex-col justify-between text-left rounded-[2rem] group border border-emerald-500/10 hover:border-emerald-500/40 transition-all"
                        >
                          <div className="p-3 bg-emerald-500/20 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                            <Network className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                             <h3 className="font-display font-black text-white text-sm italic uppercase tracking-tighter">Mind Palace</h3>
                             <p className="text-[8px] text-emerald-400/60 font-mono mt-1 uppercase tracking-widest">Graph Mapping</p>
                          </div>
                        </button>
                      </TiltCard>
                    </div>

                    <RivalDashboard 
                      currentProfile={profile!} 
                      rivalIds={profile?.rivalIds || []} 
                      rivalProfiles={rivals}
                      onAddRival={handleAddRival} 
                    />

                    <ExamCountdown profile={profile} />

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
                    
                    {/* Weekly Planner & Timetable */}
                    <div className="grid grid-cols-1 gap-6 px-2">
                        <WeeklyPlanner awardXP={awardXP} playSound={() => playTick()} />
                        <Timetable playSound={() => playTick()} />
                    </div>

                    {/* Stats Grid */}
                    <section className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest opacity-40 px-2">Quantum Dashboard</h3>
                      <AdaptiveWidgetGrid 
                        timeLeft={timeLeft}
                        isRunning={isRunning}
                        mode={mode}
                        currentTask={selectedTaskId}
                        tasks={tasks}
                        onToggleTimer={startSessionWithDreamCheck}
                        onResetTimer={() => setTimeLeft(mode === 'study' ? (profile?.settings?.workDuration || 50) * 60 : (profile?.settings?.breakDuration || 10) * 60)}
                        formatTime={formatTime}
                        sessionIntention={sessionIntention}
                        setSessionIntention={setSessionIntention}
                        distractions={distractions}
                        onAddDistraction={() => setDistractions(prev => prev + 1)}
                        onCaptureSnapshot={handleCaptureSnapshot}
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

                    {/* Health Tracker Dashboard */}
                    <VitalitySection />

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
                          const today = format(new Date(), 'yyyy-MM-dd');
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
                      <h3 className="text-sm font-black uppercase tracking-widest opacity-40 px-2 font-mono">Mission Control</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                           <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Tactical Roster</h3>
                           <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
                              <button 
                                onClick={() => setTaskView('active')}
                                className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all", taskView === 'active' ? "bg-primary text-white" : "text-white/40")}
                              >
                                Active
                              </button>
                              <button 
                                onClick={() => setTaskView('completed')}
                                className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all", taskView === 'completed' ? "bg-green-500 text-white" : "text-white/40")}
                              >
                                Completed
                              </button>
                           </div>
                        </div>
                        
                        {taskView === 'active' && (
                          <div className="flex bg-md-surface-3 rounded-full p-1 border border-white/5 w-fit ml-2">
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
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {tasks.filter(t => taskView === 'active' ? !t.completed : t.completed).sort((a, b) => {
                          if (taskView === 'completed') return (b.completedAt || 0) - (a.completedAt || 0);
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
                              onClick={() => installMission(task)}
                              className={cn(
                                "glass-card group flex items-center justify-between p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border transition-colors cursor-pointer",
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
                                    {task.urgent && !task.completed && (
                                      <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse border border-red-500/30">
                                        {t('urgent')}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 italic">{task.category}</p>
                                    {!task.completed && (
                                       <button 
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
                                           const currentPrio = task.priority || 'medium';
                                           const nextIndex = (priorities.indexOf(currentPrio) + 1) % 3;
                                           updateTaskPriority(task.id, priorities[nextIndex]);
                                         }}
                                         className={cn(
                                           "px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 shadow-sm",
                                           task.priority === 'high' ? "bg-red-500/10 border-red-500/30 text-red-500" :
                                           task.priority === 'medium' ? "bg-amber-500/10 border-amber-500/30 text-amber-500" :
                                           "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                         )}
                                       >
                                         {task.priority || 'medium'}
                                       </button>
                                    )}
                                    {task.completed && task.completedAt && (
                                      <span className="text-[8px] font-bold opacity-20 uppercase tracking-widest">
                                        • Completed {new Date(task.completedAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
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
                        {tasks.filter(t => taskView === 'active' ? !t.completed : t.completed).length === 0 && (
                          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem] opacity-30">
                            <p className="text-xs font-black uppercase tracking-[0.3em]">
                              {taskView === 'active' ? 'No Active Deployments' : 'No Completed Missions'}
                            </p>
                          </div>
                        )}
                      </div>
                    </section>
                  </motion.div>
                )}
                {activeTab === 'timer' && (
            <motion.div 
              key="timer"
              id="s-timer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full min-h-[calc(100vh-140px)]"
            >
              {/* Full Screen Background for Timer */}
              <div className={cn("fixed inset-0 z-0 pointer-events-none bg-[#05070d]", !isFocusMode && "md:ml-64")}>
                <FireBreathingScene isRunning={isRunning} intensity={mode === 'study' ? 0.9 : 0.2} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-transparent to-[#05070d] opacity-70" />
                {/* Lighter overlay for better animation visibility */}
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
              </div>
              
              <div className="relative z-10 flex flex-col items-center pt-2 md:pt-4 px-4 w-full h-full max-w-lg mx-auto">
                {/* Mode Tabs */}
                {!isFocusMode && (
                <div id="t-mode-tabs" className="relative z-[60] flex gap-2 md:gap-4 p-1.5 md:p-2 bg-white/5 rounded-2xl border border-white/10 mb-8 md:mb-12 backdrop-blur-md">
                  <button 
                    className={cn(
                        "px-6 md:px-10 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all",
                        mode === 'study' ? "bg-orange-500 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)]" : "text-white/40 hover:text-white"
                    )}
                    onClick={() => { playWhoosh(); setMode('study'); setTimeLeft((profile?.settings?.workDuration || 25) * 60); setIsRunning(false); setSessionStartTime(null); setCurrentSessionSeconds(0); setSessionIntention(''); }}
                  >
                    <span>FOCUS</span>
                  </button>
                  <button 
                    className={cn(
                        "px-6 md:px-10 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all",
                        (mode === 'shortBreak' || mode === 'longBreak') ? "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]" : "text-white/40 hover:text-white"
                    )}
                    onClick={() => { playWhoosh(); setMode('shortBreak'); setTimeLeft((profile?.settings?.breakDuration || 5) * 60); setIsRunning(false); setSessionStartTime(null); setCurrentSessionSeconds(0); }}
                  >
                    <span>REST</span>
                  </button>
                  <button 
                    className="px-6 md:px-10 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all bg-white/10 text-white/80 hover:bg-white hover:text-black border border-white/20 active:scale-95"
                    onClick={(e) => { 
                      playWhoosh(); 
                      setIsSimpleTimerMode(true);
                      window.dispatchEvent(new CustomEvent('app-touch-spark', { detail: { x: e.clientX, y: e.clientY } }));
                    }}
                  >
                    <span>SIMPLE MODE </span>
                  </button>
                </div>
              )}

              {/* Status Badge */}
              {!isFocusMode && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="relative z-10 mb-8 px-5 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md"
                >
                  <div className="flex items-center gap-3">
                      {mode === 'study' ? <Flame className="w-4 h-4 text-orange-500 shrink-0" /> : <Wind className="w-4 h-4 text-blue-400 shrink-0" />}
                      <span className={cn(
                          "text-[10px] md:text-xs font-black italic uppercase tracking-widest truncate",
                          mode === 'study' ? "text-orange-500" : "text-blue-400"
                      )}>
                          {mode === 'study' ? 'IGNITION STATUS: ACTIVE' : 'RECOVERY MODE: STEADY'}
                      </span>
                  </div>
                </motion.div>
              )}
                        {/* Timer Ring Area */}
                <div id="t-ring-area" className={cn(
                  "relative z-20 flex flex-col items-center justify-center w-full transition-all duration-700 aspect-square max-w-[min(80vw,480px)] lg:max-w-xl mx-auto my-4 md:my-8",
                  isFocusMode ? "scale-110" : ""
                )}>
                  {/* Progress Ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="46" 
                      className="fill-none stroke-white/5 stroke-[1]" 
                    />
                    <motion.circle 
                      cx="50" cy="50" r="46" 
                      className="fill-none stroke-[2]"
                      stroke={currentPersona?.auraColor || (mode === 'study' ? '#f97316' : '#3b82f6')}
                      strokeDasharray="289"
                      animate={{ strokeDashoffset: 289 * (1 - timeLeft / totalTime) }}
                      transition={{ duration: 1, ease: "linear" }}
                      strokeLinecap="round"
                    />
                  </svg>

                  
                  {/* Completion Ripple */}
                  <AnimatePresence>
                    {sessionFinished && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0.8 }}
                            animate={{ scale: [0.8, 1.8], opacity: [0.8, 0] }}
                            transition={{ duration: 2, ease: "easeOut", repeat: Infinity }}
                            className={cn(
                                "absolute inset-0 rounded-full border-[3px] z-0",
                                mode === 'study' ? "border-orange-500" : "border-blue-500"
                            )}
                        />
                    )}
                  </AnimatePresence>
                  
                  <NeuralMatrix active={isRunning} />

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div id="t-time" className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black italic tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] leading-none select-none text-white tabular-nums">
                        {formatTime(timeLeft)}
                    </div>
                    <div id="t-mode-label" className="mt-1 md:mt-1.5 flex flex-col items-center">
                      <div className="text-[10px] md:text-sm font-black uppercase tracking-[0.5em] opacity-80 text-white shadow-black drop-shadow-md">
                        {mode === 'study' ? (currentPersona ? `NEURAL LINK: ${currentPersona.name.toUpperCase()}` : 'IGNITE CORE') : 'RECOVERY PROTOCOL'}
                      </div>
                      {mode === 'study' && currentPersona && (
                        <div className="text-[9px] md:text-[11px] italic text-md-primary mt-2 uppercase tracking-widest text-center max-w-[200px] leading-tight font-black drop-shadow-md">
                            "{currentPersona.signaturePhrase}"
                        </div>
                      )}
                    </div>
                    {(sessionIntention || (selectedTaskId && tasks.find(t => t.id === selectedTaskId)?.title)) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ 
                          opacity: 1, 
                          y: [0, -8, 0],
                        }}
                        transition={{
                          y: {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                        }}
                        className={cn(
                          "fixed left-1/2 -translate-x-1/2 pointer-events-none z-[100] flex flex-col items-center gap-2 w-full max-w-[280px]",
                          isFocusMode ? "bottom-[12%]" : "bottom-[22%]"
                        )}
                      >
                         <div className={cn(
                           "px-5 py-2.5 rounded-2xl border-2 flex items-center gap-3 transition-all duration-500",
                           mode === 'study' ? "bg-orange-600/90 border-orange-400/50 shadow-[0_10px_30px_rgba(234,88,12,0.5)]" : "bg-blue-600/90 border-blue-400/50 shadow-[0_10px_30px_rgba(59,130,246,0.5)]"
                         )}>
                           <div className="relative shrink-0">
                             <Target className="w-5 h-5 text-white animate-pulse" />
                             <div className="absolute inset-0 bg-white blur-md opacity-30 animate-pulse" />
                           </div>
                           <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.1em] text-white italic whitespace-nowrap overflow-hidden text-ellipsis">
                             MISSION: {sessionIntention || tasks.find(t => t.id === selectedTaskId)?.title}
                           </span>
                         </div>
                         {isFocusMode && (
                           <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full backdrop-blur-md border border-white/10">
                             <BellOff className="w-3 h-3 text-white/60" />
                             <span className="text-[8px] font-black uppercase tracking-widest text-white/60">Notifications Muted</span>
                           </div>
                         )}
                         <div className="flex items-center gap-2 opacity-60">
                           <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/80 animate-pulse">DON'T STOP UNTIL COMPLETE</span>
                         </div>
                      </motion.div>
                    )}
                    {isFocusMode && sessionIntention ? (
                      <div className="focus-intention animate-pulse text-primary text-[8px] md:text-[10px] uppercase font-black tracking-widest mt-4 md:mt-6 bg-primary/10 px-4 py-1 rounded-full border border-primary/20">
                        Stay Focused
                      </div>
                    ) : (
                      <div id="t-session-label" className="mt-2 md:mt-4 font-black italic opacity-60 text-[10px] md:text-xs text-white">
                        Technique Stage {(sessionCount % 4) + 1} / 4
                      </div>
                    )}
                    {isFocusMode && dream && (
                      <div className="absolute top-[85%] left-1/2 -translate-x-1/2 w-max max-w-[80%] opacity-30 text-[8px] md:text-[10px] italic font-serif text-white text-center pointer-events-none">
                         "This session is for: {dream.text}"
                      </div>
                    )}
                  </div>                
                </div>
                  {/* Local anime floating elements */}
                  {isRunning && (
                    <div className="pointer-events-none absolute inset-0 overflow-visible z-20">
                      <motion.div 
                          initial={{ opacity: 0, scale: 0.5, x: 20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          className="absolute -top-2 -right-2 md:-top-6 md:-right-6 p-2 md:p-3 bg-orange-600 text-white text-[10px] md:text-sm font-black italic rounded-xl border-2 border-orange-400 rotate-12 shadow-2xl"
                      >FOCUS!!</motion.div>
                      <motion.div 
                          initial={{ opacity: 0, scale: 0.5, x: -20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="absolute -bottom-2 -left-2 md:-bottom-6 md:-left-6 p-2 md:p-3 bg-blue-600 text-white text-[10px] md:text-sm font-black italic rounded-xl border-2 border-blue-400 -rotate-12 shadow-2xl"
                      >GRIND!!</motion.div>
                    </div>
                  )}

                {!isFocusMode && (
                  <div className="flex gap-2 justify-center mt-8 p-3 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                    {[0, 1, 2, 3].map(i => (
                      <motion.div 
                        key={i} 
                        className={cn(
                          "w-4 h-4 rounded-lg flex items-center justify-center transition-all border", 
                          (sessionCount % 4) > i ? "bg-orange-500 border-orange-400 rotate-45" : (sessionCount % 4) === i && isRunning ? "border-orange-400 bg-orange-400/20" : "border-white/10 bg-white/5"
                        )} 
                        animate={isRunning && (sessionCount % 4) === i ? { scale: [1, 1.2, 1], rotate: 45 } : {}}
                      />
                    ))}
                  </div>
                )}

                {!isFocusMode && (
                  <div className="flex justify-center gap-6 mt-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-xl font-black italic text-white">{streak}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-xl font-black italic text-white">×{(1 + (profile?.level || 1) * 0.1).toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Goals & Atmosphere Section */}
              {!isFocusMode && (
                <div className="w-full max-w-sm flex flex-col gap-4 px-2 z-10 mb-10">
                  <div className="bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-sm">
                    <div className="flex justify-between mb-3 text-[10px] font-black uppercase tracking-widest">
                      <span className="opacity-40 text-white">Focus Reservoir</span>
                      <span className="text-orange-500">{Math.floor(totalFocusSecondsToday / 60) || 0} / 200m</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-orange-600 to-yellow-400" 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((Math.floor(totalFocusSecondsToday / 60) || 0) / 200) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <button 
                      onClick={() => setIsAtmosphereSheetOpen(true)}
                      className="flex items-center justify-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl transition-all active:scale-95 group backdrop-blur-md"
                  >
                    <Music className="w-4 h-4 text-white group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">
                      {activeAmbientTrack ? activeAmbientTrack.label : 'Atmosphere Engine'}
                    </span>
                  </button>
                </div>
              )}

              {/* Controls */}
              <div id="t-controls" className={cn("relative z-[60] flex items-center justify-center gap-8 pb-16 md:pb-24", isFocusMode && "mt-12")}>
              
                {!isFocusMode && (
                  <button 
                    onClick={resetTimer}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center shrink-0"
                  >
                    <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                )}
                  <button 
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTouchSparks(prev => [...prev, { id: Date.now(), x: e.clientX, y: e.clientY }]);
                      toggleTimer();
                    }}
                    className={cn(
                      "w-20 h-20 md:w-24 md:h-24 rounded-[2.2rem] md:rounded-[2.5rem] flex items-center justify-center transition-all border-4 md:border-8 shadow-2xl relative group overflow-hidden shrink-0 active:scale-95",
                      isRunning 
                          ? "bg-[#05070d] border-white/10 text-white" 
                          : "bg-orange-600 border-orange-400 text-white hover:scale-110 shadow-[0_0_40px_rgba(234,88,12,0.5)]"
                    )}
                  >
                    {isRunning ? <Pause className="w-8 h-8 md:w-10 md:h-10 fill-current" /> : <Play className="w-8 h-8 md:w-10 md:h-10 fill-current ml-1 md:ml-2" />}
                    {!isRunning && <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 animate-shimmer" />}
                </button>
                <button 
                  onClick={() => {
                    const newFocusMode = !isFocusMode;
                    setIsFocusMode(newFocusMode);
                    setFocusToastMsg(newFocusMode ? "FOCUS MODE ENGAGED: NOTIFICATIONS MUTED" : "DASHBOARD RESTORED");
                    setShowFocusToast(true);
                    setTimeout(() => setShowFocusToast(false), 3000);
                    playWhoosh();
                  }}
                  className={cn(
                      "w-12 h-12 md:w-14 md:h-14 rounded-2xl border transition-all flex items-center justify-center shrink-0",
                      isFocusMode ? "bg-orange-600 text-white border-orange-400 shadow-[0_0_20px_rgba(234,88,12,0.4)]" : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                  )}
                >
                  {isFocusMode ? <Minimize2 className="w-5 h-5 md:w-6 md:h-6" /> : <Maximize2 className="w-5 h-5 md:w-6 md:h-6" />}
                </button>
              </div>
              <AnimatePresence>
                {touchSparks.map(spark => (
                  <motion.div
                    key={spark.id}
                    initial={{ opacity: 1, scale: 0 }}
                    animate={{ opacity: 0, scale: 2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ position: 'fixed', left: `${spark.x}px`, top: `${spark.y}px`, pointerEvents: 'none', zIndex: 1000 }}
                    className="flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="absolute w-12 h-12 border-2 border-orange-500 rounded-full animate-ping" />
                    <div className="flex gap-2">
                       {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                         <div 
                          key={angle}
                          className="absolute w-1 h-8 bg-orange-500/80 rounded-full"
                          style={{ transform: `rotate(${angle}deg) translateY(-20px)`, transformOrigin: 'center bottom' }}
                         />
                       ))}
                    </div>
                  </motion.div>
                ))}
                {showScoreCard && (
                  <motion.div 
                    id="score-float"
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowScoreCard(false)}
                  >
                    <motion.div 
                      className="w-full max-w-sm glass rounded-[3rem] p-8 flex flex-col items-center text-center gap-6 border-2 border-orange-500/30"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center border-2 border-orange-500/40">
                          <Trophy className="w-10 h-10 text-orange-500" />
                        </div>
                        <h3 className="font-black text-2xl tracking-tighter uppercase text-white italic">MISSION COMPLETE</h3>
                      </div>
                      
                      <div className="flex flex-col items-center">
                          <span className="text-sm font-black uppercase tracking-widest opacity-40">Focus Score</span>
                          <span className="sc-score text-7xl font-black italic text-orange-500 tracking-tighter">{focusScore}</span>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setShowScoreCard(false);
                          if (mode === 'study') {
                            setMode('shortBreak');
                            setTimeLeft((profile?.settings?.breakDuration || 5) * 60);
                          } else {
                            setMode('study');
                            setTimeLeft((profile?.settings?.workDuration || 25) * 60);
                          }
                          setIsRunning(true);
                        }}
                        className="w-full py-4 bg-orange-600 rounded-full text-white font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/30 active:scale-95 italic"
                      >
                        REDEEM & CONTINUE
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Intention Modal Integration */}
              <AnimatePresence>
                {showIntentionInput && (
                   <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4">
                     <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       onClick={() => setShowIntentionInput(false)}
                       className="absolute inset-0 bg-black/80 backdrop-blur-md"
                     />
                     <motion.div 
                       initial={{ scale: 0.9, opacity: 0, y: 20 }}
                       animate={{ scale: 1, opacity: 1, y: 0 }}
                       exit={{ scale: 0.9, opacity: 0, y: 20 }}
                       className="relative w-full max-w-md glass rounded-[3rem] border-2 border-orange-500/30 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(234,88,12,0.2)]"
                     >
                        {/* Scanning Effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent animate-scan" />
                        
                        <div className="p-8 flex flex-col gap-8 relative z-10">
                          <div className="space-y-2 text-center">
                              <div className="flex items-center justify-center gap-2">
                                  <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">MISSION BRIEFING</h2>
                              </div>
                              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">Declare your objective to initiate focus</p>
                          </div>

                          <div className="relative">
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="Enter objective..."
                                value={sessionIntention}
                                onChange={(e) => {
                                    setSessionIntention(e.target.value);
                                    if (intentionError) setIntentionError('');
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const trimmed = sessionIntention.trim();
                                        if (trimmed.length < 3) {
                                            setIntentionError("Mission title must be at least 3 characters.");
                                            return;
                                        }
                                        if (trimmed.length > 50) {
                                            setIntentionError("Mission title is too long (max 50 chars).");
                                            return;
                                        }
                                        setShowIntentionInput(false);                
                                        setIsRunning(true);                
                                        setSessionStartTime(Date.now());                
                                        playWhoosh();
                                    }
                                }}
                                className="w-full bg-white/5 border-2 border-white/10 px-6 py-5 rounded-[2rem] text-xl font-black italic text-white focus:border-orange-500/50 focus:outline-none transition-all placeholder:text-white/10 text-center"
                            />
                            {intentionError && <p className="text-red-500 text-xs mt-2 text-center">{intentionError}</p>}
                            <div className="absolute inset-0 pointer-events-none rounded-[2rem] border border-orange-500/5 animate-pulse" />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { label: 'Deep Work', icon: Brain },
                              { label: 'Study session', icon: Target },
                              { label: 'Coding Grind', icon: Zap },
                              { label: 'Clean Mind', icon: Wind }
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                onClick={() => setSessionIntention(preset.label)}
                                className={cn(
                                  "flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest",
                                  sessionIntention === preset.label ? "bg-orange-500/20 border-orange-500 text-orange-500" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                                )}
                              >
                                <preset.icon className="w-3 h-3" />
                                <span className="truncate">{preset.label}</span>
                              </button>
                            ))}
                          </div>

                          <button 
                              disabled={sessionIntention.length < 3}
                              onClick={() => { setShowIntentionInput(false); setIsRunning(true); setSessionStartTime(Date.now()); playWhoosh(); }}
                              className="w-full py-5 bg-orange-600 rounded-[2rem] text-white font-black italic uppercase tracking-widest hover:bg-orange-500 transition-all shadow-[0_0_40px_rgba(234,88,12,0.4)] disabled:opacity-30 disabled:grayscale group relative overflow-hidden"
                          >
                              <div className="relative z-10 flex items-center justify-center gap-2">
                                <span>IGNITE PROTOCOL</span>
                                <Play className="w-4 h-4 fill-current group-hover:translate-x-1 transition-transform" />
                              </div>
                          </button>

                          <button 
                            onClick={() => setShowIntentionInput(false)}
                            className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/60 transition-colors"
                          >
                            ABORT MISSION
                          </button>
                        </div>
                     </motion.div>
                   </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'legacy' && (
            <LegacyView legacy={legacy} onWriteLetter={handleWriteLetter} />
          )}

          {activeTab === 'alchemy' && (
            <AlchemyView 
              resources={resources} 
              craftedItems={craftedItems} 
              onCraft={handleCraft} 
              onUseItem={handleUseItem} 
            />
          )}

          {activeTab === 'lab' && (
            <div className="mt-8">
              <FocusLab 
                experiments={experiments} 
                sessionLogs={sessionLogs} 
                onStartExperiment={handleStartExperiment} 
                onAbortExperiment={handleAbortExperiment}
              />
            </div>
          )}

          {activeTab === 'arena' && (
             <motion.div 
               key="arena"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="pb-20 space-y-12"
             >
                <AIArena 
                  tournaments={tournaments} 
                  profiles={rivals} 
                  currentProfile={profile!} 
                  onJoinTournament={handleJoinTournament}
                />
                <div className="px-4">
                   <Leaderboard profile={profile} onChallenge={handleChallengeRival} />
                </div>
             </motion.div>
          )}

          {activeTab === 'notes' && (
             <div className="mt-8">
                <SmartNotes 
                  notes={notes} 
                  subjects={DEFAULT_SUBJECTS} 
                  onSaveNote={handleSaveNote}
                  onDeleteNote={(id) => deleteDoc(doc(db, `users/${user!.uid}/notes`, id))}
                />
             </div>
          )}

          {activeTab === 'graph' && (
             <div className="mt-8 h-[600px]">
                <KnowledgeGraph nodes={knowledgeNodes} />
             </div>
          )}

          {activeTab === 'stream' && (
             <div className="mt-8">
                <FocusStream 
                  activeSessions={broadcasts} 
                  onStartBroadcast={handleBroadcast} 
                  onJoinSession={handleJoinSession}
                  currentProfile={profile!} 
                />
             </div>
          )}

          {activeTab === 'bureau' && (
            <PublicSafetyBureau 
              profile={profile!} 
              onRecruit={handleRecruitCharacter}
              onSelectCharacter={handleSelectCharacter}
              onSelectMission={handleSelectBureauMission}
            />
          )}

          {activeTab === 'tasks' && (
            <motion.div 
              key="tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 max-w-full overflow-x-hidden pb-[calc(10vh+80px)]"
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="text-2xl font-bold">Quantum Tasks</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openAddTaskModal('study', false)}
                    className="p-3 bg-md-primary rounded-full text-md-on-primary shadow-lg shadow-md-primary/20 active:scale-95 transition-transform"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </div>


              {/* Subject Filter Bar */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
                <button
                   onClick={() => setSelectedSubjectFilter('All')}
                   className={cn("shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all", selectedSubjectFilter === 'All' ? "bg-white/20 border-white/30 text-white shadow-sm" : "bg-transparent border-white/10 text-white/60 hover:bg-white/5")}
                >
                  All
                </button>
                {allSubjects.map(sub => {
                   const isActive = selectedSubjectFilter === sub.id;
                   const count = tasks.filter(t => t.subjects?.includes(sub.id) && !t.completed).length;
                   return (
                     <button
                       key={sub.id}
                       onClick={() => setSelectedSubjectFilter(sub.id)}
                       style={{
                          backgroundColor: isActive ? `${sub.color}33` : 'transparent',
                          borderColor: isActive ? sub.color : 'rgba(255,255,255,0.1)',
                          color: isActive ? sub.color : 'rgba(255,255,255,0.6)'
                       }}
                       className="shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-2 hover:bg-[rgba(255,255,255,0.05)]"
                     >
                       {isActive && <CheckCircle className="w-3.5 h-3.5" style={{ color: sub.color }} />}
                       {sub.name}
                       <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full">{count}</span>
                     </button>
                   );
                })}
              </div>

              {/* Subject Progress Bars */}
              <div className="flex flex-col gap-3 py-2">
                 <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1 font-mono">Subject Progress Analytics</p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {allSubjects.map(sub => {
                        const todayTasks = tasks.filter(t => t.subjects?.includes(sub.id));
                        const total = todayTasks.length;
                        if (total === 0) return null;
                        const completed = todayTasks.filter(t => t.completed).length;
                        const progress = total > 0 ? (completed / total) * 100 : 0;
                        return (
                            <div key={sub.id} className="glass-card border border-white/5 p-3 rounded-2xl space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold" style={{ color: sub.color }}>{sub.name}</span>
                                    <span className="text-[10px] text-white/60 font-mono">{completed}/{total}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{ backgroundColor: sub.color, boxShadow: `0 0 10px ${sub.color}80` }}
                                     />
                                </div>
                            </div>
                        );
                    })}
                 </div>
               </div>
       
              <div className="flex gap-2 p-1 bg-white/5 rounded-full w-fit border border-white/5">
                {['Pending', 'Completed'].map(f => {
                   const viewKey = f === 'Pending' ? 'active' : 'completed';
                   return (
                     <button 
                       key={f} 
                       onClick={() => setTaskView(viewKey)}
                       className={cn(
                         "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                         taskView === viewKey ? "bg-md-primary text-md-on-primary shadow-lg shadow-md-primary/20" : "text-white/40 hover:text-white"
                       )}
                     >
                       {f}
                     </button>
                   );
                })}
              </div>

              <div className="flex flex-col gap-4 px-2">
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input 
                      type="text" 
                      placeholder="Filter protocols..." 
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm font-bold focus:outline-none focus:border-white/20 transition-all"
                    />
                  </div>
                  <select 
                    value={taskSortBy}
                    onChange={(e) => setTaskSortBy(e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded-2xl p-3 text-[10px] font-black uppercase tracking-widest text-white/60 focus:outline-none"
                  >
                    <option value="priority">Priority</option>
                    <option value="deadline">Deadline</option>
                    <option value="created">Recent</option>
                  </select>
                </div>

                <div className="flex gap-2">
                   {['all', 'study', 'personal', 'health'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setTaskCategoryFilter(cat as any)}
                        className={cn(
                          "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                          taskCategoryFilter === cat ? "bg-white text-black shadow-lg shadow-white/20" : "bg-white/5 text-white/40 hover:bg-white/10"
                        )}
                      >
                        {cat}
                      </button>
                   ))}
                </div>
              </div>

              <div className="space-y-3">
                 {/* Reusing task card logic but in a dedicated view */}
                 {filteredTasks
                    .filter(t => taskView === 'active' ? !t.completed : t.completed)
                    .map(task => {
                       const subject = task.subjects?.[0] ? allSubjects.find(s => s.id === task.subjects![0]) : null;
                       return (
                         <div key={task.id} className="glass-card border border-white/10 rounded-[2rem] p-4 flex items-center justify-between relative overflow-hidden group">
                            {subject && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: subject.color }} />
                            )}
                            <div className="flex items-center gap-4 pl-3">
                               <CheckCircle 
                                 onClick={() => toggleTask(task)}
                                 className={cn("w-6 h-6 cursor-pointer transition-colors", task.completed ? "text-green-500 fill-green-500/20" : "text-white/20 hover:text-white/40")} 
                               />
                               <div>
                                  <p className={cn("font-bold text-sm text-white", task.completed && "line-through opacity-50")}>{task.title}</p>
                                  <div className="flex gap-2 items-center mt-1">
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{task.category}</p>
                                    {task.urgent && <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold uppercase tracking-widest">Urgent</span>}
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const priorities = ['high', 'medium', 'low'] as const;
                                        const currentIdx = priorities.indexOf(task.priority || 'medium');
                                        const nextPriority = priorities[(currentIdx + 1) % priorities.length];
                                        updateTaskPriority(task, nextPriority);
                                      }}
                                      className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest", 
                                        task.priority === 'high' ? "bg-red-500/20 text-red-400" :
                                        task.priority === 'medium' ? "bg-amber-500/20 text-amber-400" :
                                        "bg-blue-500/20 text-blue-400"
                                      )}
                                    >
                                      {task.priority || 'medium'}
                                    </button>
                                    {subject && <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest" style={{ backgroundColor: `${subject.color}20`, color: subject.color }}>{subject.name}</span>}
                                  </div>
                               </div>
                            </div>
                            <button onClick={() => deleteTask(task.id)} className="p-3 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5 rounded-full"><Trash2 className="w-5 h-5 text-red-400/70" /></button>
                         </div>
                       );
                    })}
              </div>

            </motion.div>
          )}

          {activeTab === 'habits' && (
            <motion.div 
               key="habits"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-6"
            >
              <div className="flex justify-between items-center px-4">
                  <h3 className="text-xl font-black">Habit Roster</h3>
                  <button onClick={() => setIsAddHabitModalOpen(true)} className="text-[10px] font-black text-primary uppercase tracking-widest">+ Initialize</button>
              </div>

              <HabitsGrid habits={habits} onMark={toggleHabit} onDelete={deleteHabit} />

              <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-6 space-y-4">
                 <div className="flex items-center gap-2 px-2">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Suggested Protocols</span>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { title: 'Morning Physics', icon: 'Zap' },
                      { title: 'Revise Formulas', icon: 'BookOpen' },
                      { title: 'Hydration Scan', icon: 'Droplets' },
                      { title: 'Dopamine Reset', icon: 'Moon' }
                    ].map(h => (
                      <button
                        key={h.title}
                        onClick={() => {
                           addHabit(h.title, h.icon);
                           launchConfetti({ count: 20 });
                        }}
                        className="flex items-center justify-between p-4 glass rounded-3xl border border-white/5 hover:bg-white/10 transition-all text-left"
                      >
                         <span className="text-sm font-bold">{h.title}</span>
                         <Plus className="w-4 h-4 text-primary" />
                      </button>
                    ))}
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'contracts' && (
            <motion.div 
              key="contracts"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 pb-20"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Skull className="w-8 h-8 text-red-500" />
                  <div>
                    <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Devil Contracts</h3>
                    <p className="text-[10px] uppercase font-black text-white/30 tracking-widest mt-1">High Risk. High Reward.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsContractModalOpen(true)}
                  className="px-6 py-2 bg-red-600 text-white text-xs font-black uppercase rounded-full shadow-lg shadow-red-600/20"
                >
                  New Contract
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contracts.map(contract => (
                  <DevilContractCard 
                    key={contract.id}
                    contract={contract}
                    onBreak={handleBreakContract}
                  />
                ))}
                {contracts.length === 0 && (
                  <div className="col-span-full border-2 border-dashed border-white/5 bg-white/[0.02] rounded-[3rem] p-20 text-center space-y-4">
                     <Skull className="w-12 h-12 text-white/10 mx-auto" />
                     <p className="text-sm font-black uppercase tracking-[0.3em] text-white/20 italic">No Contracts Found</p>
                     <button 
                       onClick={() => setIsContractModalOpen(true)}
                       className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                     >
                       Sign your first pact →
                     </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div 
              key="ai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-[calc(100vh-140px)] md:h-[calc(100vh-64px)]"
            >
              <AIAssistantView 
                profile={profile}
                tasks={tasks}
                habits={habits}
                sessionLogs={sessionLogs}
                onAddTask={(title, priority, subject) => addTask(title, 'study', priority === 'high', 1, subject)}
                onAddHabit={(title, icon) => addHabit(title, icon)}
              />
            </motion.div>
          )}

          {activeTab === 'sector' && (
            <motion.div 
              key="sector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between px-4 mb-6">
                <div className="flex items-center gap-3">
                   <Layers className="w-6 h-6 text-md-primary" />
                   <div>
                      <h3 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">Sector 0: Global Feed</h3>
                      <p className="text-[10px] uppercase font-black text-white/30 tracking-widest mt-1">Satellite Link: Established</p>
                   </div>
                </div>
              </div>
              <SocialFeed posts={socialPosts} currentUserId={user?.uid || ''} onReact={handleReactToPost} onChallenge={handleChallengeRival} />
            </motion.div>
          )}


          {activeTab === 'rooms' && profile && (
            <motion.div 
              key="rooms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pb-20"
            >
              <StudyRooms 
                user={user} 
                profile={profile} 
                onRoomStateChange={setIsInStudyRoom}
                appIsRunning={isRunning}
                appTimerMode={mode}
                onToggleLocalTimer={() => setIsRunning(!isRunning)}
                onSocialAction={() => {
                  if (profile?.seasonPass) {
                    updateBPMissionProgress('social');
                  }
                }}
              />
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div 
              key="events"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="pb-20"
            >
              <GlobalEvents 
                activeEvents={activeEvents}
                profile={profile!}
                onContribute={handleContribute}
              />
            </motion.div>
          )}

          {activeTab === 'store' && profile && (
            <motion.div 
              key="store"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pb-20"
            >
              <QuantumStore 
                profile={profile!}
                items={storeItems.length > 0 ? storeItems : fallbackStoreItems}
                onPurchase={handlePurchase}
                onEquip={handleEquipPet}
              />
            </motion.div>
          )}

          {activeTab === 'neural' && (
            <motion.div 
              key="neural"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="pb-20 pt-10"
            >
              <NeuralLink 
                enabled={profile?.neuralLinkEnabled || false}
                onToggle={async (enabled) => {
                  if (!user) return;
                  await updateDoc(doc(db, 'users', user.uid), { neuralLinkEnabled: enabled });
                  setProfile(p => p ? { ...p, neuralLinkEnabled: enabled } : p);
                  setFocusToastMsg(enabled ? "NEURAL LINK ESTABLISHED" : "LINK SEVERED");
                  setShowFocusToast(true);
                  setTimeout(() => setShowFocusToast(false), 3000);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-24"
            >
              {(() => {
                const data: Record<string, number> = {};
                sessionLogs.forEach(log => {
                    const subId = log.subject || 'General';
                    const subName = allSubjects.find(s => s.id === subId)?.name || subId;
                    data[subName] = (data[subName] || 0) + Math.floor(log.duration / 60);
                });
                const sortedData = Object.entries(data).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
                const primarySubject = sortedData[0]?.name || 'General Study';

                return (
                  <div className="glass-card p-6 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-[2.5rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                       <Brain className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                       <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
                          <Sparkles className="w-8 h-8 text-blue-400" />
                       </div>
                       <div className="flex-1 text-center md:text-left">
                          <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">Neural Assessment Complete</h4>
                          <p className="text-xs text-white/50 mt-1 max-w-xl">
                            AI analysis indicates your focus is trending <span className="text-green-400 font-bold underline">Uphill</span>. 
                            Subjects like <span className="text-blue-400 font-bold italic">{primarySubject}</span> are showing high retention.
                          </p>
                       </div>
                       <button 
                         onClick={() => {
                            setActiveTab('ai');
                            sendToCoach("Generate a deep dive analysis of my recent focus trends and subject mastery.");
                         }}
                         className="px-6 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-600/20"
                       >
                         GET FULL REPORT
                       </button>
                    </div>
                  </div>
                );
              })()}

              <AnalyticsView 
                sessionLogs={sessionLogs} 
                allSubjects={allSubjects} 
                activeTimerSeconds={mode === 'study' ? currentSessionSeconds : 0} 
                profile={profile}
                onToggleChapter={toggleChapter}
              />

              {/* Achievements Section - Distinct and Mini */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <h4 className="font-bold flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Neural Achievements
                  </h4>
                  <span className="text-[10px] font-black uppercase text-amber-500/60">
                    {profile?.unlockedAchievements?.length || 0} / {ACHIEVEMENTS.length} COLLECTED
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {ACHIEVEMENTS.map(ach => {
                    const isUnlocked = profile?.unlockedAchievements?.includes(ach.id);
                    return (
                      <motion.div 
                        key={ach.id} 
                        whileHover={isUnlocked ? { y: -5, scale: 1.05 } : {}}
                        className={cn(
                          "glass p-4 flex flex-col items-center justify-center text-center gap-2 rounded-[1.5rem] relative group border transition-all duration-500 overflow-hidden",
                          isUnlocked ? "border-amber-400/30 bg-gradient-to-br from-amber-400/10 to-transparent" : "opacity-20 border-white/5 grayscale"
                        )}
                      >
                        {isUnlocked && (
                           <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
                        )}
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg transition-transform",
                          isUnlocked ? "bg-amber-400/20 text-amber-400 group-hover:scale-110" : "bg-white/5 text-white/20"
                        )}>
                          {ach.icon}
                        </div>
                        <div className="flex flex-col gap-0.5">
                           <span className="text-[8px] font-black uppercase tracking-widest line-clamp-1">{ach.name}</span>
                           <span className="text-[6px] font-bold text-white/20 uppercase tracking-tighter line-clamp-1">{ach.description}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'bureau' && (
            <PublicSafetyBureau 
              profile={profile!} 
              onRecruit={async (charId) => {
                if (!user || !profile) return;
                
                const char = BUREAU_CHARACTERS.find(c => c.id === charId);
                if (!char) return;
                
                let met = false;
                if (charId === 'makima') met = profile.level >= 10;
                if (charId === 'denji') met = profile.pomodorosCompleted >= 50;
                if (charId === 'power') met = (profile as any).arenaWins >= 5;
                if (charId === 'aki') met = profile.streak >= 7;
                if (charId === 'himeno') met = (profile.rivalIds?.length || 0) >= 5;
                if (charId === 'kobeni') met = profile.totalFocusSeconds >= 100 * 3600;

                if (met) {
                   try {
                     await updateDoc(doc(db, 'users', user.uid), {
                       recruitedCharacters: arrayUnion(charId),
                       [`characterBonds.${charId}`]: 0
                     });
                     awardXP(1000, 'achievement', `CONTRACT SECURED: ${char.name} joins the hunt.`);
                     launchConfetti({ count: 200, colors: ['#ff0000', '#000000'] });
                     playTick();
                   } catch (e) {
                     handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
                   }
                } else {
                   setFocusToastMsg(`REQUIREMENT FAILED: ${char.requirement}`);
                   setShowFocusToast(true);
                   setTimeout(() => setShowFocusToast(false), 3000);
                }
              }}
              onSelectCharacter={async (charId) => {
                 if (!user) return;
                 try {
                   await updateDoc(doc(db, 'users', user.uid), { activeCharacterId: charId });
                   setFocusToastMsg(charId ? `PARTNER LINKED: ${charId.toUpperCase()}` : "DE-SYNCHRONIZED");
                   setShowFocusToast(true);
                   setTimeout(() => setShowFocusToast(false), 3000);
                   playTick();
                 } catch (e) {
                   handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
                 }
              }}
              onSelectMission={handleMissionAccept}
            />
          )}

          {activeTab === 'arena' && (
            <AIArena 
              tournaments={[{
                id: 'tourney-current',
                status: 'open',
                weekStart: format(new Date(), 'yyyy-MM-dd'),
                participantsTier1: [],
                participantsTier2: [],
                participantsTier3: [],
                participantsTier4: []
              }]}
              profiles={rivals.length > 0 ? rivals : [profile!]}
              currentProfile={profile!}
              onJoinTournament={(tid) => {
                 setFocusToastMsg("ENROLLED IN THE CRUCIBLE. GLORY AWAITS.");
                 setShowFocusToast(true);
                 setTimeout(() => setShowFocusToast(false), 3000);
                 awardXP(200, 'special', 'TOURNAMENT ENLISTMENT');
                 playTick();
              }}
            />
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
                  onClick={() => {
                    setEditDisplayName(profile?.displayName || user.displayName || '');
                    setEditPhotoURL(profile?.photoURL || user.photoURL || '');
                    setIsEditingProfile(true);
                  }}
                  className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-surface shadow-2xl rotate-3 relative group cursor-pointer"
                >
                  <img src={profile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="profile" className={cn("w-full h-full object-cover transition-opacity", isEditingProfile && "opacity-50")} />
                  {isEditingProfile && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                  {!isEditingProfile && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Edit className="w-8 h-8 text-white/70" />
                    </div>
                  )}
                </motion.div>
                
                {isEditingProfile ? (
                  <div className="w-full max-w-sm space-y-4">
                    <input
                      type="text"
                      value={editDisplayName}
                      onChange={e => setEditDisplayName(e.target.value)}
                      placeholder="Display Name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-md-primary"
                    />
                    <input
                      type="text"
                      value={editPhotoURL}
                      onChange={e => setEditPhotoURL(e.target.value)}
                      placeholder="Photo URL (Optional)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-md-primary"
                    />
                    <div className="flex gap-2">
                       <button onClick={async () => {
                          if(!user) return;
                          try {
                            const newName = editDisplayName || user.displayName;
                            const newPhoto = editPhotoURL || user.photoURL;
                            await updateProfile(user, {
                              displayName: newName,
                              photoURL: newPhoto
                            });
                            
                            // Also update Firestore profile
                            await updateDoc(doc(db, 'users', user.uid), {
                               displayName: newName,
                               photoURL: newPhoto
                            });
                            
                            // Force re-render of user
                            setUser({...user} as any);
                            
                            setIsEditingProfile(false);
                            setFocusToastMsg("PROFILE UPDATED");
                            setShowFocusToast(true);
                            setTimeout(() => setShowFocusToast(false), 3000);
                          } catch (e) {
                             console.error("Update failed", e);
                          }
                       }} className="flex-1 py-3 bg-md-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-105 transition-all">Save</button>
                       <button onClick={() => setIsEditingProfile(false)} className="px-6 py-3 bg-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/20 transition-all">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="relative group/edit">
                    <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
                      {profile?.displayName || user.displayName}
                      <button onClick={() => {
                        setEditDisplayName(profile?.displayName || user.displayName || '');
                        setEditPhotoURL(profile?.photoURL || user.photoURL || '');
                        setIsEditingProfile(true);
                      }} className="opacity-100 p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95">
                         <Edit className="w-5 h-5 text-md-primary" />
                      </button>
                    </h3>
                    <p className="text-on-surface-variant/60">{user.email}</p>
                  </div>
                )}
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
                      <span>{profile?.settings?.workDuration || 25} min</span>
                    </div>
                    <input 
                      type="range" min="10" max="120" step="5"
                      value={profile?.settings?.workDuration || 25}
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
                      <span>Short Break</span>
                      <span>{profile?.settings?.breakDuration || 5} min</span>
                    </div>
                    <input 
                      type="range" min="5" max="30" step="1"
                      value={profile?.settings?.breakDuration || 5}
                      onChange={async (e) => {
                         if(!user) return;
                         const val = parseInt(e.target.value);
                         setProfile(p => p ? {...p, settings: {...p.settings, breakDuration: val}} : p);
                         await updateDoc(doc(db, 'users', user.uid), { 'settings.breakDuration': val });
                      }}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-80">
                      <span>Long Break</span>
                      <span>{profile?.settings?.longBreakDuration || 15} min</span>
                    </div>
                    <input 
                      type="range" min="5" max="60" step="5"
                      value={profile?.settings?.longBreakDuration || 15}
                      onChange={async (e) => {
                         if(!user) return;
                         const val = parseInt(e.target.value);
                         setProfile(p => p ? {...p, settings: {...p.settings, longBreakDuration: val}} : p);
                         await updateDoc(doc(db, 'users', user.uid), { 'settings.longBreakDuration': val });
                      }}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>

                {/* Exam Preference */}
                <div className="glass-card p-5 space-y-4">
                   <div className="flex items-center gap-3 mb-2">
                     <Target className="w-5 h-5 text-md-primary" />
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Exam Protocol</span>
                   </div>
                   <div className="grid grid-cols-3 gap-2">
                     {['JEE', 'NEET', 'None'].map((pref) => (
                        <button 
                          key={pref}
                          onClick={async () => {
                             if(!user) return;
                             setExamPreference(pref as any);
                             await updateDoc(doc(db, 'users', user.uid), { examPreference: pref });
                             playTick();
                          }}
                          className={cn("px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all", 
                            examPreference === pref ? "bg-md-primary border-md-primary text-md-on-primary shadow-lg shadow-md-primary/20" : "bg-white/5 border-white/5 opacity-60 hover:opacity-100"
                          )}
                        >
                          {pref}
                        </button>
                     ))}
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

                <div className="space-y-4">
                  {deferredPrompt && (
                    <button 
                      onClick={handleInstallClick}
                      className="w-full flex items-center justify-between p-5 rounded-3xl bg-primary/10 text-primary font-bold active:scale-95 transition-transform border border-primary/20"
                    >
                      <span>Install App</span>
                      <Download className="w-5 h-5" />
                    </button>
                  )}

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-5 rounded-3xl bg-red-950/20 text-red-400 font-bold active:scale-95 transition-transform border border-red-900/10"
                  >
                    <span>Sign Out</span>
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>

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
              
              <div className="mt-8 pt-8 border-t border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 px-2">Meet the Architect</h4>
                <div className="px-2">
                    <DeveloperSection />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

          </motion.div>
        )}
      </AnimatePresence>

        <AtmosphereSheet 
           isOpen={isAtmosphereSheetOpen}
           onClose={() => setIsAtmosphereSheetOpen(false)}
           tracks={AMBIENT_DATA}
           activeTrack={activeAmbientTrack}
           onTrackSelect={(track) => {
              if (activeAmbientTrack?.id === track.id) {
                  stopAmbientSound(track.id);
                  setActiveAmbientTrack(null);
              } else {
                  if (activeAmbientTrack) stopAmbientSound(activeAmbientTrack.id);
                  playAmbientSound(track.url || track.id, track.id);
                  setActiveAmbientTrack(track);
              }
           }}
        />

        {/* Atmosphere Control Center (Persistent) */}
        <AnimatePresence>
          {activeAmbientTrack && !isFocusMode && view === 'dashboard' && (
           <motion.div 
             id="music-mini-player" 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 20 }}
             onClick={() => setIsAtmosphereSheetOpen(true)}
             className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] md:bottom-8 md:right-auto md:left-[300px] left-1/2 -translate-x-1/2 md:translate-x-0 w-[calc(100%-180px)] md:w-80 h-14 bg-md-surface-2/90 backdrop-blur-xl rounded-full border border-white/10 flex items-center px-3 gap-3 z-[55] shadow-[0_16px_32px_rgba(0,0,0,0.4)] cursor-pointer"
           >
             <div className="w-8 h-8 rounded-full bg-md-primary flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(234,88,12,0.5)]">
                 <Music className="w-4 h-4 text-md-on-primary" />
             </div>
             <div className="flex-1 font-bold flex flex-col justify-center min-w-0">
                <span className="text-xs text-white truncate">{activeAmbientTrack.label}</span>
                <span className="text-[9px] text-white/50 tracking-wider uppercase truncate">Playing</span>
             </div>
             <button 
               onClick={(e) => {
                   e.stopPropagation();
                   stopAmbientSound(activeAmbientTrack.id);
                   setActiveAmbientTrack(null);
               }}
               className="p-2 rounded-full hover:bg-white/10 hover:text-md-primary transition-colors shrink-0"
             >
                 <Pause className="w-4 h-4 fill-current" />
             </button>
           </motion.div>
          )}
        </AnimatePresence>

      {/* Focus Mode Toast */}
      <AnimatePresence>
        {showFocusToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
          >
            <div className="px-8 py-4 bg-black/80 backdrop-blur-2xl border-2 border-primary/50 shadow-[0_0_40px_rgba(59,130,246,0.5)] rounded-2xl flex items-center gap-4">
               <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  {isFocusMode ? <Zap className="w-5 h-5 text-primary animate-pulse" /> : <Layout className="w-5 h-5 text-primary" />}
               </div>
               <div>
                  <h4 className="text-white font-display font-black italic uppercase tracking-widest text-sm">{focusToastMsg}</h4>
                  <p className="text-white/40 text-[10px] font-mono mt-1 italic uppercase">Quantum Stream Optimization: Active</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Adaptive FAB */}
      {!isFocusMode && !isOverlayOpen && view === 'dashboard' && (
        <button 
          onClick={() => openAddTaskModal()}
          onMouseEnter={playTick}
          className="fixed bottom-[calc(110px+env(safe-area-inset-bottom))] right-6 md:bottom-8 md:right-8 bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 overflow-hidden shadow-[0_10px_30px_rgba(234,88,12,0.4)] z-40 group md:h-14 md:px-6 rounded-full h-14 w-14 md:w-auto border border-white/20"
        >
           <Plus className="w-6 h-6 min-w-[24px] group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
           <span className="hidden md:block font-mono font-black text-xs uppercase tracking-widest whitespace-nowrap">Deploy Mission</span>
        </button>
      )}

      {/* Bottom Navigation / M3 Rail */}
      {!isFocusMode && !isSimpleTimerMode && !isOverlayOpen && view === 'dashboard' && (
        <>
          {/* Desktop Nav Rail - FITTED LAYOUT */}
          <nav className="hidden md:flex fixed left-0 top-0 bottom-0 h-screen w-64 border-r border-white/5 bg-md-surface/80 backdrop-blur-2xl z-40
                          flex-col items-start justify-start gap-1 p-6">
            <div className="w-full mb-10 flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <Play className="w-5 h-5 text-orange-500 fill-orange-500" />
                </div>
                <h1 className="font-display text-2xl uppercase tracking-tighter italic font-black">Hunter</h1>
              </div>
            </div>

            <div className="w-full space-y-1">
              <div className="px-3 py-1 text-[8px] font-black uppercase text-white/20 tracking-[0.4em] mb-2">Core</div>
              <NavButton active={activeTab === 'home'} icon={Home} label="HQ Home" onClick={() => { setActiveTab('home'); setIsSimpleTimerMode(false); }} />
              <NavButton active={activeTab === 'tasks'} icon={BarChart2} label="Quest Log" onClick={() => { setActiveTab('tasks'); setIsSimpleTimerMode(false); }} />
              <NavButton active={activeTab === 'habits'} icon={Heart} label="Circuits" onClick={() => { setActiveTab('habits'); setIsSimpleTimerMode(false); }} />
              <NavButton active={activeTab === 'timer'} icon={Timer} label="Focus" onClick={() => { setActiveTab('timer'); setIsSimpleTimerMode(false); }} />
            </div>

            <div className="w-full space-y-1 mt-6">
              <div className="px-3 py-1 text-[8px] font-black uppercase text-white/20 tracking-[0.4em] mb-2">Systems</div>
              <NavButton active={activeTab === 'stats'} icon={Activity} label="Analysis" onClick={() => { setActiveTab('stats'); setIsSimpleTimerMode(false); }} />
              <NavButton active={activeTab === 'arena'} icon={Swords} label="Crucible" onClick={() => { setActiveTab('arena'); setIsSimpleTimerMode(false); }} />
              <NavButton active={isMoreOpen} icon={MoreHorizontal} label="Module" onClick={() => setIsMoreOpen(true)} />
            </div>
            
            <div className="flex-1" />
            
            <div className="w-full space-y-4">
              <NavButton active={activeTab === 'profile'} icon={UserIcon} label="System" onClick={() => { setActiveTab('profile'); setIsSimpleTimerMode(false); }} />
              <XPBar profile={profile} onPrestige={handlePrestige} />
            </div>
          </nav>

          {/* Mobile Bottom Tab */}
          <nav id="mobile-nav" className={cn(
            "md:hidden fixed bottom-0 left-0 right-0 h-[calc(72px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-black/80 backdrop-blur-3xl border-t border-white/10 flex items-center z-[100] transition-all duration-300",
            (isOverlayOpen || isAtmosphereSheetOpen || isFocusMode || isSimpleTimerMode || isInStudyRoom) ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
          )}>
            <div className="flex items-center w-full px-2 gap-1 overflow-x-auto no-scrollbar custom-scrollbar justify-start sm:justify-around">
              <NavButton active={activeTab === 'home'} icon={Home} label="Home" onClick={() => { setActiveTab('home'); setIsSimpleTimerMode(false); }} />
              <NavButton active={activeTab === 'tasks'} icon={BarChart2} label="Tasks" onClick={() => { setActiveTab('tasks'); setIsSimpleTimerMode(false); }} />
              <NavButton active={activeTab === 'habits'} icon={Heart} label="Habits" onClick={() => { setActiveTab('habits'); setIsSimpleTimerMode(false); }} />
              <NavButton active={activeTab === 'timer'} icon={Timer} label="Focus" onClick={() => { setActiveTab('timer'); setIsSimpleTimerMode(false); }} />
              <NavButton active={activeTab === 'stats'} icon={Activity} label="Analysis" onClick={() => { setActiveTab('stats'); setIsSimpleTimerMode(false); }} />
              <NavButton active={activeTab === 'rooms'} icon={Users} label="Rooms" onClick={() => { setActiveTab('rooms'); setIsSimpleTimerMode(false); }} />
              <NavButton active={isMoreOpen} icon={MoreHorizontal} label="More" onClick={() => setIsMoreOpen(true)} />
            </div>
          </nav>
        </>
      )}

      {/* Focus Mode floating Close removed as redundant */}
      
      <AnimatePresence>
        {isJournalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black overflow-y-auto"
          >
            <div className="absolute top-8 right-8 z-[160]">
               <button onClick={() => setIsJournalOpen(false)} className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all">
                  <X className="w-8 h-8" />
               </button>
            </div>
            <ReflectionsJournal 
              entries={journalEntries}
              onSaveEntry={handleSaveJournalEntry}
              profile={profile!}
              dayCount={dayCount}
              habits={habits}
              todayStats={todayJournalStats}
            />
          </motion.div>
        )}

        {isRadioOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <div className="absolute top-8 right-8 z-[160]">
               <button onClick={() => setIsRadioOpen(false)} className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all">
                  <X className="w-8 h-8" />
               </button>
            </div>
            <div className="w-full max-w-5xl">
               <QuantumRadio />
            </div>
          </motion.div>
        )}

        {isSeasonPassOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[150] bg-black overflow-y-auto"
          >
            <div className="absolute top-8 right-8 z-[160]">
               <button onClick={() => setIsSeasonPassOpen(false)} className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all">
                  <X className="w-8 h-8" />
               </button>
            </div>
            {profile?.seasonPass && (
              <SeasonPassUI 
                seasonPass={profile.seasonPass}
                profile={profile}
                onClaimReward={(tier) => {
                  const newUnlocked = [...(profile.seasonPass!.unlockedTiers), tier];
                  updateDoc(doc(db, 'users', user!.uid), { 
                    'seasonPass.unlockedTiers': newUnlocked 
                  });
                }}
              />
            )}
          </motion.div>
        )}

        {isMoreOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] backdrop-blur-3xl bg-black/80 flex flex-col items-center justify-center p-8"
          >
             <button onClick={() => setIsMoreOpen(false)} className="absolute top-8 right-8 p-4 text-white/40 hover:text-white transition-all hover:scale-110 active:scale-95">
                <X className="w-12 h-12" />
             </button>
             
             <div className="flex flex-col gap-10 max-w-5xl w-full overflow-y-auto pt-20 px-4 pb-12 scrollbar-hide">
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4 px-2">Core Directives</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MoreCard icon={Home} label="Home" sub="Command Center" onClick={() => { setIsMoreOpen(false); setIsSimpleTimerMode(false); setActiveTab('home'); }} />
                    <MoreCard icon={BarChart2} label="Tasks" sub="Quest Log" onClick={() => { setIsMoreOpen(false); setIsSimpleTimerMode(false); setActiveTab('tasks'); }} />
                    <MoreCard icon={Timer} label="Timer" sub="Focus Protocol" onClick={() => { setIsMoreOpen(false); setIsSimpleTimerMode(false); setActiveTab('timer'); }} />
                    <MoreCard icon={Shield} label="Bureau" sub="Strategic Hub" onClick={() => { setIsMoreOpen(false); setIsSimpleTimerMode(false); setActiveTab('bureau'); }} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4 px-2">Knowledge Base</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MoreCard icon={FileText} label="Notes" sub="Smart Filing" onClick={() => { setIsMoreOpen(false); setIsSimpleTimerMode(false); setActiveTab('notes'); }} />
                    <MoreCard icon={Network} label="Brain" sub="Knowledge Graph" onClick={() => { setIsMoreOpen(false); setIsSimpleTimerMode(false); setActiveTab('graph'); }} />
                    <MoreCard icon={Beaker} label="Persona" sub="Evolution Lab" onClick={() => { setIsMoreOpen(false); setIsSimpleTimerMode(false); setActiveTab('lab'); }} />
                    <MoreCard icon={Cpu} label="AI Support" sub="Synthetic Intel" onClick={() => { setIsMoreOpen(false); setIsSimpleTimerMode(false); setActiveTab('ai'); }} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4 px-2">Deep Work</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MoreCard icon={FlaskConical} label="Alchemy" sub="Daily Rituals" onClick={() => { setIsMoreOpen(false); setIsSimpleTimerMode(false); setActiveTab('alchemy'); }} />
                    <MoreCard icon={Heart} label="Habits" sub="Circuit Tuning" onClick={() => { setIsMoreOpen(false); setIsSimpleTimerMode(false); setActiveTab('habits'); }} />
                    <MoreCard icon={History} label="Legacy" sub="Eternal Record" onClick={() => { setIsMoreOpen(false); setIsSimpleTimerMode(false); setActiveTab('legacy'); }} />
                    <MoreCard icon={Fingerprint} label="Neural" sub="System Link" onClick={() => { setIsMoreOpen(false); setIsSimpleTimerMode(false); setActiveTab('neural'); }} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4 px-2">Network</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MoreCard icon={RadioIcon} label="Stream" sub="Live Sync" onClick={() => { setIsMoreOpen(false); setIsSimpleTimerMode(false); setActiveTab('stream'); }} />
                    <MoreCard icon={Users} label="Rooms" sub="Collective Focus" onClick={() => { setIsMoreOpen(false); setIsSimpleTimerMode(false); setActiveTab('rooms'); }} />
                    <MoreCard icon={Globe} label="Events" sub="Global Surge" onClick={() => { setIsMoreOpen(false); setIsSimpleTimerMode(false); setActiveTab('events'); }} />
                    <MoreCard icon={ShoppingBag} label="Store" sub="Neural Gear" onClick={() => { setIsMoreOpen(false); setIsSimpleTimerMode(false); setActiveTab('store'); }} />
                  </div>
                </div>

                <div className="space-y-4 pb-12">
                   <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4 px-2">Utilities</div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <MoreCard icon={BookOpen} label="Journal" sub="Reflection Logs" onClick={() => { setIsMoreOpen(false); setIsJournalOpen(true); }} />
                      <MoreCard icon={RadioIcon} label="Radio" sub="Quantum Lo-fi" onClick={() => { setIsMoreOpen(false); setIsRadioOpen(true); }} />
                      <MoreCard icon={Trophy} label="Pass" sub="Season Rewards" onClick={() => { setIsMoreOpen(false); setIsSeasonPassOpen(true); }} />
                      <MoreCard icon={Settings} label="Settings" sub="System Config" onClick={() => { setIsMoreOpen(false); setActiveTab('profile'); }} />
                   </div>
                </div>
             </div>
             
             <div className="mt-12 text-center space-y-2">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Operational Modules</div>
                <div className="text-[8px] font-mono text-white/10">v1.2.0-QUANTUM-FOCUS</div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFormulaVaultOpen && (
          <FormulaVault onClose={() => setIsFormulaVaultOpen(false)} />
        )}
        {isNightRitualOpen && (
          <NightRitual 
            profile={profile} 
            sessionLogs={sessionLogs} 
            tasks={tasks} 
            habits={habits} 
            onComplete={(reward) => {
              awardXP(reward, 'study', 'NIGHT RITUAL COMPLETE');
              setIsNightRitualOpen(false);
            }} 
          />
        )}
      </AnimatePresence>

      {view === 'dashboard' && !isFocusMode && !isSimpleTimerMode && (
        <button
          onClick={() => setIsNightRitualOpen(true)}
          className="fixed bottom-24 left-4 md:bottom-32 md:left-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 p-2.5 rounded-full z-40 hover:bg-purple-500/20 transition-all backdrop-blur-md shadow-lg shadow-purple-900/20 scale-90 md:scale-100"
          title="Night Ritual"
        >
          <Moon className="w-4 h-4 md:w-5 md:h-5" />
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
            className="fixed top-0 left-0 right-0 w-full h-[100dvh] z-[70] glass-card rounded-none flex flex-col bg-background/95 border-none shadow-none"
          >
            <header className="p-6 flex items-center justify-between border-b border-outline/20 pt-[calc(1.5rem+env(safe-area-inset-top))]">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-orange-500/20 rounded-xl">
                    <ShieldAlert className="w-5 h-5 text-orange-400" />
                 </div>
                 <div>
                    <h3 className="font-black text-white italic">PUBLIC SAFETY HQ</h3>
                    <p className="text-[10px] uppercase font-black text-orange-400 tracking-widest">Devil Hunter Registry Active</p>
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
                        sendToCoach("Analyze my current focus patterns, mission completion rate, and extermination targets to suggest 3 personalized directives.");
                    }}
                    className="px-4 py-2 bg-orange-500/10 text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
                  >
                     HQ MISSION ASSESSMENT
                  </button>
                  <button 
                    onClick={() => {
                        sendToCoach("How can I survive the pressure of finals and keep my discipline levels high?");
                    }}
                    className="px-4 py-2 bg-red-500/10 text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500/20 transition-colors"
                  >
                     COMBAT SYSTEM OPTIMIZATION
                  </button>
                  <button 
                    onClick={async () => {
                        setIsAiTyping(true);
                        setCoachMessages(prev => [...prev, { role: 'user', text: "Requesting new survival protocols (habits)." }]);
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
                        setCoachMessages(prev => [...prev, { role: 'ai', text: "Based on your combat record, I've drafted these survival protocols:", habitSuggestions: suggestions }]);
                        setIsAiTyping(false);
                    }}
                    className="px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors"
                  >
                     REQUEST PROTOCOLS
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
                       {m.directives && m.directives.length > 0 && (
                         <div className="mt-4 flex flex-col gap-3">
                           {m.directives.map((directive, dIndex) => (
                             <div key={dIndex} className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-2xl flex items-center gap-3">
                               <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                               <span className="text-xs font-bold text-orange-200 tracking-tight pt-0.5">{directive}</span>
                             </div>
                           ))}
                         </div>
                       )}
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
                                    onClick={() => {
                                      addHabit(hs.title, hs.icon || 'Zap');
                                      setInstalledHabitIds(prev => [...prev, hs.title]);
                                    }}
                                    disabled={installedHabitIds.includes(hs.title)}
                                    className={cn(
                                      "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap active:scale-95 transition-all text-pink-400 bg-pink-500/10 hover:bg-pink-500/20",
                                      installedHabitIds.includes(hs.title) && "bg-green-500/20 text-green-400"
                                    )}
                                  >
                                    {installedHabitIds.includes(hs.title) ? "Active" : "Init"}
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

            <div className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] border-t border-white/10 bg-md-surface-2 shrink-0">
              <ChatInput onSend={sendToCoach} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AddTaskModal 
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAdd={addTask}
        defaultCategory={addTaskCategory}
        defaultIsRevision={false}
        subjects={allSubjects}
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
        {isContractModalOpen && (
          <SignContractModal 
            onSign={handleSignContract}
            onClose={() => setIsContractModalOpen(false)}
            profile={profile}
            tasks={tasks}
          />
        )}
        {showMirror && profile && (
          <QuantumMirror 
            profile={profile}
            sessions={sessionLogs}
            onClose={() => setShowMirror(false)}
          />
        )}
        {isArenaOpen && (
          <FlashcardArena 
            decks={flashcardDecks}
            onClose={() => setIsArenaOpen(false)}
            onSessionComplete={handleArenaComplete}
          />
        )}
        {showBrain && profile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-black overflow-y-auto"
          >
             <header className="sticky top-0 p-8 flex justify-end z-10">
                <button onClick={() => setShowBrain(false)} className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all">
                   <X className="w-8 h-8 text-white" />
                </button>
             </header>
             <SubjectBrain 
               profile={profile}
               onUpdateChapter={handleUpdateChapter}
             />
          </motion.div>
        )}
        {showMissions && (
          <MissionImpossibleMode 
            onAccept={handleMissionAccept}
            onClose={() => setShowMissions(false)}
          />
        )}
        {isRunning && (mode === 'shortBreak' || mode === 'longBreak') && (
          <BreakRitual onComplete={() => setIsRunning(false)} />
        )}
        {isFlowState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-2xl flex items-center justify-center pointer-events-none"
          >
             <div className="text-center space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], filter: ["blur(0px)", "blur(4px)", "blur(0px)"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-8xl font-display font-black text-white italic uppercase tracking-tighter"
                >
                   Flow State
                </motion.div>
                <p className="text-md-primary font-mono text-xs uppercase tracking-[0.5em] font-black">Neural Interface Locked</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
        {showDreamPrompt && profile?.dream && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/80">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="max-w-md w-full bg-md-surface-2 border border-md-primary/30 p-10 rounded-[3rem] text-center space-y-8 shadow-[0_0_100px_rgba(234,88,12,0.2)]"
             >
                <div className="flex justify-center">
                   <div className="w-16 h-16 rounded-full bg-md-primary/20 flex items-center justify-center border border-md-primary/40 animate-pulse">
                      <Target className="w-8 h-8 text-md-primary" />
                   </div>
                </div>
                <div className="space-y-4">
                   <h2 className="text-sm font-black uppercase tracking-[0.5em] text-md-primary opacity-60">Dream Board</h2>
                   <p className="text-2xl font-serif italic text-white leading-relaxed">
                     "{profile.dream.description}"
                   </p>
                </div>
                <div className="pt-4 space-y-4">
                   <button 
                     onClick={() => {
                       setShowDreamPrompt(false);
                       setHasSeenDreamPromptToday(true);
                       setIsRunning(true);
                       playWhoosh();
                     }}
                     className="w-full py-4 bg-md-primary text-md-on-primary font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(234,88,12,0.5)]"
                   >
                      I AM READY
                   </button>
                   <button 
                     onClick={() => setShowDreamPrompt(false)}
                     className="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
                   >
                     Maybe Later
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      {showDevilHunt && (
        <DevilHunt onBanish={(xp) => {
          awardXP(xp, 'special', 'DEVIL EXTERMINATED');
          setShowDevilHunt(false);
          launchConfetti({ count: 150, colors: ['#dc2626', '#000000'] });
          playBell();
        }} />
      )}

      {showNameModal && user && (
        <NameRequestModal 
          user={user}
          onClose={() => setShowNameModal(false)}
          onSave={() => setShowNameModal(false)}
        />
      )}

      {!isFocusMode && (
        <div 
          onClick={(e) => {
            window.dispatchEvent(new CustomEvent('app-touch-spark', { detail: { x: e.clientX, y: e.clientY } }));
          }}
        >
          <PochitaPet 
            timerRunning={isRunning} 
            mode={mode} 
            celebrate={sessionFinished} 
            xp={profile?.xp || 0} 
            lastEvent={pochitaEvent} 
            activePetId={profile?.activePetId}
          />
        </div>
      )}
    </div>
  );
}
