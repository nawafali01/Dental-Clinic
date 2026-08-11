import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import * as Lucide from "lucide-react";
import { stagger, staggerItem } from "@/shared/ui/Reveal";

export function ServicesGrid({ services = [], iconMap = {}, onResetFilters }) {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {services.length > 0 ? (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.05 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {services.map((s, idx) => {
              const IconComponent =
                typeof s.icon === "string"
                  ? iconMap[s.icon] || Lucide.Sparkles
                  : s.icon || Lucide.Sparkles;
              return (
                <motion.div
                  variants={staggerItem}
                  key={s.title || idx}
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
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <Sparkles className="size-12 text-primary/30 mx-auto mb-4" />
            <p className="font-display text-lg font-semibold text-secondary">
              No services found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different search term or category.
            </p>
            {onResetFilters && (
              <button
                onClick={onResetFilters}
                className="mt-4 text-sm font-medium text-primary hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
