import { Reveal } from "./Reveal";

export function SectionTitle({
  tag,
  title,
  description,
  className = "",
  align = "left",
}) {
  const isCenter = align === "center";
  return (
    <div
      className={`max-w-2xl mb-14 ${isCenter ? "mx-auto text-center" : ""} ${className}`}
    >
      {tag && (
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {tag}
          </span>
        </Reveal>
      )}
      {title && (
        <Reveal delay={0.05}>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary leading-[1.05] tracking-tight">
            {title}
          </h2>
        </Reveal>
      )}
      {description && (
        <Reveal delay={0.1}>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
