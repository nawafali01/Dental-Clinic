import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { cn } from "@/lib/utils";

/**
 * Reusable Button component with design styles matching the Dental CRM design.
 */
export function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-display font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-[oklch(0.53_0.09_165)] focus-visible:ring-primary shadow-sm hover:shadow active:scale-[0.98]",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-[oklch(0.27_0.03_253)] focus-visible:ring-secondary shadow-sm hover:shadow active:scale-[0.98]",
    outline:
      "border border-border bg-transparent text-foreground hover:bg-muted focus-visible:ring-primary active:scale-[0.98]",
    ghost:
      "bg-transparent text-foreground hover:bg-muted focus-visible:ring-primary",
    danger:
      "bg-destructive text-destructive-foreground hover:bg-[oklch(0.58_0.21_27)] focus-visible:ring-destructive active:scale-[0.98]",
  };

  const sizes = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-6 text-sm",
    lg: "h-12 px-8 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" classNameColor="text-current" />
          <span>Please wait...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
