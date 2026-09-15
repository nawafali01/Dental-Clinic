import apiClient, { AUTH_KEYS } from '../lib/api';
import { createSuccess, createError } from '../utils/response.util';
import { storageService } from './storage.service';
import { SEED_USERS } from '../dashboard/super-admin/mock-data/usersData';
import { normalizeUser } from '../utils/normalizeUser';

/**
 * AUTH SERVICE
 *
 * login / logout / getCurrentUser now communicate with the real FastAPI backend
 * via `apiClient` (src/lib/api.js).
 *
 * All other methods (acceptInvite, forgotPassword, etc.) remain mock until
 * those endpoints are confirmed with the backend team.
 *
 * Open items:
 *  - TODO: Replace getCurrentUser() localStorage read with GET /me once confirmed.
 *  - TODO: Add refresh-token rotation in api.js interceptor once endpoint confirmed.
 */
class AuthService {
  /**
   * Authenticates the user against the real FastAPI backend.
   *
   * POST /api/v1/auth/login
   * Body: { email, username, password } — username mirrors email (Option A).
   *
   * On success: stores access_token, refresh_token, and user object in localStorage.
   * On failure: parses the API error shape { success, error: { code, message } }
   *             and returns a human-readable message.
   *
   * @param {string} email
   * @param {string} password
   */
  async login(email, username, password) {
    try {
      const cleanEmail    = (email    || '').trim().toLowerCase();
      const cleanUsername = (username || '').trim();
      const cleanPassword = (password || '').trim();

      if (!cleanEmail)    return createError('Email is required.');
      if (!cleanUsername) return createError('Username is required.');
      if (!cleanPassword) return createError('Password is required.');

      const response = await apiClient.post('/api/v1/auth/login', {
        email:    cleanEmail,
        username: cleanUsername,   // real username from form — no longer mirroring email
        password: cleanPassword,
      });

      const { access_token, refresh_token, user } = response.data;
      const normalizedUser = normalizeUser(user);

      // Persist tokens and user object
      localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN,  access_token);
      localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, refresh_token || '');
      localStorage.setItem(AUTH_KEYS.CURRENT_USER,  JSON.stringify(normalizedUser));

      // Also keep storageService.KEYS.CURRENT_USER in sync so existing
      // ClinicContext / RoleContext reads keep working without changes.
      storageService.set(storageService.KEYS.CURRENT_USER, normalizedUser);

      return createSuccess(normalizedUser, 'Login successful.');
    } catch (error) {
      // Parse the API error envelope: { success, error: { code, message, details } }
      const apiError = error.response?.data?.error;
      const message =
        apiError?.message ||
        error.response?.data?.detail ||
        error.message ||
        'An unexpected error occurred during login.';
      return createError(message, error);
    }
  }

  /**
   * Logs the user out.
   * Clears access_token, refresh_token, and the stored user object.
   * The axios interceptor in api.js also handles 401s, but explicit logout
   * must clear state too.
   */
  async logout() {
    try {
      localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(AUTH_KEYS.CURRENT_USER);
      // Also clear via storageService to keep it consistent
      storageService.remove(storageService.KEYS.CURRENT_USER);
      return createSuccess(null, 'Logged out successfully.');
    } catch (error) {
      return createError('Error during logout.', error);
    }
  }

  /**
   * Restores the user session on app load/refresh.
   *
   * KNOWN GAP: We read the stored user object from localStorage rather than
   * calling a /me endpoint. This means a deactivated or role-changed user will
   * remain authorized until they log out or their access_token triggers a 401.
   *
   * TODO: Replace this with GET /api/v1/auth/me once the backend confirms that
   *       endpoint. At that point, call apiClient.get('/api/v1/auth/me') and
   *       update localStorage with the fresh user object.
   */
  async getCurrentUser() {
    try {
      const token = localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
      if (!token) {
        return createError('No active session.');
      }

      // Read the cached user object that was saved during login
      const raw = localStorage.getItem(AUTH_KEYS.CURRENT_USER);
      const user = raw ? normalizeUser(JSON.parse(raw)) : null;

      if (!user) {
        return createError('No active session.');
      }

      // Keep storageService in sync so ClinicContext / RoleContext reads work
      storageService.set(storageService.KEYS.CURRENT_USER, user);

      return createSuccess(user, 'Session retrieved.');
    } catch (error) {
      return createError('Failed to get current user.', error);
    }
  }

  /**
   * Gets user details based on invite token for the Accept Invite screen.
   */
  async getInvitedUserByToken(token) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const users = storageService.get(storageService.KEYS.USERS) || [];
      const user = users.find(u => u.inviteToken === token);
      
      if (!user) return createError("Invalid or expired invite token.");
      if (user.status !== 'invited') return createError("This invite has already been processed.");
      
      const { password, ...safeUser } = user;
      return createSuccess(safeUser, "User found.");
    } catch (error) {
      return createError("Failed to verify invite token.", error);
    }
  }

  /**
   * Handles invite acceptance and setting initial password.
   * @param {string} token - The invite token 
   * @param {string} newPassword - The chosen password
   */
  async acceptInvite(token, newPassword) {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const users = storageService.get(storageService.KEYS.USERS) || [];
      const userIndex = users.findIndex(u => u.inviteToken === token);

      if (userIndex === -1) {
        return createError("Invalid or expired invite token.");
      }

      const user = users[userIndex];
      
      if (user.status !== 'invited') {
        return createError("This invite has already been processed.");
      }

      // Update user
      const updatedUser = {
        ...user,
        password: newPassword,
        status: 'active',
        inviteToken: null,
        acceptedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      users[userIndex] = updatedUser;
      storageService.set(storageService.KEYS.USERS, users);

      // Automatically log them in (create session)
      const { password: _, ...safeUser } = updatedUser;
      storageService.set(storageService.KEYS.CURRENT_USER, safeUser);

      return createSuccess(safeUser, "Account setup completed successfully.");
    } catch (error) {
      return createError("Failed to accept invite.", error);
    }
  }

  async forgotPassword(email) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 800));
    return createSuccess(null, "If an account exists, a reset link has been sent.");
  }

  async resetPassword(token, newPassword) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 800));
    return createSuccess(null, "Password reset successfully.");
  }
}

export const authService = new AuthService();
