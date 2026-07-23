import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import { Button } from "@/shared/ui/Button";

const CONSENT_KEY = "aurea_cookie_consent_accepted";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(CONSENT_KEY);
      if (!accepted) {
        const timer = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "true");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="fixed bottom-5 left-5 right-5 md:left-8 md:right-auto md:max-w-md z-50 glass soft-shadow rounded-3xl p-5 border border-primary/20 bg-white/95 text-secondary"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center size-8 rounded-xl bg-accent text-primary shrink-0">
                <ShieldCheck className="size-4.5" />
              </span>
              <p className="font-display font-semibold text-sm">Privacy & Cookie Choices</p>
            </div>
            <button
              onClick={() => setVisible(false)}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Close banner"
            >
              <X className="size-4" />
            </button>
          </div>

          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            We use essential cookies to ensure secure navigation, pre-fill appointment selections, and optimize your dental concierge experience.
          </p>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={() => setVisible(false)}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer transition-colors"
            >
              Preferences
            </button>
            <Button
              onClick={handleAccept}
              className="rounded-full h-8 px-4 text-xs bg-primary hover:bg-primary/95 text-primary-foreground font-semibold cursor-pointer shadow-sm"
            >
              Accept All
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
