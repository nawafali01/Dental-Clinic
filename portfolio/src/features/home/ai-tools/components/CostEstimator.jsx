import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
import { COST_TREATMENTS } from "../aiSectionConstants";
import { Card } from "./Card";

export function CostEstimator() {
  const [treatment, setTreatment] = useState(0);
  const [severity, setSeverity] = useState(1);
  const [teeth, setTeeth] = useState(1);
  const cost = Math.round(COST_TREATMENTS[treatment].base * severity * teeth);

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="grid place-items-center size-11 rounded-2xl bg-primary/10 text-primary">
          <Calculator className="size-5" />
        </span>
        <div>
          <p className="font-display text-lg font-semibold text-secondary">Cost Estimator</p>
          <p className="text-xs text-muted-foreground">Instant, transparent</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {COST_TREATMENTS.map((t, i) => (
            <button
              key={t.n}
              onClick={() => setTreatment(i)}
              className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer ${
                treatment === i
                  ? "bg-secondary text-white border-secondary"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              {t.n}
            </button>
          ))}
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Severity:{" "}
            <span className="text-secondary font-semibold">
              {["Mild", "Moderate", "Complex"][severity - 1]}
            </span>
          </p>
          <input
            type="range" min={1} max={3} value={severity}
            onChange={(e) => setSeverity(+e.target.value)}
            className="w-full accent-primary cursor-pointer"
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Teeth involved:{" "}
            <span className="text-secondary font-semibold">{teeth}</span>
          </p>
          <input
            type="range" min={1} max={6} value={teeth}
            onChange={(e) => setTeeth(+e.target.value)}
            className="w-full accent-primary cursor-pointer"
          />
        </div>
        <motion.div
          key={cost}
          initial={{ scale: 0.96, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl bg-gradient-to-br from-primary to-secondary text-white p-4 flex items-baseline justify-between shadow-[0_8px_20px_-6px_rgba(31,138,112,0.4)]"
        >
          <span className="text-xs uppercase tracking-widest opacity-80">Estimated</span>
          <span className="font-display text-3xl font-semibold">${cost.toLocaleString()}</span>
        </motion.div>
      </div>
    </Card>
  );
}
