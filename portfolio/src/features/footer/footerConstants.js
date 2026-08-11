import { Globe, ExternalLink, Share2, BookMarked } from "lucide-react";

export const FOOTER_COLS = [
  {
    title: "Clinic",
    links: [
      { label: "Services", href: "#services" },
      { label: "Doctors", href: "/home/doctors" },
      { label: "Gallery", href: "#gallery" },
      { label: "About", href: "/home/about" },
    ],
  },
  {
    title: "Care",
    links: [
      { label: "AI Assistant", href: "#ai" },
      { label: "Emergency", href: "#live-slots" },
      { label: "Insurance", href: "#faq" },
      { label: "Financing", href: "#treatment-finder" },
    ],
  },
  {
    title: "Legal & Governance",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Accessibility Statement", href: "#" },
      { label: "Non-emergency Disclaimer", href: "#" },
      { label: "Non-clinical Advice Disclaimer", href: "#" },
    ],
  },
];

export const FOOTER_LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookie Policy", href: "#" },
  { label: "Accessibility Statement", href: "#" },
  { label: "Non-emergency Medical Disclaimer", href: "#" },
  { label: "Non-clinical Advice Disclaimer", href: "#" },
];

export const FOOTER_SOCIAL_ICONS = [Globe, ExternalLink, Share2, BookMarked];

export const FOOTER_META = {
  brand: "Aurea",
  tagline: "Modern, AI-powered dentistry designed to feel calm, considered, and quietly luxurious.",
  newsletter: {
    heading: "Get gentle dental wisdom, monthly.",
    subtext: "No spam. Just tips, offers, and the occasional smile story.",
    placeholder: "you@email.com",
  },
  copyright: `© ${new Date().getFullYear()} Aurea Dental. Crafted with care in Copenhagen.`,
  disclaimer: "Aurea AI is a UI demonstration and enterprise healthcare concept.",
};
