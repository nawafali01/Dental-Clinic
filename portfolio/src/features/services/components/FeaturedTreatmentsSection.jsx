import { Reveal } from "@/shared/ui/Reveal";

export function FeaturedTreatmentsSection({ featuredTreatments = [] }) {
  return (
    <section className="py-24 md:py-32 bg-muted/50">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="text-center mb-14">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Most popular
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05]">
              Featured treatments.
            </h2>
          </Reveal>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredTreatments.map(({ icon: Icon, label, title, price, body, img }, i) => (
            <Reveal key={title} delay={i * 0.07}>
              <div className="group relative rounded-[32px] overflow-hidden soft-shadow border border-border h-[420px] flex flex-col justify-end p-6 hover:-translate-y-2 transition-all duration-300">
                <div className="absolute inset-0 z-0">
                  <img
                    src={img}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/75 to-transparent" />
                </div>
                <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                  <span className="border border-primary/20 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-3.5 text-primary transition-colors duration-300 group-hover:text-white" />{" "}
                    {label}
                  </span>
                </div>
                <div className="relative z-10 text-white">
                  <h3 className="font-display text-2xl font-semibold leading-tight">
                    {title}
                  </h3>
                  <p className="text-sm font-semibold text-primary mt-1">
                    {price}
                  </p>
                  <p className="mt-2 text-xs text-white/80 leading-relaxed font-sans opacity-95 group-hover:opacity-100 transition-opacity">
                    {body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
