import mongoose from "mongoose";

const symptomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    severity: { type: String, required: true },
    advice: { type: String, required: true },
  },
  { timestamps: true }
);

export const Symptom = mongoose.model("Symptom", symptomSchema);
