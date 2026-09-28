# Code Verse — Vercel Serverless Deployment Guide

This folder (`deploye/`) contains the production-ready **Vercel Serverless Deployment** version of **Code Verse**, a full-stack competitive programming and coding interview platform.

---

## 🏗️ Architecture Overview

The Vercel-compatible deployment decouples the traditional long-running Node.js server into an event-driven serverless architecture across 3 independent Vercel projects:

```text
                                INTERNET
                                   │
                 ┌─────────────────┴─────────────────┐
                 │                                   │
           Vercel User                         Vercel Admin
            Frontend                             Frontend
          (React / Vite)                       (React / Vite)
                 │                                   │
                 └─────────────────┬─────────────────┘
                                   │
                                   ▼
                             Vercel Backend
                             Serverless API
                          (Express on Vercel)
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
          ▼                        ▼                        ▼
    MongoDB Atlas                Redis                External APIs
   (Database with              (Upstash /                   │
  Connection Pool)            Redis Cloud)                  │
                                                            │
                            ┌───────────────────────────────┼───────────────────────────────┐
                            ▼                               ▼                               ▼
                      Google Gemini                      Judge0                        Cloudinary
                     (AI Assistant)                (Code Execution)                 (Video Storage)
```

### Key Serverless Adaptations
- **Stateless API**: Converted from long-running `app.listen()` to ephemeral serverless request handlers (`api/index.js`).
- **Connection Pooling & Cache**: Reusable cached MongoDB connection avoids opening new connections per request invocation.
- **Resilient Redis**: Implemented fault-tolerant Redis clients that gracefully fall back if Redis is unreachable.
- **Cross-Domain Authentication**: Enhanced JWT cookie headers with `sameSite: 'none'`, `secure: true`, and authorization header fallbacks (`Bearer <token>`).
- **Bounded Judge0 Polling**: Replaced unbounded polling loops with timeout-safe polling to prevent serverless execution limits.
- **SPA Routing Rewrites**: Configured `vercel.json` rewrites for both React SPAs to prevent 404s on browser refresh.

---

## 📁 Directory Structure

```text
deploye/
├── backend/
│   ├── api/
│   │   └── index.js             # Vercel serverless entrypoint
│   ├── src/
│   │   ├── app.js               # Express application initialization & middleware
│   │   ├── server.js            # Local development entrypoint
│   │   ├── config/              # Serverless MongoDB, Redis, Cloudinary, Dodo configs
│   │   ├── controllers/         # All route controllers
│   │   ├── middleware/          # User, Admin, Paid User, and Rate Limiting middlewares
│   │   ├── models/              # Mongoose schemas (User, Problem, Submission, Contest, etc.)
│   │   ├── routes/              # Modular Express routes
│   │   └── utils/               # Judge0 utilities and validators
│   ├── .env.example             # Backend environment variable template
│   ├── .gitignore
│   ├── package.json
│   └── vercel.json              # Standalone Backend Vercel configuration
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/axiosClient.js   # Production Axios client reading VITE_API_BASE_URL
│   │   ├── utils/config.js      # Production URL and OAuth resolver
│   │   └── ...                  # Components, contexts, pages, styles
│   ├── .env.example             # User frontend environment variable template
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vercel.json              # SPA rewrite configuration
│   └── vite.config.js
│
├── frontend_admin/
│   ├── public/
│   ├── src/
│   │   ├── api/axiosClient.js   # Production Axios client reading VITE_API_BASE_URL
│   │   └── ...                  # Admin components, pages, forms
│   ├── .env.example             # Admin frontend environment variable template
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vercel.json              # SPA rewrite configuration
│   └── vite.config.js
│
├── vercel.json                  # Unified Monorepo routing configuration
├── .gitignore
├── MIGRATION.md                 # Detailed migration log & architecture comparison
└── README.md                    # This deployment guide
```

---

## 🚀 Step-by-Step Vercel Deployment

Deploy Code Verse as 3 distinct Vercel projects (recommended for clean subdomain separation):

### Step 1: External Cloud Services Setup

