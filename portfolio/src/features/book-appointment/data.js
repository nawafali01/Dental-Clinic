import doctor1 from "@/assets/images/doctor-1.jpg";
import doctor2 from "@/assets/images/doctor-2.jpg";
import doctor3 from "@/assets/images/doctor-3.jpg";

export const treatmentsList = [
  { id: "cosmetic", title: "Cosmetic Restoration", duration: "60 mins", price: "$120 consult" },
  { id: "implants", title: "Implant Consult & Scan", duration: "45 mins", price: "$150 consult" },
  { id: "pediatric", title: "Pediatric Cleaning", duration: "30 mins", price: "$90 cleaning" },
  { id: "whitening", title: "Laser Teeth Whitening", duration: "60 mins", price: "$320 treatment" },
];

export const doctorsList = [
  { id: "1", name: "Dr. Catherine Reyes", role: "Cosmetic Specialist", img: doctor1 },
  { id: "2", name: "Dr. Marcus Vance", role: "Implant Surgeon", img: doctor2 },
  { id: "3", name: "Dr. Sarah Kim", role: "Pediatric Expert", img: doctor3 },
];

export const datesList = [
  { day: "Thu", date: "Jul 16", label: "Today" },
  { day: "Fri", date: "Jul 17", label: "Tomorrow" },
  { day: "Sat", date: "Jul 18", label: "Saturday" },
  { day: "Mon", date: "Jul 20", label: "Monday" },
  { day: "Tue", date: "Jul 21", label: "Tuesday" },
];

export const timesList = [
  "09:00 AM", "10:30 AM", "11:00 AM", "01:30 PM", "02:30 PM", "04:00 PM"
];

export const bookingSteps = [
  "Treatment",
  "Doctor",
  "Date & Time",
  "Review & Book",
  "Confirmed"
];
