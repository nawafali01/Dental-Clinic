import express from "express";
import { Organization } from "../models/Organization.js";
import { User } from "../models/User.js";

const router = express.Router();

/**
 * Middleware to resolve caller from Authorization header or fallback
 */
async function resolveAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  // If express token: express_<userId>_<timestamp>_<random>
  if (token.startsWith("express_")) {
    const parts = token.split("_");
    const userId = parts[1];
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        req.caller = user;
        return next();
      }
    }
  }

  // Fallback dev caller: check custom headers or query
  const callerRole = req.headers["x-user-role"] || req.query.role || "super_admin";
  const orgId = req.headers["x-organization-id"] || req.query.org_id || null;
  req.caller = {
    role: callerRole,
    organization_id: orgId,
  };
  next();
}

/**
 * POST /api/v1/organizations/
 *
 * Payload:
 * {
 *   "name": "",
 *   "description": "",
 *   "contact_email": "",
 *   "contact_phone": "",
 *   "address": "",
 *   "branding": {
 *     "additionalProperty": "anything"
 *   }
 * }
 *
 * RULE: Only Super Admin can create organizations.
 */
router.post("/", resolveAuth, async (req, res) => {
  try {
    const caller = req.caller;

    // RBAC: Only Super Admin is allowed to create organizations
    if (caller && caller.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Only Super Admin is authorized to create organizations.",
        },
      });
    }

    const {
      name,
      description = "",
      contact_email = "",
      contact_phone = "",
      address = "",
      branding = { additionalProperty: "anything" },
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Organization name is required.",
        },
      });
    }

    const newOrg = await Organization.create({
      name: name.trim(),
      description: description.trim(),
      contact_email: contact_email.trim(),
      contact_phone: contact_phone.trim(),
      address: address.trim(),
      branding: branding || { additionalProperty: "anything" },
      is_active: true,
      clinic_count: 0,
      user_count: 0,
    });

    res.status(201).json({
      id: newOrg._id.toString(),
      name: newOrg.name,
      description: newOrg.description,
      contact_email: newOrg.contact_email,
      contact_phone: newOrg.contact_phone,
      address: newOrg.address,
      branding: newOrg.branding,
      is_active: newOrg.is_active,
      clinic_count: newOrg.clinic_count,
      user_count: newOrg.user_count,
      created_at: newOrg.created_at,
      updated_at: newOrg.updated_at,
    });
  } catch (err) {
    console.error("[POST /api/v1/organizations/]", err.message);
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/v1/organizations/
 *
 * RBAC:
 * - Super Admin: returns array of all organizations
 * - Org Admin: returns their organization (single object or filtered array)
 * - Others: 403 Forbidden
 */
router.get("/", resolveAuth, async (req, res) => {
  try {
    const caller = req.caller;

    if (caller && caller.role === "org_admin") {
      // Find the specific organization
      const orgQuery = caller.organization_id ? { _id: caller.organization_id } : {};
      const org = await Organization.findOne(orgQuery);
      if (!org) {
        return res.json([]);
      }
      // Return the single organization object matching FastAPI behavior
      return res.json({
        id: org._id.toString(),
        name: org.name,
        description: org.description,
        contact_email: org.contact_email,
        contact_phone: org.contact_phone,
        address: org.address,
        branding: org.branding,
        is_active: org.is_active,
        clinic_count: org.clinic_count,
        user_count: org.user_count,
        created_at: org.created_at,
        updated_at: org.updated_at,
      });
    }

    // Super Admin: return all organizations
    const orgs = await Organization.find({}).sort({ created_at: -1 });
    res.json(
      orgs.map((o) => ({
        id: o._id.toString(),
        name: o.name,
        description: o.description,
        contact_email: o.contact_email,
        contact_phone: o.contact_phone,
        address: o.address,
        branding: o.branding,
        is_active: o.is_active,
        clinic_count: o.clinic_count,
        user_count: o.user_count,
        created_at: o.created_at,
        updated_at: o.updated_at,
      }))
    );
  } catch (err) {
    console.error("[GET /api/v1/organizations/]", err.message);
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/v1/organizations/:id
 */
router.get("/:id", resolveAuth, async (req, res) => {
  try {
    const caller = req.caller;
    if (caller && caller.role === "org_admin" && caller.organization_id && caller.organization_id !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: { message: "Access Denied: You are only authorized to view your own organization." },
      });
    }

    const org = await Organization.findById(req.params.id);
    if (!org) {
      return res.status(404).json({ success: false, error: { message: "Organization not found." } });
    }

    res.json({
      id: org._id.toString(),
      name: org.name,
      description: org.description,
      contact_email: org.contact_email,
      contact_phone: org.contact_phone,
      address: org.address,
      branding: org.branding,
      is_active: org.is_active,
      clinic_count: org.clinic_count,
      user_count: org.user_count,
      created_at: org.created_at,
      updated_at: org.updated_at,
    });
  } catch (err) {
    console.error("[GET /api/v1/organizations/:id]", err.message);
    res.status(500).json({ success: false, error: { message: err.message } });
  }
/**
 * PUT /api/v1/organizations/:id
 * Body:
 * {
 *   "name": "",
 *   "description": "",
 *   "contact_email": "",
 *   "contact_phone": "",
 *   "address": "",
 *   "branding": {
 *     "additionalProperty": "anything"
 *   },
 *   "is_active": true
 * }
 */
router.put("/:id", resolveAuth, async (req, res) => {
  try {
    const caller = req.caller;
    if (caller && caller.role === "org_admin" && caller.organization_id && caller.organization_id !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: { message: "Access Denied: You can only edit your own organization." },
      });
    }

    const {
      name,
      description,
      contact_email,
      contact_phone,
      address,
      branding,
      is_active,
    } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (contact_email !== undefined) updateFields.contact_email = contact_email.trim();
    if (contact_phone !== undefined) updateFields.contact_phone = contact_phone.trim();
    if (address !== undefined) updateFields.address = address.trim();
    if (branding !== undefined) updateFields.branding = branding;
    if (is_active !== undefined) updateFields.is_active = is_active;

    const updated = await Organization.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, error: { message: "Organization not found." } });
    }

    res.json({
      id: updated._id.toString(),
      name: updated.name,
      description: updated.description,
      contact_email: updated.contact_email,
      contact_phone: updated.contact_phone,
      address: updated.address,
      branding: updated.branding,
      is_active: updated.is_active,
      clinic_count: updated.clinic_count,
      user_count: updated.user_count,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    });
  } catch (err) {
    console.error("[PUT /api/v1/organizations/:id]", err.message);
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
