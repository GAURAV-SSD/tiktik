export interface Habit {
  _id: string;
  user: string;
  title: string;
  description?: string;
  category: HabitCategory;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  customFrequency?: {
    days: string[];
    timesPerWeek: number;
  };
  targetCount: number;
  unit: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  reminders: HabitReminder[];
  moodBooster: boolean;
  recommendedMoods: string[];
  isActive: boolean;
  isArchived: boolean;
  statistics: HabitStatistics;
  todayStatus?: {
    completed: boolean;
    count: number;
    targetCount: number;
    completionId?: string;
  };
  completionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  _id: string;
  habit: string | Habit;
  user: string;
  completedAt: string;
  completionDate: string;
  count: number;
  targetCount: number;
  notes?: string;
  moodAtTime?: string;
  moodAfterCompletion?: string;
  location?: string;
  weather?: string;
  effortLevel?: number;
  satisfactionLevel?: number;
  streakAtCompletion: number;
  source: 'manual' | 'reminder' | 'mood_recommendation';
  completionPercentage: number;
  isFullyCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitReminder {
  time: string;
  enabled: boolean;
  message?: string;
}

export interface HabitStatistics {
  averageCompletionTime?: string;
  bestStreakPeriod?: {
    start: string;
    end: string;
    length: number;
  };
  weeklyCompletionRate: number;
  monthlyCompletionRate: number;
}

export type HabitCategory = 
  | 'health' 
  | 'fitness' 
  | 'mindfulness' 
  | 'productivity' 
  | 'social' 
  | 'creativity' 
  | 'learning'
  | 'self-care'
  | 'nutrition'
  | 'sleep';

export interface CreateHabitData {
  title: string;
  description?: string;
  category: HabitCategory;
  icon?: string;
  color?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  customFrequency?: {
    days: string[];
    timesPerWeek: number;
  };
  targetCount?: number;
  unit?: string;
  reminders?: HabitReminder[];
  moodBooster?: boolean;
  recommendedMoods?: string[];
}

export interface UpdateHabitData extends Partial<CreateHabitData> {
  isActive?: boolean;
}

export interface CompleteHabitData {
  count?: number;
  notes?: string;
  effortLevel?: number;
  satisfactionLevel?: number;
  moodAtTime?: string;
}

export interface HabitStats {
  habit: Habit;
  statistics: {
    totalCompletions: number;
    averageEffort: number;
    averageSatisfaction: number;
    dayOfWeekStats: Record<string, number>;
    monthlyData: Record<string, number>;
    completions: HabitCompletion[];
  };
  calendarData: Record<string, {
    completed: boolean;
    count: number;
    targetCount: number;
    effortLevel?: number;
    satisfactionLevel?: number;
  }>;
  weeklyData: Array<{
    week: string;
    weekStart: string;
    weekEnd: string;
    completions: number;
    expected: number;
    rate: number;
  }>;
  insights: {
    bestDay: string;
    averageCompletionRate: number;
    streakRecord: number;
    totalDays: number;
  };
}

export interface HabitDashboard {
  summary: {
    totalHabits: number;
    todayCompleted: number;
    todayRemaining: number;
    weeklyCompletionRate: number;
    bestStreak: {
      habit: string;
      streak: number;
    };
    totalPointsThisWeek: number;
  };
  todayHabits: Habit[];
  recentCompletions: HabitCompletion[];
}

export interface CalendarData {
  calendarData: Record<string, {
    totalHabits: number;
    completedHabits: number;
    completionRate: number;
    habits: Array<{
      id: string;
      title: string;
      icon: string;
      color: string;
      completed: boolean;
    }>;
  }>;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  totalHabits: number;
}

// Category configurations
export const HABIT_CATEGORIES: Record<HabitCategory, { label: string; icon: string; color: string }> = {
  health: { label: 'Health', icon: '🏥', color: '#48BB78' },
  fitness: { label: 'Fitness', icon: '💪', color: '#ED8936' },
  mindfulness: { label: 'Mindfulness', icon: '🧘', color: '#805AD5' },
  productivity: { label: 'Productivity', icon: '⚡', color: '#3182CE' },
  social: { label: 'Social', icon: '👥', color: '#38B2AC' },
  creativity: { label: 'Creativity', icon: '🎨', color: '#D53F8C' },
  learning: { label: 'Learning', icon: '📚', color: '#2D3748' },
  'self-care': { label: 'Self Care', icon: '💆', color: '#9F7AEA' },
  nutrition: { label: 'Nutrition', icon: '🥗', color: '#68D391' },
  sleep: { label: 'Sleep', icon: '😴', color: '#4A5568' }
};

// Default habit suggestions
export const HABIT_SUGGESTIONS: Record<HabitCategory, Array<{ title: string; description: string; icon: string }>> = {
  health: [
    { title: 'Take vitamins', description: 'Daily vitamin supplement', icon: '💊' },
    { title: 'Drink water', description: '8 glasses of water daily', icon: '💧' },
    { title: 'Stretch', description: '10 minutes of stretching', icon: '🤸' }
  ],
  fitness: [
    { title: 'Morning walk', description: '30 minutes outdoor walk', icon: '🚶' },
    { title: 'Workout', description: 'Exercise routine', icon: '🏋️' },
    { title: 'Yoga', description: 'Daily yoga practice', icon: '🧘' }
  ],
  mindfulness: [
    { title: 'Meditation', description: '10 minutes of mindfulness', icon: '🧘' },
    { title: 'Gratitude journal', description: 'Write 3 things you\'re grateful for', icon: '📝' },
    { title: 'Deep breathing', description: '5 minutes of deep breathing', icon: '🌬️' }
  ],
  productivity: [
    { title: 'Plan the day', description: 'Review daily priorities', icon: '📋' },
    { title: 'Read', description: '30 minutes of reading', icon: '📖' },
    { title: 'Learn something new', description: 'Spend time learning', icon: '🎓' }
  ],
  social: [
    { title: 'Call family', description: 'Connect with loved ones', icon: '📞' },
    { title: 'Text a friend', description: 'Reach out to a friend', icon: '💬' },
    { title: 'Social activity', description: 'Engage in social interaction', icon: '👥' }
  ],
  creativity: [
    { title: 'Draw or sketch', description: 'Creative expression through art', icon: '🎨' },
    { title: 'Write', description: 'Creative writing or journaling', icon: '✍️' },
    { title: 'Play music', description: 'Practice an instrument', icon: '🎵' }
  ],
  learning: [
    { title: 'Study', description: 'Dedicated learning time', icon: '📚' },
    { title: 'Online course', description: 'Continue online learning', icon: '💻' },
    { title: 'Practice skill', description: 'Work on a specific skill', icon: '🎯' }
  ],
  'self-care': [
    { title: 'Skincare routine', description: 'Take care of your skin', icon: '🧴' },
    { title: 'Take a bath', description: 'Relaxing bath time', icon: '🛁' },
    { title: 'Listen to music', description: 'Enjoy your favorite music', icon: '🎵' }
  ],
  nutrition: [
    { title: 'Eat vegetables', description: 'Include vegetables in meals', icon: '🥬' },
    { title: 'Healthy breakfast', description: 'Start day with nutritious meal', icon: '🍳' },
    { title: 'No junk food', description: 'Avoid processed foods', icon: '🚫' }
  ],
  sleep: [
    { title: 'Sleep 8 hours', description: 'Get adequate sleep', icon: '😴' },
    { title: 'No screens before bed', description: 'Digital detox before sleep', icon: '📱' },
    { title: 'Bedtime routine', description: 'Consistent sleep routine', icon: '🌙' }
  ]
};