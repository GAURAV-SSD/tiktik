'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  X
} from 'lucide-react';
import { habitApi } from '@/lib/api/habits';
import { Habit, CalendarData } from '@/types/habit';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';

interface HabitCalendarProps {
  habits: Habit[];
}

interface DayData {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
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
}

export default function HabitCalendar({ habits }: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get calendar days (including days from previous/next month to fill the grid)
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(calendarStart.getDate() - monthStart.getDay());
  
  const calendarEnd = new Date(monthEnd);
  calendarEnd.setDate(calendarEnd.getDate() + (6 - monthEnd.getDay()));
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  // Load calendar data
  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const startDate = calendarStart.toISOString().split('T')[0];
      const endDate = calendarEnd.toISOString().split('T')[0];
      
      const data = await habitApi.getCalendarData(startDate, endDate);
      setCalendarData(data);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayData = (date: Date): DayData => {
    const dateStr = date.toISOString().split('T')[0];
    const dayData = calendarData?.calendarData[dateStr];
    
    return {
      date,
      dateStr,
      isCurrentMonth: isSameMonth(date, currentDate),
      isToday: isToday(date),
      totalHabits: dayData?.totalHabits || 0,
      completedHabits: dayData?.completedHabits || 0,
      completionRate: dayData?.completionRate || 0,
      habits: dayData?.habits || []
    };
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(selectedDate?.getTime() === date.getTime() ? null : date);
  };

  const getCompletionColor = (rate: number) => {
    if (rate === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (rate < 30) return 'bg-red-100 dark:bg-red-900';
    if (rate < 70) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-green-100 dark:bg-green-900';
  };

  const getCompletionIntensity = (rate: number) => {
    if (rate === 0) return 'opacity-20';
    if (rate < 30) return 'opacity-40';
    if (rate < 70) return 'opacity-60';
    return 'opacity-80';
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePreviousMonth}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleNextMonth}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Week
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded opacity-20"></div>
              <span>No habits</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-100 dark:bg-red-900 rounded opacity-40"></div>
              <span>&lt;30%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900 rounded opacity-60"></div>
              <span>30-70%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-100 dark:bg-green-900 rounded opacity-80"></div>
              <span>&gt;70%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const dayData = getDayData(date);
                const isSelected = selectedDate?.getTime() === date.getTime();
                
                return (
                  <motion.button
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    className={`relative p-2 h-20 rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                        : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                    } ${
                      !dayData.isCurrentMonth 
                        ? 'opacity-40' 
                        : ''
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.01 }}
                  >
                    {/* Date Number */}
                    <div className={`text-sm font-medium mb-1 ${
                      dayData.isToday
                        ? 'text-primary-600 dark:text-primary-400'
                        : dayData.isCurrentMonth
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400 dark:text-gray-600'
                    }`}>
                      {format(date, 'd')}
                    </div>

                    {/* Completion Indicator */}
                    {dayData.totalHabits > 0 && (
                      <div className="absolute bottom-1 left-1 right-1">
                        <div 
                          className={`h-1.5 rounded-full ${getCompletionColor(dayData.completionRate)} ${getCompletionIntensity(dayData.completionRate)}`}
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {dayData.completedHabits}/{dayData.totalHabits}
                        </div>
                      </div>
                    )}

                    {/* Today Indicator */}
                    {dayData.isToday && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></div>
                    )}

                    {/* Perfect Day Badge */}
                    {dayData.completionRate === 100 && dayData.totalHabits > 0 && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        ✓
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Selected Date Details */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {(() => {
              const dayData = getDayData(selectedDate);
              
              if (dayData.totalHabits === 0) {
                return (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No habits scheduled for this day
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Completion Rate
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dayData.completionRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Completed
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dayData.completedHabits}/{dayData.totalHabits}
                      </p>
                    </div>
                  </div>

                  {/* Habit List */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Habits for this day:
                    </h4>
                    <div className="space-y-2">
                      {dayData.habits.map((habit) => (
                        <motion.div
                          key={habit.id}
                          className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                          whileHover={{ scale: 1.01 }}
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: habit.color }}
                          />
                          <span className="text-lg">{habit.icon}</span>
                          <span className="flex-1 text-gray-900 dark:text-white">
                            {habit.title}
                          </span>
                          {habit.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Perfect Days
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {calendarData ? Object.values(calendarData.calendarData).filter(day => day.completionRate === 100 && day.totalHabits > 0).length : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {calendarData ? Math.round(
                  Object.values(calendarData.calendarData)
                    .filter(day => day.totalHabits > 0)
                    .reduce((sum, day) => sum + day.completionRate, 0) / 
                  Math.max(1, Object.values(calendarData.calendarData).filter(day => day.totalHabits > 0).length)
                ) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <MoreHorizontal className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Days
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {calendarData ? Object.values(calendarData.calendarData).filter(day => day.totalHabits > 0).length : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}