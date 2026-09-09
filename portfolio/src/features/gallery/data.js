import gallery1 from "@/assets/images/gallery-1.jpg";
import gallery2 from "@/assets/images/gallery-2.jpg";
import gallery3 from "@/assets/images/gallery-3.jpg";
import clinicInterior from "@/assets/images/clinic-interior.jpg";
import beforeImg from "@/assets/images/before.jpg";
import afterImg from "@/assets/images/after.jpg";

export const galleryItems = [
  { img: clinicInterior, title: "Modern Reception Lounge", category: "Clinic" },
  { img: gallery1, title: "Aesthetics Atelier Unit", category: "Treatment Rooms" },
  { img: gallery2, title: "AI-Assisted Panoramic X-Ray", category: "Equipment" },
  { img: gallery3, title: "Premium Operation Laboratory", category: "Treatment Rooms" },
  { img: clinicInterior, title: "Aurea Patient Care Suites", category: "Clinic" },
  { img: gallery2, title: "Sterilization Excellence Zone", category: "Equipment" },
];

export const compareItems = [
  {
    title: "Smile Rejuvenation & Alignment",
    before: beforeImg,
    after: afterImg,
    desc: "Treatment of stains, minor crowding, and aesthetic restoration using modern cosmetic dentistry."
  }
];

export const galleryCategories = ["All", "Clinic", "Treatment Rooms", "Equipment"];
