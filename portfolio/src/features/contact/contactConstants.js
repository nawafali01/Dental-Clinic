import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const contactInfo = [
  { Icon: MapPin, t: "Studio", b: "108 Nordic Ave, Copenhagen" },
  { Icon: Phone, t: "Phone", b: "+1 (555) 123-4567" },
  { Icon: Mail, t: "Email", b: "syedhussain@gmail.com" },
  { Icon: Clock, t: "Hours", b: "Mon–Sat · 8am – 8pm" },
];

export const CONTACT_META = {
  sectionLabel: "Contact",
  heading: "Book a visit, or just say hi.",
  subtext: "Prefer talking? Call us. Prefer texting? Aurea AI is on. We reply to every message.",
  formTitle: "Book your appointment",
  formSubtext: "We usually respond within an hour.",
  privacyNote: "By submitting you agree to our privacy terms. We never share your info.",
  mapLabel: "Aurea Dental · Nordic Ave",
};

export const CLINIC_SCHEDULE = [
  { days: "Monday — Thursday", hours: "08:00 AM - 07:00 PM" },
  { days: "Friday", hours: "08:00 AM - 05:00 PM" },
  { days: "Saturday", hours: "09:00 AM - 04:00 PM" },
  { days: "Sunday", hours: "Closed (On-call triage)", isClosed: true },
];

export const CONTACT_TOPICS = [
  { value: "general", label: "General Consultation" },
  { value: "appointment", label: "Appointment Inquiry" },
  { value: "billing", label: "Insurance & Billing" },
  { value: "emergency", label: "Emergency Dental Care" },
];
