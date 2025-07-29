'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Flame, 
  MoreHorizontal,
  Target,
  Calendar,
  Clock
} from 'lucide-react';
import { Habit } from '@/types/habit';
import { 
  formatStreak, 
  getStreakEmoji, 
  calculateProgress, 
  getHabitStatusColor,
  getHabitStatusText 
} from '@/lib/api/habits';

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string, completed: boolean) => void;
  onEdit: (habit: Habit) => void;
  layout?: 'grid' | 'list';
}

export default function HabitCard({ 
  habit, 
  onComplete, 
  onEdit, 
  layout = 'grid' 
}: HabitCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const progress = calculateProgress(habit);
  const isCompleted = habit.todayStatus?.completed || false;
  const statusColor = getHabitStatusColor(habit);
  const statusText = getHabitStatusText(habit);

  const handleComplete = async () => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    try {
      await onComplete(habit._id, !isCompleted);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEdit(habit);
  };

  const getFrequencyText = () => {
    switch (habit.frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'custom':
        if (habit.customFrequency?.days) {
          return `${habit.customFrequency.days.length} days/week`;
        }
        return 'Custom';
      default:
        return 'Daily';
    }
  };

  if (layout === 'list') {
    return (
      <motion.div
        className="card p-4 hover:shadow-lg transition-all duration-200"
        whileHover={{ scale: 1.01 }}
        layout
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Completion Button */}
            <motion.button
              onClick={handleComplete}
              disabled={isCompleting}
              className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-400 dark:border-gray-600 dark:hover:border-green-400'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isCompleting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </motion.button>

            {/* Habit Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{habit.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {habit.title}
                  </h3>
                  {habit.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {habit.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Status and Progress */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className={`font-medium ${statusColor}`}>
                  {statusText}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {getFrequencyText()}
                </div>
              </div>

              {/* Streak */}
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <span className="text-lg">{getStreakEmoji(habit.currentStreak)}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {habit.currentStreak}
                  </span>
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  streak
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-20">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-green-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  {Math.round(progress)}%
                </div>
              </div>
            </div>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
              >
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Habit</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid layout
  return (
    <motion.div
      className="card p-6 hover:shadow-lg transition-all duration-200 relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      layout
      style={{
        borderLeft: `4px solid ${habit.color}`
      }}
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 20px 20px, ${habit.color} 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <motion.span 
            className="text-3xl"
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {habit.icon}
          </motion.span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {habit.title}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>{getFrequencyText()}</span>
            </div>
          </div>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20"
            >
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Habit</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Description */}
      {habit.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 relative z-10">
          {habit.description}
        </p>
      )}

      {/* Progress Section */}
      <div className="mb-4 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Today's Progress
          </span>
          <span className={`text-sm font-medium ${statusColor}`}>
            {statusText}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
          <motion.div
            className="h-3 rounded-full transition-all duration-500"
            style={{ backgroundColor: habit.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {habit.todayStatus?.count || 0} / {habit.todayStatus?.targetCount || habit.targetCount} {habit.unit}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-1 text-sm">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="font-medium text-gray-900 dark:text-white">
            {habit.currentStreak}
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            day streak
          </span>
        </div>

        <div className="flex items-center space-x-1 text-sm">
          <Target className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-gray-900 dark:text-white">
            {habit.totalCompletions}
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            total
          </span>
        </div>
      </div>

      {/* Completion Button */}
      <motion.button
        onClick={handleComplete}
        disabled={isCompleting}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 relative z-10 ${
          isCompleted
            ? 'bg-green-500 text-white shadow-lg'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isCompleting ? (
          <>
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Updating...</span>
          </>
        ) : isCompleted ? (
          <>
            <CheckCircle2 className="h-5 w-5" />
            <span>Completed!</span>
          </>
        ) : (
          <>
            <Circle className="h-5 w-5" />
            <span>Mark Complete</span>
          </>
        )}
      </motion.button>

      {/* Completion Animation */}
      {isCompleted && (
        <motion.div
          className="absolute inset-0 bg-green-500 opacity-20 rounded-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Streak Badge */}
      {habit.currentStreak >= 7 && (
        <motion.div
          className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Flame className="h-3 w-3" />
          <span>{habit.currentStreak}</span>
        </motion.div>
      )}
    </motion.div>
  );
}