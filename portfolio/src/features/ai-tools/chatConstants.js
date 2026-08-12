export const CHAT_SUGGESTIONS = [
  "Book an appointment",
  "Services & Pricing",
  "Emergency Dental Care",
  "Clinic Hours & Location",
];

export function getFallbackReply(input = "") {
  const text = input.toLowerCase();

  if (text.includes("book") || text.includes("appointment") || text.includes("schedule")) {
    return "You can easily schedule an appointment using our online booking tool or by calling our desk at (555) 123-4567.";
  }

  if (text.includes("price") || text.includes("cost") || text.includes("fee") || text.includes("insurance")) {
    return "We accept most major insurance plans and offer flexible payment plans. Check our Services section for detailed cost estimates!";
  }

  if (text.includes("emergency") || text.includes("pain") || text.includes("urgent")) {
    return "If you are experiencing severe dental pain or an emergency, please call our 24/7 urgent care line at (555) 999-0000 right away.";
  }

  if (text.includes("hour") || text.includes("open") || text.includes("location") || text.includes("address")) {
    return "We are open Monday - Friday, 8:00 AM to 6:00 PM, and Saturday 9:00 AM to 2:00 PM. We're located at 123 Healthcare Blvd, Suite 400.";
  }

  return "Thank you for reaching out to Aurea AI! How else can I assist you with your dental health today?";
}
