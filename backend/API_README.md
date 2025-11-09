# Code Verse API Documentation

Complete API documentation for the Code Verse platform.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: Set via `VITE_API_BASE_URL` environment variable

## Authentication

Most endpoints require authentication via JWT token stored in HTTP-only cookies. Include credentials in requests:

```javascript
// Axios example
axios.get('/api/endpoint', { withCredentials: true })
```

## Response Format

All responses follow this structure:

```json
{
  "message": "Success message",
  "data": { ... }
}
```

Error responses:

```json
{
  "message": "Error message"
}
```

---

## Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Problems](#problems-endpoints)
3. [Submissions](#submissions-endpoints)
4. [Contests](#contests-endpoints)
5. [Stats](#stats-endpoints)
6. [Leaderboard](#leaderboard-endpoints)
7. [User Management](#user-management-endpoints)
8. [AI Chat](#ai-chat-endpoints)
9. [Videos](#videos-endpoints)
10. [Payments](#payments-endpoints)

---

## Authentication Endpoints

Base path: `/auth`

### Health Check

**GET** `/auth/health`

Check if auth routes are working.

**Response:**
```json
{
  "status": "ok",
  "message": "Auth routes are working"
}
```

---

### Register User

**POST** `/auth/register`

Register a new user account.

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

**POST** `/auth/login`

Authenticate user and receive JWT token.

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

**POST** `/auth/logout`

**Authentication:** Required

Logout user and clear session.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### Get User Profile

**GET** `/auth/profile`

**Authentication:** Required

Get current authenticated user's profile.

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

**DELETE** `/auth/profile/delete`

**Authentication:** Required

Delete current user's account.

**Response (200):**
```json
{
  "message": "Profile deleted successfully"
}
```

---

### Check Authentication

**GET** `/auth/checkAuth`

**Authentication:** Required

Verify if user is authenticated (same as profile endpoint).

**Response:** Same as `/auth/profile`

---

### Admin Register

**POST** `/auth/admin/register`

**Authentication:** Required (Admin only)

Register a new admin user.

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

Base path: `/problems`

### Get All Problems

**GET** `/problems/getAllProblems`

**Authentication:** Required

Get paginated list of all problems.

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

**GET** `/problems/problemById/:id`

**Authentication:** Required

Get detailed problem information.

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

**GET** `/problems/topics`

**Authentication:** Required

Get list of all available problem topics.

**Response (200):**
```json
{
  "topics": ["Array", "Hash Table", "Two Pointers", "String", "Dynamic Programming"]
}
```

---

### Get Problems Solved by User

**GET** `/problems/problemSolved/user`

**Authentication:** Required

Get list of problems solved by the authenticated user.

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

**GET** `/problems/problemSubmit/times`

**Authentication:** Required

Get submission statistics for user.

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

**POST** `/problems/create`

**Authentication:** Required (Admin only)

Create a new problem.

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

**PATCH** `/problems/update/:id`

**Authentication:** Required (Admin only)

Update an existing problem.

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

**DELETE** `/problems/delete/:id`

**Authentication:** Required (Admin only)

Delete a problem.

**Response (200):**
```json
{
  "message": "Problem deleted successfully"
}
```

---

### Get Problem by ID (Admin)

**GET** `/problems/admin/problemById/:id`

**Authentication:** Required (Admin only)

Get problem details including all test cases (admin view).

**Response:** Same as regular get by ID but includes all test cases

---

## Submissions Endpoints

Base path: `/solve`

### Submit Solution

**POST** `/solve/submit/:id`

**Authentication:** Required

Submit a solution for a problem.

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

**POST** `/solve/run/:id`

**Authentication:** Required

Run code against problem test cases without submitting.

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

**POST** `/solve/run-custom`

**Authentication:** Required

Run code with custom input (not against test cases).

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

**GET** `/solve/submissions/user`

**Authentication:** Required

Get all submissions by the authenticated user.

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

**GET** `/solve/submissions/problem/:id`

**Authentication:** Required

Get all submissions for a specific problem by the authenticated user.

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

Base path: `/contests`

### Get All Contests

**GET** `/contests/getAllContests`

**Authentication:** Required

Get list of all available contests.

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

**GET** `/contests/contestById/:id`

**Authentication:** Required

Get detailed contest information.

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

**GET** `/contests/myContests`

**Authentication:** Required

Get contests joined or created by the authenticated user.

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

**POST** `/contests/join/:id`

**Authentication:** Required

Join a contest.

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

**POST** `/contests/createPersonal`

**Authentication:** Required

Create a personal contest.

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

**GET** `/contests/creationCount`

**Authentication:** Required

Get number of contests created by the user.

**Response (200):**
```json
{
  "count": 5
}
```

---

### Create Contest (Admin)

**POST** `/contests/create`

**Authentication:** Required (Admin only)

Create a new contest.

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

**PATCH** `/contests/update/:id`

**Authentication:** Required (Admin only)

Update an existing contest.

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

**DELETE** `/contests/delete/:id`

**Authentication:** Required (Admin only)

Delete a contest.

**Response (200):**
```json
{
  "message": "Contest deleted successfully"
}
```

---

## Stats Endpoints

Base path: `/stats`

### Get Overview Stats

**GET** `/stats/overview`

**Authentication:** Required

Get user's overall statistics.

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

**GET** `/stats/streak`

**Authentication:** Required

Get user's current streak and streak history.

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

Base path: `/leaderboard`

### Get Top Users

**GET** `/leaderboard/top`

**Authentication:** Required

Get top users by problems solved.

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

Base path: `/users`

### Test Route

**GET** `/users/test`

Test if user management router is working.

**Response (200):**
```json
{
  "message": "User management router is working",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Get All Users (Admin)

**GET** `/users/all`

**Authentication:** Required (Admin only)

Get list of all users.

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

**POST** `/users/create`

**Authentication:** Required (Admin only)

Create a new user.

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

**GET** `/users/:id`

**Authentication:** Required (Admin only)

Get user details by ID.

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

**PATCH** `/users/update/:id`

**Authentication:** Required (Admin only)

Update user information.

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

**DELETE** `/users/delete/:id`

**Authentication:** Required (Admin only)

Delete a user.

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

### Toggle Subscription Lock (Admin)

**PATCH** `/users/:id/subscription/lock`

**Authentication:** Required (Admin only)

Lock or unlock a user's subscription.

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

**PATCH** `/users/:id/subscription`

**Authentication:** Required (Admin only)

Manually update a user's subscription.

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

Base path: `/ai`

### Test Route

**GET** `/ai/test`

Test if AI chat router is working.

**Response (200):**
```json
{
  "message": "AI Chat router is working"
}
```

---

### Chat with AI

**POST** `/ai/chat`

**Authentication:** Required

Chat with AI assistant for coding help.

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

Base path: `/videos`

### Get Upload Token (Admin)

**POST** `/videos/upload-token`

**Authentication:** Required (Admin only)

Get Cloudinary upload token for video upload.

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

**POST** `/videos/save`

**Authentication:** Required (Admin only)

Save video metadata after upload.

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

**GET** `/videos/all`

**Authentication:** Required (Admin only)

Get list of all videos.

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

**GET** `/videos/problem/:problemId`

**Authentication:** Required (Paid users only)

Get videos for a specific problem.

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

**GET** `/videos/:videoId`

Get video details.

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

**POST** `/videos/:videoId/increment-views`

Increment video view count.

**Response (200):**
```json
{
  "message": "Views incremented",
  "views": 151
}
```

---

### Update Video

**PATCH** `/videos/:videoId`

**Authentication:** Required

Update video metadata.

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

**DELETE** `/videos/:videoId`

**Authentication:** Required

Delete a video.

**Response (200):**
```json
{
  "message": "Video deleted successfully"
}
```

---

## Payments Endpoints

Base path: `/payment`

### Get Plans

**GET** `/payment/plans`

Get available subscription plans.

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

**POST** `/payment/create-order`

Create a payment order.

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

**POST** `/payment/verify`

Verify payment after completion.

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

**GET** `/payment/subscription-status`

**Authentication:** Required

Get current user's subscription status.

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

**GET** `/payment/history`

**Authentication:** Required

Get user's payment history.

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

**POST** `/payment/webhook`

Webhook endpoint for payment gateway callbacks (handled automatically).

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

**Last Updated:** January 2024

