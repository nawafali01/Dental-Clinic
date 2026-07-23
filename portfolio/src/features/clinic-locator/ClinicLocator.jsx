import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Clock,
  Star,
  Phone,
  LayoutGrid,
  Map as MapIcon,
  Check,
  ArrowRight,
} from "lucide-react";
import { Reveal } from "@/shared/ui/Reveal";
import { Button } from "@/shared/ui/Button";
import { mockClinics } from "@/data/clinics";

const treatmentFilterOptions = [
  "All Treatments",
  "Implants",
  "Clear Aligners",
  "Veneers",
  "Emergency Care",
  "Routine Checkup",
];

export function ClinicLocator() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Treatments");
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'map'
  const [selectedClinic, setSelectedClinic] = useState(mockClinics[0]);

  const filteredClinics = mockClinics.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase());

    const matchesTreatment =
      activeFilter === "All Treatments" || c.treatments.includes(activeFilter);

    return matchesSearch && matchesTreatment;
  });

  return (
    <section id="clinics" className="relative py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Atelier Directory
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-secondary leading-[1.08]">
                Find an Aurea Clinic near you.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <p className="text-muted-foreground max-w-md text-sm md:text-base">
              Explore our state-of-the-art Scandinavian clinics, operating hours, and specialized treatment options.
            </p>
          </Reveal>
        </div>

        {/* Filter & View Bar */}
        <div className="rounded-3xl bg-white border border-border p-4 md:p-6 soft-shadow mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="flex-1 flex items-center gap-2 rounded-2xl border border-border bg-muted/50 px-4 py-3">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by clinic name, address, or city..."
                className="flex-1 bg-transparent text-sm outline-none text-secondary placeholder:text-muted-foreground"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 self-start md:self-auto bg-muted p-1 rounded-2xl border border-border">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-secondary shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="size-3.5" /> List View
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  viewMode === "map"
                    ? "bg-white text-secondary shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MapIcon className="size-3.5" /> Map View
              </button>
            </div>
          </div>

          {/* Treatment Category Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
            <span className="text-xs text-muted-foreground mr-1 font-medium">Filter by service:</span>
            {treatmentFilterOptions.map((t) => (
              <button
                key={t}
                onClick={() => setActiveFilter(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  activeFilter === t
                    ? "bg-secondary text-white border-secondary"
                    : "bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Content View: List or Map */}
        {viewMode === "list" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredClinics.length > 0 ? (
              filteredClinics.map((clinic) => (
                <motion.div
                  key={clinic.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-3xl bg-white border border-border overflow-hidden soft-shadow flex flex-col justify-between group hover:border-primary/40 transition-all"
                >
                  <div>
                    {/* Clinic Image & Status Badge */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={clinic.image}
                        alt={clinic.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent" />

                      <div className="absolute top-3 left-3 flex gap-2">
                        <span
                          className={`glass rounded-full px-3 py-1 text-[11px] font-semibold flex items-center gap-1.5 ${
                            clinic.isOpen ? "text-emerald-700 bg-white/95" : "text-amber-700 bg-white/95"
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${clinic.isOpen ? "bg-emerald-500" : "bg-amber-500"}`} />
                          {clinic.status}
                        </span>
                      </div>

                      <span className="absolute bottom-3 right-3 glass rounded-full px-3 py-1 text-xs font-medium text-white bg-secondary/80">
                        {clinic.distance}
                      </span>
                    </div>

                    {/* Clinic Info */}
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-display font-semibold text-secondary text-base group-hover:text-primary transition-colors">
                          {clinic.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500 text-xs mb-3">
                        <Star className="size-3.5 fill-current" />
                        <span className="font-semibold text-secondary">{clinic.rating}</span>
                        <span className="text-muted-foreground">({clinic.reviewsCount} reviews)</span>
                      </div>

                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                        <MapPin className="size-3.5 text-primary shrink-0" />
                        {clinic.address}
                      </p>

                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-4">
                        <Clock className="size-3.5 text-primary shrink-0" />
                        {clinic.hours}
                      </p>

                      {/* Treatments list */}
                      <div className="flex flex-wrap gap-1.5">
                        {clinic.treatments.slice(0, 3).map((tr) => (
                          <span
                            key={tr}
                            className="bg-accent/60 text-primary text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-primary/10"
                          >
                            {tr}
                          </span>
                        ))}
                        {clinic.treatments.length > 3 && (
                          <span className="text-[10px] text-muted-foreground font-medium py-0.5">
                            +{clinic.treatments.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card CTAs */}
                  <div className="p-5 pt-0 grid grid-cols-2 gap-2 mt-4">
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full h-9 text-xs border-border bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      <a href="#contact">View Clinic</a>
                    </Button>
                    <Button
                      asChild
                      className="rounded-full h-9 text-xs bg-primary hover:bg-primary/95 text-primary-foreground transition-all cursor-pointer"
                    >
                      <a href="#contact">Book Consult</a>
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-border">
                <p className="font-display font-semibold text-secondary text-lg">No clinics found matching criteria</p>
                <p className="text-sm text-muted-foreground mt-1">Try resetting your search query or treatment filter.</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveFilter("All Treatments");
                  }}
                  className="mt-4 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Interactive Map View Representation */
          <div className="rounded-3xl border border-border bg-white p-6 soft-shadow grid lg:grid-cols-12 gap-6 min-h-[460px]">
            {/* Interactive SVG map illustration */}
            <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-border relative bg-muted/60 min-h-[320px] grid place-items-center">
              <div className="absolute inset-0 bg-[radial-gradient(500px_250px_at_50%_50%,rgba(31,138,112,0.15),transparent)]" />
              <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#mapGrid)" />
              </svg>

              {/* Map pins */}
              {mockClinics.map((c, idx) => {
                const positions = [
                  "top-1/4 left-1/3",
                  "top-1/2 left-2/3",
                  "bottom-1/3 left-1/4",
                  "top-1/3 right-1/4",
                ];
                const isSel = selectedClinic.id === c.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClinic(c)}
                    className={`absolute ${positions[idx]} -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 group cursor-pointer transition-transform ${
                      isSel ? "scale-110 z-20" : "scale-100 z-10 hover:scale-105"
                    }`}
                  >
                    <span
                      className={`grid place-items-center size-10 rounded-full soft-shadow transition-all ${
                        isSel ? "bg-primary text-white ring-4 ring-primary/20" : "bg-secondary text-white"
                      }`}
                    >
                      <MapPin className="size-5" />
                    </span>
                    <span className="glass rounded-full px-3 py-1 text-xs font-semibold text-secondary shadow-md hidden sm:inline-block">
                      {c.name}
                    </span>
                  </button>
                );
              })}

              <div className="absolute bottom-4 left-4 glass rounded-full px-4 py-1.5 text-xs font-medium text-secondary">
                📍 Interactive Copenhagen Dental Network Map
              </div>
            </div>

            {/* Selected Clinic Side Details */}
            <div className="lg:col-span-5 flex flex-col justify-between p-2">
              <div>
                <div className="relative h-44 rounded-2xl overflow-hidden mb-4 border border-border">
                  <img src={selectedClinic.image} alt={selectedClinic.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 glass rounded-full px-3 py-1 text-xs font-semibold text-emerald-700 bg-white/95">
                    {selectedClinic.status}
                  </span>
                </div>

                <h3 className="font-display font-semibold text-xl text-secondary">{selectedClinic.name}</h3>
                <div className="flex items-center gap-1.5 text-amber-500 text-xs mt-1 mb-3">
                  <Star className="size-3.5 fill-current" />
                  <span className="font-semibold text-secondary">{selectedClinic.rating}</span>
                  <span className="text-muted-foreground">({selectedClinic.reviewsCount} reviews)</span>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary shrink-0" /> {selectedClinic.address}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="size-4 text-primary shrink-0" /> {selectedClinic.hours}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="size-4 text-primary shrink-0" /> {selectedClinic.phone}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex items-center gap-3 mt-6">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 rounded-full h-10 text-xs border-border bg-white hover:bg-neutral-50 cursor-pointer"
                >
                  <a href="#contact">View Clinic</a>
                </Button>
                <Button
                  asChild
                  className="flex-1 rounded-full h-10 text-xs bg-primary hover:bg-primary/95 text-primary-foreground cursor-pointer"
                >
                  <a href="#contact">
                    Book Consultation <ArrowRight className="ml-1 size-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
