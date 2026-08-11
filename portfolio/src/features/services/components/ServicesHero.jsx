import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { ROUTES } from "@/constants/routes";

export function ServicesHero() {
  return (
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
          Every treatment,
          <br />
          <span className="text-gradient-primary">crafted for you.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.22 }}
          className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed"
        >
          From a routine scale-and-polish to full-smile reconstruction, every
          Aurea treatment is planned with AI-assisted diagnostics and
          delivered by clinicians who know your name.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.36 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Button
            asChild
            className="group rounded-full h-12 px-6 bg-primary hover:bg-primary/95 text-white shadow-[0_14px_40px_-12px_rgba(31,138,112,0.65)] transition-all"
          >
            <Link to={ROUTES.BOOKING}>
              Book Appointment{" "}
              <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full h-12 px-6 border-border bg-white/70 backdrop-blur hover:bg-white transition-colors"
          >
            <Link to="#faq">Common Questions</Link>
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {[
            "Same-day Emergency",
            "0% Finance Available",
            "No Hidden Fees",
            "AI-Assisted Diagnostics",
          ].map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full glass border border-primary/15 text-secondary"
            >
              <Star className="size-3 text-primary" /> {tag}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
