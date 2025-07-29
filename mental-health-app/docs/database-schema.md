# Database Schema Documentation

## Overview
This document outlines the complete database schema for the Depression Management Web Application using MongoDB with Mongoose ODM.

## Collections

### 1. Users Collection

```javascript
{
  _id: ObjectId,
  email: String, // unique, required
  password: String, // hashed with bcrypt
  role: String, // enum: ['patient', 'doctor', 'admin']
  username: String, // anonymous for patients, real name for doctors
  isVerified: Boolean, // for email verification
  isApproved: Boolean, // for doctor approval by admin
  
  // Profile Information
  profile: {
    avatar: String, // URL to profile image
    bio: String,
    specialization: String, // for doctors only
    experience: Number, // years of experience for doctors
    languages: [String],
    timezone: String
  },
  
  // Doctor-specific fields
  doctorInfo: {
    medicalLicense: String, // license number
    certificate: {
      url: String, // Cloudinary URL
      publicId: String, // Cloudinary public ID
      uploadedAt: Date
    },
    consultationFee: Number,
    availableHours: [{
      day: String, // 'monday', 'tuesday', etc.
      startTime: String, // '09:00'
      endTime: String // '17:00'
    }]
  },
  
  // Patient-specific fields
  patientInfo: {
    anonymousId: String, // generated unique anonymous identifier
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    },
    preferences: {
      reminderTime: String, // preferred time for daily reminders
      categories: [String] // preferred forum categories
    }
  },
  
  // Gamification
  gamification: {
    points: Number, // default: 0
    level: Number, // default: 1
    badges: [{
      name: String,
      description: String,
      earnedAt: Date,
      icon: String
    }],
    streaks: {
      mood: Number, // consecutive days of mood tracking
      habits: Number, // consecutive days of habit completion
      forum: Number // consecutive days of forum participation
    }
  },
  
  // Settings
  settings: {
    theme: String, // 'light', 'dark'
    accessibility: {
      highContrast: Boolean,
      largeFonts: Boolean,
      reducedMotion: Boolean
    },
    notifications: {
      email: Boolean,
      push: Boolean,
      habitReminders: Boolean,
      moodReminders: Boolean,
      chatMessages: Boolean
    },
    privacy: {
      showOnlineStatus: Boolean,
      allowDirectMessages: Boolean
    }
  },
  
  // Metadata
  lastActive: Date,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date // soft delete
}
```

### 2. Forum Posts Collection

```javascript
{
  _id: ObjectId,
  title: String, // required
  content: String, // required
  author: ObjectId, // ref: 'User'
  authorType: String, // 'patient', 'doctor'
  category: String, // enum: ['depression', 'anxiety', 'motivation', 'lifestyle', 'general']
  tags: [String],
  
  // Engagement
  votes: {
    upvotes: [ObjectId], // array of user IDs who upvoted
    downvotes: [ObjectId], // array of user IDs who downvoted
    score: Number // upvotes.length - downvotes.length
  },
  
  // Content flags
  isAnonymous: Boolean, // default: true for patients
  isPinned: Boolean, // default: false
  isLocked: Boolean, // default: false
  isFeatured: Boolean, // default: false
  
  // Moderation
  reports: [{
    reportedBy: ObjectId, // ref: 'User'
    reason: String,
    description: String,
    reportedAt: Date,
    status: String // 'pending', 'resolved', 'dismissed'
  }],
  
  // Metadata
  viewCount: Number, // default: 0
  commentCount: Number, // default: 0
  lastActivity: Date,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
}
```

### 3. Forum Comments Collection

```javascript
{
  _id: ObjectId,
  content: String, // required
  author: ObjectId, // ref: 'User'
  authorType: String, // 'patient', 'doctor'
  post: ObjectId, // ref: 'ForumPost'
  parentComment: ObjectId, // ref: 'ForumComment' for nested replies
  
  // Engagement
  votes: {
    upvotes: [ObjectId],
    downvotes: [ObjectId],
    score: Number
  },
  
  // Content flags
  isAnonymous: Boolean,
  isBestAnswer: Boolean, // marked by post author or moderator
  
  // Moderation
  reports: [{
    reportedBy: ObjectId,
    reason: String,
    description: String,
    reportedAt: Date,
    status: String
  }],
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
}
```

### 4. Conversations Collection

