# Code Verse - Online Coding Platform

A comprehensive full-stack online coding platform that enables users to practice coding problems, participate in contests, learn algorithms through visualizations, and get AI-powered coding assistance. The platform includes separate interfaces for regular users and administrators.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Development Workflow](#development-workflow)
- [Database Schema](#database-schema)
- [Third-Party Integrations](#third-party-integrations)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Code Verse is a modern online coding platform that provides:

- **Problem Solving**: Practice coding problems with multiple difficulty levels
- **Contest System**: Participate in timed coding contests
- **Algorithm Visualization**: Interactive visualizations for learning algorithms
- **AI-Powered Assistance**: Get help from AI chatbot while coding
- **Video Tutorials**: Watch editorial videos for problems
- **User Management**: Complete user authentication and profile management
- **Subscription System**: Premium features with payment integration
- **Admin Dashboard**: Comprehensive admin panel for content management

The platform consists of three main applications:
1. **Backend API** - Node.js/Express REST API
2. **Frontend** - React application for end users
3. **Admin Frontend** - React application for administrators

## ✨ Features

### User Features
- 🔐 User authentication (signup, login, logout)
- 📝 Browse and solve coding problems
- 🏆 Participate in coding contests
- 📊 View leaderboard and statistics
- 🤖 AI-powered coding assistant
- 🎥 Watch problem editorial videos
- 📈 Track problem-solving streaks
- 💳 Subscription management (free, monthly, yearly plans)
- 🎨 Algorithm visualizations (Linear Search, Binary Search, Sorting)
- 📱 Responsive design with modern UI

### Admin Features
- 👥 User management (CRUD operations)
- 📚 Problem management (create, edit, delete problems)
- 🎬 Video upload and management
- 🏁 Contest creation and management
- 📊 Analytics dashboard
- 📝 Submission monitoring
- 💰 Subscription management
- ⚙️ System settings

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis 5.9.0
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **AI Integration**: Google Generative AI (Gemini)
- **Cloud Storage**: Cloudinary (for video uploads)
- **Payment Gateway**: DodoPayments
- **Code Execution**: Judge0 API (via RapidAPI)

### Frontend (User)
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Routing**: React Router DOM 7.9.5
- **State Management**: Redux Toolkit 2.10.1
- **Code Editor**: Monaco Editor (via @monaco-editor/react)
- **Styling**: Tailwind CSS 4.1.16 + DaisyUI
- **Forms**: React Hook Form 7.66.0 + Zod validation
- **Animations**: Framer Motion 12.23.24
- **Icons**: Lucide React + React Icons
- **Markdown**: React Markdown

### Admin Frontend
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Routing**: React Router DOM 7.9.5
- **Styling**: Tailwind CSS 4.1.16
- **Icons**: Lucide React

## 🏗 Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │  Admin Frontend │
│  (Port 5173)    │         │  (Port 5174)    │
└────────┬────────┘         └────────┬────────┘
         │                            │
         │  HTTP/REST API             │
         │  (with JWT auth)           │
         └────────────┬───────────────┘
                      │
         ┌────────────▼────────────┐
         │   Backend API Server    │
         │     (Port 8080)         │
         └────────┬────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐    ┌───▼───┐    ┌───▼────┐
│ MongoDB│    │ Redis │    │External│
│        │    │ Cache │    │ APIs   │
└────────┘    └───────┘    └────────┘
                        (Judge0, Gemini,
                         Cloudinary,
                         DodoPayments)
```

### Request Flow
1. User interacts with React frontend
2. Frontend makes API calls to Express backend
3. Backend validates requests using middleware
4. Backend queries MongoDB for data
5. Backend optionally caches data in Redis
6. Backend integrates with external services (Judge0, Gemini, Cloudinary)
6. Backend returns JSON response to frontend
7. Frontend updates UI based on response

## 📁 Project Structure

```
code_verse/
├── backend/                    # Node.js/Express API server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   ├── db.js          # MongoDB connection
│   │   │   ├── redis.js       # Redis connection
│   │   │   ├── cloudinary.js  # Cloudinary setup
│   │   │   └── dodoPayments.js # Payment gateway config
│   │   ├── controllers/       # Route handlers
│   │   │   ├── userAuthent.js      # Auth controllers
│   │   │   ├── userManagement.js   # User CRUD
│   │   │   ├── userProblem.js      # Problem operations
│   │   │   ├── userSubmitProblem.js # Submission handling
│   │   │   ├── contestController.js # Contest management
│   │   │   ├── aiChatController.js  # AI chat
│   │   │   ├── videoController.js   # Video management
│   │   │   ├── paymentController.js # Payment processing
│   │   │   └── statsController.js   # Statistics
│   │   ├── middleware/        # Express middleware
│   │   │   ├── userMiddleware.js      # User auth
│   │   │   ├── adminMiddleware.js     # Admin auth
│   │   │   ├── paidUserMiddleware.js  # Subscription check
│   │   │   └── validationMiddleware.js # Input validation
│   │   ├── models/            # Mongoose schemas
│   │   │   ├── user.js        # User model
│   │   │   ├── problem.js     # Problem model
│   │   │   ├── contest.js     # Contest model
│   │   │   ├── submission.js  # Submission model
│   │   │   ├── video.js       # Video model
│   │   │   └── payment.js     # Payment model
│   │   ├── routes/            # API routes
│   │   │   ├── userAuth.js           # Auth routes
│   │   │   ├── userManagement.js    # User management
│   │   │   ├── problemCreater.js    # Problem CRUD
│   │   │   ├── submit.js            # Submission routes
│   │   │   ├── contest.js           # Contest routes
│   │   │   ├── leaderboard.js       # Leaderboard
│   │   │   ├── stats.js             # Statistics
│   │   │   ├── aiChat.js            # AI chat
│   │   │   ├── video.js             # Video routes
│   │   │   └── payment.js           # Payment routes
│   │   ├── utils/             # Utility functions
│   │   │   ├── validator.js         # Validation helpers
│   │   │   └── problemutility.js    # Problem utilities
│   │   └── index.js           # Application entry point
│   ├── package.json
│   ├── .env                    # Environment variables (create this)
│   └── README.md
│
├── frontend/                   # React user application
│   ├── src/
│   │   ├── api/               # API client
│   │   │   └── axiosClient.js
│   │   ├── components/        # React components
│   │   │   ├── CodeEditor.jsx      # Monaco editor wrapper
│   │   │   ├── ConsoleOutput.jsx   # Output display
│   │   │   ├── TestCasePanel.jsx   # Test cases UI
│   │   │   ├── ProblemCard.jsx     # Problem card
│   │   │   ├── Navbar.jsx          # Navigation
│   │   │   ├── Sidebar.jsx         # Sidebar
│   │   │   ├── AIChatbot.jsx       # AI chat UI
│   │   │   ├── PaymentModal.jsx    # Payment modal
│   │   │   ├── RequireAuth.jsx     # Auth guard
│   │   │   └── ...
│   │   ├── context/           # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   ├── ProblemContext.jsx
│   │   │   └── LayoutSettingsContext.jsx
│   │   ├── hooks/             # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useEditor.js
│   │   │   └── useSubscription.js
│   │   ├── layouts/           # Layout components
│   │   │   └── UserLayout.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── Landing.jsx         # Home page
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── SignUp.jsx          # Signup page
│   │   │   ├── ProblemList.jsx     # Problem list
│   │   │   ├── ProblemPage.jsx     # Problem detail
│   │   │   ├── ContestList.jsx     # Contest list
│   │   │   ├── ContestProblem.jsx  # Contest problems
│   │   │   ├── ContestSolving.jsx  # Contest solving
│   │   │   ├── Profile.jsx         # User profile
│   │   │   ├── Submissions.jsx     # Submission history
│   │   │   ├── AlgoVisualization.jsx # Algorithm viz
│   │   │   ├── BinarySearch.jsx    # Binary search viz
│   │   │   ├── LinearSearch.jsx    # Linear search viz
│   │   │   ├── Sorting.jsx         # Sorting viz
│   │   │   └── ...
│   │   ├── store/             # Redux store
│   │   │   └── store.js
│   │   ├── utils/             # Utilities
│   │   │   ├── api.js
│   │   │   └── formatTime.js
│   │   ├── router.jsx         # Route configuration
│   │   ├── App.jsx            # Root component
│   │   └── main.jsx           # Entry point
│   ├── package.json
│   └── README.md
│
└── frontend_admin/            # React admin application
    ├── src/
    │   ├── api/               # API client
    │   │   └── axiosClient.js
    │   ├── components/        # Reusable components
    │   │   ├── Table.jsx
    │   │   ├── Modal.jsx
    │   │   ├── Button.jsx
    │   │   ├── InputField.jsx
    │   │   ├── TestCaseManager.jsx
    │   │   ├── VideoUpload.jsx
    │   │   └── ...
    │   ├── context/           # Context providers
    │   │   └── AuthContext.jsx
    │   ├── hooks/             # Custom hooks
    │   │   └── useAuth.js
    │   ├── layouts/           # Layout components
    │   │   └── AdminLayout.jsx
    │   ├── pages/             # Admin pages
    │   │   ├── Dashboard.jsx
    │   │   ├── Login.jsx
    │   │   ├── Users.jsx
    │   │   ├── Problems.jsx
    │   │   ├── CreateProblem.jsx
    │   │   ├── Submissions.jsx
    │   │   ├── Contests.jsx
    │   │   ├── Videos.jsx
    │   │   ├── Analytics.jsx
    │   │   ├── SubscriptionManagement.jsx
    │   │   └── ...
    │   ├── router.jsx         # Route configuration
    │   ├── utils/             # Utilities
    │   │   ├── api.js
    │   │   └── helpers.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm 8+
- **MongoDB** 4.4+ (local or cloud instance)
- **Redis** 6.0+ (optional but recommended)
- **Git**

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd code_verse
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Install admin frontend dependencies**
   ```bash
   cd ../frontend_admin
   npm install
   ```

5. **Set up environment variables** (see [Environment Variables](#environment-variables) section)

6. **Start MongoDB and Redis**
   - MongoDB: Ensure MongoDB is running on your system
   - Redis: Start Redis server (if using locally)

7. **Start the backend server**
   ```bash
   cd backend
   npm run dev  # or npm start
   ```
   Backend will run on `http://localhost:8080`

8. **Start the frontend (in a new terminal)**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

9. **Start the admin frontend (in a new terminal)**
   ```bash
   cd frontend_admin
   npm run dev
   ```
   Admin frontend will run on `http://localhost:5174`

## 🔐 Environment Variables

### Backend (.env in `backend/` directory)

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=8080

# Database
DB_URL=mongodb://localhost:27017/code_verse
# Or for MongoDB Atlas:
# DB_URL=mongodb+srv://username:password@cluster.mongodb.net/code_verse

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=          # Optional
REDIS_PASSWORD=          # Optional

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars

# Cloudinary (for video uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=code_arena_videos

# Judge0 API (for code execution)
JUDGEO_URL=https://judge0-ce.p.rapidapi.com
JUDGEO_RAPIDAPI_KEY=your_rapidapi_key
JUDGEO_RAPID_HOST=judge0-ce.p.rapidapi.com

# Google Gemini AI (for AI chat)
gemniKey=your_gemini_api_key

# DodoPayments (for subscription payments)
# Add DodoPayments configuration as needed
```

### Frontend (.env in `frontend/` directory)

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:8080
```

### Admin Frontend (.env in `frontend_admin/` directory)

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:8080

# Cloudinary (for video uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=code_arena_videos
```

## 📚 API Documentation

### Base URL
```
http://localhost:8080
```

### Authentication
Most endpoints require JWT authentication via cookies. Include credentials in requests:
```javascript
axios.get('/api/endpoint', { withCredentials: true })
```

### Main API Routes

#### Authentication (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get current user profile
- `POST /auth/admin/register` - Admin registration

#### Problems (`/problems`)
- `GET /problems` - Get all problems (with filters)
- `GET /problems/:id` - Get problem by ID
- `POST /problems` - Create problem (admin only)
- `PATCH /problems/:id` - Update problem (admin only)
- `DELETE /problems/:id` - Delete problem (admin only)

#### Submissions (`/solve`)
- `POST /solve/submit` - Submit code for execution
- `GET /solve/submissions` - Get user submissions
- `GET /solve/submissions/:id` - Get submission by ID

#### Contests (`/contests`)
- `GET /contests` - Get all contests
- `GET /contests/:id` - Get contest by ID
- `POST /contests` - Create contest (admin only)
- `PATCH /contests/:id` - Update contest (admin only)
- `DELETE /contests/:id` - Delete contest (admin only)
- `POST /contests/:id/join` - Join a contest
- `GET /contests/:id/problems` - Get contest problems

#### Leaderboard (`/leaderboard`)
- `GET /leaderboard` - Get global leaderboard
- `GET /leaderboard/contest/:id` - Get contest leaderboard

#### Statistics (`/stats`)
- `GET /stats` - Get user statistics
- `GET /stats/streak` - Get user streak information

#### AI Chat (`/ai`)
- `POST /ai/chat` - Send message to AI assistant
- `GET /ai/test` - Test AI connection

#### Videos (`/videos`)
- `POST /videos/upload-token` - Get Cloudinary upload token (admin)
- `POST /videos/save` - Save video metadata (admin)
- `GET /videos/all` - Get all videos (admin)
- `GET /videos/problem/:problemId` - Get videos for a problem
- `GET /videos/:videoId` - Get video by ID
- `PATCH /videos/:videoId` - Update video (admin/owner)
- `DELETE /videos/:videoId` - Delete video (admin/owner)

#### Payments (`/payment`)
- `POST /payment/create-session` - Create payment session
- `POST /payment/verify` - Verify payment
- `GET /payment/status` - Get payment status

#### User Management (`/users`) - Admin Only
- `GET /users/all` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users/create` - Create user
- `PATCH /users/update/:id` - Update user
- `DELETE /users/delete/:id` - Delete user

For detailed request/response formats, refer to the controller files in `backend/src/controllers/`.

## 💻 Development Workflow

### Running in Development Mode

1. **Backend**: Uses `nodemon` for auto-reload
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend**: Uses Vite HMR (Hot Module Replacement)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Admin Frontend**: Uses Vite HMR
   ```bash
   cd frontend_admin
   npm run dev
   ```

### Building for Production

1. **Backend**
   ```bash
   cd backend
   npm start
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm run build
   # Output in dist/ directory
   ```

3. **Admin Frontend**
   ```bash
   cd frontend_admin
   npm run build
   # Output in dist/ directory
   ```

### Code Style
- Backend: Follow Express.js best practices
- Frontend: ESLint configured, follow React best practices
- Use consistent indentation (2 spaces for JS/JSX)

## 🗄 Database Schema

### User Model
```javascript
{
  firstName: String (required, 3-30 chars)
  lastName: String (optional, 3-30 chars)
  emailId: String (required, unique, immutable)
  password: String (required, hashed)
  age: Number (optional, min: 5)
  role: String (enum: ['user', 'admin'], default: 'user')
  problemsSolved: [ObjectId] (ref: Problem)
  subscription: {
    isActive: Boolean
    planType: String (enum: ['free', 'monthly', 'yearly'])
    startDate: Date
    expiryDate: Date
    dodoSessionId: String
    dodoPaymentId: String
  }
  createdAt: Date
}
```

### Problem Model
```javascript
{
  title: String (required, unique, max 100 chars)
  description: String (required)
  difficulty: String (enum: ['Easy', 'Medium', 'Hard'])
  tags: [String]
  visibleTestCases: [{
    input: String
    output: String
    explanation: String
  }]
  hiddenTestCases: [{
    input: String
    output: String
  }]
  starterCode: [{
    language: String
    initialCode: String
  }]
  constraints: [String]
  acceptanceRate: Number (0-100)
  submissions: Number
  successfulSubmissions: Number
  problemCreator: ObjectId
  referenceSolutions: [{
    language: String
    completeCode: String
  }]
  createdAt: Date
}
```

### Contest Model
```javascript
{
  title: String (required, max 100 chars)
  description: String (required)
  startTime: Date (required)
  endTime: Date (required)
  problems: [ObjectId] (ref: Problem)
  participants: [ObjectId] (ref: User)
  creator: ObjectId (ref: User, required)
  isPublic: Boolean (default: true)
  status: String (enum: ['upcoming', 'ongoing', 'ended'])
  createdAt: Date
}
```

### Submission Model
```javascript
{
  user: ObjectId (ref: User)
  problem: ObjectId (ref: Problem)
  contest: ObjectId (ref: Contest, optional)
  code: String
  language: String
  status: String (enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', ...])
  testCasesPassed: Number
  totalTestCases: Number
  executionTime: Number
  memoryUsed: Number
  submittedAt: Date
}
```

### Video Model
```javascript
{
  title: String (required)
  description: String
  problemId: ObjectId (ref: Problem)
  cloudinaryUrl: String (required)
  cloudinaryPublicId: String (required)
  duration: Number
  views: Number (default: 0)
  uploadedBy: ObjectId (ref: User)
  createdAt: Date
}
```

**Note**: The database file should be located under the `instance` folder as per project configuration.

## 🔌 Third-Party Integrations

### 1. Judge0 API
- **Purpose**: Code execution and testing
- **Setup**: 
  - Sign up at RapidAPI
  - Get API key from Judge0 endpoint
  - Add credentials to `.env`

### 2. Google Gemini AI
- **Purpose**: AI-powered coding assistance
- **Setup**:
  - Get API key from Google AI Studio
  - Add to `.env` as `gemniKey`

### 3. Cloudinary
- **Purpose**: Video storage and delivery
- **Setup**:
  - Create Cloudinary account
  - Create unsigned upload preset named `code_arena_videos`
  - Add credentials to `.env`
  - See `backend/CLOUDINARY_SETUP.md` for details

### 4. DodoPayments
- **Purpose**: Payment processing for subscriptions
- **Setup**:
  - Configure DodoPayments account
  - Add credentials to `.env`

### 5. Redis
- **Purpose**: Caching and session management
- **Setup**:
  - Install Redis locally or use cloud service
  - Configure connection in `.env`

## 🚢 Deployment

### Quick Start

For detailed AWS EC2 deployment instructions, see **[AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md)** - Complete step-by-step guide with troubleshooting.

### Backend Deployment

1. **Environment Variables**: Ensure all `.env` variables are set in production
2. **Database**: Use MongoDB Atlas or managed MongoDB service
3. **Redis**: Use managed Redis service (e.g., Redis Cloud)
4. **Process Manager**: Use PM2 or similar
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name code-verse-api
   ```

### Frontend Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy `dist/` folder** to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - AWS EC2 with Nginx (see [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md))
   - Any static hosting service

3. **Update API base URL** in production environment

### Admin Frontend Deployment

Same as frontend deployment process.

### Recommended Stack
- **Backend**: Railway, Render, Heroku, AWS EC2, DigitalOcean
- **Full Stack (EC2)**: See [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) for complete AWS EC2 deployment guide
- **Frontend**: Vercel, Netlify, AWS Amplify
- **Database**: MongoDB Atlas
- **Cache**: Redis Cloud, AWS ElastiCache

## 🐛 Troubleshooting

### Common Issues

1. **Cannot connect to MongoDB**
   - Verify `DB_URL` is correct
   - Ensure MongoDB is running
   - Check network/firewall settings

2. **CORS errors**
   - Verify frontend origin is in backend CORS allowed origins
   - Check `withCredentials` is set correctly
   - Ensure backend CORS config matches frontend URL

3. **JWT authentication fails**
   - Verify `JWT_SECRET` is set
   - Check token expiration
   - Ensure cookies are being sent

4. **Redis connection errors**
   - Verify Redis is running
   - Check `REDIS_HOST` and `REDIS_PORT`
   - Redis is optional; app should work without it

5. **Video upload fails**
   - Verify Cloudinary preset is set to "Unsigned"
   - Check Cloudinary credentials
   - Verify upload preset name matches `.env`

6. **Code execution fails**
   - Verify Judge0 API credentials
   - Check RapidAPI subscription status
   - Verify API endpoint URLs

7. **AI chat not working**
   - Verify Gemini API key is valid
   - Check API quota/limits
   - Verify network connectivity

8. **Payment integration issues**
   - Verify DodoPayments credentials
   - Check webhook configuration
   - Verify payment callback URLs

### Debug Mode

Enable detailed logging by setting:
```env
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Write clear commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

**Built with ❤️ for the coding community**

"# codeing_Platform" 
