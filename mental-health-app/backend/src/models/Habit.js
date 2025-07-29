const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Basic habit information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: [
      'health', 
      'fitness', 
      'mindfulness', 
      'productivity', 
      'social', 
      'creativity', 
      'learning',
      'self-care',
      'nutrition',
      'sleep'
    ],
    default: 'health'
  },
  
  // Visual customization
  icon: {
    type: String,
    default: '🎯'
  },
  color: {
    type: String,
    default: '#48BB78',
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  
  // Frequency and scheduling
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'custom'],
    required: true,
    default: 'daily'
  },
  customFrequency: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    timesPerWeek: {
      type: Number,
      min: 1,
      max: 7
    }
  },
  
  // Goal tracking
  targetCount: {
    type: Number,
    default: 1,
    min: 1
  },
  unit: {
    type: String,
    default: 'times',
    maxlength: 20
  },
  
  // Progress tracking
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCompletions: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Reminders
  reminders: [{
    time: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    enabled: {
      type: Boolean,
      default: true
    },
    message: {
      type: String,
      maxlength: 200
    }
  }],
  
  // Mood integration
  moodBooster: {
    type: Boolean,
    default: false // If true, this habit is recommended when mood is low
  },
  recommendedMoods: [{
    type: String,
    enum: ['happy', 'neutral', 'sad', 'anxious']
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  
  // Analytics
  statistics: {
    averageCompletionTime: String, // Time of day usually completed
    bestStreakPeriod: {
      start: Date,
      end: Date,
      length: Number
    },
    weeklyCompletionRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    monthlyCompletionRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
habitSchema.index({ user: 1, isActive: 1 });
habitSchema.index({ user: 1, category: 1 });
habitSchema.index({ user: 1, createdAt: -1 });
habitSchema.index({ moodBooster: 1, recommendedMoods: 1 });

// Virtual for completion rate
habitSchema.virtual('completionRate').get(function() {
  if (this.totalCompletions === 0) return 0;
  
  const daysSinceCreation = Math.ceil((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
  const expectedCompletions = this.frequency === 'daily' ? daysSinceCreation : 
                             this.frequency === 'weekly' ? Math.ceil(daysSinceCreation / 7) :
                             Math.ceil(daysSinceCreation * (this.customFrequency?.timesPerWeek || 1) / 7);
  
  return Math.min(100, Math.round((this.totalCompletions / expectedCompletions) * 100));
});

// Virtual for today's status
habitSchema.virtual('todayStatus').get(function() {
  // This will be populated by the controller with today's completion data
  return this._todayStatus || { completed: false, count: 0 };
});

// Method to check if habit is due today
habitSchema.methods.isDueToday = function(date = new Date()) {
  if (!this.isActive) return false;
  
  const today = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[today];
  
  switch (this.frequency) {
    case 'daily':
      return true;
    case 'weekly':
      return true; // Weekly habits can be done any day
    case 'custom':
      return this.customFrequency.days.includes(todayName);
    default:
      return false;
  }
};

// Method to calculate streak
habitSchema.methods.calculateStreak = async function() {
  const HabitCompletion = mongoose.model('HabitCompletion');
  
  // Get all completions for this habit, sorted by date descending
  const completions = await HabitCompletion.find({
    habit: this._id,
    user: this.user
  }).sort({ completionDate: -1 });
  
  if (completions.length === 0) {
    this.currentStreak = 0;
    return 0;
  }
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  // Check if there's a completion for today or yesterday
  const today = currentDate.toISOString().split('T')[0];
  const yesterday = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  let startDate = null;
  if (completions[0].completionDate === today) {
    startDate = today;
  } else if (completions[0].completionDate === yesterday) {
    startDate = yesterday;
  } else {
    // No recent completion, streak is 0
    this.currentStreak = 0;
    return 0;
  }
  
  // Count consecutive days backwards from start date
  let checkDate = new Date(startDate);
  let completionIndex = 0;
  
  while (completionIndex < completions.length) {
    const checkDateStr = checkDate.toISOString().split('T')[0];
    
    if (completions[completionIndex].completionDate === checkDateStr) {
      if (this.isDueToday(checkDate)) {
        streak++;
      }
      completionIndex++;
    } else if (this.isDueToday(checkDate)) {
      // This day was due but not completed, break the streak
      break;
    }
    
    // Move to previous day
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  this.currentStreak = streak;
  if (streak > this.longestStreak) {
    this.longestStreak = streak;
  }
  
  return streak;
};

// Method to update statistics
habitSchema.methods.updateStatistics = async function() {
  const HabitCompletion = mongoose.model('HabitCompletion');
  
  // Get completions from last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const completions = await HabitCompletion.find({
    habit: this._id,
    user: this.user,
    completedAt: { $gte: thirtyDaysAgo }
  });
  
  // Calculate weekly completion rate
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyCompletions = completions.filter(c => c.completedAt >= sevenDaysAgo);
  
  let expectedWeeklyCompletions = 7; // Daily default
  if (this.frequency === 'weekly') {
    expectedWeeklyCompletions = 1;
  } else if (this.frequency === 'custom') {
    expectedWeeklyCompletions = this.customFrequency.timesPerWeek || 1;
  }
  
  this.statistics.weeklyCompletionRate = Math.round((weeklyCompletions.length / expectedWeeklyCompletions) * 100);
  this.statistics.monthlyCompletionRate = Math.round((completions.length / (expectedWeeklyCompletions * 4)) * 100);
  
  // Calculate average completion time
  if (completions.length > 0) {
    const times = completions.map(c => {
      const hour = c.completedAt.getHours();
      const minute = c.completedAt.getMinutes();
      return hour * 60 + minute; // Convert to minutes
    });
    
    const averageMinutes = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const averageHour = Math.floor(averageMinutes / 60);
    const averageMinute = averageMinutes % 60;
    
    this.statistics.averageCompletionTime = `${averageHour.toString().padStart(2, '0')}:${averageMinute.toString().padStart(2, '0')}`;
  }
  
  await this.save();
};

// Static method to get habits for a specific date
habitSchema.statics.getHabitsForDate = async function(userId, date = new Date()) {
  const habits = await this.find({
    user: userId,
    isActive: true
  }).populate('user', 'username');
  
  return habits.filter(habit => habit.isDueToday(date));
};

// Static method to get mood-boosting habits
habitSchema.statics.getMoodBoostingHabits = async function(userId, mood) {
  return this.find({
    user: userId,
    isActive: true,
    $or: [
      { moodBooster: true },
      { recommendedMoods: mood }
    ]
  }).limit(3);
};

module.exports = mongoose.model('Habit', habitSchema);