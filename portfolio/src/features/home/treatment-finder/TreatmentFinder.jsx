import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, Smile, Zap, Crown, ShieldPlus } from "lucide-react";
import { Reveal } from "@/shared/ui/Reveal";
import { Button } from "@/shared/ui/Button";
import { treatmentQuestions, mockRecommendations } from "@/data/treatments";

import { TreatmentHeader } from "./TreatmentHeader";
import { QuestionOptions } from "./QuestionOptions";
import { RecommendationCard } from "./RecommendationCard";

const STORAGE_KEY = "aurea_treatment_finder_saved_state";

const iconMap = {
  Smile,
  Sparkles,
  Zap,
  Crown,
  ShieldPlus,
};

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir < 0 ? 40 : -40, opacity: 0 }),
};

export function TreatmentFinder() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { }
    return {
      reason: "missing",
      ageGroup: "18-35",
      budget: "premium",
      location: "copenhagen-downtown",
      financing: "yes-monthly",
    };
  });

  const [hasSavedSession, setHasSavedSession] = useState(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch { }
  }, [answers]);

  const totalSteps = 5;
  const currentStepKey = `step${step}`;
  const currentConfig = treatmentQuestions[currentStepKey];

  const handleSelectOption = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (step <= totalSteps) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const handleReset = () => {
    setDirection(-1);
    setStep(1);
    setAnswers({
      reason: "missing",
      ageGroup: "18-35",
      budget: "premium",
      location: "copenhagen-downtown",
      financing: "yes-monthly",
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHasSavedSession(false);
    } catch { }
  };

  const handleSaveSession = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
      setHasSavedSession(true);
    } catch { }
  };

  const recommendation = mockRecommendations[answers.reason] || mockRecommendations.missing;

  return (
    <section id="treatment-finder" className="relative py-20 md:py-28 bg-muted/40">
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-primary border border-primary/15">
              <Sparkles className="size-3.5" /> Interactive Care Guide
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-secondary leading-[1.08]">
              Discover your custom treatment plan.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-3 text-muted-foreground text-sm md:text-base">
              Answer 5 quick questions to receive instant personalized clinical recommendations & price estimates.
            </p>
          </Reveal>
        </div>

        <div className="rounded-[32px] bg-white border border-border soft-shadow p-6 md:p-10 relative overflow-hidden">
          <TreatmentHeader
            step={step}
            totalSteps={totalSteps}
            title={currentConfig?.title}
            hasSavedSession={hasSavedSession}
            onReset={handleReset}
          />

          <div className="min-h-[340px] flex flex-col justify-between">
            <AnimatePresence mode="wait" custom={direction}>
              {step <= totalSteps ? (
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <QuestionOptions
                    config={currentConfig}
                    selectedOption={answers[currentConfig?.id]}
                    iconMap={iconMap}
                    onSelectOption={handleSelectOption}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="final"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <RecommendationCard recommendation={recommendation} onReset={handleReset} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Controls */}
            {step <= totalSteps && (
              <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  disabled={step === 1}
                  className="rounded-full h-10 px-4 border-border text-sm cursor-pointer disabled:opacity-40"
                >
                  <ArrowLeft className="mr-1 size-4" /> Previous
                </Button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveSession}
                    className="hidden sm:inline-block text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer transition-colors"
                  >
                    Save & Resume Later
                  </button>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="rounded-full h-10 px-6 bg-primary hover:bg-primary/95 text-primary-foreground text-sm cursor-pointer shadow-sm"
                  >
                    {step === totalSteps ? "See Recommendation" : "Next Step"}
                    <ArrowRight className="ml-1.5 size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}