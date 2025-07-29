'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Award,
  Flame,
  Clock,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { habitApi } from '@/lib/api/habits';
import { Habit, HabitStats as HabitStatsType } from '@/types/habit';
import { HABIT_CATEGORIES } from '@/types/habit';

interface HabitStatsProps {
  habits: Habit[];
}

interface StatsData {
  categoryDistribution: Array<{ name: string; value: number; color: string }>;
  weeklyTrends: Array<{ week: string; completions: number; rate: number }>;
  bestPerformingHabits: Array<{ name: string; rate: number; streak: number }>;
  timeAnalysis: Array<{ hour: string; completions: number }>;
  streakData: Array<{ habit: string; current: number; best: number }>;
}

const COLORS = ['#48BB78', '#ED8936', '#805AD5', '#3182CE', '#38B2AC', '#D53F8C', '#2D3748', '#9F7AEA', '#68D391', '#4A5568'];

export default function HabitStats({ habits }: HabitStatsProps) {
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [habitStats, setHabitStats] = useState<HabitStatsType | null>(null);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<30 | 60 | 90>(30);

  useEffect(() => {
    generateStatsData();
  }, [habits, timeRange]);

  const generateStatsData = async () => {
    if (habits.length === 0) return;

    try {
      setLoading(true);

      // Category distribution
      const categoryCount: Record<string, number> = {};
      habits.forEach(habit => {
        categoryCount[habit.category] = (categoryCount[habit.category] || 0) + 1;
      });

      const categoryDistribution = Object.entries(categoryCount).map(([category, count]) => ({
        name: HABIT_CATEGORIES[category as keyof typeof HABIT_CATEGORIES]?.label || category,
        value: count,
        color: HABIT_CATEGORIES[category as keyof typeof HABIT_CATEGORIES]?.color || '#48BB78'
      }));

      // Weekly trends (mock data - in real app this would come from API)
      const weeklyTrends = Array.from({ length: 8 }, (_, i) => ({
        week: `Week ${i + 1}`,
        completions: Math.floor(Math.random() * 50) + 20,
        rate: Math.floor(Math.random() * 40) + 60
      }));

      // Best performing habits
      const bestPerformingHabits = habits
        .sort((a, b) => (b.statistics?.weeklyCompletionRate || 0) - (a.statistics?.weeklyCompletionRate || 0))
        .slice(0, 5)
        .map(habit => ({
          name: habit.title,
          rate: habit.statistics?.weeklyCompletionRate || 0,
          streak: habit.currentStreak
        }));

      // Time analysis (mock data)
      const timeAnalysis = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        completions: Math.floor(Math.random() * 10)
      }));

      // Streak data
      const streakData = habits.slice(0, 10).map(habit => ({
        habit: habit.title,
        current: habit.currentStreak,
        best: habit.longestStreak
      }));

      setStatsData({
        categoryDistribution,
        weeklyTrends,
        bestPerformingHabits,
        timeAnalysis,
        streakData
      });
    } catch (error) {
      console.error('Failed to generate stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHabitStats = async (habit: Habit) => {
    try {
      setLoading(true);
      const stats = await habitApi.getHabitStats(habit._id, timeRange);
      setHabitStats(stats);
      setSelectedHabit(habit);
    } catch (error) {
      console.error('Failed to load habit stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'rate') return [`${value}%`, 'Completion Rate'];
    if (name === 'completions') return [value, 'Completions'];
    return [value, name];
  };

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Statistics Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Create some habits to see your analytics and progress.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Habit Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Insights into your habit patterns and progress
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value) as 30 | 60 | 90)}
            className="input py-2 px-3 text-sm"
          >
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          className="card p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Habits
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {habits.length}
              </p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          className="card p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Streaks
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {habits.filter(h => h.currentStreak > 0).length}
              </p>
            </div>
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
        </motion.div>

        <motion.div
          className="card p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Best Streak
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.max(...habits.map(h => h.longestStreak), 0)}
              </p>
            </div>
            <Award className="h-8 w-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          className="card p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Completions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {habits.reduce((sum, h) => sum + h.totalCompletions, 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Habits by Category
            </h3>
            <PieChartIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          {statsData?.categoryDistribution && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsData.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statsData.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Weekly Trends */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Weekly Progress
            </h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          
          {statsData?.weeklyTrends && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statsData.weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={formatTooltipValue} />
                  <Line 
                    type="monotone" 
                    dataKey="completions" 
                    stroke="#48BB78" 
                    strokeWidth={2}
                    dot={{ fill: '#48BB78' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#805AD5" 
                    strokeWidth={2}
                    dot={{ fill: '#805AD5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Best Performing Habits */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Performing Habits
            </h3>
            <Award className="h-5 w-5 text-gray-400" />
          </div>
          
          {statsData?.bestPerformingHabits && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData.bestPerformingHabits} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                  <Bar dataKey="rate" fill="#48BB78" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Time Analysis */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Completion Times
            </h3>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          
          {statsData?.timeAnalysis && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData.timeAnalysis.filter((_, i) => i % 2 === 0)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completions" fill="#3182CE" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Habit List with Quick Stats */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Individual Habit Performance
          </h3>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {habits.map((habit) => (
            <motion.div
              key={habit._id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              whileHover={{ scale: 1.01 }}
              onClick={() => loadHabitStats(habit)}
            >
              <div className="flex items-center space-x-4">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
                <span className="text-2xl">{habit.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {habit.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {HABIT_CATEGORIES[habit.category]?.label}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {habit.currentStreak}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Current
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {habit.longestStreak}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Best
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {habit.totalCompletions}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Total
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {habit.statistics?.weeklyCompletionRate || 0}%
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Weekly
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed Habit Stats Modal/Section */}
      {selectedHabit && habitStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{selectedHabit.icon}</span>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedHabit.title} - Detailed Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Last {timeRange} days
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedHabit(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {habitStats.statistics.totalCompletions}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Completions
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {habitStats.statistics.averageEffort.toFixed(1)}/5
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg Effort
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {habitStats.statistics.averageSatisfaction.toFixed(1)}/5
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg Satisfaction
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {habitStats.insights.bestDay}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Best Day
              </p>
            </div>
          </div>

          {/* Weekly Progress Chart */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Weekly Progress
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={habitStats.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="rate" fill={selectedHabit.color} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              💡 Insights
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Your best completion day is {habitStats.insights.bestDay}</li>
              <li>• Current streak record: {habitStats.insights.streakRecord} days</li>
              <li>• Average completion rate: {habitStats.insights.averageCompletionRate}%</li>
              <li>• You've been tracking this habit for {habitStats.insights.totalDays} days</li>
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}