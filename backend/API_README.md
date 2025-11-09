# Code Verse API Documentation

Complete API documentation for the Code Verse platform.

## Base URL

The API base URL depends on your environment:

### Development Environment
- **Base URL**: `http://localhost:3000`
- **Port**: `3000` (configurable via `PORT` environment variable)
- **Full Example**: `http://localhost:3000/auth/register`

### Production Environment
- **Base URL**: Set via `VITE_API_BASE_URL` environment variable
- **Example**: `https://api.yourdomain.com`
- **Full Example**: `https://api.yourdomain.com/auth/register`

### Frontend Integration

#### Development (Vite Proxy)
In development, the frontend uses a Vite proxy configured at `/api`:
- Frontend makes requests to: `/api/auth/register`
- Vite proxy rewrites to: `http://localhost:3000/auth/register`

#### Production
In production, the frontend uses the `VITE_API_BASE_URL` environment variable:
- Frontend makes requests to: `${VITE_API_BASE_URL}/auth/register`
- Example: `https://api.yourdomain.com/auth/register`

### Constructing API Requests

All API endpoints follow this pattern:
```
{BASE_URL}/{endpoint_path}
```

**Examples:**
- Development: `http://localhost:3000/auth/login`
- Production: `https://api.yourdomain.com/auth/login`
- With Vite proxy (dev): `/api/auth/login`

### Code Examples

**JavaScript/TypeScript (Axios):**
```javascript
// Development
const API_BASE_URL = 'http://localhost:3000';
// or with Vite proxy: const API_BASE_URL = '/api';

// Production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.yourdomain.com';

// Example request
axios.post(`${API_BASE_URL}/auth/register`, {
  firstName: 'John',
  emailId: 'john@example.com',
  password: 'password123'
}, { withCredentials: true });
```

**cURL:**
```bash
# Development
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","emailId":"john@example.com","password":"password123"}'

# Production
curl -X POST https://api.yourdomain.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","emailId":"john@example.com","password":"password123"}'
```

---

## Authentication

Most endpoints require authentication via JWT token stored in HTTP-only cookies. Include credentials in requests:

```javascript
// Axios example
axios.get(`${API_BASE_URL}/auth/profile`, { withCredentials: true })
```

**Important:** Always include `withCredentials: true` for authenticated requests to send cookies.

---

## Response Format

All responses follow this structure:

