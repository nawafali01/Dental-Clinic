import express from "express";
import { User } from "../models/User.js";

const router = express.Router();

// ─────────────────────────────────────────────
// GET /api/v1/users/
// Returns all users (password excluded)
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { role, organization_id, is_active, search } = req.query;

    const filter = {};
    if (role)            filter.role = role;
    if (organization_id) filter.organization_id = organization_id;
    if (is_active !== undefined) filter.is_active = is_active === "true";
    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { email:     { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")       // never expose password
      .sort({ createdAt: -1 });  // newest first

    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error("[GET /api/v1/users]", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/v1/users/:id
// Returns a single user by MongoDB _id
// ─────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error("[GET /api/v1/users/:id]", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/v1/users/
// Creates a new user
// Body: { full_name, email, phone, password, role, is_active, organization_id, assigned_clinics }
// ─────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      password,
      role,
      is_active,
      organization_id,
      assigned_clinics,
    } = req.body;

    // Required field validation
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: "full_name, email, password, and role are required.",
      });
    }

    // Duplicate email check
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({
        success: false,
        error: "A user with this email already exists.",
      });
    }

    const user = await User.create({
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || "",
      password,                                     // hashed by pre-save hook
      role,
      is_active: is_active !== undefined ? is_active : true,
      organization_id: (organization_id && typeof organization_id === "string" && organization_id.trim()) ? organization_id.trim() : null,
      assigned_clinics: Array.isArray(assigned_clinics)
        ? assigned_clinics.filter((c) => Boolean(c && typeof c === "string" && c.trim()))
        : [],
    });

    // Return user without password
    const { password: _pw, ...userWithoutPassword } = user.toObject();
    res.status(201).json({ success: true, data: userWithoutPassword });
  } catch (err) {
    console.error("[POST /api/v1/users]", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/v1/users/:id
// Updates an existing user
// ─────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const {
      full_name,
      phone,
      role,
      is_active,
      organization_id,
      assigned_clinics,
    } = req.body;

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active;
    if (organization_id !== undefined) {
      updates.organization_id = (organization_id && typeof organization_id === "string" && organization_id.trim())
        ? organization_id.trim()
        : null;
    }
    if (assigned_clinics !== undefined) {
      updates.assigned_clinics = Array.isArray(assigned_clinics)
        ? assigned_clinics.filter((c) => Boolean(c && typeof c === "string" && c.trim()))
        : [];
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error("[PUT /api/v1/users/:id]", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/v1/users/:id
// Deletes a user
// ─────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, message: "User deleted successfully." });
  } catch (err) {
    console.error("[DELETE /api/v1/users/:id]", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
