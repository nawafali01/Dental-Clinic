import authService from "../services/authService.js";

/**
 * Controller mapping HTTP operations to the core auth service.
 */
export const authController = {
  /**
   * Register new user controller.
   */
  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const data = await authService.registerUser({ name, email, password, role });
      res.status(201).json({
        success: true,
        message: "Account created successfully.",
        data,
      });
    } catch (error) {
      const statusCode = error.message.includes("already exists") ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Registration failed.",
      });
    }
  },

  /**
   * Login user controller.
   */
  login: async (req, res) => {
    try {
      const { email, password, role } = req.body;
      const data = await authService.loginUser({ email, password, role });
      res.status(200).json({
        success: true,
        message: "Successfully signed in.",
        data,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message || "Invalid authentication credentials.",
      });
    }
  },

  /**
   * Get current authenticated user profile.
   */
  getMe: async (req, res) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user profile.",
      });
    }
  },

  /**
   * Password update controller.
   */
  changePassword: async (req, res) => {
    try {
      const result = await authService.changePassword(req.user._id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update password.",
      });
    }
  },

  /**
   * Forgot password request controller.
   */
  forgotPassword: async (req, res) => {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || "Forgot password operation failed.",
      });
    }
  },

  /**
   * Reset password request controller.
   */
  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Reset password operation failed.",
      });
    }
  },

  /**
   * Clear session token / Logout controller.
   */
  logout: async (req, res) => {
    // In production, invalidate token mechanisms can be placed here.
    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  },
};

export default authController;
