import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "@/shared/ui/Reveal";
import { reviews } from "./data";

export function Testimonials() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % reviews.length), 5500);
    return () => clearInterval(t);
  }, []);

  const r = reviews[i];

  return (
    <section id="testimonials" className="relative py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Testimonials
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05]">
            Loved by 12,000+ patients.
          </h2>
        </Reveal>

        <div className="relative mt-14 min-h-[280px]">
          <Quote className="absolute -top-6 left-1/2 -translate-x-1/2 size-12 text-primary/15" />
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[32px] bg-white border border-border soft-shadow p-8 md:p-12"
            >
              <div className="flex justify-center gap-0.5 text-amber-500 mb-5">
                {Array.from({ length: r.rating }).map((_, k) => (
                  <Star key={k} className="size-4 fill-current" />
                ))}
              </div>
              <p className="font-display text-xl md:text-2xl text-secondary leading-relaxed max-w-3xl mx-auto">
                "{r.body}"
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <span className="size-11 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40" />
                <div className="text-left">
                  <p className="font-semibold text-secondary">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              aria-label="Previous"
              onClick={() => setI((v) => (v - 1 + reviews.length) % reviews.length)}
              className="grid place-items-center size-10 rounded-full bg-white border border-border hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="flex gap-1.5">
              {reviews.map((_, k) => (
                <button
                  key={k}
                  aria-label={`Go to review ${k + 1}`}
                  onClick={() => setI(k)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    k === i ? "w-8 bg-primary" : "w-2 bg-border"
                  }`}
                />
              ))}
            </div>
            <button
              aria-label="Next"
              onClick={() => setI((v) => (v + 1) % reviews.length)}
              className="grid place-items-center size-10 rounded-full bg-white border border-border hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
