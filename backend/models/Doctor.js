import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    exp: { type: String, required: true },
    img: { type: String, required: true },
    edu: { type: String, required: true },
  },
  { timestamps: true }
);

export const Doctor = mongoose.model("Doctor", doctorSchema);
