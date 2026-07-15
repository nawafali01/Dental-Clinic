import { motion } from "framer-motion";
import { Reveal, stagger, staggerItem } from "./Reveal";
import { Instagram, Linkedin, Twitter, CalendarPlus } from "lucide-react";
import d1 from "@/assets/doctor-1.jpg";
import d2 from "@/assets/doctor-2.jpg";
import d3 from "@/assets/doctor-3.jpg";

const doctors = [
  { name: "Dr. Elena Marsh", role: "Cosmetic & Prosthodontics", exp: "12 years", img: d2, edu: "DDS, King's College London" },
  { name: "Dr. Julian Reyes", role: "Implantology & Surgery", exp: "9 years", img: d1, edu: "MSc Oral Surgery, NYU" },
  { name: "Dr. Anders Holm", role: "Orthodontics & AI Care", exp: "18 years", img: d3, edu: "PhD Digital Dentistry, KU" },
];

export function Doctors() {
  return (
    <section id="doctors" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <Reveal><span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Meet the team</span></Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05] max-w-2xl">
                Clinicians who listen first.
              </h2>
            </Reveal>
          </div>
        </div>

        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="grid md:grid-cols-3 gap-6">
          {doctors.map((d) => (
            <motion.article
              variants={staggerItem}
              key={d.name}
              className="group relative rounded-[28px] overflow-hidden bg-white border border-border soft-shadow"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={d.img}
                  alt={d.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-[900ms] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-secondary/10 to-transparent" />
                <div className="absolute top-4 left-4 glass rounded-full px-3 py-1 text-xs font-medium text-secondary">
                  {d.exp} experience
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs text-white/80">{d.role}</p>
                  <h3 className="font-display text-xl font-semibold text-white mt-0.5">{d.name}</h3>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{d.edu}</p>
                <div className="flex items-center gap-1.5">
                  {[Instagram, Linkedin, Twitter].map((I, i) => (
                    <button
                      key={i}
                      aria-label="Social profile"
                      className="grid place-items-center size-8 rounded-full text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
                    >
                      <I className="size-4" />
                    </button>
                  ))}
                </div>
              </div>
              <a
                href="#contact"
                className="mx-5 mb-5 flex items-center justify-center gap-2 rounded-2xl bg-secondary text-secondary-foreground py-3 text-sm font-medium hover:bg-primary transition-colors"
              >
                <CalendarPlus className="size-4" /> Book with {d.name.split(" ")[1]}
              </a>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}