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
// Isko replace karo:
app.use(cors({
  origin: ["https://dental-clinic-two-ashy.vercel.app", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"] // Ngrok warning bypass karne ke liye ye zaroori hai!
}));
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

// Port configuration - only listen locally (Vercel handles this as serverless)
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`[Aurea Server]: Server is running on port ${PORT}`);
  });
}

export default app;

