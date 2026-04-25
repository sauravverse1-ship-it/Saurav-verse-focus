import { Achievement } from '../types';

export const RANKS = [
  { id: 'novice', name: 'Novice', xp: 0, color: '#6b6b85', icon: '○', quote: 'A journey of a thousand miles begins with a single focus session.' },
  { id: 'apprentice', name: 'Apprentice', xp: 500, color: '#a0a0c0', icon: '◇', quote: 'You are beginning to see the patterns in your discipline.' },
  { id: 'focused', name: 'Focused', xp: 1500, color: '#00c8b0', icon: '◈', quote: 'The signal is getting stronger. Noise is fading.' },
  { id: 'disciplined', name: 'Disciplined', xp: 3500, color: '#00ffe0', icon: '◉', quote: 'Discipline is the bridge between goals and accomplishment.' },
  { id: 'elite', name: 'Elite', xp: 7500, color: '#7b5fe8', icon: '❋', quote: 'You are now among the top 5% of focus practitioners.' },
  { id: 'master', name: 'Master', xp: 15000, color: '#d4a843', icon: '✦', quote: 'The undisciplined fear your calendar.' },
  { id: 'grandmaster', name: 'Grandmaster', xp: 30000, color: '#ff9500', icon: '❂', quote: 'You have mastered the art of deep work.' },
  { id: 'champion', name: 'Champion', xp: 60000, color: '#ff4060', icon: '⚜', quote: 'Every session is a testament to your iron will.' },
  { id: 'sovereign', name: 'Sovereign', xp: 120000, color: '#c084fc', icon: '♛', quote: 'You rule over your own attention.' },
  { id: 'legend', name: 'LEGEND', xp: 250000, color: 'animated', icon: '★', quote: 'You have transcended. You are built different.' },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_blood', name: 'First Drop', description: 'Complete your first focus session', xpReward: 100, icon: '🎯', category: 'focus' },
  { id: 'deep_diver', name: 'Deep Diver', description: 'Complete 10 sessions', xpReward: 300, icon: '🌊', category: 'focus' },
  { id: 'centurion', name: 'Centurion', description: 'Complete 100 sessions', xpReward: 2000, icon: '💯', category: 'focus' },
  { id: 'week_warrior', name: 'Week Warrior', description: '7-day focus streak', xpReward: 500, icon: '🛡️', category: 'streak' },
  { id: 'iron_will', name: 'Iron Will', description: '30-day streak', xpReward: 2000, icon: '⛓️', category: 'streak' },
  { id: 'legend_run', name: 'Legend Run', description: '100-day streak', xpReward: 10000, icon: '🐉', category: 'streak' },
  { id: 'habit_formed', name: 'Habit Formed', description: 'Mark a habit 21 days in a row', xpReward: 1000, icon: '🧱', category: 'habit' },
  { id: 'perfectionist', name: 'Perfectionist', description: '5 perfect days', xpReward: 800, icon: '✨', category: 'special' },
  { id: 'night_owl', name: 'Night Owl', description: '10 sessions after 10PM', xpReward: 300, icon: '🦉', category: 'focus' },
  { id: 'early_bird', name: 'Early Bird', description: '10 sessions before 8AM', xpReward: 300, icon: '🌅', category: 'focus' },
  { id: 'full_cycle', name: 'Full Cycle', description: 'Complete 4 pomodoro cycle', xpReward: 200, icon: '♻️', category: 'focus' },
  { id: 'speed_run', name: 'Speed Run', description: '3 sessions in one day', xpReward: 400, icon: '🏃', category: 'focus' },
  { id: 'marathon', name: 'Marathon', description: '8 hours focus in one day', xpReward: 1500, icon: '🏅', category: 'focus' },
  { id: 'habit_collector', name: 'Habit Collector', description: 'Add 5 habits', xpReward: 300, icon: '📋', category: 'habit' },
  { id: 'capture_king', name: 'Capture King', description: '50 quick captures', xpReward: 200, icon: '👑', category: 'special' },
  { id: 'silent_monk', name: 'Silent Monk', description: 'Complete session without pause', xpReward: 75, icon: '🧘', category: 'special' },
  { id: 'the_grind', name: 'The Grind', description: '7 consecutive perfect days', xpReward: 1500, icon: '⚓', category: 'special' },
  { id: 'rank_master', name: 'Rank Master', description: 'Reach Master rank', xpReward: 500, icon: '🥋', category: 'special' },
  { id: 'omnifocused', name: 'Omnifocused', description: 'Reach Grandmaster rank', xpReward: 1000, icon: '🧿', category: 'special' },
  { id: 'ascension', name: 'Ascension', description: 'Reach LEGEND rank', xpReward: 5000, icon: '👼', category: 'special' },
];

export function getRank(totalXP: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalXP >= RANKS[i].xp) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

export function getNextRank(totalXP: number) {
  const currentRankIndex = RANKS.findIndex(r => r.name === getRank(totalXP).name);
  if (currentRankIndex < RANKS.length - 1) {
    return RANKS[currentRankIndex + 1];
  }
  return null;
}

export function getXPForLevel(totalXP: number) {
  const currentRank = getRank(totalXP);
  const nextRank = getNextRank(totalXP);
  if (!nextRank) return 100;
  return nextRank.xp - currentRank.xp;
}

export function getXPProgress(totalXP: number) {
  const currentRank = getRank(totalXP);
  const nextRank = getNextRank(totalXP);
  
  if (!nextRank) {
    return {
      currentXP: totalXP - currentRank.xp,
      nextLevelXP: 0,
      progress: 100
    };
  }

  const currentXPInRank = totalXP - currentRank.xp;
  const nextLevelXP = nextRank.xp - currentRank.xp;
  const progress = (currentXPInRank / nextLevelXP) * 100;

  return {
    currentXP: currentXPInRank,
    nextLevelXP,
    progress
  };
}

export const DAILY_CHALLENGE_POOL = [
  { id: 'focus_3', title: 'Focus Sprint', description: 'Complete 3 focus sessions today', goal: 3, xp: 200, type: 'focus' },
  { id: 'flawless', title: 'Pure Focus', description: 'Complete a flawless session (no pause)', goal: 1, xp: 150, type: 'focus' },
  { id: 'focus_2h', title: 'Deep Diver', description: 'Hit 2 hours of focus today', goal: 120, xp: 300, type: 'focus_time' },
  { id: 'full_cycle', title: 'Engine Cycle', description: 'Complete a full 4-session cycle', goal: 1, xp: 250, type: 'cycle' },
  { id: 'early_bird', title: 'Dawn Patrol', description: 'Start your first session before 9AM', goal: 1, xp: 180, type: 'early_bird' },
  { id: 'habits_all', title: 'Perfect Stack', description: 'Mark all your habits today', goal: 1, xp: 200, type: 'habits' },
  { id: 'tasks_5', title: 'Task Slayer', description: 'Complete 5 tasks', goal: 5, xp: 150, type: 'tasks' },
];

export function getDailyChallenges(date: string) {
  // Simple seeded random based on date string
  const seed = date.split('-').join('');
  const seededRandom = (s: string) => {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = ((hash << 5) - hash) + s.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };
  
  const random = seededRandom(seed);
  const shuffled = [...DAILY_CHALLENGE_POOL].sort((a, b) => {
    const s1 = seededRandom(seed + a.id);
    const s2 = seededRandom(seed + b.id);
    return s1 - s2;
  });
  
  return shuffled.slice(0, 3).map(c => ({
    ...c,
    progress: 0,
    completed: false,
    date
  }));
}
