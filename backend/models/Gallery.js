import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    src: { type: String, required: true },
    tag: { type: String, required: true },
    h: { type: String, default: "" },
    alt: { type: String, required: true },
  },
  { timestamps: true }
);

export const Gallery = mongoose.model("Gallery", gallerySchema);
