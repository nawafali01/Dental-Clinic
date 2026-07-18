import { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { navLinks } from "./data";

function scrollToHash(hash) {
  const el = document.getElementById(hash);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();
  const navigate = useNavigate();

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 24);
  });

  const isActive = (l) => {
    if (l.hash) {
      return location.pathname === "/" && location.hash === `#${l.hash}`;
    }
    return location.pathname === l.href;
  };

  const handleNavClick = (l, onClick) => (e) => {
    onClick?.();

    if (!l.hash) return;

    e.preventDefault();

    if (location.pathname === "/") {
      scrollToHash(l.hash);
      window.history.replaceState(null, "", `/#${l.hash}`);
      return;
    }

    navigate(`/#${l.hash}`);
  };

  const NavLink = ({ l, onClick }) => {
    const active = isActive(l);
    const cls = `relative px-4 py-2 text-sm font-medium transition-colors ${active ? "text-primary" : "text-foreground/80 hover:text-primary"}`;
    const underline = (
      <span className={`absolute left-4 right-4 -bottom-0.5 h-0.5 rounded-full bg-primary origin-left transition-transform duration-300 ${active ? "scale-x-100" : "scale-x-0"}`} />
    );

    return (
      <Link to={l.href} onClick={handleNavClick(l, onClick)} className={cls}>
        {l.label}{underline}
      </Link>
    );
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
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
          <Link to="/" className="flex items-center gap-2 group">
            <span className="grid place-items-center size-9 rounded-xl bg-primary text-primary-foreground soft-shadow group-hover:scale-105 transition-transform">
              <Sparkles className="size-5" />
            </span>
            <span className="font-display font-semibold text-lg tracking-tight text-secondary">
              Aurea<span className="text-primary">.</span>
            </span>
          </Link>
          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => (
              <li key={l.href}>
                <NavLink l={l} />
              </li>
            ))}
          </ul>
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+15551234567"
              className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              +1 (555) 123-4567
            </a>
            <Button
              asChild
              className="rounded-full bg-primary hover:bg-primary/95 text-primary-foreground px-5 h-10 shadow-[0_10px_30px_-10px_rgba(31,138,112,0.6)] hover:shadow-[0_16px_40px_-10px_rgba(31,138,112,0.7)] transition-all"
            >
              <Link to="/book-appointment">Book Appointment</Link>
            </Button>
          </div>
          <button
            className="lg:hidden grid place-items-center size-10 rounded-xl bg-white/70 border border-border cursor-pointer hover:bg-white transition-colors"
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
              <div className="px-6 py-4 flex flex-col gap-1 bg-white/95 backdrop-blur-md">
                {navLinks.map((l) => (
                  <NavLink key={l.href} l={l} onClick={() => setOpen(false)} />
                ))}
                <Button
                  asChild
                  className="mt-3 rounded-full bg-primary hover:bg-primary/95"
                >
                  <Link to="/book-appointment" onClick={() => setOpen(false)}>
                    Book Appointment
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
