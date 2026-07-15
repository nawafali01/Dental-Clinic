import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Mic, Bot, Sparkles } from "lucide-react";
import { axiosInstance } from "@/services/api/axiosInstance";

const suggestions = [
  "Book Changing",
  "Whitening cost",
  "Emergency care",
  "Dental tip",
];

function reply(t) {
  const s = t.toLowerCase();
  if (s.includes("book") || s.includes("appointment")) {
    return "Sure — I can offer Today 3:40 PM with Dr. Marsh or Thu 10 AM with Dr. Reyes. Which works?";
  }
  if (s.includes("cost") || s.includes("price") || s.includes("whit")) {
    return "In-office whitening starts at $320. Financing available. Want a personalized quote?";
  }
  if (s.includes("emergency") || s.includes("pain")) {
    return "I'm sorry you're in pain. Call +1 (555) 123-4567 — a dentist is on call 24/7.";
  }
  if (s.includes("tip")) {
    return "Floss BEFORE brushing so fluoride reaches between teeth. Small change, big impact.";
  }
  return "Happy to help — could you tell me a bit more about what you're looking for?";
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: "ai", text: "Hi 👋 I'm Aurea AI. How can I help your smile today?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [msgs, typing]);

  const send = async (t) => {
    const text = t.trim();
    if (!text) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);

    try {
      const response = await axiosInstance.post("/ai/chat", { text });
      setMsgs((m) => [...m, { role: "ai", text: response.data.text }]);
    } catch (error) {
      console.warn("Could not query backend AI, using client fallback", error);
      // Wait for a simulated typing pause for better UX fallback UX
      await new Promise((resolve) => setTimeout(resolve, 800));
      setMsgs((m) => [...m, { role: "ai", text: reply(text) }]);
    } finally {
      setTyping(false);
    }
  };


  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: open ? 0 : 1, opacity: open ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 1.2 }}
        className="fixed bottom-6 right-6 z-40 grid place-items-center size-14 rounded-full bg-primary text-primary-foreground shadow-[0_16px_40px_-8px_rgba(31,138,112,0.7)] animate-pulse-ring cursor-pointer"
        aria-label="Open Aurea AI chat"
      >
        <MessageCircle className="size-6" />
        <span className="absolute -top-1 -right-1 size-3 rounded-full bg-green-500 ring-2 ring-white" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="fixed bottom-6 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[560px] max-h-[80vh] rounded-3xl bg-white border border-border soft-shadow flex flex-col overflow-hidden"
          >
            <div className="relative p-4 flex items-center justify-between bg-gradient-to-br from-secondary to-secondary/90 text-white">
              <div className="flex items-center gap-3">
                <span className="relative grid place-items-center size-10 rounded-xl bg-white/10 select-none animate-none">
                  <Bot className="size-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-green-500 ring-2 ring-secondary" />
                </span>
                <div>
                  <p className="font-semibold text-sm">Aurea AI</p>
                  <p className="text-[11px] text-white/70 font-mono">
                    Powered by Aurea Dental
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid place-items-center size-9 rounded-full hover:bg-white/10 cursor-pointer"
                aria-label="Close chat"
              >
                <X className="size-4" />
              </button>
            </div>

            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30 scrollbar-thin"
            >
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    m.role === "ai" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] text-sm px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                      m.role === "ai"
                        ? "bg-white border border-border text-foreground rounded-tl-sm text-secondary"
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                    {[0, 1, 2].map((idx) => (
                      <motion.span
                        key={idx}
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 0.9,
                          repeat: Infinity,
                          delay: idx * 0.15,
                        }}
                        className="size-1.5 rounded-full bg-primary"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-3 border-t border-border bg-white">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-border hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    <Sparkles className="inline size-3 mr-1 text-primary animate-pulse" />
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2 rounded-2xl bg-muted border border-border px-3 py-1.5"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 bg-transparent text-sm outline-none py-2 text-secondary"
                />
                <button
                  type="button"
                  aria-label="Voice"
                  className="grid place-items-center size-8 rounded-lg text-muted-foreground hover:text-primary cursor-pointer hover:bg-neutral-100 transition-colors"
                >
                  <Mic className="size-4" />
                </button>
                <button
                  type="submit"
                  aria-label="Send"
                  className="grid place-items-center size-8 rounded-lg bg-primary text-primary-foreground cursor-pointer hover:bg-primary/95 transition-colors"
                >
                  <Send className="size-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
