export const treatmentQuestions = {
  step1: {
    id: "reason",
    title: "What brings you here?",
    options: [
      { id: "missing", label: "Missing Teeth", description: "Implants, bridges, or permanent restorations", icon: "Smile" },
      { id: "crooked", label: "Crooked Teeth", description: "Clear aligners or subtle orthodontics", icon: "Sparkles" },
      { id: "pain", label: "Tooth Pain", description: "Urgent care, root canals, or gentle relief", icon: "Zap" },
      { id: "cosmetic", label: "Cosmetic Smile", description: "Veneers, whitening, or smile design", icon: "Crown" },
      { id: "routine", label: "Routine Checkup", description: "Comprehensive exam & hygiene clean", icon: "ShieldPlus" },
    ],
  },
  step2: {
    id: "ageGroup",
    title: "Age Group",
    options: [
      { id: "under18", label: "Under 18", description: "Paediatric care & youth orthodontics" },
      { id: "18-35", label: "18–35", description: "Preventative, whitening & aligners" },
      { id: "36-55", label: "36–55", description: "Restorative, cosmetic & preventative" },
      { id: "55+", label: "55+", description: "Full mouth restoration & implants" },
    ],
  },
  step3: {
    id: "budget",
    title: "Preferred Budget",
    options: [
      { id: "essential", label: "Essential", description: "Core quality care & essential diagnostics" },
      { id: "moderate", label: "Moderate", description: "Balanced care with premium materials" },
      { id: "premium", label: "Premium", description: "Advanced aesthetics & fast-track care" },
      { id: "luxury", label: "Luxury", description: "Bespoke atelier experience & master clinicians" },
    ],
  },
  step4: {
    id: "location",
    title: "Preferred Clinic Location",
    options: [
      { id: "copenhagen-downtown", label: "Downtown Atelier", description: "Nordic Ave 108 · Flagship" },
      { id: "copenhagen-north", label: "Copenhagen North", description: "Strandvejen 42 · Coastal Suite" },
      { id: "waterfront", label: "Waterfront Clinic", description: "Havneholmen 12 · Panoramic View" },
      { id: "metro-center", label: "Metro Center Studio", description: "Kongens Nytorv 5 · Central" },
    ],
  },
  step5: {
    id: "financing",
    title: "Need Financing?",
    options: [
      { id: "yes-monthly", label: "Yes — Flexible Monthly Plans", description: "0% APR options up to 24 months" },
      { id: "no-direct", label: "No — Direct Payment", description: "Pay per visit or full upfront" },
      { id: "exploring", label: "Exploring Options", description: "We will check your insurance coverage" },
    ],
  },
};

export const mockRecommendations = {
  missing: {
    title: "3D Guided Dental Implants",
    timeline: "2–3 visits over 4 weeks",
    doctor: "Dr. Soren Lindqvist (Implant Specialist)",
    summary: "Permanent, natural-feeling tooth replacements designed with AI-guided 3D surgical planning.",
    priceEst: "$1,800 – $3,200",
  },
  crooked: {
    title: "Nordic Clear Aligners",
    timeline: "4–8 months duration",
    doctor: "Dr. Freja Møller (Orthodontist)",
    summary: "Virtually invisible, removable aligner therapy custom 3D-scanned for rapid gentle alignment.",
    priceEst: "$2,400 – $4,500",
  },
  pain: {
    title: "Gentle Triage & Root Care",
    timeline: "Same-day relief appointment",
    doctor: "Dr. Elena Marsh (Endodontist)",
    summary: "Painless emergency examination and micro-endodontic treatment using calming sedation.",
    priceEst: "$350 – $950",
  },
  cosmetic: {
    title: "Porcelain Atelier Veneers",
    timeline: "2 precision appointments",
    doctor: "Dr. Marcus Thorne (Cosmetic Architect)",
    summary: "Hand-crafted ultra-thin porcelain veneers matching your natural tooth luminosity.",
    priceEst: "$850 – $1,600 / tooth",
  },
  routine: {
    title: "Comprehensive Wellness Scan & Hygiene",
    timeline: "60-minute appointment",
    doctor: "Dr. Astrid Vance (Preventative Care)",
    summary: "AI caries risk detection, air-abrasion ultrasonic stain removal, and full oral exam.",
    priceEst: "$150 – $280",
  },
};
