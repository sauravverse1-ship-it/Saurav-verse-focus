import { User } from 'firebase/auth';

export interface AmbientTrack {
  id: string;
  label: string;
  category: 'nature' | 'focus' | 'atmosphere' | 'lofi';
  icon: string;
  url?: string;
}

export interface SessionLog {
  id: string;
  duration: number; // seconds
  timestamp: number;
  type: 'focus' | 'break';
  missionTitle?: string;
  subject?: string | null;
  completed: boolean;
}

export interface FocusSession {
  id: string;
  duration: number;
  timestamp: number;
  type: 'focus' | 'break';
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: number;
  dayCount: number;
  stats: {
    focusTime: number;
    sessions: number;
    habitsDone: number;
    xpEarned: number;
    avgFocusScore: number;
  };
  content: {
    learned: string;
    slowdowns: string;
    intention: string;
  };
  mood: '😤' | '🔥' | '😴' | '😊' | '💪';
}

export interface SeasonMission {
  id: string;
  type?: string;
  text: string;
  tierReward: number;
  completed: boolean;
  requirement: number;
  currentValue: number;
}

export interface SeasonPass {
  currentTier: number;
  currentXP: number;
  seasonEndDate: number;
  unlockedTiers: number[];
  dailyMissions: SeasonMission[];
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  email?: string;
  xp: number;
  level: number;
  streak: number;
  rank: string;
  allTimeXP: number;
  unlockedAchievements: string[];
  dailyChallenges: {
    id: string;
    type: string;
    title: string;
    description: string;
    xp: number;
    progress: number;
    goal: number;
    completed: boolean;
    date: string;
  }[];
  streakShields: number;
  lastActiveDate: string;
  totalFocusSeconds: number;
  dailyFocusSeconds: number;
  dailySessions: number;
  pomodorosCompleted: number;
  health: {
    water: number;
    protein: number;
    sleep: number;
  };
  skills: {
    focus: number;
    discipline: number;
    consistency: number;
  };
  jee: {
    targetAIR: number;
    weakChapters: string[];
    strongChapters: string[];
    completedChapters?: string[];
  };
  examPreference?: 'JEE' | 'NEET' | 'None';
  examDate?: string;
  hasCompletedOnboarding?: boolean;
  journalEntries?: string[]; // IDs
  seasonPass?: SeasonPass;
  inventory?: {
    ownedItemIds: string[];
    powerUps: {
      type: string;
      quantity: number;
      expiresAt?: number;
    }[];
  };
  eventContributions?: Record<string, number>; // eventId -> contribution (e.g. damage, hours)
  neuralLinkEnabled?: boolean;
  settings: {
    workDuration: number;
    breakDuration: number;
    longBreakDuration: number;
    ambientSound: 'rain' | 'lofi' | 'white' | 'none';
    notificationSound: 'default' | 'bell' | 'none';
    autoStartNextSession: boolean;
    currentTheme?: string;
    currentDimension?: string;
    language?: string;
    use24Hr?: boolean;
    startWeekSunday?: boolean;
    isDopamineDetox?: boolean;
    radioStation?: string;
  };
  dream?: Dream;
  persona?: Persona;
  rivalIds?: string[];
  unlockedDimensions?: string[];
  recruitedCharacters?: string[];
  activeCharacterId?: string;
  activePetId?: string;
  characterBonds?: Record<string, number>; // characterId -> experience/bond points
  createdAt?: number;
  prestigeLevel?: number;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  buff: string;
  requirement: string;
  image: string;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'note' | 'task' | 'formula' | 'session';
  subject: string;
  health: number; // 0-100
  lastActivity: number;
  connections: string[]; // linked node IDs
}

export type DimensionType = 'void' | 'grid' | 'cosmos' | 'chainsaw' | 'legend';

export interface BroadcastSession {
  id: string;
  userId: string;
  displayName: string;
  photoURL: string;
  subject: string;
  personaName?: string;
  durationMins: number;
  timeLeftSeconds: number;
  startTime: number;
  viewerCount: number;
  isLive: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  icon: string;
  category: 'focus' | 'streak' | 'habit' | 'special';
}

export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  urgent?: boolean;
  sessions: number;
  expectedSessions: number;
  category: 'study' | 'personal' | 'health';
  isRevision?: boolean;
  subjects?: string[];
  priority: 'high' | 'medium' | 'low';
  tags?: string[];
  deadline?: string;
  createdAt: number;
  completedAt?: number;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  icon: string;
  streak: number;
  streakBest: number;
  completedDates: string[]; // ['2026-04-24', ...]
  createdAt: number;
  reminders?: string[]; // times like ['07:00 AM']
  selectedDays?: number[]; // [0,1,2,3,4,5,6]
}

