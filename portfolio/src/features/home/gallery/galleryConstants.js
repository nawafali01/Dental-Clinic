import gallery1 from "@/assets/images/gallery-1.jpg";
import gallery2 from "@/assets/images/gallery-2.jpg";
import gallery3 from "@/assets/images/gallery-3.jpg";
import clinicInterior from "@/assets/images/clinic-interior.jpg";

export const GALLERY_CATEGORIES = ["All", "Cosmetic", "Family", "Clinic", "Interior"];

export const GALLERY_ASSET_MAP = {
  "gallery-1.jpg": gallery1,
  "gallery-2.jpg": gallery2,
  "gallery-3.jpg": gallery3,
  "clinic-interior.jpg": clinicInterior,
};

export const BEFORE_AFTER_CASE = {
  label: "Interactive Smile Transformation",
  title: "Porcelain Atelier Veneers & Alignment",
  description:
    "Drag the handle left or right to compare pre-treatment alignment with final porcelain restoration results.",
  case: "Full Upper Smile Rehabilitation",
  duration: "3 Visits over 2 Weeks",
  clinician: "Dr. Marcus Thorne",
  ctaLabel: "Book Similar Transformation →",
  ctaHref: "#contact",
};
