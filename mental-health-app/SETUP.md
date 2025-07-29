# Mental Health App Setup Guide

## 🚀 Quick Start

This guide will help you set up and run the Mental Health App locally for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)
- **npm** or **yarn** package manager

## Project Structure

```
mental-health-app/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Authentication & validation
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helper functions
│   ├── .env                 # Environment variables
│   └── package.json
├── frontend/                # Next.js React application
│   ├── src/
│   │   ├── app/             # Next.js 14 app router
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   ├── store/           # State management
│   │   └── types/           # TypeScript types
│   └── package.json
├── docs/                    # Documentation
└── README.md
```

## Installation Steps

### 1. Clone the Repository

```bash
# If you have the repository
git clone <repository-url>
cd mental-health-app

# Or if you're setting up from these files
mkdir mental-health-app
cd mental-health-app
# Copy all the provided files into this directory
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit the .env file with your configurations
nano .env  # or use your preferred editor
```

**Important Environment Variables to Configure:**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/mental-health-app

# JWT Secrets (Generate strong, unique keys)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex-123456789
JWT_REFRESH_SECRET=your-refresh-token-secret-here-987654321

# Email Configuration (Optional for development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
touch .env.local

# Add frontend environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" >> .env.local
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:5000" >> .env.local
```

### 4. Database Setup

**Option A: Local MongoDB**

1. Start MongoDB service:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community

   # On Ubuntu/Debian
   sudo systemctl start mongod

   # On Windows
   # Start MongoDB as a Windows service or run mongod.exe
   ```

2. The application will automatically create the database and collections on first run.

**Option B: MongoDB Atlas (Cloud)**

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### 5. Running the Application

**Start the Backend (Terminal 1):**

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📊 Environment: development
🍃 MongoDB Connected: localhost:27017
🔌 Socket.io server initialized
```

**Start the Frontend (Terminal 2):**

```bash
cd frontend
npm run dev
```

You should see:
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
- Ready in 2.1s
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 🧪 Testing the Setup

### 1. Health Check

Visit http://localhost:5000/health - you should see:

```json
{
  "success": true,
  "message": "Mental Health App API is running",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": "development",
  "version": "1.0.0"
}
```

### 2. Frontend Landing Page

Visit http://localhost:3000 - you should see the beautiful landing page with:
- Hero section with animated elements
- Feature showcase
- Mood tracker preview
- Testimonials
- Call-to-action sections

### 3. API Endpoints

Test some basic endpoints:

```bash
# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "role": "patient"
  }'
```

## 🔧 Development Tools

### Available Scripts

**Backend:**
```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm run lint       # Run ESLint
npm test           # Run tests
```

**Frontend:**
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run Next.js linter
npm run type-check # Run TypeScript check
```

### Database Management

**View MongoDB Data:**

```bash
# Connect to MongoDB shell
mongosh mental-health-app

# View collections
show collections

# View users
db.users.find().pretty()
```

**Reset Database:**

```bash
# Drop the entire database (BE CAREFUL!)
mongosh mental-health-app --eval "db.dropDatabase()"
```

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
❌ MongoDB connection failed: MongoNetworkError
```
**Solution:** Ensure MongoDB is running and the connection string is correct.

**2. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Kill the process using the port or change the PORT in `.env`.

**3. JWT Secret Error**
```
❌ Error: secretOrPrivateKey has a minimum key size of 256 bits
```
**Solution:** Use a longer, more complex JWT secret in your `.env` file.

**4. Email Service Error**
```
❌ Email sending failed
```
**Solution:** This is non-critical for development. You can ignore it or configure proper email credentials.

### Getting Help

1. Check the console logs in both terminal windows
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that MongoDB is running and accessible

## 🚀 Next Steps

After successful setup, you can:

1. **Create an Account**: Visit http://localhost:3000/register
2. **Explore the API**: Check out the API documentation in `docs/api-design.md`
3. **Start Development**: Begin implementing additional features
4. **Review the Roadmap**: See `docs/implementation-roadmap.md` for next features to build

## 📚 Additional Resources

- [Database Schema](docs/database-schema.md) - Complete database structure
- [API Documentation](docs/api-design.md) - All available endpoints
- [Implementation Roadmap](docs/implementation-roadmap.md) - Development phases
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

---

**Need help?** Open an issue or check the troubleshooting section above.

**Ready to contribute?** Check out the implementation roadmap for features to build next!