export interface DevilContract {
  id: string;
  userId: string;
  title: string;
  type: 'daily_grind' | 'habit_chain' | 'marathon' | 'exam_prep';
  goal: number;
  description: string;
  progress: number;
  startDate: number;
  durationDays: number;
  status: 'active' | 'completed' | 'broken';
  rewardXP: number;
  penaltyXP: number;
  signedAt: number;
  completedAt?: number;
  brokenAt?: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  cards: Flashcard[];
  masteryLevel: number;
  lastReviewed?: number;
}

export interface SocialPost {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  type: 'session' | 'achievement' | 'contract' | 'rank_up' | 'snapshot';
  timestamp: number;
  imageUrl?: string;
  stats?: {
    minutes?: number;
    title?: string;
    xp?: number;
  };
  reactions: string[]; // List of user IDs
}

export interface Dream {
  id: string;
  userId: string;
  text: string;
  description?: string;
  imageUrl?: string;
  targetDate: string;
  mantra: string;
  createdAt: number;
}

export interface Persona {
  id: string;
  userId: string;
  name: string;
  traits: string[]; // max 3
  visualStyle: 'neon' | 'violet' | 'gold' | 'crimson' | 'shadow';
  auraColor: string;
  signaturePhrase: string;
  photoURL?: string;
  totalHours: number;
  flawlessSessions: number;
  level: number;
  experience: number;
}

export interface ResourceInventory {
  crystals: number; // Focus Crystals - per minute
  shards: number;   // Energy Shards - per habit
  tokens: number;   // Flame Tokens - per streak day
  bones: number;    // Devil Bones - per contract
  dust: number;     // Star Dust - per achievement
}

export interface CraftedItem {
  id: string;
  name: string;
  type: 'focus_shield' | 'xp_amplifier' | 'dimension_key' | 'evolution_potion' | 'rival_sabotage' | 'legend_trial';
  quantity: number;
  consumed?: boolean;
  expiresAt?: number;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  inputs: Partial<ResourceInventory>;
  outputType: CraftedItem['type'];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LegacyMilestone {
  id: string;
  date: number;
  title: string;
  description: string;
  statValue?: string;
  type: 'session' | 'streak' | 'rank' | 'achievement' | 'milestone';
}

export interface FutureLetter {
  id: string;
  content: string;
  createdAt: number;
  openDate: number;
  isOpened: boolean;
}

export interface UserLegacy {
  milestones: LegacyMilestone[];
  totalFocusHours: number;
  totalSessions: number;
  totalTasksCompleted: number;
  totalHabitsCompleted: number;
  totalXpEarned: number;
  longestStreak: number;
  bestFocusScore: number;
  dimensionsUnlocked: number;
  futureLetters: FutureLetter[];
}

export interface SmartNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'quick' | 'study' | 'insight' | 'question' | 'connection' | 'formula';
  subject?: string;
  chapter?: string;
  topic?: string;
  tags: string[];
  sessionId?: string;
  linkedNoteIds: string[];
  revisionSchedule?: number[]; // Timestamps for Spaced Repetition
  createdAt: number;
  updatedAt: number;
}

export interface FocusExperiment {
  id: string;
  userId: string;
  title: string;
  hypothesis: string;
  variable: 'sound' | 'time' | 'duration' | 'ritual';
  conditionA: string; // e.g. "Music"
  conditionB: string; // e.g. "Silence"
  durationDays: number;
  startDate: number;
  status: 'active' | 'completed' | 'archived';
  data: {
    condition: 'A' | 'B';
    sessionScore: number;
    timestamp: number;
  }[];
  result?: string;
}

export interface ArenaTournament {
  id: string;
  weekStart: string; // ISO date
  status: 'open' | 'bracket' | 'results';
  participantsTier1: string[]; // UIDs for Round 1
  participantsTier2: string[]; // Round 2
  participantsTier3: string[]; // Round 3
  participantsTier4: string[]; // Final
  winnerId?: string;
}

export interface SectorEvent {
  id: string;
  type: 'marathon' | 'perfect_day' | 'boss_raid';
  title: string;
  description: string;
  goal: number;
  currentValue: number;
  startDate: number;
  endDate: number;
  rewards: {
    milestone: number;
    rewardXP: number;
    rewardItem?: string;
  }[];
  hp?: number; // for boss raids
  maxHp?: number;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  priceXP: number;
  category: 'cosmetic' | 'powerup' | 'special' | 'legend';
  type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image: string;
  limited?: boolean;
}
