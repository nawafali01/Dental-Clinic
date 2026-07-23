import gallery1 from "@/assets/images/gallery-1.jpg";
import gallery2 from "@/assets/images/gallery-2.jpg";
import gallery3 from "@/assets/images/gallery-3.jpg";
import clinicInterior from "@/assets/images/clinic-interior.jpg";

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
    title: "Smile Rejuvenation",
    before: gallery1,
    after: gallery3,
    desc: "Treatment of stains and minor crowding using Invisalign & laser-whitening."
  },
  {
    title: "Full Implant Recovery",
    before: gallery2,
    after: clinicInterior,
    desc: "Single tooth restore overlayed with ceramic crown structure."
  }
];

export const galleryCategories = ["All", "Clinic", "Treatment Rooms", "Equipment"];
