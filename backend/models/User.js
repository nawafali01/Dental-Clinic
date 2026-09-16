import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:     { type: String, default: "" },
    password:  { type: String, required: true, select: false }, // never returned by default
    role: {
      type: String,
      enum: ["super_admin", "org_admin", "clinic_manager", "agent", "receptionist", "reception", "finance", "auditor"],
      required: true,
    },
    is_active:       { type: Boolean, default: true },
    organization_id: { type: String, default: null },
    assigned_clinics: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare plain text with hashed
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

export const User = mongoose.model("User", userSchema);
