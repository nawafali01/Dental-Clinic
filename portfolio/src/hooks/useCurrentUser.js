import { useState, useEffect } from "react";
import { getCurrentUser } from "@/services/auth.service";

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    setLoading(true);
    const { data, error: fetchError } = await getCurrentUser();
    setUser(data);
    setError(fetchError);
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
    
    // Simulate listening to auth changes if it were Supabase
    // In local storage, we just rely on component remounts or explicit refetches.
    const handleStorageChange = (e) => {
      if (e.key === "currentUser" || e.key === "users") {
        fetchUser();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return { user, loading, error, refetch: fetchUser };
}
