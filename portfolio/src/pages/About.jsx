import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { useRef, useEffect } from "react";
import {
  Heart, Eye, Lightbulb, Shield, Users, Award, ArrowRight,
  CheckCircle, Star, Sparkles, Calendar, Microscope, Leaf,
  HeartHandshake, FlaskConical, Clock,
} from "lucide-react";
import clinic from "@/assets/images/clinic-interior.jpg";
import heroImg from "@/assets/images/hero-dentist.jpg";
import { Reveal, stagger, staggerItem } from "@/shared/ui/Reveal";
import { Button } from "@/shared/ui/Button";

// ---------- Stat counter ----------
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
      <p className="mt-2 text-sm text-white/70 font-medium">{label}</p>
    </div>
  );
}

// ---------- Timeline data ----------
const timeline = [
  { year: "2010", title: "Founded in Copenhagen", body: "Dr. Elena Marsh opens a small, boutique practice with the belief that dentistry should never feel clinical or cold." },
  { year: "2014", title: "AI Diagnostics Pilot", body: "Aurea becomes one of the first dental clinics in Scandinavia to integrate AI-assisted X-ray analysis into routine checkups." },
  { year: "2017", title: "Expansion to 3 Clinics", body: "Growing patient trust drives expansion to Nordic Ave, Vesterbro, and Frederiksberg — each with the same signature calm design." },
  { year: "2020", title: "12,000 Patients Milestone", body: "A landmark year despite global challenges — Aurea's virtual consultation program keeps patients connected and cared for." },
  { year: "2024", title: "Aurea AI Launch", body: "Our proprietary AI triage system launches publicly, letting patients check symptoms, estimate costs, and book in seconds." },
];

// ---------- Core values ----------
const values = [
  { icon: Heart, title: "Patient First", body: "Every clinical decision is made with your comfort, safety, and outcomes at the centre — not efficiency metrics." },
  { icon: Microscope, title: "Evidence-Based", body: "We only adopt techniques and technologies with solid clinical evidence. No trends, no experiments on patients." },
  { icon: Leaf, title: "Sustainability", body: "From biodegradable packaging to energy-efficient equipment, we reduce our environmental footprint every year." },
  { icon: HeartHandshake, title: "Radical Honesty", body: "We tell you exactly what you need, never oversell, and always explain every procedure before we begin." },
  { icon: FlaskConical, title: "Continuous Learning", body: "Every clinician completes 80+ hours of CPD annually. We bring the latest science directly to your chair." },
  { icon: Users, title: "Community", body: "We run free dental clinics in under-served neighbourhoods quarterly. Good dentistry should be accessible to all." },
];

// ---------- Why items ----------
const whyItems = [
  "AI-powered diagnostics in every appointment",
  "ADA certified & HIPAA compliant",
  "Sedation dentistry options for anxious patients",
  "Same-day emergency care guaranteed",
  "Transparent pricing — zero hidden fees",
  "Lifetime patient record & digital X-ray vault",
];

