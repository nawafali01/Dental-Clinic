import mongoose from "mongoose";
import dotenv from "dotenv";
import { Service } from "../models/Service.js";
import { Doctor } from "../models/Doctor.js";
import { Gallery } from "../models/Gallery.js";
import { Tip } from "../models/Tip.js";
import { Symptom } from "../models/Symptom.js";

dotenv.config();

const servicesData = [
  {
    icon: "Sparkles",
    title: "Cosmetic Dentistry",
    body: "Veneers, bonding and smile makeovers with digital previews.",
  },
  {
    icon: "Crown",
    title: "Dental Implants",
    body: "Same-day guided implants using 3D imaging.",
  },
  {
    icon: "Smile",
    title: "Teeth Whitening",
    body: "Enamel-safe brightening up to 8 shades in one visit.",
  },
  {
    icon: "Wrench",
    title: "Braces & Aligners",
    body: "Invisible aligners planned by our AI orthodontic engine.",
  },
  {
    icon: "Stethoscope",
    title: "Root Canal",
    body: "Micro-surgical endodontics — quiet, precise, painless.",
  },
  {
    icon: "Baby",
    title: "Family & Pediatric",
    body: "Gentle care for every age in our dedicated kids wing.",
  },
  {
    icon: "ShieldPlus",
    title: "Preventive Care",
    body: "Cleanings, sealants and personalized dental coaching.",
  },
  {
    icon: "Zap",
    title: "Emergency Care",
    body: "Same-day slots reserved for urgent pain and trauma.",
  },
];

const doctorsData = [
  {
    name: "Dr. Elena Marsh",
    role: "Cosmetic & Prosthodontics",
    exp: "12 years",
    img: "/src/assets/images/doctor-2.jpg",
    edu: "DDS, King's College London",
  },
  {
    name: "Dr. Julian Reyes",
    role: "Implantology & Surgery",
    exp: "9 years",
    img: "/src/assets/images/doctor-1.jpg",
    edu: "MSc Oral Surgery, NYU",
  },
  {
    name: "Dr. Anders Holm",
    role: "Orthodontics & AI Care",
    exp: "18 years",
    img: "/src/assets/images/doctor-3.jpg",
    edu: "PhD Digital Dentistry, KU",
  },
];

const galleryData = [
  {
    src: "/src/assets/images/gallery-1.jpg",
    tag: "Cosmetic",
    h: "row-span-2",
    alt: "Bright confident smile",
  },
  {
    src: "/src/assets/images/gallery-3.jpg",
    tag: "Clinic",
    h: "",
    alt: "Modern treatment room",
  },
  {
    src: "/src/assets/images/gallery-2.jpg",
    tag: "Family",
    h: "row-span-2",
    alt: "Happy family visit",
  },
  {
    src: "/src/assets/images/clinic-interior.jpg",
    tag: "Interior",
    h: "",
    alt: "Aurea reception",
  },
];

const tipsData = [
  { text: "Floss BEFORE brushing so fluoride reaches between teeth. Small change, big impact." },
  { text: "Drink water after espresso or tea to prevent enamel stains and maintain pH balance." },
  { text: "Replace your toothbrush every 3 months or after recovering from a cold to prevent bacteria buildup." },
  { text: "Brushing tongue minimizes bad breath and helps prevent daily plaque collection." },
];

const symptomsData = [
  {
    name: "Bleeding Gums",
    severity: "Moderate",
    advice: "Bleeding often indicates gingivitis. Ensure twice-daily flossing and mouthwash. If persistent, request clinic scale & clean.",
  },
  {
    name: "Sharp Pain",
    severity: "Critical",
    advice: "Sharp pain from cold or biting indicates possible fracture or pulp inflammation. Request emergency appointment immediately.",
  },
  {
    name: "Dull Ache",
    severity: "Moderate",
    advice: "A dull ache could mean grinding or a developing cavity. Try a mouthguard at night, and get it checked soon.",
  },
  {
    name: "Mild sensitivity",
    severity: "Low",
    advice: "Mild heat/cold sensitivity is common. Try sensitive toothpaste for 2 weeks. Avoid extreme hot/cold food.",
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await Service.deleteMany({});
    await Doctor.deleteMany({});
    await Gallery.deleteMany({});
    await Tip.deleteMany({});
    await Symptom.deleteMany({});

    // Import new data
    await Service.insertMany(servicesData);
    await Doctor.insertMany(doctorsData);
    await Gallery.insertMany(galleryData);
    await Tip.insertMany(tipsData);
    await Symptom.insertMany(symptomsData);

    console.log("Database seeded successfully 🌱");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDB();
