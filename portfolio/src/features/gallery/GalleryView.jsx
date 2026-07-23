import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, stagger, staggerItem } from "@/shared/ui/Reveal";
import { X, Expand, ArrowRight } from "lucide-react";
import { galleryItems, compareItems, galleryCategories } from "./data";

export function GalleryView() {
  const [activeCat, setActiveCat] = useState("All");
  const [lightboxImg, setLightboxImg] = useState(null);

  const filtered = galleryItems.filter(item => activeCat === "All" || item.category === activeCat);

  return (
    <div className="bg-background">
      {/* ── Hero section ── */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/60 via-background to-background" />
        <div className="max-w-7xl mx-auto px-5 md:px-8 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-secondary border border-primary/10">
              Inside Aurea Dental
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display font-semibold text-4xl sm:text-6xl tracking-tight text-secondary">
              A gallery of our<br />
              <span className="text-gradient-primary">luxury design and tech.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl mx-auto text-sm md:text-base text-muted-foreground leading-relaxed">
              Explore our boutique clinic lounges, surgical suites, and state-of-the-art diagnostic equipment designed to ensure your visual comfort.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Tabs selector ── */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {galleryCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-full border cursor-pointer transition-all ${
                  activeCat === cat
                    ? "bg-secondary text-secondary-foreground border-secondary"
                    : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Photo Grid ── */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.05 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((item, idx) => (
              <motion.article
                variants={staggerItem}
                key={idx}
                onClick={() => setLightboxImg(item)}
                className="group relative rounded-[28px] overflow-hidden border border-border bg-white cursor-pointer soft-shadow h-[280px]"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5" />
                <div className="absolute bottom-5 left-5 right-5 text-white translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-primary">{item.category}</span>
                    <h3 className="font-display font-semibold text-sm mt-0.5">{item.title}</h3>
                  </div>
                  <span className="size-8 rounded-full bg-white/20 backdrop-blur grid place-items-center">
                    <Expand className="size-4 text-white" />
                  </span>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Before & After Gallery ── */}
      <section className="py-24 bg-muted/40">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-16">
            <Reveal><span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Case Portfolio</span></Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-secondary">
                Before & After Transformations
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 text-xs md:text-sm text-muted-foreground">
                Drag the divider or browse side-by-side smile reconstructions accomplished by Aurea clinicians.
              </p>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {compareItems.map((item, idx) => (
              <div key={idx} className="bg-white border border-border soft-shadow rounded-[32px] p-6 flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-3 h-[240px] overflow-hidden rounded-2xl relative">
                  <div className="relative h-full bg-muted">
                    <img src={item.before} alt="Before Treatment" className="w-full h-full object-cover" />
                    <span className="absolute bottom-3 left-3 bg-secondary/80 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Before</span>
                  </div>
                  <div className="relative h-full bg-muted">
                    <img src={item.after} alt="After Treatment" className="w-full h-full object-cover" />
                    <span className="absolute bottom-3 left-3 bg-primary/80 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">After</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-secondary">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Photo Lightbox Modal ── */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/95 backdrop-blur-sm"
          >
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-5 right-5 text-white hover:text-primary transition-colors cursor-pointer size-10 rounded-full bg-white/10 grid place-items-center"
              aria-label="Close image popup"
            >
              <X className="size-6" />
            </button>
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl bg-black/40 relative shadow-2xl"
            >
              <img
                src={lightboxImg.img}
                alt={lightboxImg.title}
                className="w-full h-auto max-h-[75vh] object-contain"
              />
              <div className="p-5 bg-secondary text-white border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wide">{lightboxImg.category}</span>
                  <p className="font-display font-semibold text-sm mt-0.5">{lightboxImg.title}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
