import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "./authApi";

/**
 * Initialize state from localStorage for session persistence.
 */
const storedToken = localStorage.getItem("auth_token");
const storedUser = localStorage.getItem("auth_user");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
};

/**
 * Auth state slice – manages user credentials and authentication status.
 */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Manually set auth credentials (used by login/register success handlers).
     */
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
    },

    /**
     * Clear auth state on logout.
     */
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    },
  },
  extraReducers: (builder) => {
    // Auto-set credentials when login API succeeds
    builder.addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
      const { user, token } = action.payload.data;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
    });

    // Auto-set credentials when register API succeeds
    builder.addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
      const { user, token } = action.payload.data;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
    });

    // Clear credentials when logout API succeeds
    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
