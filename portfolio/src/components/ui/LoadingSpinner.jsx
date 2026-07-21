import React from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable LoadingSpinner component.
 */
export function LoadingSpinner({ size = "md", classNameColor = "text-primary", className }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2 font-semibold",
    lg: "w-8 h-8 border-3",
    xl: "w-12 h-12 border-4",
  };

  return (
    <div
      role="status"
      aria-label="loading"
      className={cn(
        "inline-block rounded-full border-t-transparent animate-spin",
        sizeClasses[size] || sizeClasses.md,
        classNameColor,
        "border-current",
        className
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
export default LoadingSpinner;
