import * as Lucide from "lucide-react";
import { Crown, Smile, Zap } from "lucide-react";
import gallery1 from "@/assets/images/gallery-1.jpg";
import gallery2 from "@/assets/images/gallery-2.jpg";
import gallery3 from "@/assets/images/gallery-3.jpg";

export const iconMap = {
  Sparkles: Lucide.Sparkles,
  Crown: Lucide.Crown,
  Smile: Lucide.Smile,
  Wrench: Lucide.Wrench,
  Stethoscope: Lucide.Stethoscope,
  Baby: Lucide.Baby,
  ShieldPlus: Lucide.ShieldPlus,
  Zap: Lucide.Zap,
};

export const categories = [
  "All",
  "Cosmetic",
  "Restorative",
  "Orthodontics",
  "Preventive",
  "Emergency",
  "Pediatric",
];

export const faqs = [
  {
    q: "How often should I visit the dentist?",
    a: "We recommend a check-up and professional clean every 6 months for most patients. However, if you have gum disease or other conditions, your clinician may suggest more frequent visits.",
  },
  {
    q: "Is teeth whitening safe?",
    a: "Yes — all whitening treatments at Aurea use clinically tested concentrations and are performed under professional supervision to protect your enamel and gum tissue.",
  },
  {
    q: "What should I do in a dental emergency?",
    a: "Call our clinic immediately at +1 (555) 123-4567. A dentist is on call 24/7. If you have a knocked-out tooth, keep it moist in milk or saliva and come in within 30 minutes for the best chance of re-implantation.",
  },
  {
    q: "Do you offer sedation for anxious patients?",
    a: "Absolutely. We offer nitrous oxide (happy gas), oral sedation, and IV sedation depending on the procedure and your anxiety level. Discuss your concerns openly with your clinician before the appointment.",
  },
  {
    q: "What payment options are available?",
    a: "We accept all major insurance plans, credit cards, and offer 0% interest payment plans for treatments over $500 through our partner financing provider.",
  },
  {
    q: "Are your treatments suitable for children?",
    a: "Yes. Our paediatric team is trained in child-friendly techniques and creates a positive, gentle first dental experience — building healthy habits for life.",
  },
];

export const fallbackServices = [
  {
    title: "General Dentistry",
    body: "Comprehensive exams, hygiene cleanings, for stable and long-term oral health.",
    icon: "Stethoscope",
    category: "Preventive",
  },
  {
    title: "Cosmetic Dentistry",
    body: "Premium porcelain veneers, bonding, and aesthetic treatments to transform your smile.",
    icon: "Sparkles",
    category: "Cosmetic",
  },
  {
    title: "Teeth Whitening",
    body: "Professional laser whitening lifting stains up to 8 shades in a single hour.",
    icon: "Zap",
    category: "Cosmetic",
  },
  {
    title: "Clear Aligners",
    body: "AI-planned invisible aligners to straighten your teeth comfortably without metal.",
    icon: "Crown",
    category: "Orthodontics",
  },
  {
    title: "Dental Implants",
    body: "Permanent, biocompatible titanium root implants topped with natural crowns.",
    icon: "Smile",
    category: "Restorative",
  },
  {
    title: "Pediatric Dentistry",
    body: "Gentle child-friendly dental care to build strong habits and positive associations.",
    icon: "Baby",
    category: "Pediatric",
  },
  {
    title: "Emergency Care",
    body: "Same-day emergency support for acute pain, broken crowns, or trauma.",
    icon: "ShieldPlus",
    category: "Emergency",
  },
  {
    title: "Root Canal Therapy",
    body: "Microscope-certified root canal therapy to save compromised teeth with zero pain.",
    icon: "Wrench",
    category: "Restorative",
  },
];

export const featuredTreatments = [
  {
    icon: Crown,
    label: "Most Popular",
    title: "Teeth Whitening",
    price: "from $320",
    body: "In-office laser whitening that lifts stains up to 8 shades in a single 60-minute session.",
    img: gallery1,
  },
  {
    icon: Smile,
    label: "Premium",
    title: "Dental Implants",
    price: "from $2,400",
    body: "Permanent, natural-looking tooth replacement using titanium root fixtures and ceramic crowns.",
    img: gallery2,
  },
  {
    icon: Zap,
    label: "New at Aurea",
    title: "Invisible Aligners",
    price: "from $1,800",
    body: "AI-planned clear aligner treatment with 3D progress tracking. Straighter teeth on your terms.",
    img: gallery3,
  },
];

/**
 * Filter services array based on category and search text.
 */
export function filterServices(services = [], activeCat = "All", search = "") {
  return services.filter((s) => {
    const matchCat =
      activeCat === "All" || (s.category && s.category === activeCat);
    const matchSearch =
      !search ||
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.body?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
}
