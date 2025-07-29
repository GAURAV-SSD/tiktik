import axios from 'axios';
import { 
  Habit, 
  CreateHabitData, 
  UpdateHabitData, 
  CompleteHabitData, 
  HabitStats, 
  HabitDashboard, 
  CalendarData 
} from '@/types/habit';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const habitApi = {
  // Get all habits
  getHabits: async (params?: { 
    category?: string; 
    active?: boolean; 
    date?: string; 
  }): Promise<{ habits: Habit[]; totalHabits: number; activeHabits: number; completedToday: number }> => {
    const response = await api.get('/habits', { params });
    return response.data.data;
  },

  // Get specific habit by ID
  getHabit: async (id: string): Promise<{ habit: Habit; recentCompletions: any[] }> => {
    const response = await api.get(`/habits/${id}`);
    return response.data.data;
  },

  // Create new habit
  createHabit: async (data: CreateHabitData): Promise<{ 
    habit: Habit; 
    pointsAwarded: number; 
    levelUp: boolean; 
  }> => {
    const response = await api.post('/habits', data);
    return response.data.data;
  },

  // Update habit
  updateHabit: async (id: string, data: UpdateHabitData): Promise<{ habit: Habit }> => {
    const response = await api.put(`/habits/${id}`, data);
    return response.data.data;
  },

  // Delete habit (archive)
  deleteHabit: async (id: string): Promise<void> => {
    await api.delete(`/habits/${id}`);
  },

  // Mark habit as complete
  completeHabit: async (id: string, data: CompleteHabitData = {}): Promise<{
    completion: any;
    habit: Habit;
    streak: number;
    pointsAwarded: number;
    levelUp: boolean;
  }> => {
    const response = await api.post(`/habits/${id}/complete`, data);
    return response.data.data;
  },

  // Undo habit completion
  undoCompletion: async (id: string): Promise<{ habit: Habit; newStreak: number }> => {
    const response = await api.delete(`/habits/${id}/complete`);
    return response.data.data;
  },

  // Get habit statistics
  getHabitStats: async (id: string, days: number = 30): Promise<HabitStats> => {
    const response = await api.get(`/habits/${id}/stats`, { params: { days } });
    return response.data.data;
  },

  // Get calendar data
  getCalendarData: async (startDate: string, endDate: string): Promise<CalendarData> => {
    const response = await api.get('/habits/calendar/range', {
      params: { startDate, endDate }
    });
    return response.data.data;
  },

  // Get mood-based recommendations
  getMoodRecommendations: async (mood: string): Promise<{
    mood: string;
    recommendedHabits: Habit[];
    message: string;
  }> => {
    const response = await api.get(`/habits/recommendations/${mood}`);
    return response.data.data;
  },

  // Get dashboard summary
  getDashboardSummary: async (): Promise<HabitDashboard> => {
    const response = await api.get('/habits/dashboard/summary');
    return response.data.data;
  }
};

// Utility functions
export const formatStreak = (streak: number): string => {
  if (streak === 0) return 'No streak';
  if (streak === 1) return '1 day';
  return `${streak} days`;
};

export const getStreakEmoji = (streak: number): string => {
  if (streak === 0) return '⭐';
  if (streak < 7) return '🔥';
  if (streak < 30) return '💪';
  if (streak < 100) return '🏆';
  return '💎';
};

export const formatCompletionRate = (rate: number): string => {
  return `${Math.round(rate)}%`;
};

export const getHabitColor = (habit: Habit): string => {
  return habit.color || '#48BB78';
};

export const isHabitDueToday = (habit: Habit, date: Date = new Date()): boolean => {
  if (!habit.isActive) return false;
  
  const today = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[today];
  
  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekly':
      return true;
    case 'custom':
      return habit.customFrequency?.days.includes(todayName) || false;
    default:
      return false;
  }
};

export const getNextDueDate = (habit: Habit): Date | null => {
  if (!habit.isActive) return null;
  
  const today = new Date();
  
  if (habit.frequency === 'daily') {
    return today;
  }
  
  if (habit.frequency === 'weekly') {
    return today;
  }
  
  if (habit.frequency === 'custom' && habit.customFrequency?.days) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayIndex = today.getDay();
    
    // Find next occurrence
    for (let i = 0; i < 7; i++) {
      const checkIndex = (todayIndex + i) % 7;
      const checkDay = dayNames[checkIndex];
      
      if (habit.customFrequency.days.includes(checkDay)) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);
        return nextDate;
      }
    }
  }
  
  return null;
};

export const calculateProgress = (habit: Habit): number => {
  if (!habit.todayStatus) return 0;
  return Math.min(100, (habit.todayStatus.count / habit.todayStatus.targetCount) * 100);
};

export const getHabitStatusColor = (habit: Habit): string => {
  const progress = calculateProgress(habit);
  
  if (progress === 100) return 'text-green-600';
  if (progress > 0) return 'text-yellow-600';
  return 'text-gray-400';
};

export const getHabitStatusText = (habit: Habit): string => {
  if (!habit.todayStatus) return 'Not started';
  
  const { completed, count, targetCount } = habit.todayStatus;
  
  if (completed && count >= targetCount) {
    return 'Completed!';
  }
  
  if (count > 0) {
    return `${count}/${targetCount} ${habit.unit}`;
  }
  
  return 'Not started';
};

// Offline support utilities
export const saveHabitOffline = (habit: Habit): void => {
  const offlineHabits = getOfflineHabits();
  offlineHabits[habit._id] = habit;
  localStorage.setItem('offline_habits', JSON.stringify(offlineHabits));
};

export const getOfflineHabits = (): Record<string, Habit> => {
  const stored = localStorage.getItem('offline_habits');
  return stored ? JSON.parse(stored) : {};
};

export const saveCompletionOffline = (habitId: string, completion: CompleteHabitData): void => {
  const offlineCompletions = getOfflineCompletions();
  const today = new Date().toISOString().split('T')[0];
  const key = `${habitId}_${today}`;
  
  offlineCompletions[key] = {
    habitId,
    date: today,
    ...completion,
    timestamp: Date.now()
  };
  
  localStorage.setItem('offline_completions', JSON.stringify(offlineCompletions));
};

export const getOfflineCompletions = (): Record<string, any> => {
  const stored = localStorage.getItem('offline_completions');
  return stored ? JSON.parse(stored) : {};
};

export const syncOfflineData = async (): Promise<void> => {
  const offlineCompletions = getOfflineCompletions();
  
  for (const [key, completion] of Object.entries(offlineCompletions)) {
    try {
      await habitApi.completeHabit(completion.habitId, {
        count: completion.count,
        notes: completion.notes,
        effortLevel: completion.effortLevel,
        satisfactionLevel: completion.satisfactionLevel,
        moodAtTime: completion.moodAtTime
      });
      
      // Remove from offline storage after successful sync
      delete offlineCompletions[key];
    } catch (error) {
      console.error('Failed to sync completion:', error);
    }
  }
  
  localStorage.setItem('offline_completions', JSON.stringify(offlineCompletions));
};

// Check if user is online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Network-aware API calls
export const completeHabitNetworkAware = async (
  habitId: string, 
  data: CompleteHabitData
): Promise<any> => {
  if (isOnline()) {
    try {
      return await habitApi.completeHabit(habitId, data);
    } catch (error) {
      // If online but request fails, save offline
      saveCompletionOffline(habitId, data);
      throw error;
    }
  } else {
    // Save offline
    saveCompletionOffline(habitId, data);
    return {
      offline: true,
      message: 'Saved offline. Will sync when connection is restored.'
    };
  }
};