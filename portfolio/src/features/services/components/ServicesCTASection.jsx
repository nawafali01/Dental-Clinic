import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/shared/ui/Reveal";
import { Button } from "@/shared/ui/Button";
import { ROUTES } from "@/constants/routes";

export function ServicesCTASection() {
  return (
    <section className="py-24 md:py-32 bg-muted/50">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <Reveal>
          <div className="rounded-[32px] bg-gradient-to-br from-primary to-secondary p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute -top-20 -left-20 size-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 size-72 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Zero pressure
              </p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold leading-tight">
                Not sure where to start?
              </h2>
              <p className="mt-4 text-white/80 max-w-xl mx-auto leading-relaxed">
                Book a free consultation and let our clinicians guide you
                through the best treatment plan for your needs and budget.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button
                  asChild
                  className="rounded-full h-12 px-7 bg-white text-secondary hover:bg-white/90 font-semibold shadow-lg transition-all"
                >
                  <Link to={ROUTES.BOOKING}>
                    Book Free Consultation{" "}
                    <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  className="rounded-full h-12 px-6 bg-primary hover:bg-primary/90 text-white border-none shadow-lg transition-colors"
                >
                  <Link to={ROUTES.ABOUT}>About Our Clinic</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
