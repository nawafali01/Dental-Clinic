import { useState } from "react";
import { useAuth as useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ROLE_REDIRECTS } from "@/constants/roles";
import { normalizeRole } from "@/utils/normalizeUser";
import { buildRoleUrl } from "@/utils/getRoleBaseUrl";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";

/**
 * useAuth (feature-level hook)
 *
 * Thin wrapper around AuthContext that adds:
 *  - Loading state for the submit button
 *  - Toast notifications on success / error
 *  - Role-based redirect after login
 *
 * All actual auth logic (API calls, token storage, context state) lives in
 * AuthContext → authService → api.js. This hook MUST NOT duplicate that logic.
 */
export function useAuth() {
  const { login, logout } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * handleLogin — called by StaffLoginFeature form submit.
   * Delegates to AuthContext.login (real API call).
   * On success: shows toast + navigates to role-specific dashboard.
   * On failure: shows the API error.message as a toast.
   */
  const handleLogin = async (email, username, password) => {
    setIsLoading(true);
    const res = await login(email, username, password);
    setIsLoading(false);

    if (!res.success) {
      toast.error(res.message || 'Login failed. Please try again.');
      return { user: null, error: res.message };
    }

    const user = res.data;
    toast.success('Successfully logged in');
    const role = normalizeRole(user?.role);
    const redirectPath = ROLE_REDIRECTS[role] || buildRoleUrl('/dashboard', role);
    navigate(redirectPath);
    return { user, error: null };
  };

  /**
   * handleLogout — delegates to AuthContext.logout which:
   *  1. Clears all tokens from localStorage
   *  2. Resets context state
   *  3. Performs window.location.replace('/login') (hard redirect)
   *
   * No navigate() call here — the hard redirect in AuthContext handles it.
   */
  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
    // AuthContext.logout does window.location.replace('/login') — no further action needed
    setIsLoading(false);
  };

  /**
   * handleAcceptInvite — still uses authService directly (mock, outside this task).
   */
  const handleAcceptInvite = async (token, password) => {
    setIsLoading(true);
    const res = await authService.acceptInvite(token, password);
    setIsLoading(false);

    if (!res.success) {
      toast.error(res.message || 'Failed to accept invite.');
      return { user: null, error: res.message };
    }

    toast.success('Account activated successfully');
    navigate('/onboarding');
    return { user: res.data, error: null };
  };

  return {
    handleLogin,
    handleLogout,
    handleAcceptInvite,
    isLoading,
  };
}

