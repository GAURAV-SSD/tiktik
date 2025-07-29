const mongoose = require('mongoose');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const User = require('../models/User');
require('dotenv').config();

const sampleHabits = [
  {
    title: 'Morning Meditation',
    description: '10 minutes of mindful meditation to start the day',
    category: 'mindfulness',
    icon: '🧘',
    color: '#805AD5',
    frequency: 'daily',
    targetCount: 1,
    unit: 'session',
    moodBooster: true,
    recommendedMoods: ['sad', 'anxious'],
    reminders: [{
      time: '07:00',
      enabled: true,
      message: 'Time for your morning meditation! 🧘'
    }]
  },
  {
    title: 'Drink Water',
    description: 'Stay hydrated throughout the day',
    category: 'health',
    icon: '💧',
    color: '#3182CE',
    frequency: 'daily',
    targetCount: 8,
    unit: 'glasses',
    reminders: [
      { time: '09:00', enabled: true, message: 'Time to drink water! 💧' },
      { time: '12:00', enabled: true, message: 'Lunch time hydration! 💧' },
      { time: '15:00', enabled: true, message: 'Afternoon water break! 💧' },
      { time: '18:00', enabled: true, message: 'Evening hydration! 💧' }
    ]
  },
  {
    title: 'Exercise',
    description: '30 minutes of physical activity',
    category: 'fitness',
    icon: '🏋️',
    color: '#ED8936',
    frequency: 'daily',
    targetCount: 30,
    unit: 'minutes',
    moodBooster: true,
    recommendedMoods: ['sad', 'anxious'],
    reminders: [{
      time: '17:00',
      enabled: true,
      message: 'Time to get moving! 🏋️'
    }]
  },
  {
    title: 'Read Books',
    description: 'Read for personal development and relaxation',
    category: 'learning',
    icon: '📚',
    color: '#2D3748',
    frequency: 'daily',
    targetCount: 30,
    unit: 'minutes',
    reminders: [{
      time: '21:00',
      enabled: true,
      message: 'Time for some reading! 📚'
    }]
  },
  {
    title: 'Gratitude Journal',
    description: 'Write down 3 things you\'re grateful for',
    category: 'mindfulness',
    icon: '📝',
    color: '#48BB78',
    frequency: 'daily',
    targetCount: 3,
    unit: 'items',
    moodBooster: true,
    recommendedMoods: ['sad', 'neutral'],
    reminders: [{
      time: '22:00',
      enabled: true,
      message: 'Time to reflect on gratitude! 📝'
    }]
  },
  {
    title: 'Call Family',
    description: 'Stay connected with loved ones',
    category: 'social',
    icon: '📞',
    color: '#38B2AC',
    frequency: 'weekly',
    targetCount: 1,
    unit: 'call',
    moodBooster: true,
    recommendedMoods: ['sad', 'neutral'],
    reminders: [{
      time: '19:00',
      enabled: true,
      message: 'Time to call family! 📞'
    }]
  },
  {
    title: 'Creative Writing',
    description: 'Express yourself through writing',
    category: 'creativity',
    icon: '✍️',
    color: '#D53F8C',
    frequency: 'custom',
    customFrequency: {
      days: ['monday', 'wednesday', 'friday'],
      timesPerWeek: 3
    },
    targetCount: 1,
    unit: 'session',
    reminders: [{
      time: '20:00',
      enabled: true,
      message: 'Time for creative writing! ✍️'
    }]
  },
  {
    title: 'Healthy Breakfast',
    description: 'Start the day with nutritious food',
    category: 'nutrition',
    icon: '🍳',
    color: '#68D391',
    frequency: 'daily',
    targetCount: 1,
    unit: 'meal',
    reminders: [{
      time: '08:00',
      enabled: true,
      message: 'Time for a healthy breakfast! 🍳'
    }]
  },
  {
    title: 'Deep Breathing',
    description: '5 minutes of deep breathing exercises',
    category: 'mindfulness',
    icon: '🌬️',
    color: '#9F7AEA',
    frequency: 'daily',
    targetCount: 2,
    unit: 'sessions',
    moodBooster: true,
    recommendedMoods: ['anxious', 'sad'],
    reminders: [
      { time: '12:00', enabled: true, message: 'Midday breathing break! 🌬️' },
      { time: '16:00', enabled: true, message: 'Afternoon calm moment! 🌬️' }
    ]
  },
  {
    title: 'Skincare Routine',
    description: 'Take care of your skin',
    category: 'self-care',
    icon: '🧴',
    color: '#ED8936',
    frequency: 'daily',
    targetCount: 2,
    unit: 'times',
    reminders: [
      { time: '07:30', enabled: true, message: 'Morning skincare! 🧴' },
      { time: '22:30', enabled: true, message: 'Evening skincare! 🧴' }
    ]
  }
];

