import { disableUser, enableUser, revokeInvite, resendInvite } from "@/services/user.service";
import { toast } from "sonner";

/**
 * Filter users by simple search query (name or email).
 */
export function filterUsers(users = [], searchTerm = "") {
  if (!searchTerm.trim()) return users;
  const term = searchTerm.toLowerCase().trim();
  return users.filter((user) => {
    const fullName = user.fullName ? user.fullName.toLowerCase() : "";
    const email = user.email ? user.email.toLowerCase() : "";
    return fullName.includes(term) || email.includes(term);
  });
}

/**
 * Advanced filter for users table supporting search query, role, status, and clinic filters.
 */
export function filterUsersAdvanced(users = [], filters = {}) {
  const { search = "", role = "", status = "", clinic = "" } = filters;
  return users.filter((user) => {
    if (search) {
      const term = search.toLowerCase().trim();
      const nameMatch = user.fullName?.toLowerCase().includes(term);
      const emailMatch = user.email?.toLowerCase().includes(term);
      if (!nameMatch && !emailMatch) return false;
    }
    if (role && user.role !== role) return false;
    if (status && user.status !== status) return false;
    if (clinic && user.clinic !== clinic) return false;
    return true;
  });
}

/**
 * Formats role snake_case / camelCase strings into human readable Title Case.
 */
export function formatRole(role) {
  if (!role) return "";
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Returns Tailwind CSS badge classes for user status.
 */
export function getStatusBadgeStyle(status) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700";
    case "invited":
      return "bg-amber-100 text-amber-700";
    case "disabled":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

/**
 * Formats date string into localized date.
 */
export function formatDate(dateString) {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
}

/**
 * Handles common user actions (disable, enable, revoke, resend) with confirmation and toasts.
 */
export async function handleUserAction(action, user, { onSuccess, confirmPrompt = true } = {}) {
  const userName = user.fullName || user.email || "this user";
  
  if (confirmPrompt) {
    const isConfirmed = window.confirm(`Are you sure you want to ${action} ${userName}?`);
    if (!isConfirmed) return { success: false, cancelled: true };
  }

  let result;
  switch (action) {
    case "disable":
      result = await disableUser(user.id);
      break;
    case "enable":
      result = await enableUser(user.id);
      break;
    case "revoke":
      result = await revokeInvite(user.id);
      break;
    case "resend":
      result = await resendInvite(user.id);
      break;
    default:
      return { success: false, error: "Invalid action" };
  }

  const { error } = result || {};

  if (error) {
    if (typeof toast !== "undefined" && toast.error) {
      toast.error(error);
    }
    return { success: false, error };
  } else {
    if (typeof toast !== "undefined" && toast.success) {
      toast.success(`Action '${action}' completed successfully.`);
    }
    if (onSuccess) onSuccess();
    return { success: true };
  }
}
