import { Reveal } from "@/shared/ui/Reveal";
import { FAQItem } from "./FAQItem";

export function ServicesFAQSection({ faqs = [], openFaq, setOpenFaq }) {
  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        <div className="text-center mb-12">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              FAQs
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05]">
              Common questions.
            </h2>
          </Reveal>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <Reveal key={idx} delay={idx * 0.04}>
              <FAQItem
                q={faq.q}
                a={faq.a}
                isOpen={openFaq === idx}
                onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
