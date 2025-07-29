const mongoose = require('mongoose');

const habitCompletionSchema = new mongoose.Schema({
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Completion details
  completedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  completionDate: {
    type: String, // 'YYYY-MM-DD' format for easy querying
    required: true
  },
  
  // Progress tracking
  count: {
    type: Number,
    default: 1,
    min: 1
  },
  targetCount: {
    type: Number,
    default: 1
  },
  
  // Additional context
  notes: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Mood correlation
  moodAtTime: {
    type: String,
    enum: ['happy', 'neutral', 'sad', 'anxious']
  },
  moodAfterCompletion: {
    type: String,
    enum: ['happy', 'neutral', 'sad', 'anxious']
  },
  
  // Location and context (optional)
  location: {
    type: String,
    maxlength: 100
  },
  weather: {
    type: String,
    maxlength: 50
  },
  
  // Completion quality/effort
  effortLevel: {
    type: Number,
    min: 1,
    max: 5 // 1 = minimal effort, 5 = maximum effort
  },
  satisfactionLevel: {
    type: Number,
    min: 1,
    max: 5 // 1 = not satisfied, 5 = very satisfied
  },
  
  // Streak information at time of completion
  streakAtCompletion: {
    type: Number,
    default: 0
  },
  
  // Metadata
  source: {
    type: String,
    enum: ['manual', 'reminder', 'mood_recommendation'],
    default: 'manual'
  }
}, {
  timestamps: true
});

// Indexes for performance
habitCompletionSchema.index({ habit: 1, completionDate: 1 }, { unique: true }); // One completion per habit per day
habitCompletionSchema.index({ user: 1, completionDate: -1 });
habitCompletionSchema.index({ habit: 1, completedAt: -1 });
habitCompletionSchema.index({ user: 1, completedAt: -1 });

// Pre-save middleware to set completionDate
habitCompletionSchema.pre('save', function(next) {
  if (!this.completionDate) {
    this.completionDate = this.completedAt.toISOString().split('T')[0];
  }
  next();
});

// Virtual for completion percentage
habitCompletionSchema.virtual('completionPercentage').get(function() {
  return Math.round((this.count / this.targetCount) * 100);
});

// Virtual for is fully completed
habitCompletionSchema.virtual('isFullyCompleted').get(function() {
  return this.count >= this.targetCount;
});

// Static method to get completions for a date range
habitCompletionSchema.statics.getCompletionsInRange = async function(userId, startDate, endDate, habitId = null) {
  const query = {
    user: userId,
    completionDate: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  if (habitId) {
    query.habit = habitId;
  }
  
  return this.find(query)
    .populate('habit', 'title icon color category')
    .sort({ completionDate: -1 });
};

// Static method to get today's completions
habitCompletionSchema.statics.getTodayCompletions = async function(userId, date = new Date()) {
  const today = date.toISOString().split('T')[0];
  
  return this.find({
    user: userId,
    completionDate: today
  }).populate('habit', 'title icon color category targetCount');
};

// Static method to get completion statistics
habitCompletionSchema.statics.getCompletionStats = async function(userId, habitId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];
  
  const completions = await this.find({
    user: userId,
    habit: habitId,
    completionDate: { $gte: startDate, $lte: endDate }
  }).sort({ completionDate: 1 });
  
  // Calculate statistics
  const totalCompletions = completions.length;
  const averageEffort = completions.length > 0 
    ? completions.reduce((sum, c) => sum + (c.effortLevel || 0), 0) / completions.length 
    : 0;
  const averageSatisfaction = completions.length > 0
    ? completions.reduce((sum, c) => sum + (c.satisfactionLevel || 0), 0) / completions.length
    : 0;
  
  // Calculate completion rate by day of week
  const dayOfWeekStats = {};
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  completions.forEach(completion => {
    const date = new Date(completion.completionDate);
    const dayName = dayNames[date.getDay()];
    dayOfWeekStats[dayName] = (dayOfWeekStats[dayName] || 0) + 1;
  });
  
  // Calculate monthly completion data for charts
  const monthlyData = {};
  completions.forEach(completion => {
    const month = completion.completionDate.substring(0, 7); // YYYY-MM
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });
  
  return {
    totalCompletions,
    averageEffort: Math.round(averageEffort * 10) / 10,
    averageSatisfaction: Math.round(averageSatisfaction * 10) / 10,
    dayOfWeekStats,
    monthlyData,
    completions: completions.slice(-7) // Last 7 completions for recent activity
  };
};

// Static method to calculate streak for a habit
habitCompletionSchema.statics.calculateHabitStreak = async function(habitId, userId) {
  const Habit = mongoose.model('Habit');
  const habit = await Habit.findById(habitId);
  
  if (!habit) return 0;
  
  const completions = await this.find({
    habit: habitId,
    user: userId
  }).sort({ completionDate: -1 });
  
  if (completions.length === 0) return 0;
  
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
    return 0; // No recent completion, streak is 0
  }
  
  // Count consecutive days backwards from start date
  let checkDate = new Date(startDate);
  let completionIndex = 0;
  
  while (completionIndex < completions.length) {
    const checkDateStr = checkDate.toISOString().split('T')[0];
    
    if (completions[completionIndex].completionDate === checkDateStr) {
      if (habit.isDueToday(checkDate)) {
        streak++;
      }
      completionIndex++;
    } else if (habit.isDueToday(checkDate)) {
      // This day was due but not completed, break the streak
      break;
    }
    
    // Move to previous day
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  return streak;
};

// Method to award gamification points
habitCompletionSchema.methods.awardPoints = async function() {
  const User = mongoose.model('User');
  const user = await User.findById(this.user);
  
  if (!user) return;
  
  let points = 10; // Base points for completion
  
  // Bonus points for effort and satisfaction
  if (this.effortLevel >= 4) points += 5;
  if (this.satisfactionLevel >= 4) points += 5;
  
  // Streak bonus
  if (this.streakAtCompletion >= 7) points += 10;
  if (this.streakAtCompletion >= 30) points += 25;
  
  const result = user.addPoints(points);
  
  // Check for streak badges
  if (this.streakAtCompletion === 7) {
    user.addBadge({
      name: '7-Day Streak',
      description: 'Completed a habit for 7 consecutive days',
      icon: '🔥',
      earnedAt: new Date()
    });
  } else if (this.streakAtCompletion === 30) {
    user.addBadge({
      name: '30-Day Streak',
      description: 'Completed a habit for 30 consecutive days',
      icon: '💎',
      earnedAt: new Date()
    });
  }
  
  await user.save();
  return { points, levelUp: result.levelUp };
};

module.exports = mongoose.model('HabitCompletion', habitCompletionSchema);