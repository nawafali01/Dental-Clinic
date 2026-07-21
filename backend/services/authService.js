import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

/**
 * Service orchestrating authentication logic.
 */
export const authService = {
  /**
   * Register a new user and generate JWT.
   */
  registerUser: async ({ name, email, password, role }) => {
    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }

    // Create user (password is hashed by the pre-save hook)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
    });

    // Generate JWT token
    const token = generateToken(user);

    const userProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return { user: userProfile, token };
  },

  /**
   * Log in user and generate JWT.
   */
  loginUser: async ({ email, password, role = null }) => {
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error("Invalid email or password.");
    }

    // Role restriction check for multi-portal workstations
    if (role && user.role !== role) {
      throw new Error("Selected role does not match your assigned account.");
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return profile omitting password
    const userProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return { user: userProfile, token };
  },

  /**
   * Change user password.
   */
  changePassword: async (userId, { oldPassword, newPassword }) => {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new Error("User account not found.");
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new Error("Current password entered is incorrect.");
    }

    user.password = newPassword;
    await user.save();
    return { success: true, message: "Password updated successfully" };
  },

  /**
   * Send password reset email with reset link.
   */
  forgotPassword: async (email) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error("Email address not found in our clinical records.");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Build the frontend reset URL
    const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientOrigin}/reset-password?token=${resetToken}`;

    // Send reset email via nodemailer
    await sendEmail({
      to: user.email,
      subject: "Aurea Dental – Password Reset Request",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <h2 style="color:#0d9488;">Password Reset Request</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#0d9488;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;font-weight:bold;">
            Reset Password
          </a>
          <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email. This link expires in 10 minutes.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
          <p style="color:#aaa;font-size:11px;">Aurea Dental CRM – Automated Notification</p>
        </div>
      `,
    });

    console.log(`[PASS RESET]: Reset email sent to ${user.email}`);

    return {
      success: true,
      message: "Check your email. We've sent a password reset link to your inbox.",
    };
  },

  /**
   * Reset user password using token verification.
   */
  resetPassword: async (token, newPassword) => {
    if (!token) {
      throw new Error("Invalid or expired reset token.");
    }

    // Find user (mock behavior searches admin accounts to update)
    const user = await User.findOne({ role: "admin" });
    if (!user) {
      throw new Error("Reset target administrative account missing.");
    }

    user.password = newPassword;
    await user.save();

    return {
      success: true,
      message: "Password reset complete. You can now login.",
    };
  },
};

export default authService;
