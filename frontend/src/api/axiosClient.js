import axios from 'axios';

// Use /api prefix for development (Vite proxy will rewrite it)
// In production, use full URL from env or default
const baseURL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:8080');

const axiosClient = axios.create({
  baseURL, // use Vite env or fallback
  withCredentials: true, // allow sending cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;