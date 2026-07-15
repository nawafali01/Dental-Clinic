import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

// Routes imports
import servicesRoutes from "./routes/services.js";
import doctorsRoutes from "./routes/doctors.js";
import galleryRoutes from "./routes/gallery.js";
import tipsRoutes from "./routes/tips.js";
import symptomsRoutes from "./routes/symptoms.js";
import appointmentsRoutes from "./routes/appointments.js";
import aiRoutes from "./routes/ai.js";
import userRoutes from "./routes/userRoutes.js";

// Initialize config
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes Mounts
app.use("/api/services", servicesRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/tips", tipsRoutes);
app.use("/api/symptoms", symptomsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Aurea Server]: Server is running on port ${PORT}`);
});
