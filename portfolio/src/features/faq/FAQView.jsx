import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/shared/ui/Reveal";
import { Button } from "@/shared/ui/Button";
import { Search, ChevronDown, HelpCircle, PhoneCall, Mail } from "lucide-react";
import { allFaqs, faqCategories } from "./data";

function FAQAccordionItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border border-border rounded-[22px] overflow-hidden bg-white soft-shadow mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer hover:bg-neutral-50/50 transition-colors"
      >
        <span className="font-display font-semibold text-secondary text-sm md:text-base pr-4">{q}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="size-5 text-muted-foreground shrink-0" />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-xs md:text-sm text-muted-foreground leading-relaxed border-t border-neutral-50/20 pt-4">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQView() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [openIdx, setOpenIdx] = useState(null);

  const filtered = allFaqs.filter(faq => {
    const matchCat = activeCat === "All" || faq.category === activeCat;
    const matchSearch = !search ||
      faq.q.toLowerCase().includes(search.toLowerCase()) ||
      faq.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="bg-background">
      {/* ── Hero section ── */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/60 via-background to-background" />
        <div className="max-w-7xl mx-auto px-5 md:px-8 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-secondary border border-primary/10">
              Got Questions?
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display font-semibold text-4xl sm:text-6xl tracking-tight text-secondary">
              Frequently asked<br />
              <span className="text-gradient-primary">questions and concerns.</span>
            </h1>
          </Reveal>
        </div>
      </section>

      {/* ── Search & Filters ── */}
      <section className="pb-10">
        <div className="max-w-3xl mx-auto px-5 md:px-8">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-5 py-3.5 soft-shadow mb-8">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search help topics — e.g. 'insurance' or 'emergency'"
              className="flex-1 bg-transparent text-sm outline-none text-secondary"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {faqCategories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCat(cat); setOpenIdx(null); }}
                className={`px-4 py-2 text-xs font-semibold rounded-full border cursor-pointer transition-all ${
                  activeCat === cat
                    ? "bg-secondary text-secondary-foreground border-secondary"
                    : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Accordions List ── */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-5 md:px-8">
          {filtered.length > 0 ? (
            <div>
              {filtered.map((faq, idx) => (
                <Reveal key={idx} delay={idx * 0.04}>
                  <FAQAccordionItem
                    q={faq.q}
                    a={faq.a}
                    isOpen={openIdx === idx}
                    onToggle={() => setOpenIdx(openIdx === idx ? null : idx)}
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-border rounded-3xl soft-shadow">
              <HelpCircle className="size-12 text-primary/30 mx-auto mb-4" />
              <p className="font-display text-lg font-semibold text-secondary">No answers matching search</p>
              <button onClick={() => { setSearch(""); setActiveCat("All"); }} className="mt-4 text-sm font-medium text-primary hover:underline cursor-pointer">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Help CTA ── */}
      <section className="py-24 bg-muted/40">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <div className="rounded-[32px] bg-gradient-to-r from-primary to-secondary p-10 md:p-14 text-white relative overflow-hidden soft-shadow">
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Still confused?</span>
                <h3 className="mt-3 font-display text-3xl font-bold">
                  Ask our specialists teams directly.
                </h3>
                <p className="mt-4 text-white/80 text-sm leading-relaxed">
                  Call our care line anytime or write to us. A patient advisor will reply within an hour.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button asChild className="rounded-full h-12 px-6 bg-white text-secondary hover:bg-neutral-50 shadow-md flex items-center gap-2 cursor-pointer font-bold">
                  <a href="tel:+15551234567"><PhoneCall className="size-4" /> +1 (555) 123-4567</a>
                </Button>
                <Button asChild variant="outline" className="rounded-full h-12 px-6 border-white/30 text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer">
                  <a href="/contact"><Mail className="size-4" /> Send Message</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
