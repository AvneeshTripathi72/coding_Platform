# Migration Report: AWS EC2 to Vercel Serverless

This document outlines the migration of **Code Verse** from an AWS EC2 traditional server model to a modern, scalable **Vercel Serverless Architecture**.

---

## 1. Architectural Comparison

| Dimension | Old AWS EC2 Architecture | New Vercel Serverless Architecture |
|---|---|---|
| **Hosting Model** | Dedicated virtual machine (EC2 t2.micro/medium) | Stateless event-driven serverless functions & global edge CDN |
| **Process Model** | Persistent long-running Node.js process managed by PM2 | Ephemeral serverless request handler invocations (`api/index.js`) |
| **Reverse Proxy** | Nginx configured with manual SSL (`certbot`) and ports | Vercel Global Edge Network with automated TLS certificates |
| **Backend Entry** | `app.listen(PORT)` starting a standalone TCP server | Exported Express app wrapped in a cached serverless function |
| **Database** | Direct Mongoose connection per server startup | Reusable cached Mongoose connection pool across invocations |
| **Redis** | Local Redis instance (`localhost:6379`) | Managed Upstash Redis / Redis Cloud with connection reuse & safe fallbacks |
| **Frontend Routing** | Nginx `try_files $uri /index.html` | `vercel.json` SPA rewrites (`"source": "/(.*)", "destination": "/index.html"`) |
| **CORS & Cookies** | Fixed origin or localhost bindings | Dynamic origin validation (`FRONTEND_URL`, `ADMIN_FRONTEND_URL`) with `sameSite: 'none'` |
| **Code Execution** | Unbounded polling loops against RapidAPI Judge0 | Bounded polling with timeout safety to prevent serverless execution freezes |
| **AI Integration** | `gemniKey` environment variable | Standardized `GEMINI_API_KEY` with multi-model fallback |
| **Video Storage** | Cloudinary uploads via preset | Cloudinary direct uploads with signed parameter security |

---

## 2. Detailed Changes & Adaptations

### 2.1 Backend Serverless Conversion
- **Decoupled Server from Express App**: Separated `app.js` (Express configuration, middleware, and route mounting) from the startup logic (`api/index.js` for Vercel, `src/server.js` for local development).
- **Dual Route Prefixing**: Mounted routes on both `/api/*` and `/*` in Express. This guarantees compatibility whether the frontend calls `/api/problems/...` or `/problems/...`.
- **Database Connection Caching**:
  - Implemented `global.mongoose` connection caching in `src/config/db.js`.
  - Added connection middleware to ensure MongoDB is ready before processing requests without duplicate handshake overhead.
- **Resilient Redis Handling**:
  - Replaced hardcoded localhost assumptions with `REDIS_URL` / Upstash connection strings.
  - Wrapped all Redis operations (`safeRedis.get`, `safeRedis.set`, `safeRedis.lRange`, etc.) so that if Redis is offline or unconfigured, the application gracefully continues instead of throwing a 500 error.
- **Express 5 & Path-to-Regexp Compatibility**:
  - Removed deprecated `app.options('*', ...)` wildcard calls that cause `PathError` in Express 5.
  - Standardized CORS with `app.use(cors(corsOptions))` handling all preflights.

### 2.2 Cross-Domain Authentication & Security
- **Production Cookies**: Configured `sameSite: 'none'`, `secure: true`, and `httpOnly: true` in production environments so credentials flow cleanly across separate subdomains (`code-verse.vercel.app` -> `code-verse-api.vercel.app`).
- **Authorization Header Support**: Added fallback token parsing from `Authorization: Bearer <token>` in `userMiddleware` and `adminMiddleware` for clients that block third-party cookies.
- **Token Blacklist**: Safely checks Redis for logged-out tokens with fallback to decoding.

### 2.3 Frontend & Admin Optimization
- **Environment-Driven Base URLs**:
  - Refactored `frontend/src/utils/config.js` and `frontend/src/api/axiosClient.js` to dynamically read `VITE_API_BASE_URL` with automated trailing slash sanitization.
  - Refactored `frontend_admin/src/api/axiosClient.js` to use `VITE_API_BASE_URL`.
- **SPA Rewrite Configurations**: Created `vercel.json` in both `frontend` and `frontend_admin` with rewrite rules to `index.html` to eliminate 404s on browser refresh.
- **Verified Clean Builds**: Both frontends build with zero errors via Vite (`npm run build`).

---

## 3. Files Created & Modified in `deploye/`

```text
deploye/
├── backend/
│   ├── api/index.js             [Created: Vercel serverless entrypoint]
│   ├── src/
│   │   ├── app.js               [Created: Decoupled Express app with dual routes & CORS]
│   │   ├── server.js            [Created: Local development runner]
│   │   ├── config/
│   │   │   ├── db.js            [Created: Serverless cached MongoDB connection]
│   │   │   ├── redis.js         [Created: Resilient Redis client with safe fallbacks]
│   │   │   ├── cloudinary.js    [Created: Secure Cloudinary client]
│   │   │   └── dodoPayments.js  [Created: DodoPayments configuration]
│   │   ├── controllers/         [Created & Adapted: Auth, AI, Video, Contest, Problems, etc.]
│   │   ├── middleware/          [Created: User auth, Admin auth, and Rate limiting]
│   │   ├── models/              [Ported: User, Problem, Submission, Contest, Video, Payment]
│   │   ├── routes/              [Ported: All modular Express routes]
│   │   └── utils/               [Created: Bounded Judge0 runner and validation]
│   ├── .env.example             [Created: Comprehensive backend environment template]
│   ├── .gitignore               [Created: Backend gitignore]
│   ├── package.json             [Created: Clean serverless dependencies]
│   └── vercel.json              [Created: Backend serverless routing]
│
├── frontend/
│   ├── src/utils/config.js      [Updated: Production URL and OAuth resolver]
│   ├── src/api/axiosClient.js   [Updated: Production Axios client]
│   ├── .env.example             [Created: User frontend environment template]
│   ├── .gitignore               [Created: User frontend gitignore]
│   ├── package.json             [Validated: Clean dependency installation]
│   └── vercel.json              [Created: User frontend SPA rewrites]
│
├── frontend_admin/
│   ├── src/api/axiosClient.js   [Updated: Production Axios client]
│   ├── .env.example             [Created: Admin frontend environment template]
│   ├── .gitignore               [Created: Admin frontend gitignore]
│   ├── package.json             [Validated: Clean dependency installation]
│   └── vercel.json              [Created: Admin frontend SPA rewrites]
│
├── vercel.json                  [Created: Unified monorepo routing]
├── .gitignore                   [Created: Root gitignore]
├── README.md                    [Created: Comprehensive deployment manual]
└── MIGRATION.md                 [Created: This migration document]
```

---

## 4. Verification & Testing Summary

1. **Frontend Production Build**:
   - `deploye/frontend`: `npm run build` completed successfully (`dist/` generated, 0 errors).
2. **Admin Frontend Production Build**:
   - `deploye/frontend_admin`: `npm run build` completed successfully (`dist/` generated, 0 errors).
3. **Backend Serverless Validation**:
   - `deploye/backend`: All 33 routes and middleware successfully loaded and verified on Node.js runtime.
4. **AWS Codebase Isolation**:
   - Verified that `backend/`, `frontend/`, `frontend_admin/`, and `AWS_DEPLOYMENT.md` remain 100% intact with zero modifications.
