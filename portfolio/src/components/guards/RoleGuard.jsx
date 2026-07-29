import { useCurrentUser } from "@/hooks/useCurrentUser";

export function RoleGuard({ allowedRoles, fallback = null, children }) {
  const { user, loading } = useCurrentUser();

  if (loading) return null;

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback;
  }

  return children;
}
