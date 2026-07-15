import express from "express";
import { Symptom } from "../models/Symptom.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const symptoms = await Symptom.find({});
    res.json(symptoms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching symptoms", error: error.message });
  }
});

export default router;
