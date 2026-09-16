import express from "express";
import mongoose from "mongoose";
import { Clinic } from "../models/Clinic.js";
import { Organization } from "../models/Organization.js";
import { User } from "../models/User.js";

const router = express.Router();

async function resolveAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

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

  const callerRole = req.headers["x-user-role"] || req.query.role || "super_admin";
  const orgId = req.headers["x-organization-id"] || req.query.org_id || null;
  req.caller = {
    role: callerRole,
    organization_id: orgId,
  };
  next();
}

/**
 * GET /api/v1/clinics/
 */
router.get("/", resolveAuth, async (req, res) => {
  try {
    const caller = req.caller;
    const queryOrgId = req.query.organization_id || req.query.org_id;

    let filter = {};
    if (caller && caller.role === "org_admin" && caller.organization_id) {
      filter.organization_id = caller.organization_id;
    } else if (queryOrgId && queryOrgId !== "all") {
      filter.organization_id = queryOrgId;
    }

    const clinics = await Clinic.find(filter).sort({ created_at: -1 });
    res.json(
      clinics.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        description: c.description,
        contact_email: c.contact_email,
        contact_phone: c.contact_phone,
        address: c.address,
        timezone: c.timezone,
        working_hours: c.working_hours,
        organization_id: c.organization_id,
        is_active: c.is_active,
        created_at: c.created_at,
        updated_at: c.updated_at,
      }))
    );
  } catch (err) {
    console.error("[GET /api/v1/clinics/]", err.message);
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * POST /api/v1/clinics/
 *
 * Payload:
 * {
 *   "name": "",
 *   "description": "",
 *   "contact_email": "",
 *   "contact_phone": "",
 *   "address": "",
 *   "timezone": "UTC",
 *   "working_hours": {
 *     "additionalProperty": "anything"
 *   },
 *   "organization_id": ""
 * }
 */
router.post("/", resolveAuth, async (req, res) => {
  try {
    const {
      name,
      description = "",
      contact_email = "",
      contact_phone = "",
      address = "",
      timezone = "UTC",
      working_hours = { additionalProperty: "anything" },
      organization_id,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Clinic name is required.",
        },
      });
    }

    const newClinic = await Clinic.create({
      name: name.trim(),
      description: description.trim(),
      contact_email: contact_email.trim(),
      contact_phone: contact_phone.trim(),
      address: address.trim(),
      timezone: timezone.trim() || "UTC",
      working_hours: working_hours || { additionalProperty: "anything" },
      organization_id: organization_id || "",
      is_active: true,
    });

    // Increment clinic_count on organization if exists
    if (organization_id) {
      try {
        await Organization.findByIdAndUpdate(organization_id, { $inc: { clinic_count: 1 } });
      } catch {}
    }

    res.status(201).json({
      id: newClinic._id.toString(),
      name: newClinic.name,
      description: newClinic.description,
      contact_email: newClinic.contact_email,
      contact_phone: newClinic.contact_phone,
      address: newClinic.address,
      timezone: newClinic.timezone,
      working_hours: newClinic.working_hours,
      organization_id: newClinic.organization_id,
      is_active: newClinic.is_active,
      created_at: newClinic.created_at,
      updated_at: newClinic.updated_at,
    });
  } catch (err) {
    console.error("[POST /api/v1/clinics/]", err.message);
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * GET /api/v1/clinics/:id
 */
router.get("/:id", resolveAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let clinic = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      clinic = await Clinic.findById(id);
    }
    if (!clinic) {
      clinic = await Clinic.findOne({ $or: [{ _id: id }, { id: id }] });
    }
    if (!clinic) {
      return res.status(404).json({ success: false, error: { message: "Clinic not found." } });
    }
    res.json({
      id: clinic._id.toString(),
      name: clinic.name,
      description: clinic.description,
      contact_email: clinic.contact_email,
      contact_phone: clinic.contact_phone,
      address: clinic.address,
      timezone: clinic.timezone,
      working_hours: clinic.working_hours,
      organization_id: clinic.organization_id,
      is_active: clinic.is_active,
      created_at: clinic.created_at,
      updated_at: clinic.updated_at,
    });
  } catch (err) {
    console.error("[GET /api/v1/clinics/:id]", err.message);
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

/**
 * PUT /api/v1/clinics/:id
 */
router.put("/:id", resolveAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      contact_email,
      contact_phone,
      address,
      timezone,
      working_hours,
      organization_id,
      is_active,
    } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (contact_email !== undefined) updateFields.contact_email = contact_email.trim();
    if (contact_phone !== undefined) updateFields.contact_phone = contact_phone.trim();
    if (address !== undefined) updateFields.address = address.trim();
    if (timezone !== undefined) updateFields.timezone = timezone.trim();
    if (working_hours !== undefined) updateFields.working_hours = working_hours;
    if (organization_id !== undefined) updateFields.organization_id = organization_id;
    if (is_active !== undefined) updateFields.is_active = is_active;

    let updated = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await Clinic.findByIdAndUpdate(id, updateFields, { new: true });
    }
    if (!updated) {
      updated = await Clinic.findOneAndUpdate({ $or: [{ _id: id }, { id: id }] }, updateFields, { new: true });
    }
    if (!updated) {
      return res.status(404).json({ success: false, error: { message: "Clinic not found." } });
    }

    res.json({
      id: updated._id.toString(),
      name: updated.name,
      description: updated.description,
      contact_email: updated.contact_email,
      contact_phone: updated.contact_phone,
      address: updated.address,
      timezone: updated.timezone,
      working_hours: updated.working_hours,
      organization_id: updated.organization_id,
      is_active: updated.is_active,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    });
  } catch (err) {
    console.error("[PUT /api/v1/clinics/:id]", err.message);
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
