import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    contact_email: { type: String, default: "", lowercase: true, trim: true },
    contact_phone: { type: String, default: "", trim: true },
    address: { type: String, default: "" },
    timezone: { type: String, default: "UTC" },
    working_hours: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ additionalProperty: "anything" }),
    },
    organization_id: { type: String, required: true, trim: true },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const Clinic = mongoose.model("Clinic", clinicSchema);
