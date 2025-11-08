# Code Arena Backend

Node.js/Express service that powers the Code Arena platform. It handles user auth, contest management, problem CRUD, submissions, leaderboards, and stats while persisting data in MongoDB and optionally caching in Redis.

## Tech Stack

- Node.js 18+
- Express 5
- MongoDB with Mongoose ODM
- Redis (optional; caching/session store)
- JSON Web Tokens for auth

## Getting Started

```bash
cd backend
npm install
```

1. Create a `.env` file in the `backend` directory with the following variables:

   | Variable | Description | Example | Required |
   | --- | --- | --- | --- |
   | `PORT` | HTTP port | `8080` | No (defaults to 8080) |
   | `DB_URL` | MongoDB connection string | `mongodb://localhost:27017/code_arena` | Yes |
   | `JWT_SECRET` | Secret for signing tokens | `your_secret_key_here` | Yes |
   | `REDIS_HOST` | Redis host | `localhost` | Yes |
   | `REDIS_PORT` | Redis port | `6379` | Yes |
   | `REDIS_USERNAME` | Redis username (if required) | - | No |
   | `REDIS_PASSWORD` | Redis password (if required) | - | No |
   | `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` | Yes (for video uploads) |
   | `CLOUDINARY_API_KEY` | Cloudinary API key | `your_api_key` | Yes (for video uploads) |
   | `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_api_secret` | Yes (for video uploads) |
   | `CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset name | `code_arena_videos` | Yes (for video uploads) |
   | `JUDGEO_URL` | Judge0 API URL | - | Yes (for code execution) |
   | `JUDGEO_RAPIDAPI_KEY` | Judge0 RapidAPI key | - | Yes (for code execution) |
   | `JUDGEO_RAPID_HOST` | Judge0 RapidAPI host | - | Yes (for code execution) |
   | `gemniKey` | Google Gemini API key | - | Yes (for AI chat) |

2. Start the server:

   ```bash
   node src/index.js
   ```

   Add scripts to `package.json` for convenience if desired:

   ```json
   {
     "scripts": {
       "start": "node src/index.js",
       "dev": "nodemon src/index.js"
     }
   }
   ```

## Project Structure

```
src/
├─ index.js            # Application bootstrap
├─ config/             # Database/Redis configuration
├─ controllers/        # Route handlers for auth, contests, submissions, etc.
├─ middleware/         # Auth/role middlewares
├─ models/             # Mongoose models
├─ routes/             # Express route definitions
└─ utils/              # Validation and helper functions
```

## Key Routes

- **Auth**: `src/routes/userAuth.js` (login, register, logout, profile, admin register)
- **User Management**: `src/routes/userManagement.js` (CRUD operations for users - admin only)
- **Problems**: `src/routes/problemCreater.js` (create, read, update, delete problems)
- **Contests**: `src/routes/contest.js` (contest management)
- **Submissions**: `src/routes/submit.js` (code submission and execution)
- **Leaderboard**: `src/routes/leaderboard.js` (user rankings)
- **Stats**: `src/routes/stats.js` (user statistics and streaks)
- **AI Chat**: `src/routes/aiChat.js` (AI-powered coding assistance)
- **Videos**: `src/routes/video.js` (video upload and management for editorial content)

### Video Routes (Admin Only)
- `POST /videos/upload-token` - Get Cloudinary upload token
- `POST /videos/save` - Save video metadata after upload
- `GET /videos/all` - Get all videos (admin only)
- `GET /videos/problem/:problemId` - Get videos for a problem (public)
- `POST /videos/:videoId/increment-views` - Increment video views (public)
- `GET /videos/:videoId` - Get single video (public)
- `PATCH /videos/:videoId` - Update video (admin or owner)
- `DELETE /videos/:videoId` - Delete video (admin or owner)

Inspect each controller for expected request/response payloads.

## Development Notes

- Run MongoDB and Redis locally or provide hosted URLs before starting the app.
- JWT secrets and database credentials should never be committed; use `.env` or a secret manager.
- Consider adding tests (currently none). Supertest + Jest is a common stack.
- When deploying, configure production-grade logging, HTTPS, and rate limiting.

## Cloudinary Setup (for Video Uploads)

1. Create a Cloudinary account at https://cloudinary.com/
2. Get your credentials from the dashboard
3. Create an **unsigned** upload preset:
   - Go to Settings → Upload
   - Click "Add upload preset"
   - Set name to match `CLOUDINARY_UPLOAD_PRESET` (e.g., `code_arena_videos`)
   - Set **Signing mode** to **"Unsigned"** (critical for direct frontend uploads)
   - Set **Resource type** to **"Video"**
   - Set **Max file size** to 500MB
   - Save the preset

See `CLOUDINARY_SETUP.md` for detailed instructions.

## Troubleshooting

- **Cannot connect to MongoDB**: ensure `DB_URL` is correct and MongoDB is running.
- **CORS or cookie issues**: review `cors` config in `src/index.js` and confirm frontend origin matches.
- **Redis errors**: ensure `REDIS_HOST` and `REDIS_PORT` are set correctly, or check Redis connection.
- **Video upload fails**: Check Cloudinary preset is set to "Unsigned" and credentials are correct.
- **Missing dependencies**: Run `npm install` to ensure all packages are installed (cloudinary, lodash, etc.)

## License

See the repository root for license information.
