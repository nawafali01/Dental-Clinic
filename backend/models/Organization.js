import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    contact_email: { type: String, default: "", lowercase: true, trim: true },
    contact_phone: { type: String, default: "", trim: true },
    address: { type: String, default: "" },
    branding: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ additionalProperty: "anything" }),
    },
    is_active: { type: Boolean, default: true },
    clinic_count: { type: Number, default: 0 },
    user_count: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const Organization = mongoose.model("Organization", organizationSchema);
