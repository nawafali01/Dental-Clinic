import mongoose from "mongoose";

const tipSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export const Tip = mongoose.model("Tip", tipSchema);
