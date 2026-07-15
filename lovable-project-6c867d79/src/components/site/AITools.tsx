import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Calculator, RefreshCw, Sparkles, PhoneCall, Search } from "lucide-react";
import { Reveal } from "./Reveal";

const symptoms = ["Tooth Pain", "Bleeding Gums", "Sensitivity", "Bad Breath", "Jaw Pain"];
const tips = [
  "Brush for two minutes, twice daily — a soft brush is enough.",
  "Floss before you brush to help fluoride reach between teeth.",
  "Drink water after coffee to protect enamel from staining.",
  "Replace your toothbrush every 90 days, or after any cold.",
  "Chewing sugar-free gum after meals boosts saliva and pH.",
];

export function AITools() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-14">
          <Reveal><span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">AI Toolkit</span></Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05]">
              Answers before you even sit down.
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

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className={`rounded-3xl bg-white border border-border p-6 md:p-7 soft-shadow ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SymptomChecker() {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (s: string) => setSelected((v) => (v.includes(s) ? v.filter((x) => x !== s) : [...v, s]));

  return (
    <Card className="lg:col-span-1">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center size-11 rounded-2xl bg-primary/10 text-primary"><Activity className="size-5" /></span>
        <div><p className="font-display text-lg font-semibold text-secondary">Symptom Checker</p><p className="text-xs text-muted-foreground">AI-guided triage</p></div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {symptoms.map((s) => (
          <button key={s} onClick={() => toggle(s)} className={`text-xs px-3 py-2 rounded-full border transition-colors ${selected.includes(s) ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border hover:border-primary hover:text-primary"}`}>{s}</button>
        ))}
      </div>
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-5 overflow-hidden">
            <div className="rounded-2xl bg-accent/60 border border-primary/15 p-4 text-sm text-secondary">
              <p><b>Possible causes:</b> enamel wear, early gingivitis or a small cavity. We recommend a 15-minute check to confirm.</p>
              <p className="mt-2 text-xs text-muted-foreground">This is guidance only — not a diagnosis.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function CostEstimator() {
  const [treatment, setTreatment] = useState(0);
  const [severity, setSeverity] = useState(1);
  const [teeth, setTeeth] = useState(1);
  const treatments = [{ n: "Cleaning", base: 90 }, { n: "Whitening", base: 320 }, { n: "Implant", base: 2400 }, { n: "Veneer", base: 780 }];
  const cost = Math.round(treatments[treatment].base * severity * teeth);

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="grid place-items-center size-11 rounded-2xl bg-primary/10 text-primary"><Calculator className="size-5" /></span>
        <div><p className="font-display text-lg font-semibold text-secondary">Cost Estimator</p><p className="text-xs text-muted-foreground">Instant, transparent</p></div>
      </div>
      <div className="mt-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {treatments.map((t, i) => (
            <button key={t.n} onClick={() => setTreatment(i)} className={`text-xs px-3 py-1.5 rounded-full border ${treatment === i ? "bg-secondary text-white border-secondary" : "border-border bg-muted"}`}>{t.n}</button>
          ))}
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">Severity: <span className="text-secondary font-medium">{["Mild", "Moderate", "Complex"][severity - 1]}</span></p>
          <input type="range" min={1} max={3} value={severity} onChange={(e) => setSeverity(+e.target.value)} className="w-full accent-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">Teeth involved: <span className="text-secondary font-medium">{teeth}</span></p>
          <input type="range" min={1} max={6} value={teeth} onChange={(e) => setTeeth(+e.target.value)} className="w-full accent-primary" />
        </div>
        <motion.div key={cost} initial={{ scale: 0.96, opacity: 0.7 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl bg-gradient-to-br from-primary to-secondary text-white p-4 flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-widest opacity-80">Estimated</span>
          <span className="font-display text-3xl font-semibold">${cost.toLocaleString()}</span>
        </motion.div>
      </div>
    </Card>
  );
}

function DailyTip() {
  const [i, setI] = useState(0);
  const spin = () => setI((v) => (v + 1) % tips.length);
  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="grid place-items-center size-11 rounded-2xl bg-primary/10 text-primary"><Sparkles className="size-5" /></span>
        <div><p className="font-display text-lg font-semibold text-secondary">Daily Dental Tip</p><p className="text-xs text-muted-foreground">AI-curated</p></div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-6 font-display text-xl text-secondary leading-snug">
          “{tips[i]}”
        </motion.p>
      </AnimatePresence>
      <button onClick={spin} className="mt-6 inline-flex items-center gap-2 text-sm text-primary font-medium hover:gap-3 transition-all">
        <RefreshCw className="size-4" /> New tip
      </button>
    </Card>
  );
}

function SmartSearch() {
  const [q, setQ] = useState("");
  const results = ["Teeth Whitening", "Invisalign Aligners", "Dental Implants", "Root Canal", "Pediatric Cleaning", "Emergency Care"].filter((r) => r.toLowerCase().includes(q.toLowerCase()));
  return (
    <Card className="lg:col-span-2">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center size-11 rounded-2xl bg-primary/10 text-primary"><Search className="size-5" /></span>
        <div><p className="font-display text-lg font-semibold text-secondary">Smart Search</p><p className="text-xs text-muted-foreground">Find any treatment instantly</p></div>
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border bg-muted px-4 py-3">
        <Search className="size-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Try "whitening" or "aligners"' className="flex-1 bg-transparent text-sm outline-none" />
      </div>
      <AnimatePresence>
        {q && (
          <motion.ul initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {results.length === 0 && <li className="p-4 text-sm text-muted-foreground">No matches — ask Aurea AI instead.</li>}
            {results.map((r) => (
              <li key={r}><a href="#services" className="flex items-center justify-between px-4 py-3 text-sm hover:bg-accent/50 transition-colors"><span>{r}</span><span className="text-xs text-primary">View →</span></a></li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </Card>
  );
}

function EmergencyCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className="rounded-3xl p-6 md:p-7 bg-secondary text-white relative overflow-hidden"
    >
      <div className="absolute -top-16 -right-10 size-52 rounded-full bg-primary/30 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center size-11 rounded-2xl bg-white/10"><PhoneCall className="size-5" /></span>
          <div><p className="font-display text-lg font-semibold">Dental Emergency?</p><p className="text-xs text-white/60">24/7 AI triage & on-call dentist</p></div>
        </div>
        <p className="mt-5 text-sm text-white/80 leading-relaxed">If you're bleeding, in severe pain, or a tooth was knocked out — call us. Aurea AI will prep the clinician before you arrive.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="tel:+15551234567" className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 text-sm font-medium">
            <PhoneCall className="size-4" /> Call Clinic
          </a>
          <a href="#contact" className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white px-5 py-3 text-sm font-medium">
            Book urgent slot
          </a>
        </div>
      </div>
    </motion.div>
  );
}