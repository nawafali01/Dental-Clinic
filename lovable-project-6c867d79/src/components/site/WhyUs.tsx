import { Reveal, stagger, staggerItem } from "./Reveal";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Award, Cpu, LifeBuoy, Wallet, ShieldCheck, Users } from "lucide-react";

const items = [
  { icon: Award, title: "Certified dentists", body: "Board-certified specialists with 10+ years experience." },
  { icon: Cpu, title: "Modern equipment", body: "3D CBCT scanners, digital impressions, AI diagnostics." },
  { icon: LifeBuoy, title: "Emergency support", body: "Same-day urgent slots, 24/7 AI triage." },
  { icon: Wallet, title: "Transparent pricing", body: "Flat fees, financing plans, insurance-friendly." },
  { icon: ShieldCheck, title: "Safe & sterile", body: "Hospital-grade sterilization on every instrument." },
  { icon: Users, title: "Experienced staff", body: "Bilingual clinicians who treat you like family." },
];

function Stat({ to, suffix, label }: { to: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const v = useMotionValue(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(v, to, { duration: 1.6 });
    const un = v.on("change", (val) => { if (ref.current) ref.current.textContent = Math.round(val).toLocaleString() + (suffix ?? ""); });
    return () => { c.stop(); un(); };
  }, [inView, to, v, suffix]);
  return (
    <div className="text-center">
      <p className="font-display text-4xl md:text-5xl font-semibold text-white"><span ref={ref}>0{suffix ?? ""}</span></p>
      <p className="mt-2 text-sm text-white/70">{label}</p>
    </div>
  );
}

export function WhyUs() {
  return (
    <section className="relative py-24 md:py-32 bg-muted/50">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-14">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Why Aurea</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05]">
              A different kind of dental practice.
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
          {items.map((f) => (
            <motion.div
              variants={staggerItem}
              key={f.title}
              className="group relative rounded-3xl bg-white border border-border p-7 overflow-hidden hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="grid place-items-center size-12 rounded-2xl bg-primary/10 text-primary">
                <f.icon className="size-6" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-secondary">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-16 rounded-[32px] bg-secondary text-white p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat to={14} suffix="+" label="Years of care" />
            <Stat to={12000} label="Happy patients" />
            <Stat to={98} suffix="%" label="Satisfaction rate" />
            <Stat to={42} label="Specialists" />
          </div>
        </div>
      </div>
    </section>
  );
}