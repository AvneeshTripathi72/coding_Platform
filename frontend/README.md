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

- The API base URL is currently set in `src/api/axiosClient.js`. Update `baseURL` to match your backend host.
- To externalize configuration, you can create a `.env` file and wire a `VITE_API_BASE_URL` variable into `axiosClient.js` (Vite exposes env values prefixed with `VITE_`).

## Available Scripts

- `npm run dev` — start Vite dev server with HMR.
- `npm run build` — generate a production build in `dist/`.
- `npm run preview` — serve the production build locally.
- `npm run lint` — run ESLint using project rules.

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
