import { Reveal } from "@/shared/ui/Reveal";
import { AI_SECTION_META } from "./aiSectionConstants";
import { SymptomChecker } from "./components/SymptomChecker";
import { CostEstimator } from "./components/CostEstimator";
import { DailyTip } from "./components/DailyTip";
import { SmartSearch } from "./components/SmartSearch";
import { EmergencyCard } from "./components/EmergencyCard";

export function AISection() {
  return (
    <section id="ai" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-14">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {AI_SECTION_META.sectionLabel}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05]">
              {AI_SECTION_META.heading}
            </h2>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <SymptomChecker />
          <CostEstimator />
          <DailyTip />
          <SmartSearch />
          <EmergencyCard />
        </div>
      </div>
    </section>
  );
}
