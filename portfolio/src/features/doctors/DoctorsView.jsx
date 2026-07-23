import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Reveal, stagger, staggerItem } from "@/shared/ui/Reveal";
import { Button } from "@/shared/ui/Button";
import { CalendarPlus, User, Star, Award, ShieldCheck } from "lucide-react";
import { getDoctors } from "@/services/api/doctor.api";
import { fallbackDoctors, doctorAssetMap, doctorCategories } from "./data";

export function DoctorsView() {
  const [team, setTeam] = useState([]);
  const [activeCat, setActiveCat] = useState("All");

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const items = await getDoctors();
        if (items && items.length > 0) {
          const normalized = items.map((doc, idx) => {
            const fileName = doc.img?.split("/").pop();
            const localImg = doctorAssetMap[fileName] ?? doc.img;
            return {
              _id: doc._id || String(idx + 1),
              name: doc.name,
              role: doc.role,
              edu: doc.edu,
              exp: doc.exp,
              img: localImg,
              category: doc.category || (idx === 0 ? "Cosmetic" : idx === 1 ? "Implantology" : "Pediatric"),
              certs: doc.certs || (idx === 0 ? ["Invisalign Diamond Provider", "AACD Accredited"] : idx === 1 ? ["Board Certified Oral Surgeon", "ICOI Fellow"] : ["AAPD Member", "Laser Dentistry Certified"]),
            };
          });
          setTeam(normalized);
        } else {
          setTeam(fallbackDoctors);
        }
      } catch (error) {
        console.warn("Could not retrieve team from backend, using fallbacks", error);
        setTeam(fallbackDoctors);
      }
    };
    fetchTeam();
  }, []);

  const filtered = team.filter(d => activeCat === "All" || d.category === activeCat);

  return (
    <div className="bg-background">
      {/* ── Hero Banner ── */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/60 via-background to-background" />
          <div className="absolute -top-24 -left-24 size-[480px] bg-primary/20 blur-3xl animate-blob" />
          <div className="absolute top-40 -right-32 size-[520px] bg-secondary/15 blur-3xl animate-blob [animation-delay:-4s]" />
          <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:22px_22px]" />
        </div>
        <div className="max-w-7xl mx-auto px-5 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-secondary border border-primary/15"
          >
            <span className="size-2 rounded-full bg-primary" />
            Empathetic, Accredited Dentists
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-6 font-display font-semibold text-[2.6rem] sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-secondary"
          >
            Meet our elite<br />
            <span className="text-gradient-primary">clinical experts.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.22 }}
            className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed"
          >
            Aurea clinicians are recruited from top-tier institutions, bringing decades of combined experience, continuous scientific training, and a deep listening-first ethos.
          </motion.p>
        </div>
      </section>

      {/* ── Filters ── */}
      <section className="pb-10">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <Reveal>
            <div className="flex flex-wrap justify-center gap-2">
              {doctorCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`px-5 py-2.5 text-sm font-medium rounded-full border cursor-pointer transition-all ${
                    activeCat === cat
                      ? "bg-secondary text-secondary-foreground border-secondary"
                      : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Doctors Grid ── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          {filtered.length > 0 ? (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.05 }}
              className="grid md:grid-cols-3 gap-8"
            >
              {filtered.map(d => (
                <motion.article
                  variants={staggerItem}
                  key={d._id}
                  className="group relative rounded-[28px] overflow-hidden bg-white border border-border soft-shadow hover:shadow-[0_20px_60px_-15px_rgba(44,62,80,0.15)] transition-shadow duration-300 flex flex-col h-full"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    <img
                      src={d.img}
                      alt={d.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[700ms] ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/15 to-transparent" />
                    <div className="absolute top-4 left-4 glass rounded-full px-3 py-1 text-xs font-semibold text-secondary border border-white/20">
                      {d.exp} Experience
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-xs text-white/85 uppercase tracking-wider font-semibold">{d.role}</p>
                      <h3 className="font-display text-2xl font-bold text-white mt-1">{d.name}</h3>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium text-secondary/80 flex items-center gap-1.5">
                        <Award className="size-4 text-primary shrink-0" /> {d.edu}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {d.certs?.map(c => (
                          <span key={c} className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-accent text-primary border border-primary/10">
                            <ShieldCheck className="size-3 shrink-0" /> {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <Link
                        to={`/doctors/${d._id}`}
                        className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-white text-secondary py-3 text-xs font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
                      >
                        <User className="size-3.5" /> View Profile
                      </Link>
                      <Link
                        to={`/book-appointment?doctor=${d._id}`}
                        className="flex items-center justify-center gap-1.5 rounded-full bg-primary text-primary-foreground py-3 text-xs font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer"
                      >
                        <CalendarPlus className="size-3.5" /> Book Doctor
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <Star className="size-12 text-primary/30 mx-auto mb-4" />
              <p className="font-display text-lg font-semibold text-secondary">No doctors found</p>
              <button onClick={() => setActiveCat("All")} className="mt-4 text-sm font-medium text-primary hover:underline cursor-pointer">
                Show all clinicians
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Large CTA Block ── */}
      <section className="py-24 bg-muted/40">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <Reveal>
            <div className="rounded-[32px] bg-secondary text-white p-10 md:p-16 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 size-80 rounded-full bg-primary/30 blur-3xl animate-blob" />
              <div className="absolute -bottom-32 -left-24 size-80 rounded-full bg-primary/20 blur-3xl animate-blob [animation-delay:-3s]" />
              <div className="relative text-center max-w-xl mx-auto">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Need urgent care?</span>
                <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold leading-tight">
                  Consult with our specialists this week.
                </h2>
                <p className="mt-4 text-white/80 text-sm leading-relaxed">
                  We maintain slots for dental emergencies and urgent diagnostics. Speak to Aurea's front desk or book easily online.
                </p>
                <div className="mt-8 flex justify-center">
                  <Button asChild className="rounded-full h-12 px-8 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-lg shadow-primary/30 transition-all cursor-pointer">
                    <a href="/book-appointment">Book Instant Consultation</a>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