const generateCompletions = (habitId, userId, daysBack = 30) => {
  const completions = [];
  const today = new Date();
  
  for (let i = 0; i < daysBack; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // 70% chance of completion for realistic data
    if (Math.random() < 0.7) {
      const completion = {
        habit: habitId,
        user: userId,
        completedAt: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          Math.floor(Math.random() * 12) + 8, // Random hour between 8-19
          Math.floor(Math.random() * 60) // Random minute
        ),
        completionDate: date.toISOString().split('T')[0],
        count: 1,
        targetCount: 1,
        effortLevel: Math.floor(Math.random() * 5) + 1,
        satisfactionLevel: Math.floor(Math.random() * 5) + 1,
        moodAtTime: ['happy', 'neutral', 'sad', 'anxious'][Math.floor(Math.random() * 4)],
        source: 'manual'
      };
      
      // Calculate streak at time of completion (simplified)
      completion.streakAtCompletion = Math.floor(Math.random() * 10) + 1;
      
      completions.push(completion);
    }
  }
  
  return completions;
};

const seedHabits = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a test user (create one if doesn't exist)
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      testUser = await User.create({
        email: 'test@example.com',
        password: 'password123', // This will be hashed by the pre-save hook
        role: 'patient',
        username: 'TestUser',
        isVerified: true,
        isApproved: true,
        patientInfo: {
          anonymousId: 'patient_' + Date.now(),
          emergencyContact: {
            name: 'Emergency Contact',
            phone: '+1234567890',
            relationship: 'Friend'
          }
        }
      });
      console.log('Created test user');
    }

    // Clear existing habits and completions for the test user
    await Habit.deleteMany({ user: testUser._id });
    await HabitCompletion.deleteMany({ user: testUser._id });
    console.log('Cleared existing data');

    // Create habits
    const createdHabits = [];
    for (const habitData of sampleHabits) {
      const habit = await Habit.create({
        ...habitData,
        user: testUser._id
      });
      
      // Generate some random completions for the past 30 days
      const completions = generateCompletions(habit._id, testUser._id, 30);
      
      if (completions.length > 0) {
        await HabitCompletion.insertMany(completions);
        
        // Update habit statistics
        habit.totalCompletions = completions.length;
        habit.currentStreak = Math.floor(Math.random() * 15) + 1;
        habit.longestStreak = Math.max(habit.currentStreak, Math.floor(Math.random() * 25) + 1);
        
        // Update statistics
        habit.statistics.weeklyCompletionRate = Math.floor(Math.random() * 40) + 60;
        habit.statistics.monthlyCompletionRate = Math.floor(Math.random() * 30) + 70;
        habit.statistics.averageCompletionTime = `${Math.floor(Math.random() * 12) + 8}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
        
        await habit.save();
      }
      
      createdHabits.push(habit);
    }

    console.log(`Created ${createdHabits.length} habits with completion data`);
    
    // Create a doctor user for testing
    let doctorUser = await User.findOne({ email: 'doctor@example.com' });
    
    if (!doctorUser) {
      doctorUser = await User.create({
        email: 'doctor@example.com',
        password: 'password123',
        role: 'doctor',
        username: 'Dr. Smith',
        isVerified: true,
        isApproved: true,
        profile: {
          specialization: 'Mental Health',
          experience: 10,
          languages: ['English']
        },
        doctorInfo: {
          medicalLicense: 'MD123456',
          consultationFee: 100,
          availability: {
            monday: { available: true, slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            tuesday: { available: true, slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            wednesday: { available: true, slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            thursday: { available: true, slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            friday: { available: true, slots: ['09:00', '10:00', '11:00'] },
            saturday: { available: false, slots: [] },
            sunday: { available: false, slots: [] }
          }
        }
      });
      console.log('Created test doctor user');
    }

    console.log('\n✅ Seed data created successfully!');
    console.log('\nTest Accounts:');
    console.log('Patient: test@example.com / password123');
    console.log('Doctor: doctor@example.com / password123');
    console.log('\nYou can now test the habit tracker with realistic data.');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedHabits();
}

module.exports = { seedHabits, sampleHabits };