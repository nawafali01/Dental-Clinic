import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Sparkles } from "lucide-react";
import { axiosInstance } from "@/services/api/axiosInstance";
import { Card } from "./Card";

export function DailyTip() {
  const [dbTips, setDbTips] = useState([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const response = await axiosInstance.get("/tips");
        setDbTips(response.data);
      } catch (error) {
        console.error("Could not load tips from backend", error);
        setDbTips([]);
      }
    };
    fetchTips();
  }, []);

  const spin = () => {
    if (dbTips.length > 0) setI((v) => (v + 1) % dbTips.length);
  };

  const currentTip = dbTips[i]?.text || "";

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="grid place-items-center size-11 rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-5" />
        </span>
        <div>
          <p className="font-display text-lg font-semibold text-secondary">Daily Dental Tip</p>
          <p className="text-xs text-muted-foreground">AI-curated</p>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-6 font-display text-xl text-secondary leading-snug min-h-[5.5rem]"
        >
          {currentTip ? `"${currentTip}"` : "Loading tip..."}
        </motion.p>
      </AnimatePresence>
      <button
        onClick={spin}
        className="mt-6 inline-flex items-center gap-2 text-sm text-primary font-medium hover:gap-3 cursor-pointer transition-all"
      >
        <RefreshCw className="size-4" /> New tip
      </button>
    </Card>
  );
}
