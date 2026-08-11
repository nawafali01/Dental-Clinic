import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Star, PlayCircle, MapPin } from "lucide-react";
import { Button } from "@/shared/ui/Button";

export function HeroLeftContent({ greeting }) {
  return (
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
        Aurea blends Scandinavian design, gentle clinicians, and AI-assisted
        diagnostics into a dental experience that finally feels human.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.32 }}
        className="mt-8 flex flex-wrap items-center gap-4"
      >
        <Button
          asChild
          className="group rounded-full h-12 px-6 bg-primary hover:bg-primary/95 text-primary-foreground shadow-[0_14px_40px_-12px_rgba(31,138,112,0.65)] transition-all cursor-pointer"
        >
          <a href="#contact">
            Book Consultation
            <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-full h-12 px-6 border-border bg-white/70 backdrop-blur hover:bg-white transition-colors cursor-pointer"
        >
          <a href="#clinics">
            <MapPin className="mr-1.5 size-4 text-primary" /> Find a Clinic
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-full h-12 px-6 border-border bg-white/70 backdrop-blur hover:bg-white transition-colors cursor-pointer"
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
  );
}
