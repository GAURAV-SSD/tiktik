# Depression Management Web App

A comprehensive mental health support platform that provides anonymous support, connects patients with verified doctors, and helps users develop healthy habits while tracking their mental wellbeing.

## Features

### 🔐 Authentication & Roles
- Role-based signup (Patient/Doctor)
- Doctor verification with medical certificate upload
- Anonymous patient usernames
- Admin approval system for doctors

### 💬 Anonymous Forum
- Reddit-style anonymous posting
- Categories: Depression, Anxiety, Motivation, Lifestyle
- Doctor responses and community interaction
- Upvote/downvote system

### 🔒 Secure One-to-One Chat
- End-to-end encrypted messaging
- Real-time communication
- Patient-doctor private consultations

### 📅 Habit Planner & Calendar
- Daily task and habit tracking
- Calendar view with streak tracking
- Reminder notifications
- Progress visualization

### 📊 Mood Tracker (Core Feature)
- Daily mood check-ins (Happy, Neutral, Sad, Anxious)
- Personalized recommendations:
  - Movies (3 suggestions)
  - Songs (3 suggestions) 
  - Exercises (3 suggestions)
  - Inspirational quotes
- Weekly mood trend graphs
- Favorite suggestions saving

### 🤖 AI Chatbot
- Motivational support and guidance
- Feature suggestions
- Crisis escalation to doctors
- 24/7 availability

### 🚨 Crisis Detection
- Keyword monitoring for self-harm indicators
- Emergency helpline display
- Automatic doctor alerts
- Immediate support resources

### 🎮 Gamification
- Achievement badges
- Habit completion rewards
- Forum participation points
- Progress milestones

### 🎨 Accessibility & Themes
- Dark/Light mode toggle
- High contrast options
- Large font accessibility
- Responsive design

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer

### Additional Services
- **AI Chatbot**: OpenAI API
- **Notifications**: Web Push API
- **Encryption**: CryptoJS for chat encryption

## Project Structure

```
mental-health-app/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities and configurations
│   │   ├── store/           # Zustand stores
│   │   └── types/           # TypeScript definitions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Express API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helper functions
│   ├── uploads/             # File upload directory
│   └── package.json
├── shared/                  # Shared types and utilities
└── docs/                    # Documentation
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Environment Variables

Create `.env.local` files in both frontend and backend directories:

**Backend (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mental-health-app
JWT_SECRET=your-super-secret-jwt-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
OPENAI_API_KEY=your-openai-api-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Installation

1. **Clone and install dependencies:**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. **Start MongoDB:**
```bash
mongod
```

3. **Run the application:**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

4. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

### Forum
- `GET /api/forum/posts` - Get all posts
- `POST /api/forum/posts` - Create new post
- `GET /api/forum/posts/:id` - Get specific post
- `POST /api/forum/posts/:id/vote` - Vote on post
- `POST /api/forum/posts/:id/comments` - Add comment

### Chat
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/conversations` - Start new conversation
- `GET /api/chat/conversations/:id/messages` - Get messages
- `POST /api/chat/conversations/:id/messages` - Send message

### Habits
- `GET /api/habits` - Get user habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `POST /api/habits/:id/complete` - Mark habit complete

### Mood Tracking
- `GET /api/mood/entries` - Get mood entries
- `POST /api/mood/entries` - Record mood entry
- `GET /api/mood/recommendations/:mood` - Get mood-based recommendations
- `GET /api/mood/analytics` - Get mood analytics

## Database Schema

See `docs/database-schema.md` for detailed schema documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.