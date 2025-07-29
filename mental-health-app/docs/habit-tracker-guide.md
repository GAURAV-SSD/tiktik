# Habit Tracker Feature Guide

## Overview

The Habit Tracker is a comprehensive feature designed to help users build healthy routines, track their progress, and stay motivated on their mental health journey. It includes habit management, progress visualization, gamification, and integration with the mood tracking system.

## Features

### 🎯 Core Functionality

#### Habit Management
- **Create Habits**: Add new habits with customizable icons, colors, and descriptions
- **Flexible Scheduling**: Support for daily, weekly, and custom frequency patterns
- **Categories**: Organize habits across 10 categories (health, fitness, mindfulness, etc.)
- **Goal Setting**: Set target counts and units for each habit
- **Reminders**: Configure multiple reminders per habit with custom messages

#### Progress Tracking
- **Completion Tracking**: Mark habits as complete with optional notes and effort ratings
- **Streak Calculation**: Automatic streak tracking with current and longest streak records
- **Progress Visualization**: Progress bars and completion percentages
- **Historical Data**: Complete history of all habit completions

### 📊 Analytics & Insights

#### Dashboard Views
- **Today's Habits**: Quick overview of habits due today
- **Weekly Summary**: Completion rates and progress metrics
- **Monthly Statistics**: Long-term trends and patterns
- **Personal Records**: Best streaks and achievement highlights

#### Data Visualization
- **Calendar View**: Monthly calendar showing completion patterns
- **Charts & Graphs**: 
  - Category distribution (pie chart)
  - Weekly progress trends (line chart)
  - Best performing habits (bar chart)
  - Completion time analysis (bar chart)
- **Individual Habit Analytics**: Detailed stats for each habit

### 🏆 Gamification

#### Rewards System
- **Points**: Earn points for completing habits (10 base + bonuses)
- **Streak Badges**: Special badges for 7-day and 30-day streaks
- **Achievement Levels**: Progress through levels based on total points
- **Visual Feedback**: Animated celebrations for completions and milestones

#### Motivation Features
- **Streak Flames**: Visual streak indicators with emoji progression
- **Perfect Day Badges**: Special recognition for 100% completion days
- **Progress Celebrations**: Animated feedback for achievements

### 🧠 Mental Health Integration

#### Mood-Based Recommendations
- **Smart Suggestions**: Habits recommended based on current mood
- **Mood Boosters**: Habits specifically marked as mood-improving
- **Crisis Support**: Integration with crisis detection for habit recommendations

#### Therapeutic Benefits
- **Routine Building**: Structured approach to establishing healthy routines
- **Progress Awareness**: Visual feedback on personal growth
- **Positive Reinforcement**: Celebration of small wins and consistency

### 📱 User Experience

#### Responsive Design
- **Mobile-First**: Optimized for mobile usage patterns
- **Touch-Friendly**: Large touch targets and intuitive gestures
- **Dark Mode**: Full dark mode support for comfortable viewing

#### Animations & Interactions
- **Framer Motion**: Smooth animations throughout the interface
- **Micro-Interactions**: Delightful feedback for user actions
- **Loading States**: Elegant loading indicators and skeleton screens

#### Offline Support
- **Local Storage**: Habits cached locally for offline access
- **Sync on Reconnect**: Automatic synchronization when connection is restored
- **Offline Indicators**: Clear indication of online/offline status

## Technical Architecture

### Backend Components

#### Database Models
```javascript
// Habit Model
{
  title: String,
  description: String,
  category: String,
  frequency: 'daily' | 'weekly' | 'custom',
  customFrequency: { days: [String], timesPerWeek: Number },
  targetCount: Number,
  currentStreak: Number,
  longestStreak: Number,
  totalCompletions: Number,
  // ... additional fields
}

// HabitCompletion Model
{
  habit: ObjectId,
  user: ObjectId,
  completionDate: String, // YYYY-MM-DD
  count: Number,
  effortLevel: Number,
  satisfactionLevel: Number,
  streakAtCompletion: Number,
  // ... additional fields
}
```

#### API Endpoints
- `GET /api/habits` - Get user's habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Archive habit
- `POST /api/habits/:id/complete` - Mark habit complete
- `DELETE /api/habits/:id/complete` - Undo completion
- `GET /api/habits/:id/stats` - Get habit analytics
- `GET /api/habits/calendar/range` - Get calendar data
- `GET /api/habits/dashboard/summary` - Get dashboard summary

### Frontend Components

