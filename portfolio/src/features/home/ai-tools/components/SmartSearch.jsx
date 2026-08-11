import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { SMART_SEARCH_OPTIONS } from "../aiSectionConstants";
import { Card } from "./Card";

export function SmartSearch() {
  const [q, setQ] = useState("");
  const results = SMART_SEARCH_OPTIONS.filter((r) =>
    r.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Card className="lg:col-span-2">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center size-11 rounded-2xl bg-primary/10 text-primary">
          <Search className="size-5" />
        </span>
        <div>
          <p className="font-display text-lg font-semibold text-secondary">Smart Search</p>
          <p className="text-xs text-muted-foreground">Find any treatment instantly</p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border bg-muted px-4 py-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Try "whitening" or "aligners"'
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      <AnimatePresence>
        {q && (
          <motion.ul
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 rounded-2xl border border-border divide-y divide-border overflow-hidden bg-white soft-shadow"
          >
            {results.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">
                No matches — ask Aurea AI instead.
              </li>
            )}
            {results.map((r) => (
              <li key={r}>
                <a
                  href="#services"
                  className="flex items-center justify-between px-4 py-3 text-sm text-secondary hover:bg-accent/50 hover:text-primary transition-colors"
                >
                  <span>{r}</span>
                  <span className="text-xs text-primary">View →</span>
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </Card>
  );
}
