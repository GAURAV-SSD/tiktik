const express = require('express');
const { body, validationResult } = require('express-validator');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { authenticate, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const habitValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('category')
    .isIn(['health', 'fitness', 'mindfulness', 'productivity', 'social', 'creativity', 'learning', 'self-care', 'nutrition', 'sleep'])
    .withMessage('Invalid category'),
  body('frequency')
    .isIn(['daily', 'weekly', 'custom'])
    .withMessage('Frequency must be daily, weekly, or custom'),
  body('targetCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Target count must be a positive integer'),
  body('icon')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Icon must not exceed 10 characters'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color')
];

// @desc    Get all habits for authenticated user
// @route   GET /api/habits
// @access  Private
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { category, active, date } = req.query;
  
  // Build query
  const query = { user: req.user._id };
  
  if (category) {
    query.category = category;
  }
  
  if (active !== undefined) {
    query.isActive = active === 'true';
  }
  
  const habits = await Habit.find(query)
    .sort({ createdAt: -1 });
  
  // If date is provided, filter habits due on that date and get completion status
  if (date) {
    const targetDate = new Date(date);
    const dateString = targetDate.toISOString().split('T')[0];
    
    // Get completions for the date
    const completions = await HabitCompletion.find({
      user: req.user._id,
      completionDate: dateString
    });
    
    const completionMap = {};
    completions.forEach(completion => {
      completionMap[completion.habit.toString()] = {
        completed: true,
        count: completion.count,
        targetCount: completion.targetCount,
        completionId: completion._id
      };
    });
    
    // Filter habits due on this date and add completion status
    const habitsForDate = habits
      .filter(habit => habit.isDueToday(targetDate))
      .map(habit => {
        const habitObj = habit.toObject();
        habitObj.todayStatus = completionMap[habit._id.toString()] || {
          completed: false,
          count: 0,
          targetCount: habit.targetCount
        };
        return habitObj;
      });
    
    return res.json({
      success: true,
      data: {
        habits: habitsForDate,
        date: dateString,
        totalHabits: habitsForDate.length,
        completedHabits: habitsForDate.filter(h => h.todayStatus.completed).length
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // For general habit list, get today's completion status
  const today = new Date().toISOString().split('T')[0];
  const todayCompletions = await HabitCompletion.find({
    user: req.user._id,
    completionDate: today
  });
  
  const completionMap = {};
  todayCompletions.forEach(completion => {
    completionMap[completion.habit.toString()] = {
      completed: true,
      count: completion.count,
      targetCount: completion.targetCount,
      completionId: completion._id
    };
  });
  
  // Add today's status to each habit
  const habitsWithStatus = habits.map(habit => {
    const habitObj = habit.toObject();
    habitObj.todayStatus = completionMap[habit._id.toString()] || {
      completed: false,
      count: 0,
      targetCount: habit.targetCount
    };
    return habitObj;
  });
  
  res.json({
    success: true,
    data: {
      habits: habitsWithStatus,
      totalHabits: habits.length,
      activeHabits: habits.filter(h => h.isActive).length,
      completedToday: todayCompletions.length
    },
    timestamp: new Date().toISOString()
  });
}));

// @desc    Get specific habit by ID
// @route   GET /api/habits/:id
// @access  Private
router.get('/:id', authenticate, checkOwnership(Habit), asyncHandler(async (req, res) => {
  const habit = req.resource; // Set by checkOwnership middleware
  
  // Get recent completions
  const recentCompletions = await HabitCompletion.find({
    habit: habit._id,
    user: req.user._id
  })
    .sort({ completionDate: -1 })
    .limit(30);
  
  // Calculate current streak
  await habit.calculateStreak();
  await habit.updateStatistics();
  
  res.json({
    success: true,
    data: {
      habit: habit.toObject(),
      recentCompletions
    },
    timestamp: new Date().toISOString()
  });
}));

// @desc    Create new habit
// @route   POST /api/habits
// @access  Private
router.post('/', authenticate, habitValidation, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VAL_001');
  }
  
  const habitData = {
    ...req.body,
    user: req.user._id
  };
  
  // Set default reminders if not provided
  if (!habitData.reminders || habitData.reminders.length === 0) {
    habitData.reminders = [{
      time: '09:00',
      enabled: true,
      message: `Time for ${habitData.title}!`
    }];
  }
  
  const habit = await Habit.create(habitData);
  
  // Award points for creating a habit
  const pointsResult = req.user.addPoints(5);
  if (pointsResult.levelUp) {
    req.user.addBadge({
      name: 'Habit Creator',
      description: 'Created your first habit',
      icon: '🎯'
    });
  }
  await req.user.save();
  
  res.status(201).json({
    success: true,
    message: 'Habit created successfully',
    data: {
      habit: habit.toObject(),
      pointsAwarded: 5,
      levelUp: pointsResult.levelUp
    },
    timestamp: new Date().toISOString()
  });
}));

