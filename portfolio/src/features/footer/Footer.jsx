import { Sparkles, Globe, ExternalLink, Share2, BookMarked, ArrowRight } from "lucide-react";
import { Reveal } from "@/shared/ui/Reveal";

const footerCols = [
  { title: "Clinic", links: [{ label: "Services", href: "#services" }, { label: "Doctors", href: "/home/doctors" }, { label: "Gallery", href: "#gallery" }, { label: "About", href: "/home/about" }] },
  { title: "Care", links: [{ label: "AI Assistant", href: "#ai" }, { label: "Emergency", href: "#live-slots" }, { label: "Insurance", href: "#faq" }, { label: "Financing", href: "#treatment-finder" }] },
  { title: "Legal & Governance", links: [{ label: "Privacy Policy", href: "#" }, { label: "Terms of Service", href: "#" }, { label: "Cookie Policy", href: "#" }, { label: "Accessibility Statement", href: "#" }, { label: "Non-emergency Disclaimer", href: "#" }, { label: "Non-clinical Advice Disclaimer", href: "#" }] },
];

function FooterCol({ title, links }) {
  return (
    <div>
      <p className="font-display font-medium text-sm">{title}</p>
      <ul className="mt-4 space-y-2 text-sm text-white/60">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="hover:text-white transition-colors">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative bg-secondary text-white pt-20 pb-10 overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[600px] bg-primary/20 blur-3xl rounded-full pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-5 md:px-8">
        <Reveal>
          <div className="rounded-[28px] bg-white/5 border border-white/10 backdrop-blur p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-md">
              <p className="font-display text-2xl md:text-3xl font-semibold leading-tight">
                Get gentle dental wisdom, monthly.
              </p>
              <p className="text-white/60 mt-2 text-sm">
                No spam. Just tips, offers, and the occasional smile story.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2 rounded-full bg-white/10 border border-white/15 pl-5 pr-1.5 py-1.5 min-w-[300px]"
            >
              <input
                type="email"
                placeholder="you@email.com"
                className="bg-transparent flex-1 outline-none text-sm placeholder:text-white/50"
              />
              <button
                className="grid place-items-center size-10 rounded-full bg-primary hover:bg-primary/90 transition-colors cursor-pointer"
                aria-label="Subscribe"
              >
                <ArrowRight className="size-4" />
              </button>
            </form>
          </div>
        </Reveal>

        <div className="mt-16 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center size-9 rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="size-5" />
              </span>
              <span className="font-display font-semibold text-lg">
                Aurea<span className="text-primary">.</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-white/60 max-w-xs">
              Modern, AI-powered dentistry designed to feel calm, considered, and quietly luxurious.
            </p>
            <div className="flex gap-2 mt-6">
              {[Globe, ExternalLink, Share2, BookMarked].map((I, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="grid place-items-center size-9 rounded-full bg-white/5 hover:bg-primary transition-colors border border-white/10"
                >
                  <I className="size-4" />
                </a>
              ))}
            </div>
          </div>
          {footerCols.map((col) => (
            <FooterCol key={col.title} title={col.title} links={col.links} />
          ))}
        </div>

        {/* Legal Disclaimers Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 space-y-3 text-xs text-white/40 leading-relaxed">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/60">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility Statement</a>
            <a href="#" className="hover:text-white transition-colors">Non-emergency Medical Disclaimer</a>
            <a href="#" className="hover:text-white transition-colors">Non-clinical Advice Disclaimer</a>
          </div>
          <p>
            <b>Non-emergency Medical Disclaimer:</b> If you are experiencing a life-threatening medical emergency or severe acute dental trauma, please call your local emergency services (112 / 911) immediately.
          </p>
          <p>
            <b>Non-clinical Advice Disclaimer:</b> Information provided by Aurea AI and interactive questionnaires is for informational guidance only and does not constitute formal medical or dental diagnosis.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Aurea Dental. Crafted with care in Copenhagen.</p>
          <p>Aurea AI is a UI demonstration and enterprise healthcare concept.</p>
        </div>
      </div>
    </footer>
  );
}
