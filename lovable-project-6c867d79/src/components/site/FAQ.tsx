import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "./Reveal";

const faqs = [
  { q: "How do I book my first appointment?", a: "Tap Book Appointment or chat with Aurea AI — we'll match you to the right clinician and find a time that fits, often same-week." },
  { q: "Do you accept insurance?", a: "We work with most major providers and offer transparent self-pay pricing with 0% financing for larger treatments." },
  { q: "Is the AI diagnosing me?", a: "No. Aurea AI helps triage, estimate and educate. Every diagnosis and treatment plan is confirmed by a licensed dentist." },
  { q: "Are you kid-friendly?", a: "Very. We have a dedicated pediatric wing with soft lighting, distractions, and clinicians who speak fluent kid." },
  { q: "What about dental emergencies?", a: "Call our 24/7 line. Aurea AI will prep the on-call dentist with your history before you arrive." },
];

export function FAQ() {
  return (
    <section className="relative py-24 md:py-32 bg-muted/50">
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <div className="text-center mb-10">
          <Reveal><span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">FAQ</span></Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05]">
              Everything you might wonder.
            </h2>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`i-${i}`}
                className="rounded-2xl bg-white border border-border px-5 data-[state=open]:border-primary/40 data-[state=open]:soft-shadow transition-all"
              >
                <AccordionTrigger className="text-left font-display text-base md:text-lg font-medium text-secondary hover:no-underline py-5">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}