// @desc    Update habit
// @route   PUT /api/habits/:id
// @access  Private
router.put('/:id', authenticate, checkOwnership(Habit), habitValidation, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VAL_001');
  }
  
  const habit = req.resource;
  
  // Update fields
  const allowedFields = [
    'title', 'description', 'category', 'icon', 'color', 'frequency', 
    'customFrequency', 'targetCount', 'unit', 'reminders', 'moodBooster', 
    'recommendedMoods', 'isActive'
  ];
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      habit[field] = req.body[field];
    }
  });
  
  await habit.save();
  
  res.json({
    success: true,
    message: 'Habit updated successfully',
    data: {
      habit: habit.toObject()
    },
    timestamp: new Date().toISOString()
  });
}));

// @desc    Delete habit
// @route   DELETE /api/habits/:id
// @access  Private
router.delete('/:id', authenticate, checkOwnership(Habit), asyncHandler(async (req, res) => {
  const habit = req.resource;
  
  // Soft delete - just mark as archived
  habit.isActive = false;
  habit.isArchived = true;
  await habit.save();
  
  res.json({
    success: true,
    message: 'Habit archived successfully',
    timestamp: new Date().toISOString()
  });
}));

// @desc    Mark habit as complete for today
// @route   POST /api/habits/:id/complete
// @access  Private
router.post('/:id/complete', authenticate, checkOwnership(Habit), asyncHandler(async (req, res) => {
  const habit = req.resource;
  const { count = 1, notes, effortLevel, satisfactionLevel, moodAtTime } = req.body;
  
  const today = new Date().toISOString().split('T')[0];
  
  // Check if already completed today
  const existingCompletion = await HabitCompletion.findOne({
    habit: habit._id,
    user: req.user._id,
    completionDate: today
  });
  
  if (existingCompletion) {
    // Update existing completion
    existingCompletion.count = Math.min(count, habit.targetCount);
    existingCompletion.notes = notes || existingCompletion.notes;
    existingCompletion.effortLevel = effortLevel || existingCompletion.effortLevel;
    existingCompletion.satisfactionLevel = satisfactionLevel || existingCompletion.satisfactionLevel;
    existingCompletion.moodAtTime = moodAtTime || existingCompletion.moodAtTime;
    
    await existingCompletion.save();
    
    return res.json({
      success: true,
      message: 'Habit completion updated',
      data: {
        completion: existingCompletion,
        habit: habit.toObject()
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Calculate current streak before creating completion
  const currentStreak = await habit.calculateStreak();
  
  // Create new completion
  const completion = await HabitCompletion.create({
    habit: habit._id,
    user: req.user._id,
    count: Math.min(count, habit.targetCount),
    targetCount: habit.targetCount,
    notes,
    effortLevel,
    satisfactionLevel,
    moodAtTime,
    streakAtCompletion: currentStreak + 1 // +1 because this completion will extend the streak
  });
  
  // Update habit statistics
  habit.totalCompletions += 1;
  habit.currentStreak = currentStreak + 1;
  if (habit.currentStreak > habit.longestStreak) {
    habit.longestStreak = habit.currentStreak;
  }
  
  await habit.save();
  await habit.updateStatistics();
  
  // Award gamification points
  const gamificationResult = await completion.awardPoints();
  
  res.json({
    success: true,
    message: 'Habit marked as complete!',
    data: {
      completion,
      habit: habit.toObject(),
      streak: habit.currentStreak,
      pointsAwarded: gamificationResult?.points || 0,
      levelUp: gamificationResult?.levelUp || false
    },
    timestamp: new Date().toISOString()
  });
}));

// @desc    Undo habit completion for today
// @route   DELETE /api/habits/:id/complete
// @access  Private
router.delete('/:id/complete', authenticate, checkOwnership(Habit), asyncHandler(async (req, res) => {
  const habit = req.resource;
  const today = new Date().toISOString().split('T')[0];
  
  const completion = await HabitCompletion.findOneAndDelete({
    habit: habit._id,
    user: req.user._id,
    completionDate: today
  });
  
  if (!completion) {
    throw new AppError('No completion found for today', 404, 'AUTHZ_002');
  }
  
  // Update habit statistics
  habit.totalCompletions = Math.max(0, habit.totalCompletions - 1);
  await habit.calculateStreak();
  await habit.updateStatistics();
  await habit.save();
  
  res.json({
    success: true,
    message: 'Habit completion removed',
    data: {
      habit: habit.toObject(),
      newStreak: habit.currentStreak
    },
    timestamp: new Date().toISOString()
  });
}));

// @desc    Get habit statistics and analytics
// @route   GET /api/habits/:id/stats
// @access  Private
router.get('/:id/stats', authenticate, checkOwnership(Habit), asyncHandler(async (req, res) => {
  const habit = req.resource;
  const { days = 30 } = req.query;
  
  // Get completion statistics
  const stats = await HabitCompletion.getCompletionStats(req.user._id, habit._id, parseInt(days));
  
  // Get completion data for calendar visualization
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];
  
  const completions = await HabitCompletion.getCompletionsInRange(
    req.user._id, 
    startDate, 
    endDate, 
    habit._id
  );
  
  // Generate calendar data
  const calendarData = {};
  completions.forEach(completion => {
    calendarData[completion.completionDate] = {
      completed: true,
      count: completion.count,
      targetCount: completion.targetCount,
      effortLevel: completion.effortLevel,
      satisfactionLevel: completion.satisfactionLevel
    };
  });
  
  // Calculate weekly completion rates for the last 8 weeks
  const weeklyData = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(Date.now() - (i * 7 + 6) * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
    
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    
    const weekCompletions = completions.filter(c => 
      c.completionDate >= weekStartStr && c.completionDate <= weekEndStr
    );
    
    // Calculate expected completions for this week based on habit frequency
    let expectedCompletions = 7; // Daily default
    if (habit.frequency === 'weekly') {
      expectedCompletions = 1;
    } else if (habit.frequency === 'custom') {
      expectedCompletions = habit.customFrequency?.timesPerWeek || 1;
    }
    
    weeklyData.push({
      week: `Week ${8 - i}`,
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      completions: weekCompletions.length,
      expected: expectedCompletions,
      rate: Math.round((weekCompletions.length / expectedCompletions) * 100)
    });
  }
  
  res.json({
    success: true,
    data: {
      habit: habit.toObject(),
      statistics: stats,
      calendarData,
      weeklyData,
      insights: {
        bestDay: Object.keys(stats.dayOfWeekStats).reduce((a, b) => 
          stats.dayOfWeekStats[a] > stats.dayOfWeekStats[b] ? a : b, 'Monday'
        ),
        averageCompletionRate: habit.statistics.weeklyCompletionRate,
        streakRecord: habit.longestStreak,
        totalDays: Math.ceil((Date.now() - habit.createdAt) / (1000 * 60 * 60 * 24))
      }
    },
    timestamp: new Date().toISOString()
  });
}));

// @desc    Get habits for a specific date range (for calendar view)
// @route   GET /api/habits/calendar
// @access  Private
router.get('/calendar/range', authenticate, asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    throw new AppError('Start date and end date are required', 400, 'VAL_001');
  }
  
  // Get all active habits
  const habits = await Habit.find({
    user: req.user._id,
    isActive: true
  });
  
  // Get completions in the date range
  const completions = await HabitCompletion.getCompletionsInRange(
    req.user._id,
    startDate,
    endDate
  );
  
  // Group completions by date
  const completionsByDate = {};
  completions.forEach(completion => {
    if (!completionsByDate[completion.completionDate]) {
      completionsByDate[completion.completionDate] = [];
    }
    completionsByDate[completion.completionDate].push(completion);
  });
  
  // Generate calendar data
  const calendarData = {};
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0];
    const habitsForDate = habits.filter(habit => habit.isDueToday(date));
    const completionsForDate = completionsByDate[dateStr] || [];
    
    calendarData[dateStr] = {
      totalHabits: habitsForDate.length,
      completedHabits: completionsForDate.length,
      completionRate: habitsForDate.length > 0 
        ? Math.round((completionsForDate.length / habitsForDate.length) * 100)
        : 0,
      habits: habitsForDate.map(habit => ({
        id: habit._id,
        title: habit.title,
        icon: habit.icon,
        color: habit.color,
        completed: completionsForDate.some(c => c.habit._id.toString() === habit._id.toString())
      }))
    };
  }
  
  res.json({
    success: true,
    data: {
      calendarData,
      dateRange: { startDate, endDate },
      totalHabits: habits.length
    },
    timestamp: new Date().toISOString()
  });
}));

