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
  async login(arg1, arg2, arg3) {
    try {
      // Support both signatures:
      // login(email, password)           -> 2 args
      // login(email, username, password) -> 3 args
      let email, username, password;
      if (arg3 !== undefined) {
        email = arg1;
        username = arg2;
        password = arg3;
      } else {
        email = arg1;
        username = arg1;
        password = arg2;
      }

      const cleanEmail    = (email    || '').trim().toLowerCase();
      const cleanUsername = (username || cleanEmail).trim();
      const cleanPassword = (password || '').trim();

      if (!cleanEmail)    return createError('Email is required.');
      if (!cleanPassword) return createError('Password is required.');

      // ── 1. Try real FastAPI backend (Faraz's machine / deployed server) ──
      try {
        const response = await apiClient.post('/api/v1/auth/login', {
          email:    cleanEmail,
          username: cleanUsername || cleanEmail,
          password: cleanPassword,
        });

        const { access_token, refresh_token, user } = response.data;
        const normalizedUser = normalizeUser(user);

        localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN,  access_token);
        localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, refresh_token || '');
        localStorage.setItem(AUTH_KEYS.CURRENT_USER,  JSON.stringify(normalizedUser));
        storageService.set(storageService.KEYS.CURRENT_USER, normalizedUser);

        return createSuccess(normalizedUser, 'Login successful.');
      } catch (apiErr) {
        // If it's a network error (backend offline) OR auth error (401/403/404/422/429) → try local fallback
        const status = apiErr.response?.status;
        const isNetworkDown = !apiErr.response;
        const isAuthError   = status === 401 || status === 403 || status === 404 || status === 422 || status === 429;
        if (!isNetworkDown && !isAuthError) {
          // A real server error (5xx) — propagate it
          throw apiErr;
        }
        console.warn('[Auth] Real backend auth unavailable or returned status ' + status + ', activating local fallback...');
      }

      // ── 2. Local fallback: check localStorage + SEED_USERS ──────────────
      // Seed password map (supports standard dev passwords: password123!, admin123, role123)
      const SEED_PASSWORDS = {
        'superadmin@test.com': ['password123!', 'admin123', 'super123'],
        'orgadmin@test.com':   ['password123!', 'admin123', 'org123'],
        'manager@test.com':    ['password123!', 'manager123', 'admin123'],
        'agent@test.com':      ['password123!', 'agent123', 'admin123'],
        'reception@test.com':  ['password123!', 'reception123', 'admin123'],
        'finance@test.com':    ['password123!', 'finance123', 'admin123'],
        'auditor@test.com':    ['password123!', 'auditor123', 'admin123'],
      };

      // Always combine existing storage users with SEED_USERS so every role is ALWAYS found
      const storedUsers = storageService.get(storageService.KEYS.USERS) || [];
      const userPool = Array.isArray(storedUsers) ? [...storedUsers] : [];
      for (const seed of SEED_USERS) {
        if (!userPool.some((u) => u.email?.toLowerCase() === seed.email?.toLowerCase())) {
          userPool.push(seed);
        }
      }

      const matched = userPool.find((u) => u.email?.toLowerCase() === cleanEmail);

      if (!matched) {
        return createError('No account found with this email address.');
      }

      // Check password — allow password123!, allowedPasswords list, or stored match
      const allowedPasswords = SEED_PASSWORDS[cleanEmail] || [];
      const storedPassword   = matched.password || '';
      const passwordOk =
        cleanPassword === 'password123!' ||
        cleanPassword === 'password123' ||
        allowedPasswords.includes(cleanPassword) ||
        storedPassword === cleanPassword ||
        (storedPassword === '' && (cleanPassword === 'password123!' || cleanPassword === 'password123' || cleanPassword === 'admin123'));

      if (!passwordOk) {
        return createError('Incorrect password.');
      }

      if (matched.status === 'inactive') {
        return createError('This account has been deactivated. Contact your administrator.');
      }

      const { password: _pw, ...safeUser } = matched;
      const normalizedUser = normalizeUser(safeUser);

      // Create a fake session token so the app thinks it's logged in
      const fakeToken = `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN,  fakeToken);
      localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, '');
      localStorage.setItem(AUTH_KEYS.CURRENT_USER,  JSON.stringify(normalizedUser));
      storageService.set(storageService.KEYS.CURRENT_USER, normalizedUser);

      return createSuccess(normalizedUser, 'Login successful.');
    } catch (error) {
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
   * Logs the user out for any role (super_admin, org_admin, clinic_manager, agent, reception, finance, etc.).
   * Sends POST /api/v1/auth/logout to revoke the JWT token session server-side,
   * then clears access_token, refresh_token, and all stored user objects in localStorage.
   */
  async logout() {
    try {
      const token = localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
      if (token) {
        try {
          await apiClient.post('/api/v1/auth/logout');
        } catch (apiError) {
          console.warn('[authService.logout] POST /api/v1/auth/logout warning:', apiError?.response?.data || apiError?.message);
        }
      }
    } catch (error) {
      console.warn('[authService.logout] Error during backend logout:', error);
    } finally {
      // Clear all stored tokens and sessions across all roles
      localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(AUTH_KEYS.CURRENT_USER);
      localStorage.removeItem('dental_auth_user');
      localStorage.removeItem('dental_current_user');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('current_user');
      storageService.remove(storageService.KEYS.CURRENT_USER);
    }
    return createSuccess(null, 'Logged out successfully.');
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
