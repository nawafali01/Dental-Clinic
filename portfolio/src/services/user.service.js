import { storageService } from "./storage.service";

const createResponse = (data, error = null) => ({ data, error });

// FUTURE: supabase.from('users').insert(...)
export const inviteUser = async (data) => {
  try {
    const users = storageService.get("users") || [];
    
    // Check if email already exists
    if (users.some(u => u.email === data.email)) {
      return createResponse(null, "User with this email already exists.");
    }

    const newUser = {
      id: crypto.randomUUID(),
      ...data,
      status: "invited",
      password: "", // Handled on accept
      inviteToken: crypto.randomUUID(),
      invitedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    storageService.set("users", users);

    return createResponse(newUser);
  } catch (error) {
    return createResponse(null, error.message);
  }
};

// FUTURE: supabase.from('users').update({ status: 'disabled' })
export const disableUser = async (userId) => {
  try {
    const users = storageService.get("users") || [];
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) return createResponse(null, "User not found");
    
    users[index].status = "disabled";
    storageService.set("users", users);
    
    return createResponse(true);
  } catch (error) {
    return createResponse(null, error.message);
  }
};

// FUTURE: supabase.from('users').update({ status: 'active' })
export const enableUser = async (userId) => {
  try {
    const users = storageService.get("users") || [];
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) return createResponse(null, "User not found");
    
    // Only enable if they were previously active. If invited, they should remain invited?
    // According to typical flow, enable is opposite of disable.
    if (users[index].status === "disabled") {
       users[index].status = users[index].password ? "active" : "invited";
    }
    
    storageService.set("users", users);
    
    return createResponse(true);
  } catch (error) {
    return createResponse(null, error.message);
  }
};

// FUTURE: supabase.from('users').delete() or update token
export const revokeInvite = async (userId) => {
  try {
    let users = storageService.get("users") || [];
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) return createResponse(null, "User not found");
    if (users[index].status !== "invited") return createResponse(null, "User is not in invited state");

    // Remove user completely or set to revoked state. Let's remove for simplicity.
    users = users.filter(u => u.id !== userId);
    storageService.set("users", users);
    
    return createResponse(true);
  } catch (error) {
    return createResponse(null, error.message);
  }
};

// FUTURE: supabase.rpc('resend_invite', { user_id: userId })
export const resendInvite = async (userId) => {
  try {
    const users = storageService.get("users") || [];
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) return createResponse(null, "User not found");
    if (users[index].status !== "invited") return createResponse(null, "User is already active");

    // Generate new token
    users[index].inviteToken = crypto.randomUUID();
    users[index].invitedAt = new Date().toISOString();
    
    storageService.set("users", users);
    
    return createResponse(users[index]);
  } catch (error) {
    return createResponse(null, error.message);
  }
};

// FUTURE: supabase.from('users').update({ phone, avatar, timezone })
export const updateProfile = async (userId, data) => {
  try {
    const users = storageService.get("users") || [];
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) return createResponse(null, "User not found");
    
    users[index] = { ...users[index], ...data, onboardingComplete: true };
    storageService.set("users", users);
    
    // Also update current user if it's the logged in user
    const currentUser = storageService.get("currentUser");
    if (currentUser?.id === userId) {
      storageService.set("currentUser", users[index]);
    }
    
    return createResponse(users[index]);
  } catch (error) {
    return createResponse(null, error.message);
  }
};

// FUTURE: supabase.from('users').select()
export const getUsers = async (filters = {}) => {
  try {
    let users = storageService.get("users") || [];
    
    if (filters.role) {
      users = users.filter(u => u.role === filters.role);
    }
    if (filters.status) {
      users = users.filter(u => u.status === filters.status);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      users = users.filter(u => 
        u.fullName?.toLowerCase().includes(search) || 
        u.email?.toLowerCase().includes(search)
      );
    }
    if (filters.clinic) {
      users = users.filter(u => u.clinic === filters.clinic);
    }

    return createResponse(users);
  } catch (error) {
    return createResponse(null, error.message);
  }
};

export const getUserByToken = async (token) => {
  try {
    const users = storageService.get("users") || [];
    const user = users.find(u => u.inviteToken === token);
    
    if (!user) return createResponse(null, "User not found");
    return createResponse(user);
  } catch (error) {
    return createResponse(null, error.message);
  }
};
