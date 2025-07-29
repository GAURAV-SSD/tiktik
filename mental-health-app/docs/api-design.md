# API Design Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": {}, // Response data
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Additional error details
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## API Endpoints

### 1. Authentication Endpoints

#### POST /auth/register
Register a new user (patient or doctor)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "patient", // or "doctor"
  "username": "John Doe", // for doctors, auto-generated for patients
  "profile": {
    "specialization": "Psychiatry", // doctors only
    "experience": 5, // doctors only
    "languages": ["English", "Spanish"]
  },
  "patientInfo": { // patients only
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+1234567890",
      "relationship": "Spouse"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "patient",
      "username": "anonymous_user_123",
      "isVerified": false,
      "isApproved": true // false for doctors initially
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

#### POST /auth/login
Authenticate user and get tokens

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "patient",
      "username": "anonymous_user_123",
      "profile": {},
      "settings": {}
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

#### POST /auth/refresh
Refresh access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

#### POST /auth/logout
Logout user and invalidate tokens

**Headers:** `Authorization: Bearer <token>`

#### POST /auth/verify-email
Verify user email with token

**Request Body:**
```json
{
  "token": "email_verification_token"
}
```

#### POST /auth/forgot-password
Request password reset

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/reset-password
Reset password with token

**Request Body:**
```json
{
  "token": "password_reset_token",
  "newPassword": "newSecurePassword123"
}
```

### 2. User Management Endpoints

#### GET /users/profile
Get current user profile

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "patient",
      "username": "anonymous_user_123",
      "profile": {},
      "settings": {},
      "gamification": {
        "points": 150,
        "level": 2,
        "badges": [],
        "streaks": {}
      }
    }
  }
}
```

#### PUT /users/profile
Update user profile

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "profile": {
    "bio": "Updated bio",
    "languages": ["English", "French"]
  },
  "settings": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false
    }
  }
}
```

#### POST /users/upload-certificate
Upload medical certificate (doctors only)

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Request Body:**
```
certificate: <file>
licenseNumber: "MD123456"
```

#### GET /users/doctors
Get list of approved doctors

**Query Parameters:**
- `specialization`: Filter by specialization
- `language`: Filter by language
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": "doctor_id",
        "username": "Dr. Smith",
        "profile": {
          "specialization": "Psychiatry",
          "experience": 5,
          "languages": ["English"]
        },
        "rating": 4.8,
        "isOnline": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### 3. Forum Endpoints

#### GET /forum/posts
Get forum posts

**Query Parameters:**
- `category`: Filter by category
- `sort`: Sort by ('recent', 'popular', 'trending')
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post_id",
        "title": "How to deal with anxiety?",
        "content": "I've been struggling with...",
        "author": {
          "id": "user_id",
          "username": "anonymous_user_123",
          "role": "patient"
        },
        "category": "anxiety",
        "tags": ["anxiety", "coping"],
        "votes": {
          "upvotes": 15,
          "downvotes": 2,
          "score": 13,
          "userVote": null // 'upvote', 'downvote', or null
        },
        "commentCount": 8,
        "viewCount": 45,
        "createdAt": "2024-01-15T10:30:00Z",
        "lastActivity": "2024-01-15T14:20:00Z"
      }
    ],
    "pagination": {}
  }
}
```

#### POST /forum/posts
Create a new forum post

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "How to deal with anxiety?",
  "content": "I've been struggling with anxiety lately...",
  "category": "anxiety",
  "tags": ["anxiety", "coping"],
  "isAnonymous": true
}
```

#### GET /forum/posts/:id
Get specific forum post with comments

**Response:**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "post_id",
      "title": "How to deal with anxiety?",
      "content": "I've been struggling with...",
      "author": {},
      "category": "anxiety",
      "votes": {},
      "comments": [
        {
          "id": "comment_id",
          "content": "Have you tried meditation?",
          "author": {
            "username": "Dr. Smith",
            "role": "doctor"
          },
          "votes": {},
          "replies": [],
          "createdAt": "2024-01-15T11:00:00Z"
        }
      ]
    }
  }
}
```

#### POST /forum/posts/:id/vote
Vote on a forum post

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "voteType": "upvote" // or "downvote" or "remove"
}
```

