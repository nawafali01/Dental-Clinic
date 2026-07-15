import express from "express";
import { Gallery } from "../models/Gallery.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const galleryItems = await Gallery.find({});
    res.json(galleryItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching gallery items", error: error.message });
  }
});

export default router;
