import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck, Star, Sparkles, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-dentist.jpg";
import toothImg from "@/assets/tooth-3d.png";

function useGreeting() {
  const [g, setG] = useState("Good day");
  useEffect(() => {
    const h = new Date().getHours();
    setG(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);
  return g;
}

export function Hero() {
  const greeting = useGreeting();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-40, 40], [6, -6]), { stiffness: 120, damping: 15 });
  const ry = useSpring(useTransform(mx, [-40, 40], [-6, 6]), { stiffness: 120, damping: 15 });

  return (
    <section id="top" className="relative pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/60 via-background to-background" />
        <div className="absolute -top-24 -left-24 size-[520px] bg-primary/20 blur-3xl animate-blob" />
        <div className="absolute top-40 -right-32 size-[560px] bg-secondary/15 blur-3xl animate-blob [animation-delay:-4s]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-secondary border border-primary/15"
          >
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            {greeting} — welcome to Aurea Dental
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.05 }}
            className="mt-6 font-display font-semibold text-[2.6rem] sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-secondary"
          >
            A calmer way to
            <br />
            care for your <span className="text-gradient-primary">smile</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.18 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed"
          >
            Aurea blends Scandinavian design, gentle clinicians, and AI-assisted diagnostics
            into a dental experience that finally feels human.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Button
              asChild
              className="group rounded-full h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_14px_40px_-12px_rgba(31,138,112,0.65)]"
            >
              <a href="#contact">
                Book Appointment
                <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full h-12 px-6 border-border bg-white/70 backdrop-blur hover:bg-white"
            >
              <a href="#services">
                <PlayCircle className="mr-1.5 size-4 text-primary" /> Explore Services
              </a>
            </Button>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="size-8 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 border-2 border-white"
                  />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">4.9/5</span> from 2,300+ patients
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" /> ADA Certified & HIPAA compliant
            </div>
          </motion.div>
        </div>

        {/* Right */}
        <div
          className="lg:col-span-5 relative"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            mx.set(e.clientX - r.left - r.width / 2);
            my.set(e.clientY - r.top - r.height / 2);
          }}
          onMouseLeave={() => {
            mx.set(0);
            my.set(0);
          }}
        >
          <motion.div
            style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="relative"
          >
            <div className="relative rounded-[36px] overflow-hidden soft-shadow border border-white/60 bg-white">
              <img
                src={heroImg}
                alt="Dentist at Aurea Dental smiling in a modern clinic"
                width={1200}
                height={1400}
                className="w-full h-[480px] md:h-[560px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/25 via-transparent to-transparent" />
            </div>

            {/* Floating stat cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="absolute -left-4 md:-left-10 top-16 glass soft-shadow rounded-2xl px-4 py-3 flex items-center gap-3 animate-float-slow"
            >
              <span className="grid place-items-center size-10 rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">AI Smile Score</p>
                <p className="font-semibold text-secondary">96 / 100</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="absolute -right-3 md:-right-8 bottom-14 glass soft-shadow rounded-2xl px-4 py-3 animate-float-slow [animation-delay:-3s]"
            >
              <p className="text-xs text-muted-foreground">Next opening</p>
              <p className="font-semibold text-secondary">Today · 3:40 PM</p>
              <p className="text-xs text-primary mt-0.5">Dr. Elena Marsh</p>
            </motion.div>

            <motion.img
              src={toothImg}
              alt=""
              aria-hidden
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="hidden md:block absolute -bottom-10 -left-14 size-40 animate-float-slow [animation-delay:-2s] drop-shadow-[0_20px_40px_rgba(31,138,112,0.25)]"
            />
          </motion.div>
        </div>
      </div>

      {/* Logo marquee */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 mt-16 md:mt-24">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
          Trusted by leading healthcare networks
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex gap-16 animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, k) => (
              <div key={k} className="flex gap-16 items-center shrink-0">
                {["Meridian Health", "OakCare", "NorthClinic", "PearlDental", "Lumen Group", "VivaHealth", "Nordica"].map(
                  (n) => (
                    <span
                      key={n + k}
                      className="font-display text-xl font-semibold text-secondary/40 tracking-tight"
                    >
                      {n}
                    </span>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}