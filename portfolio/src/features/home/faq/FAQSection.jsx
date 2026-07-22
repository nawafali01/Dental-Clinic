import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, HelpCircle, PhoneCall, Mail } from "lucide-react";
import { Reveal } from "@/shared/ui/Reveal";
import { Button } from "@/shared/ui/Button";
import { homepageFaqs } from "@/data/faqs";

const categories = ["All", "General", "Treatments", "Billing & Financing", "Technology"];

export function FAQSection() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [openIdx, setOpenIdx] = useState(0);

  const filtered = homepageFaqs.filter((faq) => {
    const matchCat = activeCat === "All" || faq.category === activeCat;
    const matchSearch =
      !search ||
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section id="faq" className="relative py-20 md:py-28 bg-muted/40">
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Got Questions?
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-secondary leading-[1.08]">
              Frequently asked questions.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-3 text-muted-foreground text-sm md:text-base">
              Everything you need to know about our Scandinavian clinical care, treatments, and transparent billing.
            </p>
          </Reveal>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-5 py-3.5 soft-shadow">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help topics — e.g. 'aligners', 'financing', 'emergency'"
              className="flex-1 bg-transparent text-sm outline-none text-secondary placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCat(cat);
                  setOpenIdx(null);
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-full border cursor-pointer transition-all ${
                  activeCat === cat
                    ? "bg-secondary text-white border-secondary"
                    : "bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04 }}
                  className="border border-border rounded-3xl overflow-hidden bg-white soft-shadow"
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer hover:bg-neutral-50/50 transition-colors"
                  >
                    <span className="font-display font-semibold text-secondary text-base pr-4">
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="grid place-items-center size-8 rounded-full bg-accent text-primary shrink-0"
                    >
                      <ChevronDown className="size-4" />
                    </motion.span>
                  </button>

                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white border border-border rounded-3xl soft-shadow">
              <HelpCircle className="size-10 text-primary/40 mx-auto mb-3" />
              <p className="font-display text-base font-semibold text-secondary">
                No matching answers found
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCat("All");
                }}
                className="mt-3 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Clear search filters
              </button>
            </div>
          )}
        </div>

        <div className="mt-10 rounded-3xl bg-gradient-to-r from-primary to-secondary p-6 md:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 soft-shadow">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/80 font-semibold">Still have questions?</p>
            <p className="font-display text-xl font-semibold mt-1">Our patient advisors reply within 1 hour.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              asChild
              className="rounded-full h-10 px-5 bg-white text-secondary hover:bg-neutral-100 font-semibold cursor-pointer text-xs"
            >
              <a href="tel:+15551234567">
                <PhoneCall className="mr-1.5 size-3.5" /> +1 (555) 123-4567
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full h-10 px-5 border-white/30 text-white hover:bg-white/10 cursor-pointer text-xs"
            >
              <a href="#contact">
                <Mail className="mr-1.5 size-3.5" /> Send Message
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
