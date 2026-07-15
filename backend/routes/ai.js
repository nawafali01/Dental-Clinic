import express from "express";

const router = express.Router();

// Simple rules-based triage agent response
function reply(messageText) {
  const s = messageText.toLowerCase();
  
  if (s.includes("book") || s.includes("appointment") || s.includes("visit")) {
    return "Sure — I can offer Today 3:40 PM with Dr. Marsh or Thu 10 AM with Dr. Reyes. Which works?";
  }
  if (s.includes("cost") || s.includes("price") || s.includes("whitening") || s.includes("pay")) {
    return "In-office whitening starts at $320. Financing available. Want a personalized quote?";
  }
  if (s.includes("emergency") || s.includes("pain") || s.includes("hurt") || s.includes("accident")) {
    return "I'm sorry you're in pain. Call +1 (555) 123-4567 — a dentist is on call 24/7.";
  }
  if (s.includes("tip") || s.includes("wisdom") || s.includes("hygiene")) {
    return "Floss BEFORE brushing so fluoride reaches between teeth. Small change, big impact.";
  }
  
  return "Happy to help — could you tell me a bit more about what you're looking for?";
}

router.post("/chat", (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text field is required" });
    }
    
    // Simulate thinking delay
    const responseText = reply(text);
    
    res.json({
      role: "ai",
      text: responseText
    });
  } catch (error) {
    res.status(500).json({ message: "Error in AI processing", error: error.message });
  }
});

export default router;
