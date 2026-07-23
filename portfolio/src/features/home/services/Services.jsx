import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import * as Lucide from "lucide-react";
import { Reveal, stagger, staggerItem } from "@/shared/ui/Reveal";
import { axiosInstance } from "@/services/api/axiosInstance";

const iconMap = {
  Sparkles: Lucide.Sparkles,
  Crown: Lucide.Crown,
  Smile: Lucide.Smile,
  Wrench: Lucide.Wrench,
  Stethoscope: Lucide.Stethoscope,
  Baby: Lucide.Baby,
  ShieldPlus: Lucide.ShieldPlus,
  Zap: Lucide.Zap,
};

export function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axiosInstance.get("/services");
        setServices(response.data);
      } catch (error) {
        console.error("Could not load services from backend", error);
        setServices([]);
      }
    };
    fetchServices();
  }, []);

  return (
    <section id="services" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div>
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                What we do
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight text-secondary max-w-2xl leading-[1.05]">
                Full-spectrum dentistry, curated like an atelier.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <p className="text-muted-foreground max-w-md">
              Each treatment is planned with AI-assisted diagnostics and delivered by a small team you actually know by name.
            </p>
          </Reveal>
        </div>

        {services.length > 0 && (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {services.map((s, idx) => {
              let IconComponent = Lucide.Sparkles;
              if (s.icon) {
                if (typeof s.icon === "string") {
                  IconComponent = iconMap[s.icon] || Lucide.Sparkles;
                } else {
                  IconComponent = s.icon;
                }
              }

              return (
                <motion.a
                  variants={staggerItem}
                  key={s.title || idx}
                  href="#contact"
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  className="group relative rounded-3xl bg-white border border-border p-6 overflow-hidden hover:border-primary/40 hover:shadow-[0_20px_60px_-20px_rgba(31,138,112,0.35)] transition-shadow"
                >
                  <div className="absolute -top-16 -right-16 size-40 rounded-full bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500 blur-2xl" />
                  <div className="relative grid place-items-center size-12 rounded-2xl bg-accent text-primary group-hover:rotate-6 transition-transform">
                    <IconComponent className="size-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-secondary">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {s.body}
                  </p>
                  <div className="mt-5 flex items-center text-sm font-medium text-primary">
                    Learn more
                    <ArrowUpRight className="ml-1 size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
