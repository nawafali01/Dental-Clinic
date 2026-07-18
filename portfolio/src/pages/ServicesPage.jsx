import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ChevronDown, Search, Sparkles, Crown, Smile,
  Wrench, Stethoscope, Baby, ShieldPlus, Zap, Star, ArrowUpRight,
} from "lucide-react";
import * as Lucide from "lucide-react";
import { Reveal, stagger, staggerItem } from "@/shared/ui/Reveal";
import { Button } from "@/shared/ui/Button";
import { axiosInstance } from "@/services/api/axiosInstance";
import gallery1 from "@/assets/images/gallery-1.jpg";
import gallery2 from "@/assets/images/gallery-2.jpg";
import gallery3 from "@/assets/images/gallery-3.jpg";

const iconMap = {
  Sparkles: Lucide.Sparkles, Crown: Lucide.Crown, Smile: Lucide.Smile,
  Wrench: Lucide.Wrench, Stethoscope: Lucide.Stethoscope, Baby: Lucide.Baby,
  ShieldPlus: Lucide.ShieldPlus, Zap: Lucide.Zap,
};

const categories = ["All", "Cosmetic", "Restorative", "Orthodontics", "Preventive", "Emergency", "Pediatric"];

// Static FAQ data
const faqs = [
  { q: "How often should I visit the dentist?", a: "We recommend a check-up and professional clean every 6 months for most patients. However, if you have gum disease or other conditions, your clinician may suggest more frequent visits." },
  { q: "Is teeth whitening safe?", a: "Yes — all whitening treatments at Aurea use clinically tested concentrations and are performed under professional supervision to protect your enamel and gum tissue." },
  { q: "What should I do in a dental emergency?", a: "Call our clinic immediately at +1 (555) 123-4567. A dentist is on call 24/7. If you have a knocked-out tooth, keep it moist in milk or saliva and come in within 30 minutes for the best chance of re-implantation." },
  { q: "Do you offer sedation for anxious patients?", a: "Absolutely. We offer nitrous oxide (happy gas), oral sedation, and IV sedation depending on the procedure and your anxiety level. Discuss your concerns openly with your clinician before the appointment." },
  { q: "What payment options are available?", a: "We accept all major insurance plans, credit cards, and offer 0% interest payment plans for treatments over $500 through our partner financing provider." },
  { q: "Are your treatments suitable for children?", a: "Yes. Our paediatric team is trained in child-friendly techniques and creates a positive, gentle first dental experience — building healthy habits for life." },
];

function FAQItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer hover:bg-accent/30 transition-colors"
      >
        <span className="font-display font-semibold text-secondary pr-4">{q}</span>
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
            <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const fallbackServices = [
  { title: "General Dentistry", body: "Comprehensive exams, hygiene cleanings, for stable and long-term oral health.", icon: "Stethoscope", category: "Preventive" },
  { title: "Cosmetic Dentistry", body: "Premium porcelain veneers, bonding, and aesthetic treatments to transform your smile.", icon: "Sparkles", category: "Cosmetic" },
  { title: "Teeth Whitening", body: "Professional laser whitening lifting stains up to 8 shades in a single hour.", icon: "Zap", category: "Cosmetic" },
  { title: "Clear Aligners", body: "AI-planned invisible aligners to straighten your teeth comfortably without metal.", icon: "Crown", category: "Orthodontics" },
  { title: "Dental Implants", body: "Permanent, biocompatible titanium root implants topped with natural crowns.", icon: "Smile", category: "Restorative" },
  { title: "Pediatric Dentistry", body: "Gentle child-friendly dental care to build strong habits and positive associations.", icon: "Baby", category: "Pediatric" },
  { title: "Emergency Care", body: "Same-day emergency support for acute pain, broken crowns, or trauma.", icon: "ShieldPlus", category: "Emergency" },
  { title: "Root Canal Therapy", body: "Microscope-certified root canal therapy to save compromised teeth with zero pain.", icon: "Wrench", category: "Restorative" }
];

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    axiosInstance.get("/services")
      .then(r => setServices(r.data))
      .catch(() => setServices([]));
  }, []);

  const displayServices = services.length > 0 ? services : fallbackServices;

  const filtered = displayServices.filter(s => {
    const matchCat = activeCat === "All" || (s.category && s.category === activeCat);
    const matchSearch = !search || s.title?.toLowerCase().includes(search.toLowerCase()) || s.body?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div id="top" className="bg-background">

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/60 via-background to-background" />
          <div className="absolute -top-24 -left-24 size-[480px] bg-primary/20 blur-3xl animate-blob" />
          <div className="absolute top-40 -right-32 size-[520px] bg-secondary/15 blur-3xl animate-blob [animation-delay:-4s]" />
          <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:22px_22px]" />
        </div>
        <div className="max-w-7xl mx-auto px-5 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-secondary border border-primary/15"
          >
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            Full-spectrum dental care
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6 font-display font-semibold text-[2.6rem] sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-secondary"
          >
            Every treatment,<br />
            <span className="text-gradient-primary">crafted for you.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.22 }}
            className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed"
          >
            From a routine scale-and-polish to full-smile reconstruction, every Aurea treatment is planned with AI-assisted diagnostics and delivered by clinicians who know your name.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.36 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Button asChild className="group rounded-full h-12 px-6 bg-primary hover:bg-primary/95 text-primary-foreground shadow-[0_14px_40px_-12px_rgba(31,138,112,0.65)] transition-all">
              <a href="#contact">Book Appointment <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" /></a>
            </Button>
            <Button asChild variant="outline" className="rounded-full h-12 px-6 border-border bg-white/70 backdrop-blur hover:bg-white transition-colors">
              <a href="#faq">Common Questions</a>
            </Button>
          </motion.div>
          {/* Trust pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            {["Same-day Emergency", "0% Finance Available", "No Hidden Fees", "AI-Assisted Diagnostics"].map(tag => (
              <span key={tag} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full glass border border-primary/15 text-secondary">
                <Star className="size-3 text-primary" /> {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Search + Filter ── */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          {/* Search bar */}
          <Reveal>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-5 py-3.5 soft-shadow max-w-lg mx-auto mb-8">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder='Search services — e.g. "whitening" or "implants"'
                className="flex-1 bg-transparent text-sm outline-none text-secondary placeholder:text-muted-foreground"
              />
            </div>
          </Reveal>
          {/* Category tabs */}
          <Reveal delay={0.05}>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`px-4 py-2 text-sm rounded-full border cursor-pointer transition-all ${
                    activeCat === cat
                      ? "bg-secondary text-secondary-foreground border-secondary"
                      : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          {filtered.length > 0 ? (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.05 }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {filtered.map((s, idx) => {
                const IconComponent = typeof s.icon === "string" ? (iconMap[s.icon] || Lucide.Sparkles) : (s.icon || Lucide.Sparkles);
                return (
                  <motion.a
                    variants={staggerItem}
                    key={s.title || idx}
                    href="#contact"
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="group relative rounded-3xl bg-white border border-border p-6 overflow-hidden hover:border-primary/40 hover:shadow-[0_20px_60px_-20px_rgba(31,138,112,0.35)] transition-shadow"
                  >
                    <div className="absolute -top-16 -right-16 size-40 rounded-full bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500 blur-2xl" />
                    <div className="relative grid place-items-center size-12 rounded-2xl bg-accent text-primary group-hover:rotate-6 transition-transform">
                      <IconComponent className="size-6" />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold text-secondary">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                    <div className="mt-5 flex items-center text-sm font-medium text-primary">
                      Learn more <ArrowUpRight className="ml-1 size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </motion.a>
                );
              })}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <Sparkles className="size-12 text-primary/30 mx-auto mb-4" />
              <p className="font-display text-lg font-semibold text-secondary">No services found</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search term or category.</p>
              <button onClick={() => { setSearch(""); setActiveCat("All"); }} className="mt-4 text-sm font-medium text-primary hover:underline cursor-pointer">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Featured Treatments ── */}
      <section className="py-24 md:py-32 bg-muted/50">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <Reveal><span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Most popular</span></Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05]">
                Featured treatments.
              </h2>
            </Reveal>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Crown, label: "Most Popular", title: "Teeth Whitening", price: "from $320", body: "In-office laser whitening that lifts stains up to 8 shades in a single 60-minute session.", img: gallery1 },
              { icon: Smile, label: "Premium", title: "Dental Implants", price: "from $2,400", body: "Permanent, natural-looking tooth replacement using titanium root fixtures and ceramic crowns.", img: gallery2 },
              { icon: Zap, label: "New at Aurea", title: "Invisible Aligners", price: "from $1,800", body: "AI-planned clear aligner treatment with 3D progress tracking. Straighter teeth on your terms.", img: gallery3 },
            ].map(({ icon: Icon, label, title, price, body, img }, i) => (
              <Reveal key={title} delay={i * 0.07}>
                <div className="group relative rounded-[32px] overflow-hidden soft-shadow border border-border h-[420px] flex flex-col justify-end p-6 hover:-translate-y-2 transition-all duration-300">
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/75 to-transparent" />
                  </div>
                  {/* Floating Top Badge */}
                  <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                    <span className="glass border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md">
                      <Icon className="size-3.5 text-primary" /> {label}
                    </span>
                  </div>
                  {/* Content (Overlaid at bottom) */}
                  <div className="relative z-10 text-white">
                    <h3 className="font-display text-2xl font-semibold leading-tight">{title}</h3>
                    <p className="text-sm font-semibold text-primary mt-1">{price}</p>
                    <p className="mt-2 text-xs text-white/80 leading-relaxed font-sans opacity-95 group-hover:opacity-100 transition-opacity">{body}</p>
                    <a
                      href="#contact"
                      className="mt-5 inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-white/20 bg-white/10 hover:bg-white hover:text-secondary transition-all w-fit"
                    >
                      Book Treatment <ArrowRight className="size-3" />
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-5 md:px-8">
          <div className="text-center mb-12">
            <Reveal><span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">FAQs</span></Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05]">
                Common questions.
              </h2>
            </Reveal>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <Reveal key={idx} delay={idx * 0.04}>
                <FAQItem
                  q={faq.q}
                  a={faq.a}
                  isOpen={openFaq === idx}
                  onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 md:py-32 bg-muted/50">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <Reveal>
            <div className="rounded-[32px] bg-gradient-to-br from-primary to-secondary p-10 md:p-16 text-center text-white relative overflow-hidden">
              <div className="absolute -top-20 -left-20 size-72 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 size-72 rounded-full bg-white/10 blur-3xl" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Zero pressure</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold leading-tight">
                  Not sure where to start?
                </h2>
                <p className="mt-4 text-white/80 max-w-xl mx-auto leading-relaxed">
                  Book a free consultation and let our clinicians guide you through the best treatment plan for your needs and budget.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Button asChild className="rounded-full h-12 px-7 bg-white text-secondary hover:bg-white/90 font-semibold shadow-lg transition-all">
                    <a href="#contact">Book Free Consultation <ArrowRight className="ml-1.5 size-4" /></a>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full h-12 px-6 border-white/40 text-white hover:bg-white/10 transition-colors">
                    <a href="/about">About Our Clinic</a>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
