import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { useRef, useEffect } from "react";
import {
  Heart, Eye, Lightbulb, Shield, Users, Award, ArrowRight,
  CheckCircle, Star, Sparkles, Calendar, Microscope, Leaf,
  HeartHandshake, FlaskConical, Clock,
} from "lucide-react";
import clinic from "@/assets/images/clinic-interior.jpg";
import { Reveal, stagger, staggerItem } from "@/shared/ui/Reveal";
import { Button } from "@/shared/ui/Button";

function Stat({ to, suffix = "", label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const v = useMotionValue(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(v, to, { duration: 1.6 });
    const un = v.on("change", (val) => {
      if (ref.current) ref.current.textContent = Math.round(val).toLocaleString() + suffix;
    });
    return () => { c.stop(); un(); };
  }, [inView, to, v, suffix]);
  return (
    <div className="text-center">
      <p className="font-display text-4xl md:text-5xl font-semibold text-white">
        <span ref={ref}>0{suffix}</span>
      </p>
      <p className="mt-2 text-sm text-white/70">{label}</p>
    </div>
  );
}

const values = [
  { icon: HeartHandshake, title: "Empathy First", desc: "We listen before we examine. Your comfort and peace of mind drive every clinical decision we make." },
  { icon: FlaskConical, title: "AI Precision", desc: "Advanced machine-learning diagnostics catch microscopic issues early, keeping treatments minimal." },
  { icon: Leaf, title: "Scandinavian Calm", desc: "Designed like a quiet Nordic atelier — natural oak, gentle scents, ambient soundscapes, and no medical clutter." },
  { icon: Microscope, title: "Bespoke Materials", desc: "We work exclusively with high-grade biocompatible porcelain and titanium for long-lasting, natural beauty." },
  { icon: Shield, title: "100% Transparency", desc: "Clear treatment plans, fixed prices upfront, zero hidden costs, and plain-language medical guidance." },
  { icon: Clock, title: "Zero Wait Time", desc: "Respecting your schedule. Digital check-in ensures you step directly into your suite on time." },
];

const timeline = [
  { year: "2012", title: "Copenhagen Atelier Founded", desc: "Dr. Elena Marsh opened the first 2-chair practice with a vision of calm, human-centred dentistry." },
  { year: "2016", title: "Pioneered Digital Scans", desc: "Eliminated gooey physical impressions entirely, adopting 3D intraoral optical scanning." },
  { year: "2020", title: "Aurea AI Diagnostic Integration", desc: "Launched custom neural net assistant to help clinicians detect early enamel micro-fractures." },
  { year: "2024", title: "12,000 Patient Milestone", desc: "Expanded to 4 Nordic locations while maintaining our signature 4.9-star patient satisfaction rating." },
];

export function AboutView() {
  return (
    <div className="bg-background">
      {/* ── Hero section ── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/60 via-background to-background" />
        <div className="absolute -top-24 -left-24 size-[520px] bg-primary/15 blur-3xl animate-blob" />
        <div className="max-w-7xl mx-auto px-5 md:px-8 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-secondary border border-primary/15">
              <Sparkles className="size-3.5 text-primary" /> Our Philosophy & Practice
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display font-semibold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-secondary max-w-4xl mx-auto leading-[1.05]">
              Dentistry reimagined as an <span className="text-gradient-primary">art of care</span>.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Founded in Copenhagen, Aurea combines Nordic design principles, gentle clinical hands, and state-of-the-art AI diagnostics to transform oral healthcare into a peaceful experience.
            </p>
          </Reveal>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Button asChild className="group rounded-full h-12 px-6 bg-primary hover:bg-primary/95 text-primary-foreground shadow-[0_14px_40px_-12px_rgba(31,138,112,0.65)] transition-all">
              <a href="/home/services">Explore Services <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" /></a>
            </Button>
            <Button asChild variant="outline" className="rounded-full h-12 px-6 border-border bg-white/70 backdrop-blur hover:bg-white transition-colors">
              <a href="/home/contact">Book a Visit</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Clinic Story ── */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Our Story</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-secondary leading-[1.08]">
                We set out to remove fear from dental visits.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                For decades, dental care meant sterile white tiles, harsh fluorescent lights, and anxiety-inducing sounds. Aurea was created to challenge every piece of that stereotype.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                By designing minimalist, acoustic-softened suites and combining them with AI tools that explain diagnoses visually in real-time, we give patients total clarity and control over their health.
              </p>
            </Reveal>
            <div className="mt-8 space-y-3">
              {["ADA & Nordic Board Certified Clinicians", "100% Mercury-Free & Biocompatible Materials", "Same-Day Emergency Triage Guarantee"].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-medium text-secondary">
                  <CheckCircle className="size-4 text-primary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-[36px] overflow-hidden soft-shadow border border-border">
              <img src={clinic} alt="Aurea Clinic Interior" className="w-full h-[480px] object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 glass soft-shadow rounded-2xl p-5 max-w-xs border border-white/60">
              <p className="text-xs text-muted-foreground">Patient Satisfaction</p>
              <p className="font-display text-3xl font-semibold text-secondary mt-1">98.4%</p>
              <p className="text-xs text-primary font-medium mt-1">Based on 2,300+ verified reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values Grid ── */}
      <section className="py-24 bg-muted/40">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Core Values</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-secondary">
                The principles that guide every smile we treat.
              </h2>
            </Reveal>
          </div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v) => (
              <motion.div variants={staggerItem} key={v.title} className="rounded-3xl bg-white border border-border p-8 soft-shadow hover:border-primary/40 transition-colors">
                <span className="grid place-items-center size-12 rounded-2xl bg-accent text-primary mb-6">
                  <v.icon className="size-6" />
                </span>
                <h3 className="font-display font-semibold text-xl text-secondary">{v.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Our Journey</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-secondary">
                Over a decade of clinical innovation.
              </h2>
            </Reveal>
          </div>
          <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 md:before:left-1/2 before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
            {timeline.map((t, idx) => (
              <Reveal key={t.year} delay={idx * 0.08}>
                <div className={`relative flex flex-col md:flex-row items-start ${idx % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                  <div className="md:w-1/2 p-6 rounded-3xl bg-white border border-border soft-shadow ml-10 md:ml-0 md:mx-6">
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary font-display">{t.year}</span>
                    <h3 className="font-display font-semibold text-xl text-secondary mt-1">{t.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t.desc}</p>
                  </div>
                  <span className="absolute left-4 md:left-1/2 -translate-x-1/2 top-6 size-4 rounded-full bg-primary ring-4 ring-white" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="rounded-[32px] bg-secondary text-white p-8 md:p-14 relative overflow-hidden soft-shadow">
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
              <Stat to={14} suffix="+" label="Years of clinical excellence" />
              <Stat to={12000} label="Happy smiles crafted" />
              <Stat to={98} suffix="%" label="Verified satisfaction" />
              <Stat to={42} label="Specialists on staff" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
