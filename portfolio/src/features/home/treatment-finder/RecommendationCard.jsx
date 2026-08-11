import { Sparkles, Calendar, UserCheck, DollarSign, RotateCcw, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/Button";

export function RecommendationCard({
  recommendation,
  onReset,
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-secondary via-secondary/95 to-secondary text-white p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 size-60 rounded-full bg-primary/30 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-white/90 mb-4 border border-white/15">
            <Sparkles className="size-3.5 text-primary" /> Recommended Match
          </span>

          <h3 className="font-display text-2xl md:text-3xl font-semibold">
            {recommendation?.title}
          </h3>
          <p className="mt-2 text-white/80 text-sm md:text-base leading-relaxed max-w-2xl">
            {recommendation?.summary}
          </p>

          <div className="mt-6 grid sm:grid-cols-3 gap-4 pt-6 border-t border-white/15">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center size-9 rounded-xl bg-white/10 text-primary">
                <Calendar className="size-4" />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/60">Estimated Time</p>
                <p className="text-xs font-medium text-white">{recommendation?.timeline}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="grid place-items-center size-9 rounded-xl bg-white/10 text-primary">
                <UserCheck className="size-4" />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/60">Lead Clinician</p>
                <p className="text-xs font-medium text-white">{recommendation?.doctor}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="grid place-items-center size-9 rounded-xl bg-white/10 text-primary">
                <DollarSign className="size-4" />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/60">Est. Investment</p>
                <p className="text-xs font-semibold text-white">{recommendation?.priceEst}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <RotateCcw className="size-3.5" /> Retake Questionnaire
        </button>

        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            variant="outline"
            className="rounded-full h-11 px-5 border-border bg-white hover:bg-neutral-50 transition-colors cursor-pointer text-sm"
          >
            <a href="#clinics">
              <MapPin className="mr-1.5 size-4 text-primary" /> Find Nearby Clinic
            </a>
          </Button>
          <Button
            asChild
            className="rounded-full h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all cursor-pointer text-sm"
          >
            <a href="#contact">
              Book Consultation <ArrowRight className="ml-1.5 size-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