// @desc    Get mood-based habit recommendations
// @route   GET /api/habits/recommendations/:mood
// @access  Private
router.get('/recommendations/:mood', authenticate, asyncHandler(async (req, res) => {
  const { mood } = req.params;
  
  if (!['happy', 'neutral', 'sad', 'anxious'].includes(mood)) {
    throw new AppError('Invalid mood parameter', 400, 'VAL_001');
  }
  
  const recommendedHabits = await Habit.getMoodBoostingHabits(req.user._id, mood);
  
  res.json({
    success: true,
    data: {
      mood,
      recommendedHabits,
      message: `Here are some habits that might help when you're feeling ${mood}`
    },
    timestamp: new Date().toISOString()
  });
}));

// @desc    Get habit dashboard summary
// @route   GET /api/habits/dashboard/summary
// @access  Private
router.get('/dashboard/summary', authenticate, asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Get user's active habits
  const habits = await Habit.find({
    user: req.user._id,
    isActive: true
  });
  
  // Get today's completions
  const todayCompletions = await HabitCompletion.getTodayCompletions(req.user._id);
  
  // Get this week's completions
  const weekCompletions = await HabitCompletion.getCompletionsInRange(
    req.user._id,
    weekAgo,
    today
  );
  
  // Calculate streaks
  const streaks = await Promise.all(
    habits.map(async (habit) => ({
      habit: habit.title,
      streak: await habit.calculateStreak()
    }))
  );
  
  const bestStreak = streaks.reduce((max, current) => 
    current.streak > max.streak ? current : max, 
    { habit: '', streak: 0 }
  );
  
  // Calculate completion rate for this week
  const expectedWeekly = habits.reduce((total, habit) => {
    if (habit.frequency === 'daily') return total + 7;
    if (habit.frequency === 'weekly') return total + 1;
    return total + (habit.customFrequency?.timesPerWeek || 1);
  }, 0);
  
  const weeklyCompletionRate = expectedWeekly > 0 
    ? Math.round((weekCompletions.length / expectedWeekly) * 100)
    : 0;
  
  res.json({
    success: true,
    data: {
      summary: {
        totalHabits: habits.length,
        todayCompleted: todayCompletions.length,
        todayRemaining: habits.filter(h => h.isDueToday()).length - todayCompletions.length,
        weeklyCompletionRate,
        bestStreak,
        totalPointsThisWeek: weekCompletions.length * 10 // Base points
      },
      todayHabits: habits.filter(h => h.isDueToday()).map(habit => {
        const completion = todayCompletions.find(c => 
          c.habit._id.toString() === habit._id.toString()
        );
        return {
          ...habit.toObject(),
          todayStatus: {
            completed: !!completion,
            count: completion?.count || 0,
            targetCount: habit.targetCount
          }
        };
      }),
      recentCompletions: weekCompletions.slice(0, 5)
    },
    timestamp: new Date().toISOString()
  });
}));

module.exports = router;