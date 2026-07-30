import { storageService } from './storage.service';
import { createSuccess, createError } from '../utils/response.util';

/**
 * USER SERVICE
 * Handles user management operations. Communicates exclusively with StorageService.
 * Can be hot-swapped for Supabase in the future.
 */
class UserService {
  /**
   * Retrieves all users (with optional filtering later).
   */
  async getUsers() {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const users = storageService.get(storageService.KEYS.USERS) || [];
      // Strip passwords before returning
      const safeUsers = users.map(({ password, ...u }) => u);
      return createSuccess(safeUsers, "Users retrieved successfully.");
    } catch (error) {
      return createError("Failed to fetch users.", error);
    }
  }

  /**
   * Retrieves a specific user by ID.
   */
  async getUserById(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const users = storageService.get(storageService.KEYS.USERS) || [];
      const user = users.find(u => u.id === id);
      
      if (!user) return createError("User not found.");
      
      const { password, ...safeUser } = user;
      return createSuccess(safeUser, "User retrieved successfully.");
    } catch (error) {
      return createError("Failed to fetch user.", error);
    }
  }

  /**
   * Invites a new user to the system.
   */
  async inviteUser(userData) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const users = storageService.get(storageService.KEYS.USERS) || [];
      
      if (users.some(u => u.email === userData.email)) {
        return createError("A user with this email already exists.");
      }

      const inviteToken = crypto.randomUUID();
      
      const newUser = {
        id: crypto.randomUUID(),
        fullName: userData.fullName,
        email: userData.email,
        password: null, // Password set upon accepting invite
        role: userData.role,
        organizationId: userData.organizationId || null,
        clinicIds: userData.clinicIds || [],
        status: 'invited',
        phone: null,
        avatar: null,
        timezone: 'UTC',
        inviteToken,
        invitedAt: new Date().toISOString(),
        acceptedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      users.push(newUser);
      storageService.set(storageService.KEYS.USERS, users);

      // In a real app, an email would be triggered here via an Edge Function/API.
      const { password, ...safeUser } = newUser;
      
      // Return the token just for demo purposes (so the user can click the "Open Invite" button)
      return createSuccess({ user: safeUser, inviteToken }, "User invited successfully.");
    } catch (error) {
      return createError("Failed to invite user.", error);
    }
  }

  /**
   * Admin updates a user's role, org, clinic, etc.
   */
  async updateUser(id, updates) {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      const users = storageService.get(storageService.KEYS.USERS) || [];
      const index = users.findIndex(u => u.id === id);
      
      if (index === -1) return createError("User not found.");

      const updatedUser = {
        ...users[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      users[index] = updatedUser;
      storageService.set(storageService.KEYS.USERS, users);

      const { password, ...safeUser } = updatedUser;
      return createSuccess(safeUser, "User updated successfully.");
    } catch (error) {
      return createError("Failed to update user.", error);
    }
  }

  /**
   * User updates their own profile (restricted fields).
   */
  async updateProfile(id, updates) {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      const users = storageService.get(storageService.KEYS.USERS) || [];
      const index = users.findIndex(u => u.id === id);
      
      if (index === -1) return createError("User not found.");

      // Security: Only allow specific fields to be updated by the user themselves
      const allowedUpdates = {
        fullName: updates.fullName !== undefined ? updates.fullName : users[index].fullName,
        phone: updates.phone !== undefined ? updates.phone : users[index].phone,
        avatar: updates.avatar !== undefined ? updates.avatar : users[index].avatar,
        timezone: updates.timezone !== undefined ? updates.timezone : users[index].timezone,
        updatedAt: new Date().toISOString()
      };

      // Handle password change if provided
      if (updates.password && updates.password.trim() !== '') {
        allowedUpdates.password = updates.password;
      }

      const updatedUser = {
        ...users[index],
        ...allowedUpdates
      };

      users[index] = updatedUser;
      storageService.set(storageService.KEYS.USERS, users);

      // If the current session matches this user, update the session
      const currentUser = storageService.get(storageService.KEYS.CURRENT_USER);
      if (currentUser && currentUser.id === id) {
        const { password, ...safeUser } = updatedUser;
        storageService.set(storageService.KEYS.CURRENT_USER, safeUser);
      }

      const { password, ...safeUserReturn } = updatedUser;
      return createSuccess(safeUserReturn, "Profile updated successfully.");
    } catch (error) {
      return createError("Failed to update profile.", error);
    }
  }

  /**
   * Disables a user account.
   */
  async disableUser(id) {
    return this.updateUser(id, { status: 'disabled' });
  }

  /**
   * Enables a user account.
   */
  async enableUser(id) {
    return this.updateUser(id, { status: 'active' });
  }

  /**
   * Resends an invite (generates a new token).
   */
  async resendInvite(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const users = storageService.get(storageService.KEYS.USERS) || [];
      const index = users.findIndex(u => u.id === id);
      
      if (index === -1) return createError("User not found.");
      if (users[index].status !== 'invited') return createError("User is not in invited status.");

      const newInviteToken = crypto.randomUUID();
      users[index].inviteToken = newInviteToken;
      users[index].invitedAt = new Date().toISOString();
      users[index].updatedAt = new Date().toISOString();

      storageService.set(storageService.KEYS.USERS, users);

      return createSuccess({ inviteToken: newInviteToken }, "Invite resent successfully.");
    } catch (error) {
      return createError("Failed to resend invite.", error);
    }
  }

  /**
   * Revokes a pending invite.
   */
  async revokeInvite(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const users = storageService.get(storageService.KEYS.USERS) || [];
      const index = users.findIndex(u => u.id === id);
      
      if (index === -1) return createError("User not found.");
      if (users[index].status !== 'invited') return createError("Cannot revoke a non-pending invite.");

      // Hard delete the invited user record
      users.splice(index, 1);
      storageService.set(storageService.KEYS.USERS, users);

      return createSuccess(null, "Invite revoked and user deleted.");
    } catch (error) {
      return createError("Failed to revoke invite.", error);
    }
  }
}

export const userService = new UserService();