```javascript
{
  _id: ObjectId,
  participants: [{
    user: ObjectId, // ref: 'User'
    role: String, // 'patient', 'doctor'
    joinedAt: Date,
    leftAt: Date
  }],
  
  // Conversation metadata
  type: String, // 'direct', 'group' (future feature)
  title: String, // optional conversation title
  description: String,
  
  // Settings
  isEncrypted: Boolean, // default: true
  encryptionKey: String, // for E2E encryption
  
  // Status
  isActive: Boolean, // default: true
  isArchived: Boolean, // default: false
  
  // Last message info (for quick access)
  lastMessage: {
    content: String,
    sender: ObjectId,
    sentAt: Date,
    messageType: String
  },
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Messages Collection

```javascript
{
  _id: ObjectId,
  conversation: ObjectId, // ref: 'Conversation'
  sender: ObjectId, // ref: 'User'
  
  // Message content
  content: String, // encrypted if conversation.isEncrypted
  messageType: String, // 'text', 'image', 'file', 'system'
  
  // File attachments
  attachments: [{
    type: String, // 'image', 'document', 'audio'
    url: String,
    filename: String,
    size: Number,
    mimeType: String
  }],
  
  // Message status
  isEdited: Boolean, // default: false
  editedAt: Date,
  isDeleted: Boolean, // default: false
  deletedAt: Date,
  
  // Read receipts
  readBy: [{
    user: ObjectId,
    readAt: Date
  }],
  
  // Reply information
  replyTo: ObjectId, // ref: 'Message'
  
  // Crisis detection
  flaggedForCrisis: Boolean, // default: false
  crisisKeywords: [String],
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Habits Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId, // ref: 'User'
  
  // Habit details
  title: String, // required
  description: String,
  category: String, // 'health', 'productivity', 'social', 'mindfulness', 'exercise'
  icon: String, // icon name or emoji
  color: String, // hex color code
  
  // Scheduling
  frequency: String, // 'daily', 'weekly', 'custom'
  customFrequency: {
    days: [String], // ['monday', 'wednesday', 'friday']
    times: [String] // ['09:00', '18:00']
  },
  
  // Goal and tracking
  targetCount: Number, // daily target (e.g., 8 glasses of water)
  unit: String, // 'times', 'minutes', 'hours', 'glasses', etc.
  
  // Progress tracking
  currentStreak: Number, // default: 0
  longestStreak: Number, // default: 0
  totalCompletions: Number, // default: 0
  
  // Reminders
  reminders: [{
    time: String, // '09:00'
    enabled: Boolean,
    message: String
  }],
  
  // Status
  isActive: Boolean, // default: true
  isArchived: Boolean, // default: false
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Habit Completions Collection

```javascript
{
  _id: ObjectId,
  habit: ObjectId, // ref: 'Habit'
  user: ObjectId, // ref: 'User'
  
  // Completion details
  completedAt: Date, // required
  completionDate: String, // 'YYYY-MM-DD' for easy querying
  count: Number, // how many times completed (for habits with targets)
  notes: String, // optional user notes
  
  // Mood correlation
  moodAtTime: String, // 'happy', 'neutral', 'sad', 'anxious'
  
  // Metadata
  createdAt: Date
}
```

### 8. Mood Entries Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId, // ref: 'User'
  
  // Mood data
  mood: String, // required: 'happy', 'neutral', 'sad', 'anxious'
  intensity: Number, // 1-5 scale
  entryDate: String, // 'YYYY-MM-DD'
  entryTime: String, // 'HH:MM'
  
  // Additional context
  notes: String, // optional user notes
  triggers: [String], // what might have influenced the mood
  activities: [String], // what the user was doing
  
  // Weather correlation (optional)
  weather: {
    condition: String,
    temperature: Number,
    humidity: Number
  },
  
  // Recommendations shown
  recommendationsShown: {
    movies: [String],
    songs: [String],
    exercises: [String],
    quote: String
  },
  
  // User interactions with recommendations
  savedRecommendations: [{
    type: String, // 'movie', 'song', 'exercise'
    item: String,
    savedAt: Date
  }],
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

### 9. Recommendations Collection

```javascript
{
  _id: ObjectId,
  
  // Recommendation details
  type: String, // 'movie', 'song', 'exercise', 'quote'
  title: String, // required
  description: String,
  content: String, // for quotes, this is the quote text
  
  // Media information
  mediaInfo: {
    genre: [String],
    duration: Number, // in minutes for movies/songs
    rating: String, // 'G', 'PG', 'PG-13', etc.
    year: Number,
    artist: String, // for songs
    album: String, // for songs
    director: String, // for movies
    difficulty: String, // for exercises: 'beginner', 'intermediate', 'advanced'
    equipment: [String] // for exercises
  },
  
  // Mood associations
  recommendedFor: [String], // ['happy', 'sad', 'anxious', 'neutral']
  
  // External links
  links: {
    spotify: String,
    youtube: String,
    imdb: String,
    netflix: String,
    amazonPrime: String,
    instructions: String // for exercises
  },
  
  // Usage statistics
  stats: {
    timesRecommended: Number, // default: 0
    timesSaved: Number, // default: 0
    rating: Number, // average user rating
    ratingCount: Number
  },
  
  // Content flags
  isActive: Boolean, // default: true
  isVerified: Boolean, // verified by admin
  
  // Metadata
  createdBy: ObjectId, // ref: 'User' (admin who added it)
  createdAt: Date,
  updatedAt: Date
}
```

### 10. Chatbot Conversations Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId, // ref: 'User'
  
  // Conversation data
  messages: [{
    role: String, // 'user', 'assistant'
    content: String,
    timestamp: Date,
    
    // AI response metadata
    model: String, // 'gpt-3.5-turbo', etc.
    tokens: Number,
    responseTime: Number // in milliseconds
  }],
  
  // Context and state
  context: {
    currentTopic: String,
    userMood: String,
    lastMoodEntry: Date,
    recentHabits: [String],
    crisisLevel: Number // 0-10 scale
  },
  
  // Crisis detection
  crisisFlags: [{
    keyword: String,
    severity: Number, // 1-10
    detectedAt: Date,
    actionTaken: String // 'helpline_shown', 'doctor_alerted', etc.
  }],
  
  // Session info
  sessionStart: Date,
  sessionEnd: Date,
  isActive: Boolean,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

### 11. Crisis Alerts Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId, // ref: 'User' - the user who triggered the alert
  
  // Alert details
  alertType: String, // 'keyword_detection', 'mood_pattern', 'manual_report'
  severity: String, // 'low', 'medium', 'high', 'critical'
  source: String, // 'chat', 'forum', 'chatbot', 'mood_tracker'
  sourceId: ObjectId, // ID of the message/post that triggered alert
  
  // Detected content
  triggerContent: String, // the content that triggered the alert
  keywords: [String], // crisis keywords detected
  
  // Response
  status: String, // 'pending', 'acknowledged', 'resolved'
  assignedTo: ObjectId, // ref: 'User' (doctor assigned to handle)
  responseActions: [{
    action: String, // 'helpline_shown', 'emergency_contact_notified', 'doctor_contacted'
    performedBy: ObjectId, // ref: 'User'
    performedAt: Date,
    notes: String
  }],
  
  // Follow-up
  followUpRequired: Boolean,
  followUpDate: Date,
  resolution: String,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  resolvedAt: Date
}
```

### 12. Notifications Collection

```javascript
{
  _id: ObjectId,
  recipient: ObjectId, // ref: 'User'
  
  // Notification content
  type: String, // 'habit_reminder', 'mood_reminder', 'new_message', 'forum_reply', 'crisis_alert'
  title: String,
  message: String,
  
  // Action data
  actionUrl: String, // where to redirect when clicked
  actionData: Object, // additional data for the action
  
  // Status
  isRead: Boolean, // default: false
  readAt: Date,
  
  // Delivery
  deliveryMethod: [String], // ['push', 'email', 'in_app']
  deliveryStatus: {
    push: String, // 'sent', 'delivered', 'failed'
    email: String,
    inApp: String
  },
  
  // Scheduling
  scheduledFor: Date,
  sentAt: Date,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

### Performance Indexes
```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ "patientInfo.anonymousId": 1 })
db.users.createIndex({ isApproved: 1, role: 1 })

// Forum Posts
db.forumposts.createIndex({ category: 1, createdAt: -1 })
db.forumposts.createIndex({ author: 1 })
db.forumposts.createIndex({ "votes.score": -1 })
db.forumposts.createIndex({ lastActivity: -1 })

// Messages
db.messages.createIndex({ conversation: 1, createdAt: 1 })
db.messages.createIndex({ sender: 1 })
db.messages.createIndex({ flaggedForCrisis: 1 })

// Habits
db.habits.createIndex({ user: 1, isActive: 1 })
db.habitcompletions.createIndex({ habit: 1, completionDate: 1 })
db.habitcompletions.createIndex({ user: 1, completionDate: -1 })

// Mood Entries
db.moodentries.createIndex({ user: 1, entryDate: -1 })
db.moodentries.createIndex({ entryDate: 1 })

// Notifications
db.notifications.createIndex({ recipient: 1, isRead: 1, createdAt: -1 })
db.notifications.createIndex({ scheduledFor: 1 })
```

## Data Relationships

### User Relationships
- User → Forum Posts (1:many)
- User → Forum Comments (1:many)
- User → Conversations (many:many through participants)
- User → Messages (1:many)
- User → Habits (1:many)
- User → Mood Entries (1:many)
- User → Crisis Alerts (1:many)

### Content Relationships
- Forum Post → Comments (1:many)
- Conversation → Messages (1:many)
- Habit → Habit Completions (1:many)
- User → Notifications (1:many)

## Data Privacy & Security

### Encryption
- All chat messages are encrypted using AES-256
- Medical certificates stored securely in Cloudinary
- Sensitive user data hashed/encrypted at rest

### Anonymization
- Patient usernames are auto-generated anonymous IDs
- Forum posts can be completely anonymous
- Personal data separated from public content

### Data Retention
- Soft delete for most collections
- Automatic cleanup of old notifications (90 days)
- Crisis alerts retained for legal compliance (7 years)
- Chat messages can be deleted on user request

### GDPR Compliance
- Right to data export
- Right to data deletion
- Consent tracking for data processing
- Data minimization principles applied