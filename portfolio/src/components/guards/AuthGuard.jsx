import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { STATUS } from "@/constants/roles";
import { logout } from "@/services/auth.service";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }) {
  const { user, loading } = useCurrentUser();
  const location = useLocation();

  useEffect(() => {
    if (user && user.status === STATUS.DISABLED) {
      logout().then(() => {
        window.location.href = "/login";
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.status === STATUS.DISABLED) {
    return null; // Will redirect via useEffect
  }

  return children || <Outlet />;
}
