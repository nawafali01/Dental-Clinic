import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";
import { axiosInstance } from "@/services/api/axiosInstance";
import { Card } from "./Card";

export function SymptomChecker() {
  const [dbSymptoms, setDbSymptoms] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const response = await axiosInstance.get("/symptoms");
        setDbSymptoms(response.data);
      } catch (error) {
        console.error("Could not load symptoms from backend", error);
        setDbSymptoms([]);
      }
    };
    fetchSymptoms();
  }, []);

  const toggle = (sName) =>
    setSelected((v) =>
      v.includes(sName) ? v.filter((x) => x !== sName) : [...v, sName]
    );

  const selectedDetails = dbSymptoms.filter((s) => selected.includes(s.name));

  return (
    <Card className="lg:col-span-1">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center size-11 rounded-2xl bg-primary/10 text-primary">
          <Activity className="size-5" />
        </span>
        <div>
          <p className="font-display text-lg font-semibold text-secondary">Symptom Checker</p>
          <p className="text-xs text-muted-foreground">AI-guided triage</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {dbSymptoms.map((s) => (
          <button
            key={s.name}
            onClick={() => toggle(s.name)}
            className={`text-xs px-3 py-2 rounded-full border cursor-pointer transition-colors ${
              selected.includes(s.name)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted border-border hover:border-primary hover:text-primary"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 overflow-hidden"
          >
            <div className="rounded-2xl bg-accent/60 border border-primary/15 p-4 text-sm text-secondary space-y-2">
              <div>
                <b>Possible causes & advice:</b>
                <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                  {selectedDetails.map((det, idx) => (
                    <li key={idx}>
                      <span className="font-semibold text-primary">
                        {det.name} ({det.severity || "Advice"}):
                      </span>{" "}
                      {det.advice}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                This is guidance only — not a diagnosis.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
