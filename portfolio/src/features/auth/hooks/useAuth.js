import { useState } from "react";
import { login, logout, forgotPassword, resetPassword, acceptInvite } from "@/services/auth.service";
import { useNavigate } from "react-router-dom";
import { ROLE_REDIRECTS } from "@/constants/roles";
import { toast } from "sonner";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    const { data: user, error } = await login(email, password);
    setIsLoading(false);

    if (error) {
      toast.error(error);
      return { user: null, error };
    }

    if (user) {
      toast.success("Successfully logged in");
      const redirectPath = ROLE_REDIRECTS[user.role] || "/dashboard";
      navigate(redirectPath);
    }
    
    return { user, error: null };
  };

  const handleLogout = async () => {
    setIsLoading(true);
    const { error } = await logout();
    setIsLoading(false);
    
    if (error) {
      toast.error(error);
    } else {
      navigate("/login");
    }
  };
  
  const handleAcceptInvite = async (token, password) => {
    setIsLoading(true);
    const { data: user, error } = await acceptInvite(token, password);
    setIsLoading(false);
    
    if (error) {
      toast.error(error);
      return { user: null, error };
    }
    
    toast.success("Account activated successfully");
    navigate("/onboarding");
    return { user, error: null };
  };

  return {
    handleLogin,
    handleLogout,
    handleAcceptInvite,
    isLoading,
  };
}