#### POST /forum/posts/:id/comments
Add comment to forum post

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "This is a helpful comment",
  "parentComment": "parent_comment_id", // optional for replies
  "isAnonymous": true
}
```

#### PUT /forum/comments/:id
Update comment

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

#### DELETE /forum/posts/:id
Delete forum post (author or admin only)

**Headers:** `Authorization: Bearer <token>`

### 4. Chat Endpoints

#### GET /chat/conversations
Get user's conversations

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conversation_id",
        "participants": [
          {
            "user": {
              "id": "user_id",
              "username": "Dr. Smith",
              "role": "doctor"
            },
            "joinedAt": "2024-01-15T10:00:00Z"
          }
        ],
        "lastMessage": {
          "content": "How are you feeling today?",
          "sender": "doctor_id",
          "sentAt": "2024-01-15T14:30:00Z"
        },
        "unreadCount": 2,
        "updatedAt": "2024-01-15T14:30:00Z"
      }
    ]
  }
}
```

#### POST /chat/conversations
Start new conversation

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "participantId": "doctor_id",
  "initialMessage": "Hi, I'd like to talk about my anxiety"
}
```

#### GET /chat/conversations/:id/messages
Get messages from conversation

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: Page number
- `limit`: Messages per page
- `before`: Get messages before this timestamp

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message_id",
        "content": "How are you feeling today?",
        "sender": {
          "id": "user_id",
          "username": "Dr. Smith"
        },
        "messageType": "text",
        "isEdited": false,
        "readBy": [
          {
            "user": "user_id",
            "readAt": "2024-01-15T14:35:00Z"
          }
        ],
        "createdAt": "2024-01-15T14:30:00Z"
      }
    ],
    "pagination": {}
  }
}
```

#### POST /chat/conversations/:id/messages
Send message

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "I'm feeling better today, thank you",
  "messageType": "text",
  "replyTo": "message_id" // optional
}
```

#### PUT /chat/messages/:id/read
Mark message as read

**Headers:** `Authorization: Bearer <token>`

### 5. Habits Endpoints

#### GET /habits
Get user's habits

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `category`: Filter by category
- `isActive`: Filter active/archived habits

**Response:**
```json
{
  "success": true,
  "data": {
    "habits": [
      {
        "id": "habit_id",
        "title": "Morning Meditation",
        "description": "10 minutes of mindfulness",
        "category": "mindfulness",
        "icon": "🧘",
        "color": "#5A67D8",
        "frequency": "daily",
        "targetCount": 1,
        "unit": "times",
        "currentStreak": 5,
        "longestStreak": 12,
        "totalCompletions": 45,
        "todayCompleted": false,
        "reminders": [
          {
            "time": "07:00",
            "enabled": true,
            "message": "Time for morning meditation"
          }
        ],
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### POST /habits
Create new habit

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Evening Walk",
  "description": "30 minutes walk in the park",
  "category": "exercise",
  "icon": "🚶",
  "color": "#48BB78",
  "frequency": "daily",
  "targetCount": 30,
  "unit": "minutes",
  "reminders": [
    {
      "time": "18:00",
      "enabled": true,
      "message": "Time for your evening walk"
    }
  ]
}
```

#### PUT /habits/:id
Update habit

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated habit title",
  "description": "Updated description",
  "reminders": []
}
```

#### POST /habits/:id/complete
Mark habit as completed

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "count": 30, // how many units completed
  "notes": "Felt great today",
  "completedAt": "2024-01-15T18:30:00Z" // optional, defaults to now
}
```

#### GET /habits/:id/analytics
Get habit analytics

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period`: 'week', 'month', 'year'

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "completionRate": 85.7,
      "currentStreak": 5,
      "longestStreak": 12,
      "totalCompletions": 45,
      "weeklyData": [
        {
          "date": "2024-01-15",
          "completed": true,
          "count": 30
        }
      ],
      "moodCorrelation": {
        "happy": 0.8,
        "neutral": 0.6,
        "sad": 0.3,
        "anxious": 0.4
      }
    }
  }
}
```

#### DELETE /habits/:id
Delete habit

**Headers:** `Authorization: Bearer <token>`

### 6. Mood Tracking Endpoints

#### GET /mood/entries
Get mood entries

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `limit`: Number of entries

**Response:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "entry_id",
        "mood": "happy",
        "intensity": 4,
        "entryDate": "2024-01-15",
        "entryTime": "14:30",
        "notes": "Had a great therapy session",
        "triggers": ["therapy", "sunny weather"],
        "activities": ["work", "exercise"],
        "recommendationsShown": {
          "movies": ["The Pursuit of Happyness", "Inside Out", "Good Will Hunting"],
          "songs": ["Happy - Pharrell Williams", "Here Comes the Sun - The Beatles", "Don't Stop Me Now - Queen"],
          "exercises": ["Dancing", "Yoga", "Walking"],
          "quote": "The best way to cheer yourself up is to try to cheer somebody else up."
        },
        "savedRecommendations": [
          {
            "type": "song",
            "item": "Happy - Pharrell Williams",
            "savedAt": "2024-01-15T14:35:00Z"
          }
        ],
        "createdAt": "2024-01-15T14:30:00Z"
      }
    ]
  }
}
```

