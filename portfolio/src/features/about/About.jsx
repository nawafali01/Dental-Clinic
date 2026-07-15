import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { Reveal, stagger, staggerItem } from "@/shared/ui/Reveal";
import clinic from "@/assets/images/clinic-interior.jpg";
import { timeline, coreValues } from "./data";

function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const v = useMotionValue(0);

  useEffect(() => {
    if (!inView) return;
    const c = animate(v, to, { duration: 1.6, ease: [0.22, 1, 0.36, 1] });
    const un = v.on("change", (val) => {
      if (ref.current) {
        ref.current.textContent = Math.round(val).toLocaleString() + suffix;
      }
    });
    return () => {
      c.stop();
      un();
    };
  }, [inView, to, v, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export function About() {
  return (
    <section id="about" className="relative py-24 md:py-32 bg-muted/50">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-12 gap-12 items-start">
        {/* Left column */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Our story
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-semibold tracking-tight text-secondary leading-[1.05]">
              Fifteen years perfecting a calmer dentistry.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Aurea was born from a simple frustration: healthcare rooms
              shouldn't feel like waiting rooms. We designed every corner — from
              lighting to language — to help you exhale.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 rounded-3xl overflow-hidden soft-shadow border border-border bg-white">
              <img
                src={clinic}
                alt="Aurea Dental reception"
                width={1400}
                height={900}
                loading="lazy"
                className="w-full h-64 object-cover"
              />
            </div>
          </Reveal>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="mt-8 grid grid-cols-3 gap-4"
          >
            {[
              { k: "14+", label: "Years of care", n: 14, s: "+" },
              { k: "42", label: "Specialists", n: 42, s: "" },
              { k: "12k", label: "Happy patients", n: 12000, s: "" },
            ].map((s) => (
              <motion.div
                key={s.label}
                variants={staggerItem}
                className="rounded-2xl bg-white border border-border p-5 text-center"
              >
                <div className="font-display text-3xl font-semibold text-primary">
                  <Counter to={s.n} suffix={s.s} />
                </div>
                <p className="text-xs mt-1 text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-7 relative">
          <div className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />
          <motion.ol
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="space-y-8"
          >
            {timeline.map((t) => (
              <motion.li
                variants={staggerItem}
                key={t.year}
                className="relative pl-16 animate-none"
              >
                <span className="absolute left-0 top-1 grid place-items-center size-12 rounded-2xl bg-primary/10 text-primary font-display font-semibold text-sm border border-primary/20">
                  {t.year}
                </span>
                <div className="rounded-2xl bg-white border border-border p-6 soft-shadow hover:-translate-y-0.5 transition-transform">
                  <h3 className="font-display text-xl font-semibold text-secondary">
                    {t.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {t.body}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ol>

          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {coreValues.map((v) => (
              <Reveal key={v.t}>
                <div className="rounded-2xl bg-white border border-border p-5 h-full">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    {v.t}
                  </p>
                  <p className="mt-2 font-display text-lg text-secondary leading-snug">
                    {v.b}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
