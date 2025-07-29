'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  BarChart3, 
  Target, 
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import { habitApi, syncOfflineData, isOnline } from '@/lib/api/habits';
import { Habit, HabitDashboard, HABIT_CATEGORIES } from '@/types/habit';
import HabitCard from '@/components/habits/HabitCard';
import HabitCalendar from '@/components/habits/HabitCalendar';
import HabitModal from '@/components/habits/HabitModal';
import HabitStats from '@/components/habits/HabitStats';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

type ViewMode = 'dashboard' | 'calendar' | 'stats';
type LayoutMode = 'grid' | 'list';

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [dashboard, setDashboard] = useState<HabitDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isOnlineStatus, setIsOnlineStatus] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
    checkOnlineStatus();

    // Set up online/offline listeners
    const handleOnline = () => {
      setIsOnlineStatus(true);
      syncOfflineData().then(() => {
        toast.success('Offline data synced!');
        loadData();
      });
    };

    const handleOffline = () => {
      setIsOnlineStatus(false);
      toast('You\'re offline. Changes will be saved locally.', {
        icon: '📱',
        duration: 3000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkOnlineStatus = () => {
    setIsOnlineStatus(isOnline());
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [habitsData, dashboardData] = await Promise.all([
        habitApi.getHabits(),
        habitApi.getDashboardSummary()
      ]);
      
      setHabits(habitsData.habits);
      setDashboard(dashboardData);
    } catch (error) {
      console.error('Failed to load habits:', error);
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = () => {
    setSelectedHabit(null);
    setIsModalOpen(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setSelectedHabit(habit);
    setIsModalOpen(true);
  };

  const handleHabitSaved = (habit: Habit) => {
    if (selectedHabit) {
      // Update existing habit
      setHabits(prev => prev.map(h => h._id === habit._id ? habit : h));
    } else {
      // Add new habit
      setHabits(prev => [habit, ...prev]);
    }
    
    // Reload dashboard to update stats
    loadData();
    setIsModalOpen(false);
  };

  const handleCompleteHabit = async (habitId: string, completed: boolean) => {
    try {
      if (completed) {
        const result = await habitApi.completeHabit(habitId);
        toast.success(`Habit completed! +${result.pointsAwarded} points`, {
          icon: '🎉'
        });
        
        if (result.levelUp) {
          toast.success('Level up! 🎊', { duration: 4000 });
        }
      } else {
        await habitApi.undoCompletion(habitId);
        toast.success('Completion removed');
      }
      
      // Update local state
      setHabits(prev => prev.map(habit => 
        habit._id === habitId 
          ? { 
              ...habit, 
              todayStatus: { 
                ...habit.todayStatus!, 
                completed 
              } 
            }
          : habit
      ));
      
      // Reload dashboard
      loadData();
    } catch (error) {
      console.error('Failed to update habit:', error);
      toast.error('Failed to update habit');
    }
  };

  const filteredHabits = filterCategory === 'all' 
    ? habits 
    : habits.filter(habit => habit.category === filterCategory);

  const todayHabits = habits.filter(habit => {
    // Simple check - in a real app, this would use the isDueToday utility
    return habit.isActive;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Habit Tracker
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Build healthy routines, one day at a time
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Online/Offline indicator */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isOnlineStatus 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isOnlineStatus ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span>{isOnlineStatus ? 'Online' : 'Offline'}</span>
              </div>
              
              <button
                onClick={handleCreateHabit}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Habit</span>
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-6 mt-6">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'dashboard'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Target className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span>Calendar</span>
            </button>
            
            <button
              onClick={() => setViewMode('stats')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'stats'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {viewMode === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats Cards */}
              {dashboard && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <motion.div
                    className="card p-6"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Today's Progress
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {dashboard.summary.todayCompleted}/{dashboard.summary.todayCompleted + dashboard.summary.todayRemaining}
                        </p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${((dashboard.summary.todayCompleted / (dashboard.summary.todayCompleted + dashboard.summary.todayRemaining)) * 100) || 0}%` 
                          }}
                        />
                      </div>
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
                          Weekly Rate
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {dashboard.summary.weeklyCompletionRate}%
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-500" />
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
                          {dashboard.summary.bestStreak.streak}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {dashboard.summary.bestStreak.habit}
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
                          Points This Week
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {dashboard.summary.totalPointsThisWeek}
                        </p>
                      </div>
                      <Trophy className="h-8 w-8 text-yellow-500" />
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Filters and Layout Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="input py-2 px-3 text-sm"
                    >
                      <option value="all">All Categories</option>
                      {Object.entries(HABIT_CATEGORIES).map(([key, category]) => (
                        <option key={key} value={key}>
                          {category.icon} {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setLayoutMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      layoutMode === 'grid'
                        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <Grid3X3 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setLayoutMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      layoutMode === 'list'
                        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Today's Habits */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Today's Habits
                </h2>
                
                {todayHabits.length === 0 ? (
                  <div className="card p-8 text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No habits for today
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Create your first habit to start building healthy routines.
                    </p>
                    <button
                      onClick={handleCreateHabit}
                      className="btn btn-primary"
                    >
                      Create Your First Habit
                    </button>
                  </div>
                ) : (
                  <div className={`grid gap-4 ${
                    layoutMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {filteredHabits.map((habit, index) => (
                      <motion.div
                        key={habit._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <HabitCard
                          habit={habit}
                          onComplete={handleCompleteHabit}
                          onEdit={handleEditHabit}
                          layout={layoutMode}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {viewMode === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HabitCalendar habits={habits} />
            </motion.div>
          )}

          {viewMode === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HabitStats habits={habits} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Habit Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleHabitSaved}
        habit={selectedHabit}
      />
    </div>
  );
}