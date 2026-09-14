import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneCall, Phone, MapPin, Clock, Copy, Check, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { mockClinics } from "@/data/clinics";

export function EmergencyCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (phone, key) => {
    navigator.clipboard?.writeText(phone);
    setCopiedKey(key);
    toast.success(`Copied ${phone} to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="rounded-3xl p-6 md:p-7 bg-secondary text-white relative overflow-hidden"
      >
        <div className="absolute -top-16 -right-10 size-52 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center size-11 rounded-2xl bg-white/10 select-none">
              <PhoneCall className="size-5" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold">Dental Emergency?</p>
              <p className="text-xs text-white/60">24/7 AI triage & on-call dentist</p>
            </div>
          </div>
          <p className="mt-5 text-sm text-white/80 leading-relaxed">
            If you're bleeding, in severe pain, or a tooth was knocked out — call
            us. Aurea AI will prep the clinician before you arrive.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-3 text-sm font-medium transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-95"
            >
              <PhoneCall className="size-4" /> Call Clinic
            </button>
            <a
              href="/book-appointment"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white px-5 py-3 text-sm font-medium transition-colors"
            >
              Book urgent slot
            </a>
          </div>
        </div>
      </motion.div>

      {/* Emergency Clinic Selector Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-secondary/80 backdrop-blur-md grid place-items-center p-4 overflow-y-auto"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-border text-secondary my-8"
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 grid place-items-center size-9 rounded-full bg-muted text-muted-foreground hover:text-secondary hover:bg-muted/80 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3.5 mb-5">
                <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-600 grid place-items-center shrink-0">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-secondary">
                    Call Clinic Helpline
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Choose your nearest clinic branch or call our 24/7 central emergency desk.
                  </p>
                </div>
              </div>

              {/* 24/7 Central Hotline Banner */}
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      24/7 Emergency Triage Line
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-secondary mt-0.5">
                    +1 (555) 123-4567
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy("+1 (555) 123-4567", "hotline")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-border bg-white hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                    title="Copy phone number"
                  >
                    {copiedKey === "hotline" ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    <span>{copiedKey === "hotline" ? "Copied" : "Copy"}</span>
                  </button>
                  <a
                    href="tel:+15551234567"
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/95 shadow-sm transition-colors cursor-pointer"
                  >
                    <Phone className="size-3.5" /> Call Now
                  </a>
                </div>
              </div>

              {/* Clinics List */}
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                  Or Call A Specific Branch
                </p>
                {mockClinics.map((clinic) => {
                  const rawPhone = clinic.phone.replace(/[^\d+]/g, "");
                  const isCopied = copiedKey === clinic.id;
                  return (
                    <div
                      key={clinic.id}
                      className="p-4 rounded-2xl border border-border hover:border-primary/40 hover:shadow-sm transition-all bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-sm font-semibold text-secondary truncate">
                            {clinic.name}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              clinic.isOpen
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {clinic.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                          <MapPin className="size-3 text-primary shrink-0" />
                          {clinic.address}
                        </p>
                        <p className="text-xs font-semibold text-secondary mt-1">
                          {clinic.phone}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopy(clinic.phone, clinic.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-border bg-white hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                          title="Copy phone number"
                        >
                          {isCopied ? (
                            <Check className="size-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                          <span>{isCopied ? "Copied" : "Copy"}</span>
                        </button>
                        <a
                          href={`tel:${rawPhone}`}
                          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-secondary text-white hover:bg-primary transition-colors cursor-pointer shadow-sm"
                        >
                          <Phone className="size-3.5" /> Call Branch
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer Note */}
              <div className="mt-5 pt-4 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" /> On-call dentist ready 24/7
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="font-medium hover:text-secondary underline cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
