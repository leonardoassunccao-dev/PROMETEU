import { useState, useEffect, useCallback } from 'react';
import { UserState, Habit, KironMood } from '../types';
import { 
  STARTING_LIFE, MAX_LIFE, MAX_HABITS, XP_PER_HABIT, 
  LIFE_PER_HABIT, PENALTY_XP, PENALTY_LIFE, 
  PHRASES, REACTION_PHRASES, NOTIFICATION_MSGS, getLevel, getKironMood 
} from '../constants';
import { getTodayStr, getPreviousDay, isHabitDueToday } from '../utils';

const STORAGE_KEY_USER = 'kiron_user_v2'; 
const STORAGE_KEY_HABITS = 'kiron_habits_v1';

const INITIAL_USER_STATE: UserState = {
  xpTotal: 0,
  level: 1,
  life: STARTING_LIFE,
  lastDailyCheck: getTodayStr(),
  streakCurrent: 0,
  history: {},
  robotName: "PROMETEU",
  theme: 'light',
  lastNotification: {
    date: getTodayStr(),
    morning: false,
    evening: false
  }
};

export const useKironGame = () => {
  const [state, setState] = useState<UserState>(INITIAL_USER_STATE);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [animation, setAnimation] = useState<'none'|'bounce'|'blink'>('none');
  const [tempPhrase, setTempPhrase] = useState<string | null>(null);

  // Helper to pick random phrase
  const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  // Trigger temporary phrase
  const triggerPhrase = useCallback((type: 'DONE' | 'MISSED') => {
    const list = type === 'DONE' ? REACTION_PHRASES.DONE : REACTION_PHRASES.MISSED;
    setTempPhrase(pickRandom(list));
    setTimeout(() => setTempPhrase(null), 4000); // Show for 4 seconds
  }, []);

  // --- NOTIFICATION LOGIC ---
  const requestNotifyPermission = async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const sendLocalNotification = useCallback((title: string, body: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    
    // Standard Notification API without Service Worker
    new Notification(title, { 
      body, 
      icon: 'https://via.placeholder.com/128/4F46E5/FFFFFF?text=K',
      tag: 'kiron-daily'
    });
  }, []);

  const checkAndSendNotifications = useCallback(() => {
    if (Notification.permission !== 'granted') return;
    
    const now = new Date();
    const hour = now.getHours();
    const today = getTodayStr();

    // Reset notification tracker if new day
    if (state.lastNotification.date !== today) {
       setState(prev => ({
         ...prev,
         lastNotification: { date: today, morning: false, evening: false }
       }));
       return; // Wait for next tick to process
    }

    const { morning, evening } = state.lastNotification;

    // Morning: 07h - 09h
    if (hour >= 7 && hour < 9 && !morning) {
      const msg = pickRandom(NOTIFICATION_MSGS.MORNING);
      sendLocalNotification(state.robotName, msg);
      setState(prev => ({
        ...prev,
        lastNotification: { ...prev.lastNotification, morning: true }
      }));
    }

    // Evening: 18h - 21h
    if (hour >= 18 && hour < 21 && !evening) {
       // Check if habits were done today
       const historyToday = state.history[today];
       const habitsDone = historyToday ? historyToday.habitsDone.length > 0 : false;
       
       const msg = habitsDone 
         ? pickRandom(NOTIFICATION_MSGS.EVENING_DONE) 
         : pickRandom(NOTIFICATION_MSGS.EVENING_PENDING);

       sendLocalNotification(state.robotName, msg);
       setState(prev => ({
         ...prev,
         lastNotification: { ...prev.lastNotification, evening: true }
       }));
    }
  }, [state.lastNotification, state.history, state.robotName, sendLocalNotification]);

  // Check notifications every minute
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(checkAndSendNotifications, 60000);
    // Also check immediately on mount/focus
    checkAndSendNotifications();
    return () => clearInterval(interval);
  }, [loaded, checkAndSendNotifications]);


  // --- LOAD/SAVE DATA ---
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    const savedHabits = localStorage.getItem(STORAGE_KEY_HABITS);

    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // Ensure strict merge for deep objects like lastNotification
      const mergedState = { ...INITIAL_USER_STATE, ...parsed };
      // Safety check if upgrading from version without notifications
      if (!mergedState.lastNotification) {
        mergedState.lastNotification = INITIAL_USER_STATE.lastNotification;
      }
      setState(mergedState);
    }
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(state));
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
  }, [state, habits, loaded]);

  // Apply Theme
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Daily Check Logic
  useEffect(() => {
    if (!loaded) return;

    const today = getTodayStr();
    if (state.lastDailyCheck !== today) {
      // It's a new day!
      const prevDay = getPreviousDay(today);
      const prevDayHistory = state.history[prevDay];
      
      let xpLoss = 0;
      let lifeLoss = 0;

      const activeHabits = habits.filter(h => h.active);
      const hadHabitsYesterday = activeHabits.length > 0;

      if (hadHabitsYesterday && (!prevDayHistory || prevDayHistory.habitsDone.length === 0)) {
        xpLoss = PENALTY_XP;
        lifeLoss = PENALTY_LIFE;
        triggerPhrase('MISSED');
      }

      setState(prev => ({
        ...prev,
        lastDailyCheck: today,
        life: Math.max(0, prev.life - lifeLoss),
        xpTotal: Math.max(0, prev.xpTotal - xpLoss),
        streakCurrent: (prevDayHistory && prevDayHistory.habitsDone.length > 0) ? prev.streakCurrent : 0
      }));
    }
  }, [loaded, state.lastDailyCheck, habits, triggerPhrase]);

  // Actions
  const addHabit = (name: string, days: number[], time: string) => {
    if (habits.length >= MAX_HABITS) return;
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      days,
      time,
      active: true
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const editHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const deleteHabit = (id: string) => {
    if (confirm("Tem certeza que deseja apagar? O histórico será mantido.")) {
      setHabits(prev => prev.filter(h => h.id !== id));
    }
  };

  const markHabitDone = (habitId: string) => {
    const today = getTodayStr();
    const todayRecord = state.history[today] || { habitsDone: [], habitsFailed: [], xpDelta: 0, lifeDelta: 0 };

    if (todayRecord.habitsDone.includes(habitId)) return; 

    setAnimation('bounce');
    triggerPhrase('DONE');
    setTimeout(() => setAnimation('none'), 300);

    const newLife = Math.min(MAX_LIFE, state.life + LIFE_PER_HABIT);
    const newXP = state.xpTotal + XP_PER_HABIT;
    
    let newStreak = state.streakCurrent;
    if (todayRecord.habitsDone.length === 0) {
       const prevDay = getPreviousDay(today);
       const prevHistory = state.history[prevDay];
       if (prevHistory && prevHistory.habitsDone.length > 0) {
         newStreak += 1;
       } else if (newStreak === 0) {
         newStreak = 1;
       } else {
         newStreak = 1;
       }
    }

    setState(prev => ({
      ...prev,
      life: newLife,
      xpTotal: newXP,
      level: getLevel(newXP),
      streakCurrent: newStreak,
      history: {
        ...prev.history,
        [today]: {
          ...todayRecord,
          habitsDone: [...todayRecord.habitsDone, habitId],
          xpDelta: todayRecord.xpDelta + XP_PER_HABIT,
          lifeDelta: todayRecord.lifeDelta + LIFE_PER_HABIT
        }
      }
    }));
  };

  const setRobotName = (name: string) => {
    setState(prev => ({ ...prev, robotName: name }));
  };

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const getPhrase = (): string => {
    if (tempPhrase) return tempPhrase;
    const mood = getKironMood(state.life);
    const moodPhrases = PHRASES[mood];
    const idx = Math.floor(new Date().getMinutes() / 5) % moodPhrases.length;
    return moodPhrases[idx];
  };

  return {
    state,
    habits,
    loaded,
    addHabit,
    editHabit,
    deleteHabit,
    markHabitDone,
    setRobotName,
    toggleTheme,
    requestNotifyPermission,
    kironPhrase: getPhrase(),
    triggerAnimation: animation
  };
};