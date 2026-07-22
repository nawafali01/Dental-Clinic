import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Calendar,
  UserCheck,
  DollarSign,
  MapPin,
  Smile,
  Zap,
  Crown,
  ShieldPlus,
} from "lucide-react";
import { Reveal } from "@/shared/ui/Reveal";
import { Button } from "@/shared/ui/Button";
import { treatmentQuestions, mockRecommendations } from "@/data/treatments";

const STORAGE_KEY = "aurea_treatment_finder_saved_state";

const iconMap = {
  Smile: Smile,
  Sparkles: Sparkles,
  Zap: Zap,
  Crown: Crown,
  ShieldPlus: ShieldPlus,
};

export function TreatmentFinder() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
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

  // Autosave to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      // ignore
    }
  }, [answers]);

  const totalSteps = 5;
  const currentStepKey = `step${step}`;
  const currentConfig = treatmentQuestions[currentStepKey];

  const handleSelectOption = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
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
    } catch {
      // ignore
    }
  };

  const recommendation = mockRecommendations[answers.reason] || mockRecommendations.missing;

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir < 0 ? 40 : -40,
      opacity: 0,
    }),
  };

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
          {/* Top Progress Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border mb-8">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center size-9 rounded-xl bg-accent text-primary font-display font-semibold text-sm">
                {step <= totalSteps ? `0${step}` : "✓"}
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  {step <= totalSteps ? `Step ${step} of ${totalSteps}` : "Recommendation Ready"}
                </p>
                <p className="text-sm font-semibold text-secondary">
                  {step <= totalSteps ? currentConfig.title : "Your Personalized Smile Plan"}
                </p>
              </div>
            </div>

            {hasSavedSession && step <= totalSteps && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-primary font-medium bg-accent/60 px-3 py-1 rounded-full border border-primary/10">
                  Autosaved progress
                </span>
                <button
                  onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="size-3" /> Reset
                </button>
              </div>
            )}
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-8">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              initial={{ width: "20%" }}
              animate={{ width: `${(Math.min(step, totalSteps) / totalSteps) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          {/* Stepper Content */}
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
                  className="space-y-6"
                >
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-secondary">
                    {currentConfig.title}
                  </h3>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentConfig.options.map((opt) => {
                      const isSelected = answers[currentConfig.id] === opt.id;
                      const IconComp = opt.icon ? iconMap[opt.icon] : null;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(currentConfig.id, opt.id)}
                          className={`relative text-left p-5 rounded-2xl border transition-all cursor-pointer group ${
                            isSelected
                              ? "bg-accent/40 border-primary shadow-[0_4px_20px_-4px_rgba(31,138,112,0.25)]"
                              : "bg-white border-border hover:border-primary/40 hover:bg-neutral-50/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            {IconComp ? (
                              <span
                                className={`grid place-items-center size-10 rounded-xl transition-colors ${
                                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-secondary group-hover:bg-accent group-hover:text-primary"
                                }`}
                              >
                                <IconComp className="size-5" />
                              </span>
                            ) : (
                              <span className="size-2 rounded-full bg-primary/40" />
                            )}
                            {isSelected && (
                              <CheckCircle2 className="size-5 text-primary shrink-0 ml-2" />
                            )}
                          </div>

                          <p className="mt-4 font-display font-semibold text-secondary text-base">
                            {opt.label}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            {opt.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                /* Final Screen Recommendation */
                <motion.div
                  key="final"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="rounded-3xl bg-gradient-to-br from-secondary via-secondary/95 to-secondary text-white p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 size-60 rounded-full bg-primary/30 blur-3xl" />
                    
                    <div className="relative">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-white/90 mb-4 border border-white/15">
                        <Sparkles className="size-3.5 text-primary" /> Recommended Match
                      </span>

                      <h3 className="font-display text-2xl md:text-3xl font-semibold">
                        {recommendation.title}
                      </h3>
                      <p className="mt-2 text-white/80 text-sm md:text-base leading-relaxed max-w-2xl">
                        {recommendation.summary}
                      </p>

                      <div className="mt-6 grid sm:grid-cols-3 gap-4 pt-6 border-t border-white/15">
                        <div className="flex items-center gap-3">
                          <span className="grid place-items-center size-9 rounded-xl bg-white/10 text-primary">
                            <Calendar className="size-4" />
                          </span>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-white/60">Estimated Time</p>
                            <p className="text-xs font-medium text-white">{recommendation.timeline}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="grid place-items-center size-9 rounded-xl bg-white/10 text-primary">
                            <UserCheck className="size-4" />
                          </span>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-white/60">Lead Clinician</p>
                            <p className="text-xs font-medium text-white">{recommendation.doctor}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="grid place-items-center size-9 rounded-xl bg-white/10 text-primary">
                            <DollarSign className="size-4" />
                          </span>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-white/60">Est. Investment</p>
                            <p className="text-xs font-semibold text-white">{recommendation.priceEst}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                    <button
                      onClick={handleReset}
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
                    onClick={() => {
                      try {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
                        setHasSavedSession(true);
                      } catch {
                        // ignore
                      }
                    }}
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
