# Code Arena Admin Frontend

Admin dashboard built with React and Vite for managing Code Arena content. It lets administrators curate problems, monitor submissions, review analytics, and manage users.

## Prerequisites

- Node.js 18+
- npm 8+

## Installation & Scripts

```bash
cd frontend_admin
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview the production bundle locally
npm run preview
```

The Vite dev server defaults to `http://localhost:5174`. Update the port with `--port` if it conflicts with other services.

## API Configuration

- Axios is configured in `src/api/axiosClient.js` with `baseURL: 'http://localhost:8080'`.
- For different environments, update that value or load it from an environment variable (e.g. `VITE_ADMIN_API_BASE_URL`).
- Requests send cookies (`withCredentials: true`), so ensure the backend CORS policy allows the admin origin.

## Environment Variables

Create a `.env` file in `frontend_admin` directory:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=code_arena_videos
```

**Important**: After creating/updating `.env`, restart the Vite dev server for changes to take effect.

## Project Structure

```
src/
├─ api/               # Axios client configuration
├─ components/        # Reusable UI components (tables, modals, forms)
├─ context/           # Auth context and provider
├─ hooks/             # Custom admin hooks (auth helper)
├─ layouts/           # Admin layout shell
├─ pages/             # Feature pages (dashboard, users, problems, analytics)
├─ router.jsx         # Route definitions and guards
└─ utils/             # Helper functions for formatting and API calls
```

Styling is handled with Tailwind CSS and utility classes on components.

## Features

- **Role-based access**: Access control via `AuthContext` and route guards
- **Problem Management**: Create, edit, delete problems with test case editor (`components/TestCaseManager.jsx`)
- **User Management**: View, create, update, delete users with role management
- **Video Management**: Upload and manage editorial videos for problems
  - Direct upload to Cloudinary with progress tracking
  - Video metadata management
  - View tracking and statistics
- **Submission Monitoring**: View user submissions
- **Dashboard**: Overview statistics and admin creation
- **Analytics**: Platform health monitoring

## Video Upload Feature

The admin panel includes a comprehensive video upload system:

1. **Upload Videos**: Navigate to "Videos" page or edit a problem
2. **Progress Tracking**: Real-time upload progress with visual indicators
3. **Cloudinary Integration**: Direct upload to Cloudinary with unsigned preset
4. **Error Handling**: Clear error messages and recovery options
5. **View Tracking**: Videos automatically track views when played

See `CLOUDINARY_PRESET_SETUP.md` for Cloudinary configuration details.

## Recommended Improvements

- Add authentication flow integration with the backend once available (login page is scaffolded).
- Implement form validation with Zod or React Hook Form for consistent UX.
- Add unit/integration tests. Vitest + React Testing Library is recommended.

## Troubleshooting

- **Login fails**: check backend URL and cookies; adjust CORS settings if the browser blocks requests.
- **Styling missing**: confirm Tailwind is configured in `vite.config.js` and restart the dev server after changes.
- **Route not found**: review `src/router.jsx` and ensure the page component is exported correctly.
- **Video upload fails**: 
  - Check Cloudinary preset is set to "Unsigned" in Cloudinary dashboard
  - Verify `VITE_CLOUDINARY_CLOUD_NAME` in `.env` matches your Cloudinary account
  - Restart dev server after changing `.env` file
  - Check browser console for detailed error messages
- **Data not displaying**: Check browser console and network tab for API errors
- **Environment variables not working**: Restart Vite dev server after creating/updating `.env`

## License

See the repository root for license information.