export default function About() {
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
            Our story — since 2010
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6 font-display font-semibold text-[2.6rem] sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-secondary"
          >
            Built on trust,<br />
            <span className="text-gradient-primary">crafted with care.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.22 }}
            className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed"
          >
            Aurea Dental was born from a simple belief: dental care should feel as good as it looks. We combine human warmth with precision technology to give you a smile experience unlike any other.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.36 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Button asChild className="group rounded-full h-12 px-6 bg-primary hover:bg-primary/95 text-primary-foreground shadow-[0_14px_40px_-12px_rgba(31,138,112,0.65)] transition-all">
              <a href="/services">Explore Services <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" /></a>
            </Button>
            <Button asChild variant="outline" className="rounded-full h-12 px-6 border-border bg-white/70 backdrop-blur hover:bg-white transition-colors">
              <a href="#contact">Book a Visit</a>
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
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05]">
                Where calm and clinical meet.
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                In 2010, Dr. Elena Marsh walked away from a prestigious hospital post with one question: why does visiting the dentist have to feel so stressful? She envisioned a space where Scandinavian minimalism, evidence-based medicine, and genuine human connection could create something rare — a dental experience you'd actually look forward to.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Today, Aurea Dental serves over 12,000 patients across three Copenhagen locations. But the philosophy hasn't changed: every person who sits in our chair deserves unhurried, honest, expert care — delivered with warmth.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap gap-3">
                {["ADA Certified", "HIPAA Compliant", "AI-Assisted", "Zero Hidden Fees"].map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-accent text-primary border border-primary/15">
                    <CheckCircle className="size-3.5" /> {tag}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
          {/* Image collage */}
          <Reveal delay={0.1}>
            <div className="relative h-[420px] md:h-[500px]">
              <div className="absolute inset-0 rounded-[36px] overflow-hidden border border-white/60 bg-white soft-shadow">
                <img
                  src={clinic}
                  alt="Aurea Dental reception"
                  width={1400}
                  height={900}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/45 via-transparent to-transparent" />
              </div>
              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                className="absolute top-6 left-6 glass soft-shadow rounded-2xl px-4 py-3 flex items-center gap-3 animate-float-slow"
              >
                <span className="grid place-items-center size-10 rounded-xl bg-primary/10 text-primary"><Award className="size-5" /></span>
                <div>
                  <p className="text-xs text-muted-foreground font-display">Excellence Award</p>
                  <p className="font-semibold text-secondary font-display">2023 Winner</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
                className="absolute bottom-10 right-6 glass soft-shadow rounded-2xl px-4 py-3 animate-float-slow [animation-delay:-3s]"
              >
                <div className="flex -space-x-2 mb-2">
                  {[1, 2, 3, 4].map(i => (
                    <span key={i} className="size-8 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 border-2 border-white" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-display">12,000+ happy patients</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <span className="relative grid place-items-center size-20 rounded-full bg-primary text-primary-foreground soft-shadow animate-pulse-ring">
                  <Sparkles className="size-8" />
                </span>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-24 md:py-32 bg-muted/50">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Purpose</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05]">
                Mission & Vision
              </h2>
            </Reveal>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Heart,
                label: "Our Mission",
                title: "To make excellent dental care feel human.",
                body: "We exist to remove the fear, jargon, and coldness from dentistry. Every aspect of Aurea — from lighting to language — is designed to make you feel respected, informed, and at ease. We pursue clinical excellence not as an end in itself, but as a means to give you decades of confident smiles.",
                gradient: "from-primary/10 to-primary/5",
                border: "border-primary/20",
              },
              {
                icon: Eye,
                label: "Our Vision",
                title: "A world where everyone smiles freely.",
                body: "We envision a future where advanced dental care is not a privilege but a right — where AI removes the cost and friction of diagnostics, and where every community has access to a practitioner who treats them with dignity. Aurea is a proof of concept that this is possible today.",
                gradient: "from-secondary/10 to-secondary/5",
                border: "border-secondary/20",
              },
            ].map(({ icon: Icon, label, title, body, gradient, border }) => (
              <Reveal key={label} delay={0.05}>
                <div className={`rounded-3xl bg-gradient-to-br ${gradient} border ${border} p-8 md:p-10 h-full`}>
                  <span className="grid place-items-center size-12 rounded-full bg-white text-primary soft-shadow">
                    <Icon className="size-6" />
                  </span>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{label}</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-secondary leading-snug">{title}</h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="max-w-2xl mb-14">
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">What we stand for</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05]">
                Our core values.
              </h2>
            </Reveal>
          </div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {values.map(({ icon: Icon, title, body }) => (
              <motion.div
                variants={staggerItem}
                key={title}
                className="group relative rounded-3xl bg-white border border-border p-7 overflow-hidden hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="grid place-items-center size-12 rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-secondary">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-24 md:py-32 bg-muted/50">
        <div className="max-w-4xl mx-auto px-5 md:px-8">
          <div className="text-center mb-16">
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Since 2010</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05]">
                Our journey.
              </h2>
            </Reveal>
          </div>
          <div className="relative">
            <div className="absolute left-[26px] md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2" />
            <div className="space-y-12">
              {timeline.map(({ year, title, body }, idx) => (
                <Reveal key={year} delay={idx * 0.06}>
                  <div className={`relative flex gap-6 md:gap-0 ${idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    {/* Year bubble */}
                    <div className="relative md:absolute md:left-1/2 md:-translate-x-1/2 z-10 shrink-0">
                      <div className="flex items-center justify-center size-[52px] rounded-full bg-primary text-primary-foreground font-display font-semibold text-sm soft-shadow">
                        <Calendar className="size-4" />
                      </div>
                    </div>
                    {/* Content card */}
                    <div className={`md:w-[45%] ${idx % 2 === 0 ? "md:ml-0 md:mr-auto md:pr-10" : "md:ml-auto md:pl-10"}`}>
                      <div className="bg-white border border-border rounded-3xl p-6 soft-shadow">
                        <span className="text-xs font-semibold text-primary font-display tracking-wide">{year}</span>
                        <h3 className="mt-1 font-display text-lg font-semibold text-secondary">{title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Statistics ── */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="rounded-[32px] bg-secondary text-white p-8 md:p-14 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/30 blur-3xl animate-blob" />
            <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-primary/20 blur-3xl animate-blob [animation-delay:-3s]" />
            <div className="relative text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">By the numbers</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold leading-tight">
                Fourteen years of smiles.
              </h2>
            </div>
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
              <Stat to={14} suffix="+" label="Years of care" />
              <Stat to={12000} label="Happy patients" />
              <Stat to={98} suffix="%" label="Satisfaction rate" />
              <Stat to={42} label="Specialists" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-24 md:py-32 bg-muted/50">
        <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">The Aurea difference</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05]">
                Why patients stay with us for life.
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                Choosing a dental provider is personal. Here is what makes Aurea different — not marketing copy, but real commitments we make to every patient on day one.
              </p>
            </Reveal>
            <motion.ul
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-8 space-y-3"
            >
              {whyItems.map(item => (
                <motion.li key={item} variants={staggerItem} className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Star, stat: "4.9/5", label: "Google Rating", sub: "from 2,300+ reviews" },
                { icon: Shield, stat: "100%", label: "Safe Practice", sub: "ADA certified always" },
                { icon: Clock, stat: "<15min", label: "Wait Time", sub: "average on arrival" },
                { icon: Lightbulb, stat: "AI-First", label: "Diagnostics", sub: "since 2014" },
              ].map(({ icon: Icon, stat, label, sub }) => (
                <div key={label} className="rounded-3xl bg-white border border-border p-6 soft-shadow hover:-translate-y-1 transition-transform duration-300">
                  <span className="grid place-items-center size-11 rounded-2xl bg-accent text-primary w-fit">
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-4 font-display text-2xl font-semibold text-secondary">{stat}</p>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <Reveal>
            <div className="rounded-[32px] bg-gradient-to-br from-primary to-secondary p-10 md:p-16 text-center text-white relative overflow-hidden">
              <div className="absolute -top-20 -left-20 size-72 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 size-72 rounded-full bg-white/10 blur-3xl" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Ready to begin?</p>
                <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold leading-tight">
                  Start your Aurea journey today.
                </h2>
                <p className="mt-4 text-white/80 max-w-xl mx-auto leading-relaxed">
                  Your first consultation is a no-pressure conversation. We listen, we explain, and only then do we recommend.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Button asChild className="rounded-full h-12 px-7 bg-white text-secondary hover:bg-white/90 font-semibold shadow-lg transition-all">
                    <a href="#contact">Book Free Consultation <ArrowRight className="ml-1.5 size-4" /></a>
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