**Success Response:**
```json
{
  "message": "Success message",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "message": "Error message"
}
```

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Problems Endpoints](#problems-endpoints)
3. [Submissions Endpoints](#submissions-endpoints)
4. [Contests Endpoints](#contests-endpoints)
5. [Stats Endpoints](#stats-endpoints)
6. [Leaderboard Endpoints](#leaderboard-endpoints)
7. [User Management Endpoints](#user-management-endpoints)
8. [AI Chat Endpoints](#ai-chat-endpoints)
9. [Videos Endpoints](#videos-endpoints)
10. [Payments Endpoints](#payments-endpoints)

---

## Authentication Endpoints

**Base Path:** `{BASE_URL}/auth`

### Health Check

**GET** `{BASE_URL}/auth/health`

Check if auth routes are working.

**Full URL Examples:**
- Development: `http://localhost:3000/auth/health`
- Production: `https://api.yourdomain.com/auth/health`

**Response (200):**
```json
{
  "status": "ok",
  "message": "Auth routes are working"
}
```

---

### Register User

**POST** `{BASE_URL}/auth/register`

Register a new user account.

**Full URL Examples:**
- Development: `http://localhost:3000/auth/register`
- Production: `https://api.yourdomain.com/auth/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",        // Optional
  "emailId": "john@example.com",
  "password": "password123",
  "age": 25                  // Optional
}
```

**Validation:**
- `firstName`: Required, minimum 3 characters
- `emailId`: Required, valid email format
- `password`: Required, minimum 8 characters
- `lastName`: Optional, if provided must be at least 3 characters
- `age`: Optional, minimum 5 if provided

**Response (201):**
```json
{
  "message": "user registered successfully",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "emailId": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "subscription": {
      "isActive": false,
      "planType": "free"
    }
  }
}
```

**Error Responses:**
- `400`: Validation error or user already exists
- `400`: First name must be at least 3 characters long

---

### Login

**POST** `{BASE_URL}/auth/login`

Authenticate user and receive JWT token.

**Full URL Examples:**
- Development: `http://localhost:3000/auth/login`
- Production: `https://api.yourdomain.com/auth/login`

**Request Body:**
```json
{
  "emailId": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "user logged in successfully",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "emailId": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "subscription": {
      "isActive": false,
      "planType": "free"
    }
  }
}
```

**Error Responses:**
- `400`: Email and password are required
- `400`: Invalid credentials

---

### Logout

**POST** `{BASE_URL}/auth/logout`

**Authentication:** Required

Logout user and clear session.

**Full URL Examples:**
- Development: `http://localhost:3000/auth/logout`
- Production: `https://api.yourdomain.com/auth/logout`

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### Get User Profile

**GET** `{BASE_URL}/auth/profile`

**Authentication:** Required

Get current authenticated user's profile.

**Full URL Examples:**
- Development: `http://localhost:3000/auth/profile`
- Production: `https://api.yourdomain.com/auth/profile`

**Response (200):**
```json
{
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "emailId": "john@example.com",
    "role": "user",
    "age": 25,
    "problemsSolved": [],
    "subscription": {
      "isActive": false,
      "planType": "free"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Delete User Profile

**DELETE** `{BASE_URL}/auth/profile/delete`

**Authentication:** Required

Delete current user's account.

**Full URL Examples:**
- Development: `http://localhost:3000/auth/profile/delete`
- Production: `https://api.yourdomain.com/auth/profile/delete`

**Response (200):**
```json
{
  "message": "Profile deleted successfully"
}
```

---

### Check Authentication

**GET** `{BASE_URL}/auth/checkAuth`

**Authentication:** Required

Verify if user is authenticated (same as profile endpoint).

**Full URL Examples:**
- Development: `http://localhost:3000/auth/checkAuth`
- Production: `https://api.yourdomain.com/auth/checkAuth`

**Response:** Same as `/auth/profile`

---

### Admin Register

**POST** `{BASE_URL}/auth/admin/register`

**Authentication:** Required (Admin only)

Register a new admin user.

**Full URL Examples:**
- Development: `http://localhost:3000/auth/admin/register`
- Production: `https://api.yourdomain.com/auth/admin/register`

**Request Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "emailId": "admin@example.com",
  "password": "admin123",
  "age": 30
}
```

**Response (201):**
```json
{
  "message": "Admin registered successfully",
  "user": {
    "_id": "admin_id",
    "firstName": "Admin",
    "emailId": "admin@example.com",
    "role": "admin"
  }
}
```

---

## Problems Endpoints

**Base Path:** `{BASE_URL}/problems`

### Get All Problems

**GET** `{BASE_URL}/problems/getAllProblems`

**Authentication:** Required

Get paginated list of all problems.

**Full URL Examples:**
- Development: `http://localhost:3000/problems/getAllProblems?page=1&limit=10`
- Production: `https://api.yourdomain.com/problems/getAllProblems?page=1&limit=10`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `difficulty` (optional): Filter by difficulty (easy, medium, hard)
- `topic` (optional): Filter by topic
- `search` (optional): Search in title/description

**Response (200):**
```json
{
  "problems": [
    {
      "_id": "problem_id",
      "title": "Two Sum",
      "description": "Find two numbers...",
      "difficulty": "easy",
      "topics": ["Array", "Hash Table"],
      "testCases": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

---

### Get Problem by ID

**GET** `{BASE_URL}/problems/problemById/:id`

**Authentication:** Required

Get detailed problem information.

**Full URL Examples:**
- Development: `http://localhost:3000/problems/problemById/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/problems/problemById/507f1f77bcf86cd799439011`

**Response (200):**
```json
{
  "problem": {
    "_id": "problem_id",
    "title": "Two Sum",
    "description": "Find two numbers...",
    "difficulty": "easy",
    "topics": ["Array", "Hash Table"],
    "testCases": [
      {
        "input": "[2,7,11,15], 9",
        "expectedOutput": "[0,1]"
      }
    ],
    "constraints": "1 <= nums.length <= 10^4",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get Topics

**GET** `{BASE_URL}/problems/topics`

**Authentication:** Required

Get list of all available problem topics.

**Full URL Examples:**
- Development: `http://localhost:3000/problems/topics`
- Production: `https://api.yourdomain.com/problems/topics`

**Response (200):**
```json
{
  "topics": ["Array", "Hash Table", "Two Pointers", "String", "Dynamic Programming"]
}
```

---

### Get Problems Solved by User

**GET** `{BASE_URL}/problems/problemSolved/user`

**Authentication:** Required

Get list of problems solved by the authenticated user.

**Full URL Examples:**
- Development: `http://localhost:3000/problems/problemSolved/user`
- Production: `https://api.yourdomain.com/problems/problemSolved/user`

**Response (200):**
```json
{
  "problems": [
    {
      "_id": "problem_id",
      "title": "Two Sum",
      "difficulty": "easy"
    }
  ]
}
```

---

### Get Problem Submission Times

**GET** `{BASE_URL}/problems/problemSubmit/times`

**Authentication:** Required

Get submission statistics for user.

**Full URL Examples:**
- Development: `http://localhost:3000/problems/problemSubmit/times`
- Production: `https://api.yourdomain.com/problems/problemSubmit/times`

**Response (200):**
```json
{
  "submissions": [
    {
      "problemId": "problem_id",
      "problemTitle": "Two Sum",
      "submissionCount": 5
    }
  ]
}
```

---

### Create Problem (Admin)

**POST** `{BASE_URL}/problems/create`

**Authentication:** Required (Admin only)

Create a new problem.

**Full URL Examples:**
- Development: `http://localhost:3000/problems/create`
- Production: `https://api.yourdomain.com/problems/create`

**Request Body:**
```json
{
  "title": "Two Sum",
  "description": "Find two numbers...",
  "difficulty": "easy",
  "topics": ["Array", "Hash Table"],
  "testCases": [
    {
      "input": "[2,7,11,15], 9",
      "expectedOutput": "[0,1]",
      "isPublic": true
    }
  ],
  "constraints": "1 <= nums.length <= 10^4"
}
```

**Response (201):**
```json
{
  "message": "Problem created successfully",
  "problem": { ... }
}
```

---

### Update Problem (Admin)

**PATCH** `{BASE_URL}/problems/update/:id`

**Authentication:** Required (Admin only)

Update an existing problem.

**Full URL Examples:**
- Development: `http://localhost:3000/problems/update/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/problems/update/507f1f77bcf86cd799439011`

**Request Body:** Same as create, all fields optional

**Response (200):**
```json
{
  "message": "Problem updated successfully",
  "problem": { ... }
}
```

---

### Delete Problem (Admin)

**DELETE** `{BASE_URL}/problems/delete/:id`

**Authentication:** Required (Admin only)

Delete a problem.

**Full URL Examples:**
- Development: `http://localhost:3000/problems/delete/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/problems/delete/507f1f77bcf86cd799439011`

**Response (200):**
```json
{
  "message": "Problem deleted successfully"
}
```

---

### Get Problem by ID (Admin)

**GET** `{BASE_URL}/problems/admin/problemById/:id`

**Authentication:** Required (Admin only)

Get problem details including all test cases (admin view).

**Full URL Examples:**
- Development: `http://localhost:3000/problems/admin/problemById/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/problems/admin/problemById/507f1f77bcf86cd799439011`

**Response:** Same as regular get by ID but includes all test cases

---

## Submissions Endpoints

**Base Path:** `{BASE_URL}/solve`

### Submit Solution

**POST** `{BASE_URL}/solve/submit/:id`

**Authentication:** Required

Submit a solution for a problem.

**Full URL Examples:**
- Development: `http://localhost:3000/solve/submit/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/solve/submit/507f1f77bcf86cd799439011`

**Request Body:**
```json
{
  "code": "function twoSum(nums, target) { ... }",
  "language": "javascript"
}
```

**Response (200):**
```json
{
  "message": "Solution submitted successfully",
  "submission": {
    "_id": "submission_id",
    "problemId": "problem_id",
    "userId": "user_id",
    "code": "function twoSum...",
    "language": "javascript",
    "status": "accepted",
    "testCasesPassed": 5,
    "totalTestCases": 5,
    "runtime": 45,
    "memory": 12.5,
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Possible Status Values:**
- `accepted`: All test cases passed
- `wrong_answer`: Some test cases failed
- `time_limit_exceeded`: Solution took too long
- `runtime_error`: Code execution error
- `compilation_error`: Code compilation failed

---

### Run Code on Test Cases

**POST** `{BASE_URL}/solve/run/:id`

**Authentication:** Required

Run code against problem test cases without submitting.

**Full URL Examples:**
- Development: `http://localhost:3000/solve/run/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/solve/run/507f1f77bcf86cd799439011`

**Request Body:**
```json
{
  "code": "function twoSum(nums, target) { ... }",
  "language": "javascript"
}
```

**Response (200):**
```json
{
  "results": [
    {
      "testCase": 1,
      "status": "passed",
      "input": "[2,7,11,15], 9",
      "expectedOutput": "[0,1]",
      "actualOutput": "[0,1]",
      "runtime": 12
    }
  ],
  "summary": {
    "passed": 5,
    "total": 5
  }
}
```

---

### Run Custom Input

**POST** `{BASE_URL}/solve/run-custom`

**Authentication:** Required

Run code with custom input (not against test cases).

**Full URL Examples:**
- Development: `http://localhost:3000/solve/run-custom`
- Production: `https://api.yourdomain.com/solve/run-custom`

**Request Body:**
```json
{
  "code": "function twoSum(nums, target) { ... }",
  "language": "javascript",
  "input": "[1,2,3,4], 7"
}
```

**Response (200):**
```json
{
  "output": "[2,3]",
  "runtime": 10,
  "memory": 8.5
}
```

---

### Get User Submissions

**GET** `{BASE_URL}/solve/submissions/user`

**Authentication:** Required

Get all submissions by the authenticated user.

**Full URL Examples:**
- Development: `http://localhost:3000/solve/submissions/user?page=1&limit=10`
- Production: `https://api.yourdomain.com/solve/submissions/user?page=1&limit=10`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `problemId` (optional): Filter by problem

**Response (200):**
```json
{
  "submissions": [
    {
      "_id": "submission_id",
      "problemId": "problem_id",
      "problemTitle": "Two Sum",
      "status": "accepted",
      "language": "javascript",
      "submittedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1
}
```

---

### Get Problem Submissions

**GET** `{BASE_URL}/solve/submissions/problem/:id`

**Authentication:** Required

Get all submissions for a specific problem by the authenticated user.

**Full URL Examples:**
- Development: `http://localhost:3000/solve/submissions/problem/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/solve/submissions/problem/507f1f77bcf86cd799439011`

**Response (200):**
```json
{
  "submissions": [
    {
      "_id": "submission_id",
      "status": "accepted",
      "language": "javascript",
      "submittedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Contests Endpoints

**Base Path:** `{BASE_URL}/contests`

### Get All Contests

**GET** `{BASE_URL}/contests/getAllContests`

**Authentication:** Required

Get list of all available contests.

**Full URL Examples:**
- Development: `http://localhost:3000/contests/getAllContests?page=1&limit=10`
- Production: `https://api.yourdomain.com/contests/getAllContests?page=1&limit=10`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (upcoming, active, ended)

**Response (200):**
```json
{
  "contests": [
    {
      "_id": "contest_id",
      "title": "Weekly Contest",
      "description": "Solve problems in 2 hours",
      "startTime": "2024-01-01T10:00:00.000Z",
      "endTime": "2024-01-01T12:00:00.000Z",
      "problems": ["problem_id_1", "problem_id_2"],
      "participants": ["user_id_1", "user_id_2"],
      "status": "upcoming"
    }
  ],
  "total": 10
}
```

---

### Get Contest by ID

**GET** `{BASE_URL}/contests/contestById/:id`

**Authentication:** Required

Get detailed contest information.

**Full URL Examples:**
- Development: `http://localhost:3000/contests/contestById/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/contests/contestById/507f1f77bcf86cd799439011`

**Response (200):**
```json
{
  "contest": {
    "_id": "contest_id",
    "title": "Weekly Contest",
    "description": "Solve problems in 2 hours",
    "startTime": "2024-01-01T10:00:00.000Z",
    "endTime": "2024-01-01T12:00:00.000Z",
    "problems": [
      {
        "_id": "problem_id",
        "title": "Two Sum",
        "difficulty": "easy"
      }
    ],
    "participants": 50,
    "status": "active"
  }
}
```

---

### Get My Contests

**GET** `{BASE_URL}/contests/myContests`

**Authentication:** Required

Get contests joined or created by the authenticated user.

**Full URL Examples:**
- Development: `http://localhost:3000/contests/myContests`
- Production: `https://api.yourdomain.com/contests/myContests`

**Response (200):**
```json
{
  "contests": [
    {
      "_id": "contest_id",
      "title": "Weekly Contest",
      "status": "active",
      "joinedAt": "2024-01-01T09:00:00.000Z"
    }
  ]
}
```

---

### Join Contest

**POST** `{BASE_URL}/contests/join/:id`

**Authentication:** Required

Join a contest.

**Full URL Examples:**
- Development: `http://localhost:3000/contests/join/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/contests/join/507f1f77bcf86cd799439011`

**Response (200):**
```json
{
  "message": "Successfully joined contest",
  "contest": { ... }
}
```

**Error Responses:**
- `400`: Contest not found or already joined
- `400`: Contest has ended

---

### Create Personal Contest

**POST** `{BASE_URL}/contests/createPersonal`

**Authentication:** Required

Create a personal contest.

**Full URL Examples:**
- Development: `http://localhost:3000/contests/createPersonal`
- Production: `https://api.yourdomain.com/contests/createPersonal`

**Request Body:**
```json
{
  "title": "My Practice Contest",
  "description": "Practice session",
  "startTime": "2024-01-01T10:00:00.000Z",
  "endTime": "2024-01-01T12:00:00.000Z",
  "problemIds": ["problem_id_1", "problem_id_2"]
}
```

**Response (201):**
```json
{
  "message": "Contest created successfully",
  "contest": { ... }
}
```

---

### Get Contest Creation Count

**GET** `{BASE_URL}/contests/creationCount`

**Authentication:** Required

Get number of contests created by the user.

**Full URL Examples:**
- Development: `http://localhost:3000/contests/creationCount`
- Production: `https://api.yourdomain.com/contests/creationCount`

**Response (200):**
```json
{
  "count": 5
}
```

---

### Create Contest (Admin)

**POST** `{BASE_URL}/contests/create`

**Authentication:** Required (Admin only)

Create a new contest.

**Full URL Examples:**
- Development: `http://localhost:3000/contests/create`
- Production: `https://api.yourdomain.com/contests/create`

**Request Body:**
```json
{
  "title": "Weekly Contest",
  "description": "Solve problems in 2 hours",
  "startTime": "2024-01-01T10:00:00.000Z",
  "endTime": "2024-01-01T12:00:00.000Z",
  "problemIds": ["problem_id_1", "problem_id_2"]
}
```

**Response (201):**
```json
{
  "message": "Contest created successfully",
  "contest": { ... }
}
```

---

### Update Contest (Admin)

**PATCH** `{BASE_URL}/contests/update/:id`

**Authentication:** Required (Admin only)

Update an existing contest.

**Full URL Examples:**
- Development: `http://localhost:3000/contests/update/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/contests/update/507f1f77bcf86cd799439011`

**Request Body:** Same as create, all fields optional

**Response (200):**
```json
{
  "message": "Contest updated successfully",
  "contest": { ... }
}
```

---

### Delete Contest (Admin)

**DELETE** `{BASE_URL}/contests/delete/:id`

**Authentication:** Required (Admin only)

Delete a contest.

**Full URL Examples:**
- Development: `http://localhost:3000/contests/delete/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/contests/delete/507f1f77bcf86cd799439011`

**Response (200):**
```json
{
  "message": "Contest deleted successfully"
}
```

---

## Stats Endpoints

**Base Path:** `{BASE_URL}/stats`

### Get Overview Stats

**GET** `{BASE_URL}/stats/overview`

**Authentication:** Required

Get user's overall statistics.

**Full URL Examples:**
- Development: `http://localhost:3000/stats/overview`
- Production: `https://api.yourdomain.com/stats/overview`

**Response (200):**
```json
{
  "stats": {
    "totalProblemsSolved": 25,
    "totalSubmissions": 150,
    "acceptanceRate": 75.5,
    "problemsByDifficulty": {
      "easy": 15,
      "medium": 8,
      "hard": 2
    },
    "problemsByTopic": {
      "Array": 10,
      "Hash Table": 5,
      "String": 10
    }
  }
}
```

---

### Get User Streak

**GET** `{BASE_URL}/stats/streak`

**Authentication:** Required

Get user's current streak and streak history.

**Full URL Examples:**
- Development: `http://localhost:3000/stats/streak`
- Production: `https://api.yourdomain.com/stats/streak`

**Response (200):**
```json
{
  "currentStreak": 7,
  "longestStreak": 15,
  "streakHistory": [
    {
      "date": "2024-01-01",
      "solved": true
    }
  ]
}
```

---

## Leaderboard Endpoints

**Base Path:** `{BASE_URL}/leaderboard`

### Get Top Users

**GET** `{BASE_URL}/leaderboard/top`

**Authentication:** Required

Get top users by problems solved.

**Full URL Examples:**
- Development: `http://localhost:3000/leaderboard/top?limit=20`
- Production: `https://api.yourdomain.com/leaderboard/top?limit=20`

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 20, max: 100)

**Response (200):**
```json
{
  "users": [
    {
      "firstName": "John",
      "solvedCount": 150
    },
    {
      "firstName": "Jane",
      "solvedCount": 120
    }
  ]
}
```

---

## User Management Endpoints

**Base Path:** `{BASE_URL}/users`

### Test Route

**GET** `{BASE_URL}/users/test`

Test if user management router is working.

**Full URL Examples:**
- Development: `http://localhost:3000/users/test`
- Production: `https://api.yourdomain.com/users/test`

**Response (200):**
```json
{
  "message": "User management router is working",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Get All Users (Admin)

**GET** `{BASE_URL}/users/all`

**Authentication:** Required (Admin only)

Get list of all users.

**Full URL Examples:**
- Development: `http://localhost:3000/users/all?page=1&limit=10`
- Production: `https://api.yourdomain.com/users/all?page=1&limit=10`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by name or email

**Response (200):**
```json
{
  "users": [
    {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "emailId": "john@example.com",
      "role": "user",
      "problemsSolved": 25
    }
  ],
  "total": 100
}
```

---

### Create User (Admin)

**POST** `{BASE_URL}/users/create`

**Authentication:** Required (Admin only)

Create a new user.

**Full URL Examples:**
- Development: `http://localhost:3000/users/create`
- Production: `https://api.yourdomain.com/users/create`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "emailId": "john@example.com",
  "password": "password123",
  "age": 25,
  "role": "user"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": { ... }
}
```

---

### Get User by ID (Admin)

**GET** `{BASE_URL}/users/:id`

**Authentication:** Required (Admin only)

Get user details by ID.

**Full URL Examples:**
- Development: `http://localhost:3000/users/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/users/507f1f77bcf86cd799439011`

**Response (200):**
```json
{
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "emailId": "john@example.com",
    "role": "user",
    "problemsSolved": 25
  }
}
```

---

### Update User (Admin)

**PATCH** `{BASE_URL}/users/update/:id`

**Authentication:** Required (Admin only)

Update user information.

**Full URL Examples:**
- Development: `http://localhost:3000/users/update/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/users/update/507f1f77bcf86cd799439011`

**Request Body:**
```json
{
  "firstName": "John Updated",
  "age": 26
}
```

**Response (200):**
```json
{
  "message": "User updated successfully",
  "user": { ... }
}
```

---

### Delete User (Admin)

**DELETE** `{BASE_URL}/users/delete/:id`

**Authentication:** Required (Admin only)

Delete a user.

**Full URL Examples:**
- Development: `http://localhost:3000/users/delete/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/users/delete/507f1f77bcf86cd799439011`

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

### Toggle Subscription Lock (Admin)

**PATCH** `{BASE_URL}/users/:id/subscription/lock`

**Authentication:** Required (Admin only)

Lock or unlock a user's subscription.

**Full URL Examples:**
- Development: `http://localhost:3000/users/507f1f77bcf86cd799439011/subscription/lock`
- Production: `https://api.yourdomain.com/users/507f1f77bcf86cd799439011/subscription/lock`

**Request Body:**
```json
{
  "locked": true
}
```

**Response (200):**
```json
{
  "message": "Subscription lock toggled successfully"
}
```

---

### Update User Subscription (Admin)

**PATCH** `{BASE_URL}/users/:id/subscription`

**Authentication:** Required (Admin only)

Manually update a user's subscription.

**Full URL Examples:**
- Development: `http://localhost:3000/users/507f1f77bcf86cd799439011/subscription`
- Production: `https://api.yourdomain.com/users/507f1f77bcf86cd799439011/subscription`

**Request Body:**
```json
{
  "isActive": true,
  "planType": "monthly",
  "startDate": "2024-01-01T00:00:00.000Z",
  "expiryDate": "2024-02-01T00:00:00.000Z"
}
```

**Response (200):**
```json
{
  "message": "Subscription updated successfully"
}
```

---

## AI Chat Endpoints

**Base Path:** `{BASE_URL}/ai`

### Test Route

**GET** `{BASE_URL}/ai/test`

Test if AI chat router is working.

**Full URL Examples:**
- Development: `http://localhost:3000/ai/test`
- Production: `https://api.yourdomain.com/ai/test`

**Response (200):**
```json
{
  "message": "AI Chat router is working"
}
```

---

### Chat with AI

**POST** `{BASE_URL}/ai/chat`

**Authentication:** Required

Chat with AI assistant for coding help.

**Full URL Examples:**
- Development: `http://localhost:3000/ai/chat`
- Production: `https://api.yourdomain.com/ai/chat`

**Request Body:**
```json
{
  "message": "How do I solve the two sum problem?",
  "context": {
    "problemId": "problem_id",
    "code": "function twoSum() { ... }"
  }
}
```

**Response (200):**
```json
{
  "response": "To solve the two sum problem, you can use a hash map...",
  "suggestions": [
    "Try using a hash map for O(n) time complexity"
  ]
}
```

---

## Videos Endpoints

**Base Path:** `{BASE_URL}/videos`

### Get Upload Token (Admin)

**POST** `{BASE_URL}/videos/upload-token`

**Authentication:** Required (Admin only)

Get Cloudinary upload token for video upload.

**Full URL Examples:**
- Development: `http://localhost:3000/videos/upload-token`
- Production: `https://api.yourdomain.com/videos/upload-token`

**Request Body:**
```json
{
  "problemId": "problem_id"
}
```

**Response (200):**
```json
{
  "uploadPreset": "preset_name",
  "folder": "videos/problem_id",
  "cloudName": "cloud_name"
}
```

---

### Save Video (Admin)

**POST** `{BASE_URL}/videos/save`

**Authentication:** Required (Admin only)

Save video metadata after upload.

**Full URL Examples:**
- Development: `http://localhost:3000/videos/save`
- Production: `https://api.yourdomain.com/videos/save`

**Request Body:**
```json
{
  "problemId": "problem_id",
  "title": "Two Sum Solution",
  "description": "Explanation of two sum problem",
  "cloudinaryVideoId": "video_id",
  "cloudinaryUrl": "https://res.cloudinary.com/...",
  "thumbnailUrl": "https://res.cloudinary.com/...",
  "duration": 300
}
```

**Response (201):**
```json
{
  "message": "Video saved successfully",
  "video": { ... }
}
```

---

### Get All Videos (Admin)

**GET** `{BASE_URL}/videos/all`

**Authentication:** Required (Admin only)

Get list of all videos.

**Full URL Examples:**
- Development: `http://localhost:3000/videos/all`
- Production: `https://api.yourdomain.com/videos/all`

**Response (200):**
```json
{
  "videos": [
    {
      "_id": "video_id",
      "title": "Two Sum Solution",
      "problemId": "problem_id",
      "cloudinaryUrl": "https://...",
      "views": 150
    }
  ]
}
```

---

### Get Problem Videos

**GET** `{BASE_URL}/videos/problem/:problemId`

**Authentication:** Required (Paid users only)

Get videos for a specific problem.

**Full URL Examples:**
- Development: `http://localhost:3000/videos/problem/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/videos/problem/507f1f77bcf86cd799439011`

**Response (200):**
```json
{
  "videos": [
    {
      "_id": "video_id",
      "title": "Two Sum Solution",
      "description": "Explanation...",
      "cloudinaryUrl": "https://...",
      "duration": 300,
      "views": 150
    }
  ]
}
```

---

### Get Video

**GET** `{BASE_URL}/videos/:videoId`

Get video details.

**Full URL Examples:**
- Development: `http://localhost:3000/videos/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/videos/507f1f77bcf86cd799439011`

**Response (200):**
```json
{
  "video": {
    "_id": "video_id",
    "title": "Two Sum Solution",
    "cloudinaryUrl": "https://...",
    "views": 150,
    "duration": 300
  }
}
```

---

### Increment Video Views

**POST** `{BASE_URL}/videos/:videoId/increment-views`

Increment video view count.

**Full URL Examples:**
- Development: `http://localhost:3000/videos/507f1f77bcf86cd799439011/increment-views`
- Production: `https://api.yourdomain.com/videos/507f1f77bcf86cd799439011/increment-views`

**Response (200):**
```json
{
  "message": "Views incremented",
  "views": 151
}
```

---

### Update Video

**PATCH** `{BASE_URL}/videos/:videoId`

**Authentication:** Required

Update video metadata.

**Full URL Examples:**
- Development: `http://localhost:3000/videos/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/videos/507f1f77bcf86cd799439011`

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "message": "Video updated successfully",
  "video": { ... }
}
```

---

### Delete Video

**DELETE** `{BASE_URL}/videos/:videoId`

**Authentication:** Required

Delete a video.

**Full URL Examples:**
- Development: `http://localhost:3000/videos/507f1f77bcf86cd799439011`
- Production: `https://api.yourdomain.com/videos/507f1f77bcf86cd799439011`

**Response (200):**
```json
{
  "message": "Video deleted successfully"
}
```

---

## Payments Endpoints

**Base Path:** `{BASE_URL}/payment`

### Get Plans

**GET** `{BASE_URL}/payment/plans`

Get available subscription plans.

**Full URL Examples:**
- Development: `http://localhost:3000/payment/plans`
- Production: `https://api.yourdomain.com/payment/plans`

**Response (200):**
```json
{
  "plans": [
    {
      "planType": "monthly",
      "price": 999,
      "currency": "INR",
      "features": ["Access to all videos", "Priority support"]
    },
    {
      "planType": "yearly",
      "price": 9999,
      "currency": "INR",
      "features": ["Access to all videos", "Priority support", "20% discount"]
    }
  ]
}
```

---

### Create Order

**POST** `{BASE_URL}/payment/create-order`

Create a payment order.

**Full URL Examples:**
- Development: `http://localhost:3000/payment/create-order`
- Production: `https://api.yourdomain.com/payment/create-order`

**Request Body:**
```json
{
  "planType": "monthly",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response (200):**
```json
{
  "orderId": "order_id",
  "amount": 999,
  "currency": "INR",
  "paymentUrl": "https://payment.gateway.com/..."
}
```

---

### Verify Payment

**POST** `{BASE_URL}/payment/verify`

Verify payment after completion.

**Full URL Examples:**
- Development: `http://localhost:3000/payment/verify`
- Production: `https://api.yourdomain.com/payment/verify`

**Request Body:**
```json
{
  "orderId": "order_id",
  "paymentId": "payment_id"
}
```

**Response (200):**
```json
{
  "message": "Payment verified successfully",
  "subscription": {
    "isActive": true,
    "planType": "monthly",
    "expiryDate": "2024-02-01T00:00:00.000Z"
  }
}
```

---

### Get Subscription Status

**GET** `{BASE_URL}/payment/subscription-status`

**Authentication:** Required

Get current user's subscription status.

**Full URL Examples:**
- Development: `http://localhost:3000/payment/subscription-status`
- Production: `https://api.yourdomain.com/payment/subscription-status`

**Response (200):**
```json
{
  "subscription": {
    "isActive": true,
    "planType": "monthly",
    "startDate": "2024-01-01T00:00:00.000Z",
    "expiryDate": "2024-02-01T00:00:00.000Z"
  }
}
```

---

### Get Payment History

**GET** `{BASE_URL}/payment/history`

**Authentication:** Required

Get user's payment history.

**Full URL Examples:**
- Development: `http://localhost:3000/payment/history`
- Production: `https://api.yourdomain.com/payment/history`

**Response (200):**
```json
{
  "payments": [
    {
      "_id": "payment_id",
      "amount": 999,
      "planType": "monthly",
      "status": "completed",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Payment Webhook

**POST** `{BASE_URL}/payment/webhook`

Webhook endpoint for payment gateway callbacks (handled automatically).

**Full URL Examples:**
- Development: `http://localhost:3000/payment/webhook`
- Production: `https://api.yourdomain.com/payment/webhook`

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation error or invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

---

## Rate Limiting

Some endpoints may have rate limiting applied. Check response headers for rate limit information.

---

## CORS

The API supports CORS for the following origins:
- `http://localhost:5173`
- `http://localhost:5174`
- `http://localhost:5175`
- `http://localhost:3000`
- `http://3.109.157.144`

Credentials are required for authenticated requests.

---

## Support

For API support or questions, please contact the development team.

---

**Last Updated:** November 2024
