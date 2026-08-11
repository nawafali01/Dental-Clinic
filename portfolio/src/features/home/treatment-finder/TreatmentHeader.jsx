import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

export function TreatmentHeader({
  step,
  totalSteps,
  title,
  hasSavedSession,
  onReset,
}) {
  const isFinal = step > totalSteps;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border mb-8">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center size-9 rounded-xl bg-accent text-primary font-display font-semibold text-sm">
            {!isFinal ? `0${step}` : "✓"}
          </span>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              {!isFinal ? `Step ${step} of ${totalSteps}` : "Recommendation Ready"}
            </p>
            <p className="text-sm font-semibold text-secondary">
              {!isFinal ? title : "Your Personalized Smile Plan"}
            </p>
          </div>
        </div>

        {hasSavedSession && !isFinal && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-primary font-medium bg-accent/60 px-3 py-1 rounded-full border border-primary/10">
              Autosaved progress
            </span>
            <button
              onClick={onReset}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="size-3" /> Reset
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-8">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
          initial={{ width: "20%" }}
          animate={{ width: `${(Math.min(step, totalSteps) / totalSteps) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </>
  );
}
