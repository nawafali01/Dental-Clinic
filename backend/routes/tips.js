import express from "express";
import { Tip } from "../models/Tip.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const tips = await Tip.find({});
    res.json(tips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tips", error: error.message });
  }
});

export default router;
