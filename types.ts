export interface Habit {
  id: string;
  name: string;
  days: number[]; // 0-6 (Sun-Sat)
  time: string; // "HH:MM"
  active: boolean;
}

export interface HistoryRecord {
  habitsDone: string[]; // Habit IDs completed
  habitsFailed: string[]; // Habit IDs explicitly failed or missed at EOD
  xpDelta: number;
  lifeDelta: number;
}

export interface UserState {
  xpTotal: number;
  level: number;
  life: number; // 0-100
  lastDailyCheck: string; // YYYY-MM-DD
  streakCurrent: number;
  history: Record<string, HistoryRecord>; // date string -> record
  robotName: string;
  theme: 'light' | 'dark';
  lastNotification: {
    date: string;
    morning: boolean;
    evening: boolean;
  };
}

export interface KironContextType {
  state: UserState;
  habits: Habit[];
  addHabit: (name: string, days: number[], time: string) => void;
  editHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  markHabitDone: (habitId: string) => void;
  setRobotName: (name: string) => void;
  toggleTheme: () => void;
  requestNotifyPermission: () => void;
  kironPhrase: string;
  triggerAnimation: string; // 'none' | 'bounce' | 'blink'
}

export enum KironMood {
  HAPPY = 'HAPPY',
  NEUTRAL = 'NEUTRAL',
  SAD = 'SAD',
  OFFLINE = 'OFFLINE',
}