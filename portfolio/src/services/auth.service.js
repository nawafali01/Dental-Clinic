import { storageService } from './storage.service';
import { createSuccess, createError } from '../utils/response.util';

/**
 * AUTH SERVICE
 * Handles authentication flows. Communicates exclusively with StorageService.
 * Can be hot-swapped for Supabase Auth in the future.
 */
class AuthService {
  /**
   * Logs a user in by checking email and password.
   * @param {string} email 
   * @param {string} password 
   */
  async login(email, password) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const users = storageService.get(storageService.KEYS.USERS) || [];
      const user = users.find(u => u.email === email);

      if (!user) {
        return createError("Invalid email or password.");
      }

      if (user.password !== password) {
        return createError("Invalid email or password.");
      }

      if (user.status === 'disabled') {
        return createError("Your account has been disabled. Please contact an administrator.");
      }

      if (user.status === 'invited') {
        return createError("Please complete your account setup first. Check your email for the invite link.");
      }

      // Strip password from the session user object for security
      const { password: _, ...safeUser } = user;
      
      // Save session
      storageService.set(storageService.KEYS.CURRENT_USER, safeUser);
      
      return createSuccess(safeUser, "Login successful.");
    } catch (error) {
      return createError("An unexpected error occurred during login.", error);
    }
  }

  /**
   * Logs the user out by clearing the current session.
   */
  async logout() {
    try {
      storageService.remove(storageService.KEYS.CURRENT_USER);
      return createSuccess(null, "Logged out successfully.");
    } catch (error) {
      return createError("Error during logout.", error);
    }
  }

  /**
   * Gets the currently authenticated user from local session.
   */
  async getCurrentUser() {
    try {
      const currentUser = storageService.get(storageService.KEYS.CURRENT_USER);
      
      if (!currentUser) {
        return createError("No active session.");
      }

      // Always fetch the freshest user data from the DB table
      const users = storageService.get(storageService.KEYS.USERS) || [];
      const freshUser = users.find(u => u.id === currentUser.id);

      if (!freshUser || freshUser.status === 'disabled') {
        storageService.remove(storageService.KEYS.CURRENT_USER);
        return createError("Session invalidated.");
      }

      const { password: _, ...safeUser } = freshUser;
      
      // Update session with fresh data
      storageService.set(storageService.KEYS.CURRENT_USER, safeUser);
      return createSuccess(safeUser, "Session retrieved.");
    } catch (error) {
      return createError("Failed to get current user.", error);
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
