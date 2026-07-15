import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    icon: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

export const Service = mongoose.model("Service", serviceSchema);
