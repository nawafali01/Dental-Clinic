import { HEALTHCARE_PARTNERS, MARQUEE_TITLE } from "../useGreeting";

export function HeroLogoMarquee() {
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 mt-16 md:mt-24">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6 font-display font-semibold">
        {MARQUEE_TITLE}
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex gap-16 items-center shrink-0">
              {HEALTHCARE_PARTNERS.map((partnerName) => (
                <span
                  key={`${partnerName}-${k}`}
                  className="font-display text-xl font-semibold text-secondary/40 tracking-tight"
                >
                  {partnerName}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
