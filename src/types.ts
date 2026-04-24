import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  totalFocusTime: number;
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
  settings: {
    workDuration: number;
    breakDuration: number;
    ambientSound: 'rain' | 'lofi' | 'white' | 'none';
    notificationSound: 'default' | 'bell' | 'none';
    autoStartNextSession: boolean;
    isDopamineDetox: boolean;
    language?: string;
    use24Hr?: boolean;
    startWeekSunday?: boolean;
  };
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
