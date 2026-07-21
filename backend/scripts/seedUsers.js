import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const usersData = [
  {
    name: "Dr. Sarah Al-Faisal",
    email: "superadmin@dentalcrm.example",
    password: "SuperAdmin123!",
    role: "super_admin",
  },
  {
    name: "Dr. Nawaf Ali",
    email: "admin@dentalcrm.example",
    password: "Admin123!",
    role: "admin",
  },
  {
    name: "Bassem Tariq",
    email: "manager@dentalcrm.example",
    password: "Manager123!",
    role: "clinic_manager",
  },
  {
    name: "Layla Hassan",
    email: "receptionist@dentalcrm.example",
    password: "Reception123!",
    role: "reception",
  },
  {
    name: "Kareem Zayed",
    email: "finance@dentalcrm.example",
    password: "Finance123!",
    role: "finance",
  },
  {
    name: "Noor Salem",
    email: "agent@dentalcrm.example",
    password: "Agent123!",
    role: "agent",
  },
];

const seedUsers = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is missing.");
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("[MongoDB Connected]: Seeding users...");

    // Remove existing mock users to prevent duplicate key errors
    await User.deleteMany({
      email: {
        $in: usersData.map((u) => u.email.toLowerCase()),
      },
    });
    console.log("[Database Cleaned]: Deleted conflicting accounts.");

    for (const u of usersData) {
      const newUser = new User(u);
      await newUser.save();
      console.log(`[USER SEEDED]: Generated role '${u.role}' account for ${u.email}`);
    }

    console.log("Database user seeding completed 🌱");
    process.exit(0);
  } catch (error) {
    console.error("User seeding failed:", error.message);
    process.exit(1);
  }
};

seedUsers();
