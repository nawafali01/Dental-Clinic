import { Search } from "lucide-react";
import { Reveal } from "@/shared/ui/Reveal";

export function ServicesFilter({ search, setSearch, categories, activeCat, setActiveCat }) {
  return (
    <section className="pb-8">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <Reveal>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-5 py-3.5 soft-shadow max-w-lg mx-auto mb-8">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search services — e.g. "whitening" or "implants"'
              className="flex-1 bg-transparent text-sm outline-none text-secondary placeholder:text-muted-foreground"
            />
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-4 py-2 text-sm rounded-full border cursor-pointer transition-all ${
                  activeCat === cat
                    ? "bg-secondary text-secondary-foreground border-secondary"
                    : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
