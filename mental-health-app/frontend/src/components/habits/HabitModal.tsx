'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  Palette,
  Clock,
  Target,
  Calendar,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import { habitApi } from '@/lib/api/habits';
import { 
  Habit, 
  CreateHabitData, 
  HABIT_CATEGORIES, 
  HABIT_SUGGESTIONS,
  HabitCategory 
} from '@/types/habit';
import toast from 'react-hot-toast';

const habitSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  category: z.enum(['health', 'fitness', 'mindfulness', 'productivity', 'social', 'creativity', 'learning', 'self-care', 'nutrition', 'sleep']),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color'),
  frequency: z.enum(['daily', 'weekly', 'custom']),
  customFrequency: z.object({
    days: z.array(z.string()),
    timesPerWeek: z.number().min(1).max(7)
  }).optional(),
  targetCount: z.number().min(1, 'Target count must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  reminders: z.array(z.object({
    time: z.string(),
    enabled: z.boolean(),
    message: z.string().optional()
  })).optional(),
  moodBooster: z.boolean().optional(),
  recommendedMoods: z.array(z.string()).optional()
});

type HabitFormData = z.infer<typeof habitSchema>;

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Habit) => void;
  habit?: Habit | null;
}

const PRESET_COLORS = [
  '#48BB78', '#ED8936', '#805AD5', '#3182CE', '#38B2AC', 
  '#D53F8C', '#2D3748', '#9F7AEA', '#68D391', '#4A5568'
];

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' }
];

export default function HabitModal({ isOpen, onClose, onSave, habit }: HabitModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory>('health');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customColor, setCustomColor] = useState('#48BB78');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'health',
      icon: '🎯',
      color: '#48BB78',
      frequency: 'daily',
      targetCount: 1,
      unit: 'times',
      moodBooster: false,
      recommendedMoods: []
    }
  });

  const watchedFrequency = watch('frequency');
  const watchedCategory = watch('category');
  const watchedIcon = watch('icon');
  const watchedColor = watch('color');

  // Update form when habit changes
  useEffect(() => {
    if (habit) {
      reset({
        title: habit.title,
        description: habit.description || '',
        category: habit.category,
        icon: habit.icon,
        color: habit.color,
        frequency: habit.frequency,
        customFrequency: habit.customFrequency,
        targetCount: habit.targetCount,
        unit: habit.unit,
        reminders: habit.reminders,
        moodBooster: habit.moodBooster,
        recommendedMoods: habit.recommendedMoods
      });
      setSelectedCategory(habit.category);
      setCustomColor(habit.color);
    } else {
      reset({
        title: '',
        description: '',
        category: 'health',
        icon: '🎯',
        color: '#48BB78',
        frequency: 'daily',
        targetCount: 1,
        unit: 'times',
        moodBooster: false,
        recommendedMoods: []
      });
      setSelectedCategory('health');
      setCustomColor('#48BB78');
    }
  }, [habit, reset]);

  const onSubmit = async (data: HabitFormData) => {
    try {
      setIsSubmitting(true);
      
      if (habit) {
        // Update existing habit
        const result = await habitApi.updateHabit(habit._id, data);
        onSave(result.habit);
        toast.success('Habit updated successfully!');
      } else {
        // Create new habit
        const result = await habitApi.createHabit(data);
        onSave(result.habit);
        toast.success(`Habit created! +${result.pointsAwarded} points`, {
          icon: '🎉'
        });
        
        if (result.levelUp) {
          toast.success('Level up! 🎊', { duration: 4000 });
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save habit:', error);
      toast.error('Failed to save habit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestionSelect = (suggestion: { title: string; description: string; icon: string }) => {
    setValue('title', suggestion.title);
    setValue('description', suggestion.description);
    setValue('icon', suggestion.icon);
    setShowSuggestions(false);
  };

  const handleColorSelect = (color: string) => {
    setValue('color', color);
    setCustomColor(color);
  };

  const handleCustomFrequencyToggle = (day: string) => {
    const currentDays = watch('customFrequency.days') || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    setValue('customFrequency.days', newDays);
    setValue('customFrequency.timesPerWeek', newDays.length);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <motion.span
                className="text-3xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {watchedIcon}
              </motion.span>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {habit ? 'Edit Habit' : 'Create New Habit'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {habit ? 'Update your habit details' : 'Build a healthy routine'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Basic Information
              </h3>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Habit Title *
                </label>
                <div className="flex space-x-2">
                  <input
                    {...register('title')}
                    className="input flex-1"
                    placeholder="e.g., Morning meditation"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="btn btn-secondary px-3"
                  >
                    💡
                  </button>
                </div>
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
                
                {/* Suggestions */}
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Suggestions for {HABIT_CATEGORIES[watchedCategory]?.label}:
                    </p>
                    <div className="space-y-1">
                      {HABIT_SUGGESTIONS[watchedCategory]?.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className="w-full text-left p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded flex items-center space-x-2"
                        >
                          <span>{suggestion.icon}</span>
                          <span>{suggestion.title}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  className="input resize-none"
                  rows={3}
                  placeholder="Optional description of your habit..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(HABIT_CATEGORIES).map(([key, category]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setValue('category', key as HabitCategory);
                        setSelectedCategory(key as HabitCategory);
                      }}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        watchedCategory === key
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-lg">{category.icon}</span>
                        <span>{category.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Appearance
              </h3>
              
              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon *
                </label>
                <input
                  {...register('icon')}
                  className="input w-20 text-center text-2xl"
                  placeholder="🎯"
                />
                {errors.icon && (
                  <p className="text-red-500 text-sm mt-1">{errors.icon.message}</p>
                )}
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color *
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorSelect(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          watchedColor === color
                            ? 'border-gray-900 dark:border-white scale-110'
                            : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Palette className="h-4 w-4 text-gray-400" />
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => handleColorSelect(e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Frequency & Goals */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Frequency & Goals
              </h3>
              
              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequency *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['daily', 'weekly', 'custom'].map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setValue('frequency', freq as any)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors capitalize ${
                        watchedFrequency === freq
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Frequency Days */}
              {watchedFrequency === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Days
                  </label>
                  <div className="flex space-x-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = watch('customFrequency.days')?.includes(day.key) || false;
                      return (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => handleCustomFrequencyToggle(day.key)}
                          className={`w-12 h-12 rounded-full border-2 text-sm font-medium transition-colors ${
                            isSelected
                              ? 'border-primary-500 bg-primary-500 text-white'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Target Count */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Count *
                  </label>
                  <input
                    {...register('targetCount', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="input"
                    placeholder="1"
                  />
                  {errors.targetCount && (
                    <p className="text-red-500 text-sm mt-1">{errors.targetCount.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit *
                  </label>
                  <input
                    {...register('unit')}
                    className="input"
                    placeholder="times"
                  />
                  {errors.unit && (
                    <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Advanced Options
              </h3>
              
              {/* Mood Booster */}
              <div className="flex items-center space-x-3">
                <input
                  {...register('moodBooster')}
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recommend when mood is low
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="btn btn-primary flex items-center space-x-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>{habit ? 'Update Habit' : 'Create Habit'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}