import { motion } from "framer-motion";
import { PhoneCall } from "lucide-react";
import { AI_SECTION_META } from "../aiSectionConstants";

export function EmergencyCard() {
  return (
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
          <a
            href={AI_SECTION_META.emergencyPhone}
            className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-3 text-sm font-medium transition-colors"
          >
            <PhoneCall className="size-4" /> Call Clinic
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white px-5 py-3 text-sm font-medium transition-colors"
          >
            Book urgent slot
          </a>
        </div>
      </div>
    </motion.div>
  );
}
