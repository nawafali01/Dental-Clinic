import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

const router = express.Router();

/**
 * POST /api/v1/auth/login
 * Body: { email, username?, password }
 *
 * 1. Looks up user in MongoDB by email
 * 2. Verifies bcrypt password
 * 3. Returns a session token + user object
 *
 * If user not found in DB, returns 404 so the frontend
 * local fallback in auth.service.js takes over.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: "Email and password are required." },
      });
    }

    // Find user and include the password field (it's excluded by default)
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "No account found with this email address." },
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: { message: "Incorrect password." },
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: { message: "This account has been deactivated. Contact your administrator." },
      });
    }

    // Build a simple session token (replace with JWT in production)
    const token = `express_${user._id}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // Return user without password
    const { password: _pw, ...safeUser } = user.toObject();

    res.json({
      success: true,
      access_token: token,
      refresh_token: "",
      user: {
        id: safeUser._id,
        name: safeUser.full_name,
        fullName: safeUser.full_name,
        email: safeUser.email,
        phone: safeUser.phone || "",
        role: safeUser.role,
        organizationId: safeUser.organization_id || null,
        assignedClinics: safeUser.assigned_clinics || [],
        status: safeUser.is_active ? "active" : "inactive",
      },
    });
  } catch (err) {
    console.error("[POST /api/v1/auth/login]", err.message);
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * POST /api/v1/auth/logout
 * Stateless — client just clears localStorage tokens.
 */
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully." });
});

export default router;
