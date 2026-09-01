import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
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

  const login = async (email, password) => {
    setLoading(true);
    const res = await authService.login(email, password);
    if (res.success && res.data) {
      setCurrentUser(res.data);
      setIsAuthenticated(true);
    }
    setLoading(false);
    return res;
  };

  const logout = async () => {
    setLoading(true);
    const res = await authService.logout();
    if (res.success) {
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
    return res;
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
    login,
    logout,
    updateProfile,
    // Provide a way to refresh user state without full reload
    refreshSession: async () => {
      const res = await authService.getCurrentUser();
      if (res.success) setCurrentUser(res.data);
    }
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
