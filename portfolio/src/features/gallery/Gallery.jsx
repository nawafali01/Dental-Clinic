import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Reveal } from "@/shared/ui/Reveal";
import { getGalleryItems } from "@/services/api/gallery.api";
import gallery1 from "@/assets/images/gallery-1.jpg";
import gallery2 from "@/assets/images/gallery-2.jpg";
import gallery3 from "@/assets/images/gallery-3.jpg";
import clinicInterior from "@/assets/images/clinic-interior.jpg";

const galleryCategories = ["All", "Cosmetic", "Family", "Clinic", "Interior"];
const galleryAssetMap = {
  "gallery-1.jpg": gallery1,
  "gallery-2.jpg": gallery2,
  "gallery-3.jpg": gallery3,
  "clinic-interior.jpg": clinicInterior,
};

export function Gallery() {
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const items = await getGalleryItems();
        const normalizedItems = items.map((item) => {
          const fileName = item.src?.split("/").pop();
          return {
            ...item,
            src: galleryAssetMap[fileName] ?? item.src,
          };
        });
        setGalleryItems(normalizedItems);
      } catch (error) {
        console.error("Could not load gallery from backend", error);
        setGalleryItems([]);
      }
    };
    fetchGallery();
  }, []);


  const filtered = cat === "All" ? galleryItems : galleryItems.filter((i) => i.tag === cat);

  return (
    <section id="gallery" className="relative py-24 md:py-32 bg-muted/50">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Portfolio
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05]">
                Real results, real smiles.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="flex flex-wrap gap-2">
              {galleryCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-4 py-2 text-sm rounded-full border cursor-pointer transition-all ${
                    cat === c
                      ? "bg-secondary text-secondary-foreground border-secondary"
                      : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[220px] gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((it, i) => (
              <motion.button
                layout
                key={(it.src || it.image) + i}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.4 }}
                onClick={() => setOpen(it.src)}
                className={`relative overflow-hidden rounded-3xl group text-left cursor-pointer ${it.h || ""}`}
              >
                <img
                  src={it.src}
                  alt={it.alt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[900ms] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-secondary/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                <span className="absolute top-3 left-3 glass rounded-full px-3 py-1 text-xs font-medium text-secondary">
                  {it.tag}
                </span>
                <span className="absolute bottom-3 left-3 right-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                  View case →
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[70] bg-secondary/85 backdrop-blur-md grid place-items-center p-6"
          >
            <motion.img
              src={open}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-5xl max-h-[85vh] rounded-3xl shadow-2xl object-contain"
              alt="Enlarged view"
            />
            <button
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute top-6 right-6 grid place-items-center size-11 rounded-full bg-white/20 text-white hover:bg-white/30 cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