#### POST /mood/entries
Record mood entry

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "mood": "happy",
  "intensity": 4,
  "notes": "Feeling great after therapy",
  "triggers": ["therapy", "sunny weather"],
  "activities": ["work", "exercise"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "entry": {
      "id": "entry_id",
      "mood": "happy",
      "intensity": 4,
      "entryDate": "2024-01-15",
      "entryTime": "14:30",
      "notes": "Feeling great after therapy"
    },
    "recommendations": {
      "movies": [
        {
          "title": "The Pursuit of Happyness",
          "description": "Inspirational drama about perseverance",
          "genre": ["Drama", "Biography"],
          "rating": "PG-13",
          "links": {
            "netflix": "https://netflix.com/title/...",
            "imdb": "https://imdb.com/title/..."
          }
        }
      ],
      "songs": [
        {
          "title": "Happy",
          "artist": "Pharrell Williams",
          "album": "G I R L",
          "duration": 233,
          "links": {
            "spotify": "https://open.spotify.com/track/...",
            "youtube": "https://youtube.com/watch?v=..."
          }
        }
      ],
      "exercises": [
        {
          "title": "Dancing",
          "description": "Free form dancing to your favorite music",
          "difficulty": "beginner",
          "duration": 15,
          "equipment": []
        }
      ],
      "quote": {
        "content": "The best way to cheer yourself up is to try to cheer somebody else up.",
        "author": "Mark Twain"
      }
    }
  }
}
```

#### GET /mood/recommendations/:mood
Get recommendations for specific mood

**Parameters:**
- `mood`: 'happy', 'neutral', 'sad', 'anxious'

#### POST /mood/recommendations/save
Save recommendation to favorites

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "entryId": "mood_entry_id",
  "type": "song",
  "item": "Happy - Pharrell Williams"
}
```

#### GET /mood/analytics
Get mood analytics

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period`: 'week', 'month', 'year'

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "averageMood": 3.2,
      "moodDistribution": {
        "happy": 25,
        "neutral": 40,
        "sad": 20,
        "anxious": 15
      },
      "weeklyTrend": [
        {
          "date": "2024-01-15",
          "mood": "happy",
          "intensity": 4
        }
      ],
      "triggers": {
        "positive": ["therapy", "exercise", "friends"],
        "negative": ["work stress", "rain", "news"]
      },
      "recommendations": {
        "mostSaved": [
          {
            "type": "song",
            "item": "Happy - Pharrell Williams",
            "count": 5
          }
        ]
      }
    }
  }
}
```

### 7. Chatbot Endpoints

#### POST /chatbot/conversation
Start or continue chatbot conversation

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "message": "I'm feeling anxious today",
  "conversationId": "conversation_id" // optional, for continuing conversation
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "conversation_id",
    "response": {
      "message": "I understand you're feeling anxious. Can you tell me what might be causing these feelings?",
      "suggestions": [
        "Tell me about breathing exercises",
        "I want to talk to a doctor",
        "Show me calming activities"
      ],
      "crisisDetected": false
    },
    "context": {
      "currentTopic": "anxiety",
      "crisisLevel": 2
    }
  }
}
```

#### GET /chatbot/conversations/:id
Get chatbot conversation history

**Headers:** `Authorization: Bearer <token>`

### 8. Crisis Management Endpoints

#### POST /crisis/alert
Manually trigger crisis alert

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "message": "I need immediate help",
  "severity": "high"
}
```

