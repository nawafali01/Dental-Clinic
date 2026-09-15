import axios from 'axios';

/**
 * API CLIENT
 *
 * Central axios instance for communicating with the FastAPI backend.
 *
 * - baseURL: pulled from VITE_API_BASE_URL (defaults to http://127.0.0.1:8000)
 * - Request interceptor: attaches `Authorization: Bearer <access_token>` from localStorage.
 * - Response interceptor: on 401, clears all auth keys and hard-redirects to /login.
 *   (Hard redirect instead of React Router navigate to guarantee stale context is destroyed.)
 *
 * This is the ONLY file that should create an axios instance.
 * All service files must import `apiClient` from here.
 */

export const AUTH_KEYS = {
  ACCESS_TOKEN:  'dental_crm_access_token',
  REFRESH_TOKEN: 'dental_crm_refresh_token',
  CURRENT_USER:  'dental_crm_current_user',
};

const apiClient = axios.create({
  // VITE_API_BASE_URL = http://192.168.18.195:8000 (Faraz's laptop, same WiFi)
  // Dev:  requests go directly to Faraz's FastAPI backend
  // Prod: set VITE_API_BASE_URL to the deployed backend URL
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// --- Request interceptor ---
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- Response interceptor ---
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all auth state
      localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(AUTH_KEYS.CURRENT_USER);

      // Hard redirect -- destroys React context so no stale state leaks
      // TODO: Once the backend confirms a refresh-token endpoint, attempt
      //       token rotation here before logging out.
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
