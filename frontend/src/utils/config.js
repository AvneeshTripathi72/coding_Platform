/**
 * Get the API base URL based on environment
 * In development, uses Vite proxy (/api)
 * In production, uses VITE_API_BASE_URL environment variable
 * 
 * @returns {string} The API base URL
 */
export const getApiBaseURL = () => {
  // In production, use the environment variable
  if (import.meta.env.PROD) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiUrl) {
      console.warn('VITE_API_BASE_URL is not set in production. API calls may fail.');
      // Fallback to same origin if not set
      return '';
    }
    return apiUrl;
  }
  // In development, use the Vite proxy
  return '/api';
};

/**
 * Get the full backend URL for direct redirects (like OAuth)
 * In development, uses localhost:3000
 * In production, uses VITE_API_BASE_URL environment variable
 * 
 * @returns {string} The full backend URL
 */
export const getBackendURL = () => {
  if (import.meta.env.PROD) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiUrl) {
      console.error('VITE_API_BASE_URL is required in production for OAuth redirects.');
      // Fallback to same origin if not set (may not work for OAuth)
      return window.location.origin;
    }
    return apiUrl;
  }
  // In development, use localhost:3000
  return 'http://localhost:3000';
};

