import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function Field({ label, type = "text", textarea = false }: { label: string; type?: string; textarea?: boolean }) {
  const [v, setV] = useState("");
  const filled = v.length > 0;
  const Inp: React.ElementType = textarea ? "textarea" : "input";
  return (
    <label className="relative block group">
      <Inp
        type={type}
        value={v}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV(e.target.value)}
        rows={textarea ? 4 : undefined}
        className={`peer w-full rounded-2xl bg-white border border-border px-4 pt-6 pb-2.5 text-sm outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_rgba(31,138,112,0.12)] ${textarea ? "resize-none" : ""}`}
        placeholder=" "
      />
      <span className={`pointer-events-none absolute left-4 transition-all text-muted-foreground ${filled ? "top-2 text-[10px] uppercase tracking-widest text-primary" : "top-4 text-sm peer-focus:top-2 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-primary"}`}>
        {label}
      </span>
    </label>
  );
}

export function Contact() {
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thanks! We'll be in touch within one business hour.");
  };
  return (
    <section id="contact" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <Reveal><span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Contact</span></Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05]">
              Book a visit, or just say hi.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-muted-foreground leading-relaxed max-w-md">
              Prefer talking? Call us. Prefer texting? Aurea AI is on. We reply to every message.
            </p>
          </Reveal>

          <div className="mt-8 space-y-3">
            {[
              { Icon: MapPin, t: "Studio", b: "108 Nordic Ave, Copenhagen" },
              { Icon: Phone, t: "Phone", b: "+1 (555) 123-4567" },
              { Icon: Mail, t: "Email", b: "hello@aurea.dental" },
              { Icon: Clock, t: "Hours", b: "Mon–Sat · 8am – 8pm" },
            ].map((c) => (
              <div key={c.t} className="flex items-start gap-4 rounded-2xl bg-white border border-border p-4 hover:border-primary/40 transition-colors">
                <span className="grid place-items-center size-11 rounded-xl bg-accent text-primary shrink-0"><c.Icon className="size-5" /></span>
                <div><p className="text-xs uppercase tracking-widest text-muted-foreground">{c.t}</p><p className="text-secondary font-medium">{c.b}</p></div>
              </div>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-6 rounded-3xl overflow-hidden border border-border relative aspect-[16/10] bg-muted">
              <div className="absolute inset-0 bg-[radial-gradient(600px_300px_at_30%_40%,rgba(31,138,112,0.25),transparent),linear-gradient(180deg,#eef4f6,#dbe6ea)]" />
              <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#94a3b8" strokeWidth="0.5" /></pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="relative grid place-items-center size-12 rounded-full bg-primary text-primary-foreground soft-shadow animate-pulse-ring">
                  <MapPin className="size-5" />
                </span>
              </div>
              <div className="absolute bottom-3 left-3 glass rounded-full px-3 py-1 text-xs font-medium text-secondary">Aurea Dental · Nordic Ave</div>
            </div>
          </Reveal>
        </div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="lg:col-span-7 rounded-[32px] bg-white border border-border soft-shadow p-6 md:p-10"
        >
          <p className="font-display text-2xl font-semibold text-secondary">Book your appointment</p>
          <p className="text-sm text-muted-foreground mt-1">We usually respond within an hour.</p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <Field label="Full name" />
            <Field label="Email address" type="email" />
            <Field label="Phone number" type="tel" />
            <Field label="Preferred date" type="date" />
          </div>
          <div className="mt-4">
            <Field label="Tell us what you need" textarea />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground max-w-xs">By submitting you agree to our privacy terms. We never share your info.</p>
            <Button type="submit" className="rounded-full h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Send className="mr-1.5 size-4" /> Send request
            </Button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}