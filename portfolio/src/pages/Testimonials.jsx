import { motion } from "framer-motion";
import { Reveal, stagger, staggerItem } from "@/shared/ui/Reveal";
import { Star, Quote, Heart, CheckCircle2, TrendingUp } from "lucide-react";
import doctor1 from "@/assets/images/doctor-1.jpg";
import doctor2 from "@/assets/images/doctor-2.jpg";
import doctor3 from "@/assets/images/doctor-3.jpg";

const stats = [
  { val: "12,000+", label: "Happy Patients", desc: "Smiles restored and protected" },
  { val: "99.2%", label: "Satisfaction Rate", desc: "Based on post-treatment audits" },
  { val: "15+", label: "Years of Care", desc: "Clinical excellence in practice" },
  { val: "4.9/5", label: "Google Rating", desc: "Over 800 certified reviews" },
];

const patientStories = [
  {
    name: "Eleanor Vance",
    age: "34, Designer",
    treatment: "Cosmetic Veneers",
    quote: "My teeth had gaps and stains that I was always conscious of. Dr. Reyes spent hours designing the templates, explaining every step. On the day of mapping, I cried tears of joy. Aurea didn't just fix my smile, they cured my social anxiety.",
    img: doctor1
  },
  {
    name: "Raymond Chen",
    age: "52, Analyst",
    treatment: "Full Arch Dental Implants",
    quote: "After losing my molars, chewing became painful. Dr. Vance used 3D guidance tools to place the implants. The process felt extremely premium, and today I can eat, speak, and laugh without thinking twice about my teeth.",
    img: doctor2
  }
];

const reviewCards = [
  { author: "Sarah L.", rating: 5, date: "2 weeks ago", treatment: "Teeth Whitening", text: "Incredible clinic! The laser whitening took less than an hour and took my teeth 6 shades whiter. No sensitivity issues which was my biggest fear!" },
  { author: "Gregory M.", rating: 5, date: "1 month ago", treatment: "Invisalign Aligners", text: "Clean modern design, helpful staff, and clear pricing structure. The AI simulation showed me what my teeth would look like, and the trays fit perfectly." },
  { author: "Hanna S.", rating: 5, date: "2 months ago", treatment: "Emergency Care", text: "Cracked my crown late on Sunday. They responded to the emergency line immediately and had me fitted with a temporary by Monday morning." },
  { author: "Nate K.", rating: 5, date: "3 months ago", treatment: "General Hygiene", text: "Best scaling experience of my life. They used warm water air sprays instead of metal scraping. Felt like a facial for my teeth." },
];

export default function Testimonials() {
  return (
    <div className="bg-background">
      {/* ── Hero Banner ── */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/60 via-background to-background" />
        <div className="max-w-7xl mx-auto px-5 md:px-8 text-center text-secondary">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-secondary border border-primary/10">
              Honest Feedback
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display font-semibold text-4xl sm:text-6xl tracking-tight leading-tight">
              Real smiles. <br />
              <span className="text-gradient-primary">Real stories.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl mx-auto text-sm md:text-base text-muted-foreground leading-relaxed">
              Nothing speaks louder than the health and confidence of our patients. Read about their customized treatment journeys at Aurea Dental.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Numerical Statistics ── */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, idx) => (
              <Reveal key={s.label} delay={idx * 0.05}>
                <div className="rounded-[28px] border border-border bg-white p-6 shadow-sm text-center flex flex-col justify-center h-full">
                  <div className="font-display text-3xl md:text-4xl font-bold text-primary">{s.val}</div>
                  <div className="font-semibold text-sm text-secondary mt-2">{s.label}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Patient Stories Section ── */}
      <section className="py-24 bg-muted/40">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-16">
            <Reveal><span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">In-Depth Case Studies</span></Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-secondary">
                Patient Transformation Stories
              </h2>
            </Reveal>
          </div>

          <div className="space-y-12">
            {patientStories.map((story, idx) => (
              <Reveal key={story.name} delay={idx * 0.1}>
                <div className="bg-white border border-border soft-shadow rounded-[32px] overflow-hidden grid lg:grid-cols-12 gap-8 p-6 lg:p-8">
                  {/* Photo details */}
                  <div className="lg:col-span-4 aspect-square rounded-2xl overflow-hidden bg-muted relative">
                    <img src={story.img} alt={story.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 via-transparent to-transparent" />
                  </div>
                  {/* Words */}
                  <div className="lg:col-span-8 flex flex-col justify-center">
                    <Quote className="size-10 text-primary/20 mb-4" />
                    <p className="text-sm md:text-base text-secondary font-medium italic leading-relaxed">
                      "{story.quote}"
                    </p>
                    <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                      <div>
                        <h4 className="font-display font-semibold text-secondary">{story.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{story.age}</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-accent text-primary">
                        <CheckCircle2 className="size-3.5" /> Checked {story.treatment}
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews Grid ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14">
            <Reveal><span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Certified Ratings</span></Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-secondary">
                Google & Trustpilot Reviews
              </h2>
            </Reveal>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviewCards.map((rc, idx) => (
              <Reveal key={idx} delay={idx * 0.05}>
                <div className="rounded-3xl border border-border bg-white p-6 soft-shadow flex flex-col justify-between h-full">
                  <div>
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(rc.rating)].map((_, i) => (
                        <Star key={i} className="size-3.5 text-primary fill-primary" />
                      ))}
                    </div>
                    <p className="text-xs text-secondary/90 leading-relaxed font-sans min-h-[72px]">
                      "{rc.text}"
                    </p>
                  </div>
                  <div className="mt-5 border-t border-neutral-50 pt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                    <div>
                      <span className="font-semibold text-secondary">{rc.author}</span>
                      <span className="block text-[10px] mt-0.5">{rc.treatment}</span>
                    </div>
                    <span>{rc.date}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
