import { motion } from "framer-motion";
import { Sparkles, Mic, Send, Bot, ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { Button } from "@/components/ui/button";

const suggestions = ["Book Appointment", "Treatment Cost", "Dental Tips", "Emergency Help", "Find Services"];

export function AIPreview() {
  return (
    <section id="ai" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_500px_at_50%_0%,rgba(31,138,112,0.10),transparent_60%)]" />
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-semibold">
              <Sparkles className="size-3.5" /> Meet Aurea AI
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 font-display text-4xl md:text-5xl font-semibold tracking-tight text-secondary leading-[1.05]">
              Your dental assistant, <span className="text-gradient-primary">always on call.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-muted-foreground text-lg leading-relaxed max-w-lg">
              Ask a symptom, estimate a treatment, or book a visit — Aurea AI answers instantly and hands you
              off to a clinician when it matters.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button className="rounded-full h-12 px-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                Try AI Assistant <ArrowRight className="ml-1.5 size-4" />
              </Button>
              <Button variant="outline" className="rounded-full h-12 px-6">
                Watch 60s demo
              </Button>
            </div>
          </Reveal>
        </div>

        {/* Chat mock */}
        <div className="lg:col-span-7">
          <Reveal delay={0.1}>
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 blur-3xl -z-10" />
              <div className="rounded-3xl bg-white soft-shadow border border-border/70 p-4 md:p-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="relative grid place-items-center size-10 rounded-xl bg-primary/10 text-primary">
                      <Bot className="size-5" />
                      <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-success ring-2 ring-white" />
                    </span>
                    <div>
                      <p className="font-semibold text-secondary">Aurea AI</p>
                      <p className="text-xs text-muted-foreground">Online · replies instantly</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground font-medium">Beta</span>
                </div>

                <div className="py-5 space-y-4 min-h-[280px]">
                  <Bubble side="ai" delay={0.1}>
                    Hi Emma 👋 — how can I help your smile today?
                  </Bubble>
                  <Bubble side="user" delay={0.35}>
                    My back tooth is sensitive to cold drinks.
                  </Bubble>
                  <Bubble side="ai" delay={0.65}>
                    That often points to enamel wear or a small cavity. I can book you a
                    15-min check with <b>Dr. Elena Marsh</b> today at 3:40 PM.
                  </Bubble>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9 }}
                    className="flex flex-wrap gap-2 pt-1"
                  >
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        className="text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-muted hover:border-primary hover:text-primary transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </motion.div>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/60 pl-4 pr-2 py-2">
                  <input
                    placeholder="Ask Aurea anything…"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    className="grid place-items-center size-9 rounded-xl hover:bg-white text-muted-foreground"
                    aria-label="Voice input"
                  >
                    <Mic className="size-4" />
                  </button>
                  <button
                    className="grid place-items-center size-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                    aria-label="Send"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Bubble({ side, children, delay = 0 }: { side: "ai" | "user"; children: React.ReactNode; delay?: number }) {
  const isAI = side === "ai";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className={`flex ${isAI ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[78%] text-sm leading-relaxed px-4 py-3 rounded-2xl ${
          isAI
            ? "bg-muted text-foreground rounded-tl-sm"
            : "bg-primary text-primary-foreground rounded-tr-sm"
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}