# Code Arena Frontend

React + Vite single-page application that powers the learner-facing experience for Code Arena. It lets users browse problems, join contests, solve challenges in a Monaco editor, and review submissions.

## Prerequisites

- Node.js 18+
- npm 8+

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

The development server runs on `http://localhost:5173` by default. Vite automatically reloads the page when files change.

## Environment

### Development
- The Vite dev server automatically proxies `/api/*` requests to `http://localhost:3000` (configured in `vite.config.js`).
- No environment variables needed for local development.

### Production
- Create a `.env` file in the `frontend` directory with:
  ```
  VITE_API_BASE_URL=https://api.yourdomain.com
  ```
- Replace `https://api.yourdomain.com` with your actual backend API URL.
- The application uses this environment variable for all API calls and OAuth redirects in production.
- **Important**: Set `VITE_API_BASE_URL` before building for production. The value is embedded at build time.

## Available Scripts

- `npm run dev` — start Vite dev server with HMR (uses proxy to backend on port 3000).
- `npm run build` — generate a production build in `dist/`. **Set `VITE_API_BASE_URL` in `.env` before building.**
- `npm run preview` — serve the production build locally.
- `npm run lint` — run ESLint using project rules.

## Production Deployment

1. **Set Environment Variable**:
   ```bash
   # Create .env file in frontend directory
   echo "VITE_API_BASE_URL=https://api.yourdomain.com" > .env
   ```

2. **Build for Production**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   - The `dist/` folder contains the production-ready static files.
   - Deploy to any static hosting service (Vercel, Netlify, AWS S3, etc.).
   - Ensure your backend API is accessible at the URL specified in `VITE_API_BASE_URL`.

4. **CORS Configuration**:
   - Make sure your backend CORS settings include your frontend domain.
   - Update `allowedOrigins` in `backend/src/index.js` to include your production frontend URL.

## Project Structure

```
src/
├─ api/               # Axios client and API helpers
├─ components/        # Shared UI components (editor, navbar, etc.)
├─ context/           # React context providers (auth, problem, theme)
├─ hooks/             # Custom hooks for auth/editor state
├─ layouts/           # Layout wrappers for pages
├─ pages/             # Route views (dashboard, contests, problems)
├─ store/             # Redux store configuration
├─ utils/             # Misc utilities (formatting, API helpers)
└─ router.jsx         # Route definitions and guards
```

Tailwind CSS powers styling. Check `App.css`, `index.css`, and component-level class names.

## Working With Auth

- Authentication state lives in `src/context/AuthContext.jsx`.
- Protected routes use `src/components/RequireAuth.jsx`.
- API calls expect cookies (`withCredentials: true`), so ensure CORS settings in the backend allow the frontend origin.

## Testing & QA

No automated tests are configured yet. Consider adding:

- Component tests with Vitest + React Testing Library.
- E2E coverage with Playwright or Cypress for core flows (login, solve problem, submit).

## Troubleshooting

- **Blank page**: confirm `npm run dev` is running and the backend API URL is reachable.
- **CORS errors**: adjust backend CORS origins to include `http://localhost:5173` (or whichever port you use).
- **Editor not loading**: Monaco requires HTTPS in some browsers when used with workers—ensure dev server runs on localhost.

## License

Refer to the repository root for license information.
