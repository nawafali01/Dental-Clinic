import { CheckCircle2 } from "lucide-react";

export function QuestionOptions({
  config,
  selectedOption,
  iconMap,
  onSelectOption,
}) {
  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl md:text-2xl font-semibold text-secondary">
        {config?.title}
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {config?.options?.map((opt) => {
          const isSelected = selectedOption === opt.id;
          const IconComp = opt.icon ? iconMap[opt.icon] : null;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectOption(config.id, opt.id)}
              className={`relative text-left p-5 rounded-2xl border transition-all cursor-pointer group ${
                isSelected
                  ? "bg-accent/40 border-primary shadow-[0_4px_20px_-4px_rgba(31,138,112,0.25)]"
                  : "bg-white border-border hover:border-primary/40 hover:bg-neutral-50/50"
              }`}
            >
              <div className="flex items-start justify-between">
                {IconComp ? (
                  <span
                    className={`grid place-items-center size-10 rounded-xl transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-secondary group-hover:bg-accent group-hover:text-primary"
                    }`}
                  >
                    <IconComp className="size-5" />
                  </span>
                ) : (
                  <span className="size-2 rounded-full bg-primary/40" />
                )}
                {isSelected && (
                  <CheckCircle2 className="size-5 text-primary shrink-0 ml-2" />
                )}
              </div>

              <p className="mt-4 font-display font-semibold text-secondary text-base">
                {opt.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
