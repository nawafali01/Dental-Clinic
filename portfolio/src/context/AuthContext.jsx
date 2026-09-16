import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount.
  // Restores user from localStorage (no API call).
  // TODO: Once GET /api/v1/auth/me is confirmed, replace authService.getCurrentUser()
  //       with a real /me call so we can validate the token and get a fresh user object.
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const res = await authService.getCurrentUser();

      if (res.success && res.data) {
        setCurrentUser(res.data);
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Calls the real FastAPI login endpoint via authService.
   * On success, persists tokens + user object and updates context state.
   * The returned response has shape { success, data, message } matching
   * createSuccess / createError from response.util.js.
   */
  const login = async (...args) => {
    setLoading(true);
    const res = await authService.login(...args);
    if (res.success && res.data) {
      setCurrentUser(res.data);
      setIsAuthenticated(true);
    }
    setLoading(false);
    return res;
  };

  /**
   * Clears all auth tokens and user state, then performs a hard redirect
   * to /login so stale React context is fully destroyed.
   *
   * Using window.location.replace (not React Router navigate) intentionally —
   * it guarantees a full page reload so no stale context or token leaks through.
   */
  const logout = async () => {
    setLoading(true);
    await authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setLoading(false);
    window.location.replace('/login');
    return { success: true };
  };

  const updateProfile = async (updates) => {
    if (!currentUser) return;

    // Calls the userService which strictly limits which fields can be updated
    const res = await userService.updateProfile(currentUser.id, updates);
    if (res.success && res.data) {
      setCurrentUser(res.data);
    }
    return res;
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    isLoading: loading,       // alias used by StaffLogin.jsx
    login,
    handleLogin: login,       // alias used by StaffLogin.jsx
    logout,
    updateProfile,
    refreshSession: async () => {
      const res = await authService.getCurrentUser();
      if (res.success) setCurrentUser(res.data);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    const rawUser = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('dental_crm_current_user') || 'null')
      : null;
    return {
      currentUser: rawUser,
      isAuthenticated: Boolean(rawUser),
      loading: false,
      login: async () => ({ success: false }),
      logout: async () => ({ success: true }),
      updateProfile: async () => ({ success: false }),
      refreshSession: async () => {},
    };
  }
  return context;
};

