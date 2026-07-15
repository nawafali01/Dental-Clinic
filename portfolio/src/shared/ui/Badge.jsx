import { cn } from "@/lib/utils";

export function Badge({ children, variant = "default", className = "" }) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors";

  const variants = {
    default: "bg-accent/60 border-primary/15 text-secondary",
    primary: "bg-primary text-primary-foreground border-transparent animate-pulse",
    secondary: "bg-secondary text-secondary-foreground border-transparent",
    glass: "glass border-primary/15 text-secondary",
    outline:
      "border-border bg-white text-muted-foreground hover:border-primary hover:text-primary",
  };

  return (
    <span className={cn(base, variants[variant] || variants.default, className)}>
      {children}
    </span>
  );
}
