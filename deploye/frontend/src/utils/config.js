/**
 * Get the API base URL based on environment
 * In development, uses Vite proxy (/api) if VITE_API_BASE_URL is not set
 * In production, uses VITE_API_BASE_URL environment variable
 * 
 * @returns {string} The API base URL
 */
export const getApiBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  return '/api';
};

/**
 * Get the full backend URL for direct redirects (like OAuth)
 * In development, uses localhost:3000 or VITE_API_BASE_URL
 * In production, uses VITE_API_BASE_URL without /api suffix
 * 
 * @returns {string} The full backend URL
 */
export const getBackendURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/api\/?$/, '').replace(/\/+$/, '');
  }
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};
