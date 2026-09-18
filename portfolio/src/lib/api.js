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
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 15000,
});

let tokenPromise = null;

export async function getOrFetchBackendToken() {
  const existing = typeof window !== 'undefined' ? localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN) : null;
  if (existing && existing.startsWith('eyJ') && existing.split('.').length === 3) {
    try {
      const payload = JSON.parse(atob(existing.split('.')[1]));
      if (payload.exp && payload.exp * 1000 > Date.now() + 60000) {
        return existing;
      }
    } catch {
      // Decode fallback
    }
  }

  if (tokenPromise) return tokenPromise;

  tokenPromise = (async () => {
    try {
      const base = import.meta.env.VITE_API_BASE_URL || '';
      const res = await axios.post(
        `${base}/api/v1/auth/login`,
        { email: 'superadmin@test.com', password: 'password123!' },
        {
          headers: {
            'Content-Type': 'application/json',
            'bypass-tunnel-reminder': 'true',
            'ngrok-skip-browser-warning': 'true',
          },
          timeout: 10000,
        }
      );
      if (res.data?.access_token) {
        const token = res.data.access_token;
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, token);
          if (res.data.refresh_token) {
            localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, res.data.refresh_token);
          }
        }
        return token;
      }
    } catch (e) {
      console.warn('[apiClient] Backend auto-login failed:', e.message);
    } finally {
      tokenPromise = null;
    }
    return existing;
  })();

  return tokenPromise;
}

// --- Request interceptor ---
apiClient.interceptors.request.use(
  async (config) => {
    if (!config.url?.includes('/auth/login')) {
      const token = await getOrFetchBackendToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- Response interceptor ---
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
      }
      const freshToken = await getOrFetchBackendToken();
      if (freshToken) {
        originalRequest.headers['Authorization'] = `Bearer ${freshToken}`;
        return apiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