#### GET /crisis/resources
Get crisis resources and helplines

**Response:**
```json
{
  "success": true,
  "data": {
    "resources": {
      "helplines": [
        {
          "name": "National Suicide Prevention Lifeline",
          "phone": "988",
          "available": "24/7",
          "website": "https://suicidepreventionlifeline.org"
        }
      ],
      "emergencyContacts": [
        {
          "service": "Emergency Services",
          "phone": "911"
        }
      ],
      "onlineResources": [
        {
          "name": "Crisis Text Line",
          "contact": "Text HOME to 741741",
          "website": "https://crisistextline.org"
        }
      ]
    }
  }
}
```

### 9. Notifications Endpoints

#### GET /notifications
Get user notifications

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `unread`: Filter unread notifications
- `type`: Filter by notification type
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification_id",
        "type": "habit_reminder",
        "title": "Time for Morning Meditation",
        "message": "Don't forget your daily meditation practice",
        "isRead": false,
        "actionUrl": "/habits",
        "createdAt": "2024-01-15T07:00:00Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {}
  }
}
```

#### PUT /notifications/:id/read
Mark notification as read

**Headers:** `Authorization: Bearer <token>`

#### PUT /notifications/read-all
Mark all notifications as read

**Headers:** `Authorization: Bearer <token>`

### 10. Admin Endpoints

#### GET /admin/users
Get all users (admin only)

**Headers:** `Authorization: Bearer <token>`

#### PUT /admin/users/:id/approve
Approve doctor registration

**Headers:** `Authorization: Bearer <token>`

#### GET /admin/reports
Get content reports

**Headers:** `Authorization: Bearer <token>`

#### PUT /admin/reports/:id/resolve
Resolve content report

**Headers:** `Authorization: Bearer <token>`

## WebSocket Events

### Connection
```javascript
// Client connects
socket.emit('join', { userId: 'user_id', token: 'jwt_token' })

// Server confirms
socket.emit('joined', { success: true })
```

### Chat Events
```javascript
// Send message
socket.emit('send_message', {
  conversationId: 'conversation_id',
  content: 'Hello',
  messageType: 'text'
})

// Receive message
socket.on('new_message', {
  conversationId: 'conversation_id',
  message: { /* message object */ }
})

// Typing indicators
socket.emit('typing', { conversationId: 'conversation_id' })
socket.on('user_typing', { userId: 'user_id', conversationId: 'conversation_id' })
```

### Real-time Updates
```javascript
// Mood entry notifications
socket.on('mood_reminder', { message: 'Time for your daily mood check-in' })

// Habit reminders
socket.on('habit_reminder', { habitId: 'habit_id', message: 'Time for meditation' })

// Crisis alerts
socket.on('crisis_alert', { alertId: 'alert_id', severity: 'high' })
```

## Error Codes

### Authentication Errors
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Token invalid
- `AUTH_004`: Account not verified
- `AUTH_005`: Account not approved

### Validation Errors
- `VAL_001`: Required field missing
- `VAL_002`: Invalid email format
- `VAL_003`: Password too weak
- `VAL_004`: Invalid file type
- `VAL_005`: File too large

### Authorization Errors
- `AUTHZ_001`: Insufficient permissions
- `AUTHZ_002`: Resource not found
- `AUTHZ_003`: Action not allowed

### Business Logic Errors
- `BIZ_001`: Duplicate entry
- `BIZ_002`: Resource limit exceeded
- `BIZ_003`: Invalid operation
- `BIZ_004`: Dependency exists

## Rate Limiting
- Authentication endpoints: 5 requests per minute
- General API: 100 requests per minute per user
- File uploads: 10 requests per minute
- Chatbot: 20 requests per minute

## Pagination
All list endpoints support pagination:
```json
{
  "page": 1,
  "limit": 10,
  "total": 100,
  "pages": 10,
  "hasNext": true,
  "hasPrev": false
}
```