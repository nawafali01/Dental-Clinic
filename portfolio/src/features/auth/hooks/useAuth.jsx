import { useSelector, useDispatch } from "react-redux";
import { useLoginMutation, useRegisterMutation, useLogoutMutation, useForgotPasswordMutation } from "../services/authApi";
import { clearCredentials } from "../services/authSlice";

/**
 * Central auth hook – reads Redux state and exposes RTK mutation triggers.
 * Drop-in replacement for the old Context-based useAuth.
 */
export function useAuth() {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);

  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [logoutMutation, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const [forgotPasswordMutation, { isLoading: isForgotLoading }] = useForgotPasswordMutation();

  /**
   * Login – calls RTK mutation. Credentials auto-stored via extraReducers.
   */
  const login = async ({ email, password, role = null }) => {
    const result = await loginMutation({ email, password, role }).unwrap();
    return result;
  };

  /**
   * Register – calls RTK mutation. Credentials auto-stored via extraReducers.
   */
  const register = async ({ name, email, password, role }) => {
    const result = await registerMutation({ name, email, password, role }).unwrap();
    return result;
  };

  /**
   * Logout – calls RTK mutation and clears Redux state.
   */
  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Even if API fails, clear local state
    }
    dispatch(clearCredentials());
  };

  /**
   * Forgot password – sends reset email.
   */
  const forgotPassword = async (email) => {
    const result = await forgotPasswordMutation({ email }).unwrap();
    return result;
  };

  return {
    user,
    token,
    isAuthenticated,
    loading: isLoginLoading || isRegisterLoading || isLogoutLoading || isForgotLoading,
    login,
    register,
    logout,
    forgotPassword,
  };
}

export default useAuth;
