import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, trim: true },
    entity_type: { type: String, required: true, trim: true },
    entity_id: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    changes: { type: mongoose.Schema.Types.Mixed, default: {} },
    user_id: { type: String, default: "" },
    user_email: { type: String, default: "", lowercase: true, trim: true },
    user_role: { type: String, default: "system" },
    organization_id: { type: String, default: "" },
    clinic_id: { type: String, default: "" },
    ip_address: { type: String, default: "127.0.0.1" },
    user_agent: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
