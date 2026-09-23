import express from "express";
import { AuditLog } from "../models/AuditLog.js";

const router = express.Router();

// Helper to format log response
function formatLog(l) {
  return {
    id: l._id ? l._id.toString() : l.id,
    created_at: l.created_at || l.timestamp || new Date().toISOString(),
    user_id: l.user_id || "",
    user_email: l.user_email || l.actor || "",
    user_role: l.user_role || l.role || "system",
    action: l.action,
    entity_type: l.entity_type || l.entity || "",
    entity_id: l.entity_id || l.entityId || "",
    description: l.description || l.details || "",
    changes: l.changes || {},
    organization_id: l.organization_id || l.orgId || "",
    clinic_id: l.clinic_id || l.clinicId || "",
    ip_address: l.ip_address || l.ipAddress || "127.0.0.1",
    user_agent: l.user_agent || "",
  };
}

// POST /api/v1/audit/log - Create audit log entry
router.post("/log", async (req, res) => {
  try {
    const {
      action,
      entity_type,
      entity_id,
      description = "",
      changes = {},
      user_id = "",
      user_email = "",
      user_role = "system",
      organization_id = "",
      clinic_id = "",
      ip_address = "127.0.0.1",
      user_agent = "",
    } = req.body;

    const log = await AuditLog.create({
      action,
      entity_type,
      entity_id,
      description,
      changes,
      user_id,
      user_email,
      user_role,
      organization_id,
      clinic_id,
      ip_address: req.ip || ip_address,
      user_agent: req.headers["user-agent"] || user_agent,
    });

    res.status(201).json(formatLog(log));
  } catch (err) {
    console.error("[POST /api/v1/audit/log]", err.message);
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/v1/audit/entity/:entity_type/:entity_id
router.get("/entity/:entity_type/:entity_id", async (req, res) => {
  try {
    const { entity_type, entity_id } = req.params;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 1000);
    const userRole = req.headers["x-user-role"] || "super_admin";

    if (userRole !== "super_admin" && userRole !== "org_admin") {
      return res.status(403).json({ detail: "Access denied: Super Admin or Org Admin role required." });
    }

    const logs = await AuditLog.find({
      entity_type: new RegExp(`^${entity_type}$`, "i"),
      entity_id: entity_id,
    })
      .sort({ created_at: -1 })
      .limit(limit);

    return res.json(logs.map(formatLog));
  } catch (err) {
    console.error("[GET /api/v1/audit/entity]", err.message);
    return res.json([]);
  }
});

// GET /api/v1/audit/user/:user_id
router.get("/user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 1000);
    const currentUserId = req.headers["x-user-id"] || "usr-001";
    const userRole = req.headers["x-user-role"] || "super_admin";

    const isSelf = currentUserId === user_id;
    const isAdmin = userRole === "super_admin" || userRole === "org_admin";

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ detail: "Access denied: You can only view your own logs." });
    }

    const logs = await AuditLog.find({ user_id })
      .sort({ created_at: -1 })
      .limit(limit);

    return res.json(logs.map(formatLog));
  } catch (err) {
    console.error("[GET /api/v1/audit/user]", err.message);
    return res.json([]);
  }
});

// GET /api/v1/audit/organization/:org_id
router.get("/organization/:org_id", async (req, res) => {
  try {
    const { org_id } = req.params;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 1000);
    const userRole = req.headers["x-user-role"] || "super_admin";
    const currentOrgId = req.headers["x-org-id"] || "org-001";

    if (userRole !== "super_admin" && userRole !== "org_admin") {
      return res.status(403).json({ detail: "Access denied: Super Admin or Org Admin role required." });
    }

    if (userRole === "org_admin" && currentOrgId !== org_id) {
      return res.status(403).json({ detail: "Access denied: Cannot view logs for another organization." });
    }

    const filter = org_id === "all" ? {} : { organization_id: org_id };
    const logs = await AuditLog.find(filter)
      .sort({ created_at: -1 })
      .limit(limit);

    return res.json(logs.map(formatLog));
  } catch (err) {
    console.error("[GET /api/v1/audit/organization]", err.message);
    return res.json([]);
  }
});

// GET /api/v1/audit or GET /api/v1/audit/logs
const getAllAuditLogs = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 1000);
    const logs = await AuditLog.find({})
      .sort({ created_at: -1 })
      .limit(limit);

    return res.json(logs.map(formatLog));
  } catch (err) {
    console.error("[GET /api/v1/audit]", err.message);
    return res.json([]);
  }
};

router.get("/", getAllAuditLogs);
router.get("/logs", getAllAuditLogs);

// GET /api/v1/audit/security
router.get("/security", async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 1000);
    const userRole = req.headers["x-user-role"] || "super_admin";

    if (userRole !== "super_admin") {
      return res.status(403).json({ detail: "Access denied: Security audit logs are strictly restricted to Super Admins." });
    }

    const logs = await AuditLog.find({
      action: { $regex: /LOGIN|SECURITY|PASSWORD|ROLE/i },
    })
      .sort({ created_at: -1 })
      .limit(limit);

    return res.json(logs.map(formatLog));
  } catch (err) {
    console.error("[GET /api/v1/audit/security]", err.message);
    return res.json([]);
  }
});

export default router;
