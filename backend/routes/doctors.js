import express from "express";
import { Doctor } from "../models/Doctor.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error: error.message });
  }
});

export default router;