1. **MongoDB Atlas**:
   - Create a MongoDB Atlas cluster at [cloud.mongodb.com](https://cloud.mongodb.com/).
   - Create a database user and whitelist `0.0.0.0/0` (required for dynamic Vercel serverless IPs).
   - Copy connection string: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/code_verse?retryWrites=true&w=majority`.

2. **Upstash Redis (Serverless-compatible)**:
   - Create a free Redis database at [upstash.com](https://upstash.com/).
   - Copy the `REDIS_URL` connection string (e.g. `rediss://default:...@...upstash.io:6379`).

3. **Cloudinary (Video Uploads)**:
   - Sign up at [cloudinary.com](https://cloudinary.com/).
   - Note `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
   - Create an unsigned upload preset named `code_arena_videos` in Cloudinary Settings -> Upload.

4. **Judge0 (RapidAPI)**:
   - Subscribe to Judge0 CE on [RapidAPI](https://rapidapi.com/hermancloud/api/judge0-ce).
   - Copy your RapidAPI Key and Host (`judge0-ce.p.rapidapi.com`).

5. **Google Gemini AI**:
   - Generate an API key from [Google AI Studio](https://aistudio.google.com/).

6. **DodoPayments**:
   - Create an account on [DodoPayments](https://app.dodopayments.com/).
   - Obtain `DODO_API_KEY` and create monthly & yearly subscription products.
   - Configure webhook endpoint to: `https://<your-backend-vercel-url>/api/payment/webhook`.

---

### Step 2: Deploy Backend API (`code-verse-api`)

1. Go to [Vercel Dashboard](https://vercel.com/) -> **Add New Project**.
2. Select your GitHub repository.
3. Configure Project Settings:
   - **Framework Preset**: `Other`
   - **Root Directory**: `deploye/backend`
   - **Build Command**: Leave default (empty)
   - **Output Directory**: Leave default
4. Add Backend Environment Variables:

| Variable | Description | Example / Recommended Value |
|---|---|---|
| `NODE_ENV` | Environment Mode | `production` |
| `MONGODB_URI` | MongoDB Atlas URI | `mongodb+srv://user:pass@cluster.mongodb.net/code_verse` |
| `JWT_SECRET` | JWT Signing Secret | `your_32_char_random_secret` |
| `SESSION_SECRET` | Express Session Secret | `your_session_secret` |
| `REDIS_URL` | Upstash Redis URL | `rediss://default:pass@endpoint.upstash.io:6379` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `JUDGEO_URL` | Judge0 Endpoint | `https://judge0-ce.p.rapidapi.com/submissions/batch` |
| `JUDGEO_RAPIDAPI_KEY`| RapidAPI Key | `your_rapidapi_key` |
| `JUDGEO_RAPID_HOST` | RapidAPI Host | `judge0-ce.p.rapidapi.com` |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary Cloud Name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET`| Cloudinary Secret | `your_api_secret` |
| `CLOUDINARY_UPLOAD_PRESET`| Cloudinary Upload Preset | `code_arena_videos` |
| `DODO_API_KEY` | DodoPayments API Key | `dodo_sk_...` |
| `DODO_ENV` | DodoPayments Mode | `live_mode` or `test_mode` |
| `DODO_PAYMENTS_WEBHOOK_SECRET`| Webhook Secret | `whsec_...` |
| `DODO_PRODUCT_MONTHLY_ID`| Monthly Product ID | `p_monthly_xxx` |
| `DODO_PRODUCT_YEARLY_ID` | Yearly Product ID | `p_yearly_xxx` |
| `FRONTEND_URL` | User Frontend Domain | `https://code-verse.vercel.app` |
| `ADMIN_FRONTEND_URL` | Admin Frontend Domain | `https://code-verse-admin.vercel.app` |
| `BACKEND_URL` | Backend API Domain | `https://code-verse-api.vercel.app` |

5. Click **Deploy**. Note the assigned domain (e.g. `https://code-verse-api.vercel.app`).

---

### Step 3: Deploy User Frontend (`code-verse-frontend`)

1. In Vercel -> **Add New Project**.
2. Select your repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `deploye/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://code-verse-api.vercel.app`
5. Click **Deploy**. Note the assigned domain (e.g. `https://code-verse.vercel.app`).

---

### Step 4: Deploy Admin Frontend (`code-verse-admin`)

1. In Vercel -> **Add New Project**.
2. Select your repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `deploye/frontend_admin`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://code-verse-api.vercel.app`
5. Click **Deploy**. Note the assigned domain (e.g. `https://code-verse-admin.vercel.app`).

---

### Step 5: Finalize CORS & Webhook Configuration

1. In the **Backend Vercel Project Settings** -> Environment Variables:
   - Ensure `FRONTEND_URL` matches your deployed User Frontend domain.
   - Ensure `ADMIN_FRONTEND_URL` matches your deployed Admin Frontend domain.
   - Trigger a redeploy of the backend if you modified these variables.
2. In **DodoPayments Dashboard** -> Webhooks:
   - Set endpoint URL to `https://<your-backend-domain>/api/payment/webhook`.

---

## 📊 API Route Audit & Verification

| Route | Vercel Serverless Endpoint | Method | Auth Required | Purpose |
|---|---|---|---|---|
| `/auth/register` | `/api/auth/register` | `POST` | Public | Register new user |
| `/auth/login` | `/api/auth/login` | `POST` | Public | User / Admin login |
| `/auth/logout` | `/api/auth/logout` | `POST` | User | User logout & token blacklist |
| `/auth/profile` | `/api/auth/profile` | `GET` | User | Fetch active user profile |
| `/auth/checkAuth` | `/api/auth/checkAuth` | `GET` | User | Verify user session |
| `/problems/getAllProblems` | `/api/problems/getAllProblems` | `GET` | User | Paginated problem list with filters |
| `/problems/problemById/:id` | `/api/problems/problemById/:id` | `GET` | User | Get problem details |
| `/problems/create` | `/api/problems/create` | `POST` | Admin | Create new problem with test cases |
| `/problems/update/:id` | `/api/problems/update/:id` | `PATCH` | Admin | Update existing problem |
| `/problems/delete/:id` | `/api/problems/delete/:id` | `DELETE` | Admin | Remove problem |
| `/solve/submit/:id` | `/api/solve/submit/:id` | `POST` | User | Submit code against hidden test cases via Judge0 |
| `/solve/run/:id` | `/api/solve/run/:id` | `POST` | User | Test code against visible test cases |
| `/solve/run-custom` | `/api/solve/run-custom` | `POST` | User | Run code on custom standard input |
| `/solve/submissions/user` | `/api/solve/submissions/user` | `GET` | User | Get current user's submissions |
| `/solve/submissions/problem/:id` | `/api/solve/submissions/problem/:id` | `GET` | User | Get problem-specific submissions |
| `/contests/getAllContests` | `/api/contests/getAllContests` | `GET` | User | List all public contests |
| `/contests/contestById/:id` | `/api/contests/contestById/:id` | `GET` | User | Get contest details & problems |
| `/contests/join/:id` | `/api/contests/join/:id` | `POST` | User | Register user for contest |
| `/contests/create` | `/api/contests/create` | `POST` | Admin | Create platform-wide contest |
| `/leaderboard/top` | `/api/leaderboard/top` | `GET` | User | Get global leaderboard rankings |
| `/stats/overview` | `/api/stats/overview` | `GET` | User | User statistics & solved problems count |
| `/stats/streak` | `/api/stats/streak` | `GET` | User | User daily problem solving streak |
| `/ai/chat` | `/api/ai/chat` | `POST` | User | AI problem hints and guidance (Gemini) |
| `/videos/upload-token` | `/api/videos/upload-token` | `POST` | Admin | Get signed Cloudinary upload params |
| `/videos/save` | `/api/videos/save` | `POST` | Admin | Save uploaded video metadata |
| `/videos/problem/:problemId` | `/api/videos/problem/:problemId` | `GET` | Paid User / Admin | Get problem editorial video |
| `/payment/create-order` | `/api/payment/create-order` | `POST` | Optional User | Create Dodo checkout session |
| `/payment/verify` | `/api/payment/verify` | `POST` | Optional User | Verify payment session & activate subscription |
| `/payment/webhook` | `/api/payment/webhook` | `POST` | Dodo Signed | Webhook handler for payment events |
| `/payment/subscription-status` | `/api/payment/subscription-status` | `GET` | User | Get current subscription tier & validity |
| `/users/all` | `/api/users/all` | `GET` | Admin | Admin user listing |
| `/users/update/:id` | `/api/users/update/:id` | `PATCH` | Admin | Update user details & role |
| `/users/delete/:id` | `/api/users/delete/:id` | `DELETE` | Admin | Delete user |

---

## 🔒 Security Best Practices

1. **Never Commit Secrets**: Real credentials must only be configured in Vercel Project Settings or local `.env` (which is git-ignored).
2. **Cross-Site Cookies**: Set `sameSite: 'none'` and `secure: true` in production so auth cookies transmit reliably between `*.vercel.app` frontend and API subdomains.
3. **Authorization Header Support**: In addition to cookies, the API supports `Authorization: Bearer <token>` for clients or browsers with strict third-party cookie restrictions.
4. **Cloudinary Direct Upload**: Videos upload directly from browser to Cloudinary via client-side presets, bypassing serverless function payload limits.