#### Component Structure
```
src/components/habits/
├── HabitCard.tsx          # Individual habit display
├── HabitModal.tsx         # Create/edit habit modal
├── HabitCalendar.tsx      # Calendar view component
├── HabitStats.tsx         # Analytics dashboard
└── LoadingSpinner.tsx     # Reusable loading component
```

#### State Management
- **Zustand**: Lightweight state management for habit data
- **React Query**: Server state management and caching
- **Local Storage**: Offline data persistence

#### Key Features Implementation
- **Form Validation**: Zod schemas with React Hook Form
- **Chart Library**: Recharts for data visualization
- **Date Handling**: date-fns for calendar operations
- **Animations**: Framer Motion for smooth transitions

## Usage Guide

### For Users

#### Getting Started
1. **Create Your First Habit**
   - Click "Add Habit" button
   - Choose from suggestions or create custom habit
   - Set frequency and target goals
   - Configure reminders (optional)

2. **Daily Usage**
   - View today's habits on dashboard
   - Mark habits complete as you do them
   - Add notes and rate your effort/satisfaction
   - Check your progress and streaks

3. **Track Progress**
   - Use calendar view to see completion patterns
   - Review analytics to understand your habits
   - Celebrate streaks and achievements
   - Adjust habits based on insights

#### Best Practices
- **Start Small**: Begin with 2-3 simple habits
- **Be Consistent**: Focus on daily completion over perfection
- **Use Categories**: Organize habits for better overview
- **Set Reminders**: Use notifications to build routine
- **Review Regularly**: Check analytics weekly for insights

### For Developers

#### Adding New Features
1. **Backend Changes**
   - Update models in `src/models/`
   - Add API endpoints in `src/routes/habits.js`
   - Update validation schemas

2. **Frontend Changes**
   - Add new components in `src/components/habits/`
   - Update types in `src/types/habit.ts`
   - Extend API client in `src/lib/api/habits.ts`

#### Testing
```bash
# Backend
npm test

# Frontend
npm run test

# Seed test data
npm run seed:habits
```

#### Deployment Considerations
- **Database Indexes**: Ensure proper indexing for performance
- **Caching**: Implement Redis caching for frequently accessed data
- **Rate Limiting**: Configure rate limits for API endpoints
- **Monitoring**: Set up logging and error tracking

## API Reference

### Authentication
All habit endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Error Handling
Standard error response format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Rate Limits
- General API: 100 requests per 15 minutes
- Habit completion: 30 requests per minute
- Analytics endpoints: 20 requests per minute

## Performance Optimizations

### Backend
- **Database Indexes**: Optimized queries with proper indexing
- **Aggregation Pipelines**: Efficient data aggregation for analytics
- **Caching**: Redis caching for frequently accessed data
- **Pagination**: Paginated responses for large datasets

### Frontend
- **Code Splitting**: Lazy loading of habit components
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtual Scrolling**: For large habit lists
- **Image Optimization**: Optimized icons and graphics

## Security Considerations

### Data Protection
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against abuse
- **Authentication**: JWT-based authentication
- **Authorization**: Resource ownership verification

### Privacy
- **Data Minimization**: Only collect necessary data
- **Encryption**: Sensitive data encrypted at rest
- **Audit Logs**: Track data access and modifications
- **GDPR Compliance**: Data export and deletion capabilities

## Future Enhancements

### Planned Features
- **Social Features**: Share progress with friends
- **Advanced Analytics**: Machine learning insights
- **Integration**: Connect with fitness trackers
- **Challenges**: Community challenges and competitions
- **AI Coaching**: Personalized habit recommendations

### Technical Improvements
- **Real-time Updates**: WebSocket integration
- **Progressive Web App**: Enhanced mobile experience
- **Advanced Caching**: More sophisticated caching strategies
- **Performance Monitoring**: Real-time performance tracking

## Troubleshooting

### Common Issues

#### Habits Not Syncing
1. Check internet connection
2. Verify authentication token
3. Clear local storage and re-login
4. Check browser console for errors

#### Calendar Not Loading
1. Verify date range parameters
2. Check API endpoint availability
3. Clear browser cache
4. Ensure proper permissions

#### Streaks Not Calculating
1. Verify habit frequency settings
2. Check completion date format
3. Review streak calculation logic
4. Ensure timezone consistency

### Debug Mode
Enable debug mode by setting `NODE_ENV=development` and checking browser console for detailed logs.

## Support

For technical support or feature requests:
- Create an issue in the project repository
- Contact the development team
- Check the FAQ section in the main documentation

---

*This guide covers the complete Habit Tracker feature. For additional information, refer to the main project documentation and API reference.*