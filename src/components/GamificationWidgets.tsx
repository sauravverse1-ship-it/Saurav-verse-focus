import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ACHIEVEMENTS, RANKS, getRank, getNextRank, getXPProgress } from '../lib/gamification';
import { Achievement, UserProfile } from '../types';
import { Trophy, Flame, Target, Star, ChevronRight, X, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

// --- Streak Widget ---
export const StreakWidget = ({ profile, mobile }: { profile: UserProfile | null, mobile?: boolean }) => {
  if (!profile || profile.streak === 0) return null;

  const streakColor = 
    profile.streak >= 100 ? 'var(--rank-legend)' :
    profile.streak >= 30 ? 'var(--rank-master)' :
    profile.streak >= 14 ? 'var(--rank-elite)' :
    profile.streak >= 7 ? 'var(--rank-disciplined)' : 
    'inherit';

  const nextMilestone = profile.streak < 7 ? 7 : profile.streak < 14 ? 14 : profile.streak < 30 ? 30 : profile.streak < 100 ? 100 : 365;
  const progress = (profile.streak / nextMilestone) * 100;

  return (
    <div className="relative">
      <AnimatePresence>
        {profile.streak >= 30 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-[-20px] bg-amber-500/20 blur-[40px] rounded-full z-0"
          />
        )}
        {profile.streak >= 100 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-[-40px] bg-red-600/30 blur-[60px] rounded-full z-0"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "glass backdrop-blur-3xl rounded-full flex items-center gap-2 border border-white/10 group cursor-default transition-all shadow-xl relative overflow-hidden z-10",
          mobile ? "px-3 py-1.5 h-10" : "px-4 py-3"
        )}
        style={{ borderColor: streakColor !== 'inherit' && streakColor !== 'var(--rank-legend)' ? streakColor : 'rgba(255,255,255,0.1)' }}
      >
      <div className="relative flex items-center justify-center w-8 h-8">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/10" />
          <motion.circle 
            cx="16" cy="16" r="14" 
            fill="none" stroke={streakColor === 'inherit' ? 'var(--md-primary)' : streakColor} 
            strokeWidth="2" 
            strokeDasharray={88}
            initial={{ strokeDashoffset: 88 }}
            animate={{ strokeDashoffset: 88 - (88 * progress / 100) }}
            className="transition-all duration-1000"
          />
        </svg>
        <motion.span 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-lg relative z-10"
        >
          🔥
        </motion.span>
      </div>
      <div className="flex flex-col">
        <span className="font-mono font-black text-xs leading-none flex items-center gap-1">
          {profile.streak} <span className="text-[8px] opacity-60 uppercase tracking-tighter">Day Streak</span>
        </span>
        <span className="text-[8px] opacity-40 font-mono">Next: {nextMilestone}d</span>
      </div>
      {profile.streak >= 7 && (
        <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-r from-transparent to-white/5 pointer-events-none" />
      )}
      </motion.div>
    </div>
  );
};

// --- Daily Challenges Widget ---
export const ChallengesWidget = ({ profile }: { profile: UserProfile | null }) => {
  if (!profile || !profile.dailyChallenges) return null;

  const allCompleted = profile.dailyChallenges.every(c => c.completed);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-display text-xl uppercase tracking-wider flex items-center gap-2">
          <Target className="w-5 h-5 text-md-primary" />
          Daily Challenges
        </h3>
        {allCompleted && (
          <span className="bg-md-primary/10 text-md-primary text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
            TRIFECTA COMPLETE!
          </span>
        )}
      </div>

      <div className="grid gap-3">
        {profile.dailyChallenges.map((challenge) => (
          <div 
            key={challenge.id}
            className={cn(
              "p-4 rounded-2xl glass border-l-4 transition-all relative overflow-hidden",
              challenge.completed ? "border-md-primary bg-md-primary/5" : "border-white/10"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-xl",
                  challenge.completed ? "" : "grayscale"
                )}>
                  {challenge.type === 'focus' ? '🎯' : challenge.type === 'habits' ? '🧱' : '⚡'}
                </span>
                <div>
                  <h4 className={cn("font-bold text-sm", challenge.completed && "line-through opacity-50")}>
                    {challenge.title}
                  </h4>
                  <p className="text-[10px] opacity-60">{challenge.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono font-black text-md-primary">+{challenge.xp} XP</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            {!challenge.completed && (
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(challenge.progress / (challenge as any).goal) * 100}%` }}
                  className="h-full bg-md-primary"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Achievements Gallery Modal ---
export const AchievementsModal = ({ isOpen, onClose, profile }: { isOpen: boolean, onClose: () => void, profile: UserProfile | null }) => {
  if (!isOpen || !profile) return null;

  const unlockedCount = profile.unlockedAchievements?.length || 0;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <motion.div
      initial={{ clipPath: "circle(0% at center)" }}
      animate={{ clipPath: "circle(150% at center)" }}
      exit={{ clipPath: "circle(0% at center)" }}
      className="fixed inset-0 z-[1000] bg-zinc-950 flex flex-col overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(0,255,224,0.15),transparent)] pointer-events-none" />
      <div className="cinematic-grid opacity-20" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/5">
        <div>
          <h2 className="font-display text-4xl uppercase tracking-tighter text-white">Your Achievements</h2>
          <p className="text-sm opacity-60 font-mono">
            {unlockedCount} / {totalCount} UNLOCKED · {(unlockedCount / totalCount * 100).toFixed(0)}% COMPLETE
          </p>
        </div>
        <button onClick={onClose} className="w-12 h-12 rounded-full glass hover:bg-white/10 flex items-center justify-center transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Scrollable Grid */}
      <div className="flex-1 overflow-y-auto p-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {ACHIEVEMENTS.map((achievement, idx) => {
            const isUnlocked = profile.unlockedAchievements?.includes(achievement.id);
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={cn(
                  "p-5 rounded-[2rem] border transition-all relative group",
                  isUnlocked 
                    ? "glass border-md-primary/30 bg-md-primary/5 cursor-default" 
                    : "bg-white/[0.02] border-white/5 grayscale"
                )}
              >
                {!isUnlocked && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm rounded-[2rem]">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Keep Pushing...</span>
                  </div>
                )}
                
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-4 transition-transform group-hover:scale-110",
                  isUnlocked ? "bg-md-primary/20 shadow-[0_0_20px_rgba(0,255,224,0.2)]" : "bg-white/5"
                )}>
                  {achievement.icon}
                </div>
                
                <h4 className={cn("font-display text-lg tracking-tight mb-1", !isUnlocked && "blur-[2px]")}>
                  {achievement.name}
                </h4>
                <p className={cn("text-[11px] opacity-60 leading-tight mb-3", !isUnlocked && "blur-[4px]")}>
                  {achievement.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-mono font-black text-md-primary">
                    {isUnlocked ? `+${achievement.xpReward} XP` : '??? XP'}
                  </span>
                  {isUnlocked && <Star className="w-4 h-4 text-md-primary animate-pulse" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
