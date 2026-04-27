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

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
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
  };
  examPreference?: 'JEE' | 'NEET' | 'None';
  examDate?: string;
  settings: {
    workDuration: number;
    breakDuration: number;
    ambientSound: 'rain' | 'lofi' | 'white' | 'none';
    notificationSound: 'default' | 'bell' | 'none';
    autoStartNextSession: boolean;
    language?: string;
    use24Hr?: boolean;
    startWeekSunday?: boolean;
  };
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

export interface FocusSession {
  id: string;
  userId: string;
  taskId: string | null;
  duration: number;
  timestamp: number;
  xpEarned: number;
}
