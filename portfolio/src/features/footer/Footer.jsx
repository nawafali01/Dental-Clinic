import { Sparkles } from "lucide-react";
import {
  FOOTER_COLS,
  FOOTER_SOCIAL_ICONS,
  FOOTER_META,
} from "./footerConstants";

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
    <footer className="relative bg-secondary text-white pt-14 md:pt-16 pb-10 overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[600px] bg-primary/20 blur-3xl rounded-full pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center size-9 rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="size-5" />
              </span>
              <span className="font-display font-semibold text-lg">
                {FOOTER_META.brand}<span className="text-primary">.</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-white/60 max-w-xs">
              {FOOTER_META.tagline}
            </p>
            <div className="flex gap-2 mt-6">
              {FOOTER_SOCIAL_ICONS.map((I, i) => (
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
          {FOOTER_COLS.map((col) => (
            <FooterCol key={col.title} title={col.title} links={col.links} />
          ))}
        </div>

        {/* Copyright & Disclaimer Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>{FOOTER_META.copyright}</p>
          <p>{FOOTER_META.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
