import doctor1 from "@/assets/images/doctor-1.jpg";
import doctor2 from "@/assets/images/doctor-2.jpg";
import doctor3 from "@/assets/images/doctor-3.jpg";

export const doctorAssetMap = {
  "doctor-1.jpg": doctor1,
  "doctor-2.jpg": doctor2,
  "doctor-3.jpg": doctor3,
};

export const fallbackDoctors = [
  {
    _id: "1",
    name: "Dr. Catherine Reyes",
    role: "Cosmetic & Restorative Dentist",
    edu: "DDS, Columbia University",
    exp: "12 years",
    img: doctor1,
    category: "Cosmetic",
    bio: "Dr. Reyes has over twelve years of clinical practice in aesthetics. She specializes in full smile makeovers using custom-veneers, composite bonding, and orthodontics. Her mission is to merge medical requirements with artistic beauty, delivering highly personalized confidence milestones.",
    certs: ["Invisalign Diamond Provider", "ACCD Accredited Member", "Sirona Dental Specialist"],
    reviews: [
      { author: "Mark J.", rating: 5, comment: "Dr. Reyes is purely an artist. I did my composite veneers and the results look extremely natural and beautiful!" },
      { author: "Zoe K.", rating: 5, comment: "Extremely gentle, explained everything clearly. Highly recommend her for nervous patients." }
    ],
    services: ["Porcelain Veneers", "Teeth Whitening", "Laser Gum Contouring", "Cosmetic Bonding"]
  },
  {
    _id: "2",
    name: "Dr. Marcus Vance",
    role: "Implant & Oral Surgeon",
    edu: "DDS, PhD, Harvard Dental School",
    exp: "15 years",
    img: doctor2,
    category: "Implantology",
    bio: "Dr. Vance is a double board-certified implantologist and oral surgeon with fifteen years of experience. He is an international lecturer on computer-guided implant operations, aiming to perform low-infiltration procedures with extremely rapid healing windows.",
    certs: ["Board Certified Oral Surgeon", "ICOI Fellow Member", "Dental Implants Implant Chair"],
    reviews: [
      { author: "Arthur L.", rating: 5, comment: "Amazing skill. Replaced two missing molars with zero pain during the procedure. Truly a specialist." },
      { author: "Sonia G.", rating: 5, comment: "Professional team and advanced surgical diagnostics. Recommended for dental implants." }
    ],
    services: ["Single Tooth Implants", "All-on-4 Restoration", "Bone Grafting", "Wisdom Teeth Extraction"]
  },
  {
    _id: "3",
    name: "Dr. Sarah Kim",
    role: "Pediatric Specialist",
    edu: "DMD, University of Pennsylvania",
    exp: "9 years",
    img: doctor3,
    category: "Pediatric",
    bio: "Dr. Kim understands that children require a unique, patient approach to health. With a deep emphasis on pediatric psychology and laser dental tools, she builds happy dental habits, transforming dental cleanings into fun educational adventures.",
    certs: ["AAPD Certified Pediatric Expert", "Laser Dentistry Certified", "BLS Instructor"],
    reviews: [
      { author: "David P.", rating: 5, comment: "My 6-year old actually likes visiting her! That should tell you everything." },
      { author: "Lucia M.", rating: 5, comment: "Super sweet and knows exactly how to handle anxious kids. The kids play area is amazing too." }
    ],
    services: ["Child Cleanings", "Fluoride Treatment", "Pit & Fissure Sealants", "Myofunctional Therapy"]
  }
];

export const doctorCategories = ["All", "Cosmetic", "Implantology", "Pediatric", "General"];
