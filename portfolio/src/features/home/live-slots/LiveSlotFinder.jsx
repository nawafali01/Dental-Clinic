import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, UserCheck, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { Reveal } from "@/shared/ui/Reveal";
import { Button } from "@/shared/ui/Button";
import { mockSlots } from "@/data/slots";

export function LiveSlotFinder() {
  const [activeDay, setActiveDay] = useState("Today");

  const currentGroup = mockSlots.find((g) => g.dayGroup === activeDay) || mockSlots[0];

  return (
    <section id="live-slots" className="relative py-20 md:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-primary border border-primary/15">
                <Zap className="size-3.5" /> Real-time Schedule
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-secondary leading-[1.08]">
                Live appointment availability.
              </h2>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-border soft-shadow">
              {mockSlots.map((g) => (
                <button
                  key={g.dayGroup}
                  onClick={() => setActiveDay(g.dayGroup)}
                  className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeDay === g.dayGroup
                      ? "bg-secondary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-neutral-50"
                  }`}
                >
                  {g.dayGroup}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-secondary">
          <Calendar className="size-4 text-primary" />
          <span>Showing open slots for: {currentGroup.dateLabel}</span>
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse ml-2" />
          <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Live Availability
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {currentGroup.slots.map((slot, idx) => (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: idx * 0.05, duration: 0.35 }}
              whileHover={{ y: -5 }}
              className="rounded-3xl bg-white border border-border p-6 soft-shadow flex flex-col justify-between hover:border-primary/40 hover:shadow-[0_20px_50px_-15px_rgba(31,138,112,0.25)] transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="font-display font-bold text-xl text-secondary flex items-center gap-1.5">
                    <Clock className="size-4 text-primary" />
                    {slot.time}
                  </span>

                  {slot.isFastTrack && (
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-primary bg-accent px-2.5 py-1 rounded-full border border-primary/15">
                      Fast-Track
                    </span>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-border/60">
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center size-9 rounded-xl bg-accent text-primary shrink-0">
                      <UserCheck className="size-4.5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-secondary group-hover:text-primary transition-colors">
                        {slot.doctor}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{slot.specialty}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-neutral-50 px-3 py-2 rounded-xl border border-border/80">
                    <ShieldCheck className="size-3.5 text-primary shrink-0" />
                    <span>{slot.room}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60">
                <Button
                  asChild
                  className="w-full rounded-full h-10 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold shadow-sm transition-all cursor-pointer group-hover:shadow-[0_10px_25px_-8px_rgba(31,138,112,0.6)]"
                >
                  <a href="#contact">
                    Book Now <ArrowRight className="ml-1 size-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
