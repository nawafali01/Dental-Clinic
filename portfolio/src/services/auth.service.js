import { storageService } from "./storage.service";

// Helper for consistent return objects, simulating Supabase
const createResponse = (data, error = null) => ({ data, error });

// FUTURE: supabase.auth.signInWithPassword({ email, password })
export const login = async (email, password) => {
  try {
    const users = storageService.get("users") || [];
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      return createResponse(null, "Invalid email or password");
    }

    if (user.status === "disabled") {
      return createResponse(null, "Your account has been disabled.");
    }

    if (user.status === "invited") {
      return createResponse(null, "Please complete your account setup first.");
    }

    storageService.set("currentUser", user);
    return createResponse(user);
  } catch (error) {
    return createResponse(null, error.message || "An unexpected error occurred");
  }
};

// FUTURE: supabase.auth.signOut()
export const logout = async () => {
  try {
    storageService.remove("currentUser");
    return createResponse(true);
  } catch (error) {
    return createResponse(null, error.message || "Error logging out");
  }
};

// FUTURE: supabase.auth.resetPasswordForEmail(email)
export const forgotPassword = async (email) => {
  try {
    const users = storageService.get("users") || [];
    const user = users.find((u) => u.email === email);
    
    if (!user) {
      // Return true anyway for security reasons, or specific error if desired
      return createResponse(null, "User not found");
    }

    // In a real app, this would send an email. For demo, we just return success.
    return createResponse(true);
  } catch (error) {
    return createResponse(null, error.message);
  }
};

// FUTURE: supabase.auth.updateUser({ password })
export const resetPassword = async (email, newPassword) => {
  try {
    const users = storageService.get("users") || [];
    const userIndex = users.findIndex((u) => u.email === email);

    if (userIndex === -1) {
      return createResponse(null, "User not found");
    }

    users[userIndex].password = newPassword;
    storageService.set("users", users);

    return createResponse(true);
  } catch (error) {
    return createResponse(null, error.message);
  }
};

// FUTURE: supabase.rpc('accept_invite', { token, password })
export const acceptInvite = async (token, password) => {
  try {
    const users = storageService.get("users") || [];
    const userIndex = users.findIndex((u) => u.inviteToken === token);

    if (userIndex === -1) {
      return createResponse(null, "Invite expired or invalid.");
    }

    const user = users[userIndex];
    if (user.status !== "invited") {
       return createResponse(null, "This invite has already been accepted or is invalid.");
    }

    // Update user
    user.status = "active";
    user.password = password;
    user.acceptedAt = new Date().toISOString();
    delete user.inviteToken;

    users[userIndex] = user;
    storageService.set("users", users);
    
    // Log them in immediately after accepting
    storageService.set("currentUser", user);

    return createResponse(user);
  } catch (error) {
    return createResponse(null, error.message);
  }
};

// FUTURE: supabase.auth.getUser()
export const getCurrentUser = async () => {
  try {
    const user = storageService.get("currentUser");
    return createResponse(user || null);
  } catch (error) {
    return createResponse(null, error.message);
  }
};
