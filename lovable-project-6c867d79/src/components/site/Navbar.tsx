import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
  { href: "#doctors", label: "Doctors" },
  { href: "#gallery", label: "Gallery" },
  { href: "#ai", label: "AI Care" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > prev && y > 220);
  });

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive("#" + e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    links.forEach((l) => {
      const el = document.querySelector(l.href);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? -100 : 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div
        className={`transition-all duration-500 ${
          scrolled
            ? "mx-3 md:mx-6 mt-3 rounded-2xl glass soft-shadow"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-8 h-16 md:h-18">
          <a href="#top" className="flex items-center gap-2 group">
            <span className="grid place-items-center size-9 rounded-xl bg-primary text-primary-foreground soft-shadow group-hover:scale-105 transition-transform">
              <Sparkles className="size-5" />
            </span>
            <span className="font-display font-semibold text-lg tracking-tight text-secondary">
              Aurea<span className="text-primary">.</span>
            </span>
          </a>
          <ul className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                >
                  {l.label}
                  <span
                    className={`absolute left-4 right-4 -bottom-0.5 h-0.5 rounded-full bg-primary origin-left transition-transform duration-300 ${
                      active === l.href ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              </li>
            ))}
          </ul>
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+15551234567"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              +1 (555) 123-4567
            </a>
            <Button
              asChild
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-5 h-10 shadow-[0_10px_30px_-10px_rgba(31,138,112,0.6)] hover:shadow-[0_16px_40px_-10px_rgba(31,138,112,0.7)] transition-shadow"
            >
              <a href="#contact">Book Appointment</a>
            </Button>
          </div>
          <button
            className="lg:hidden grid place-items-center size-10 rounded-xl bg-white/70 border border-border"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-border"
            >
              <div className="px-6 py-4 flex flex-col gap-1 bg-white/95">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="py-3 text-base font-medium text-foreground/80 hover:text-primary border-b border-border/60 last:border-0"
                  >
                    {l.label}
                  </a>
                ))}
                <Button
                  asChild
                  className="mt-3 rounded-full bg-primary hover:bg-primary/90"
                >
                  <a href="#contact" onClick={() => setOpen(false)}>
                    Book Appointment
                  </a>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}