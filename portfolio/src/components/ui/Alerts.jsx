import React from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable SuccessAlert component for notifications.
 */
export function SuccessAlert({ message, className, onClose }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl bg-[oklch(0.972_0.028_165)] border border-[oklch(0.65_0.17_148)] text-[oklch(0.42_0.09_165)] dark:bg-[oklch(0.208_0.042_265.755)] dark:border-[oklch(0.65_0.17_148)/40%] dark:text-[oklch(0.65_0.17_148)] shadow-sm animate-in fade-in slide-in-from-top-1 duration-200",
        className
      )}
    >
      <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-[oklch(0.65_0.17_148)] animate-pulse-ring rounded-full" />
      <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="p-1 rounded-lg hover:bg-[oklch(0.42_0.09_165)/10%] dark:hover:bg-[oklch(0.65_0.17_148)/10%] transition-colors duration-150 shrink-0"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Reusable ErrorAlert component for form or API errors.
 */
export function ErrorAlert({ message, className, onClose }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl bg-[oklch(0.704_0.191_22.216)/8%] border border-[oklch(0.62_0.23_27)] text-[oklch(0.62_0.23_27)] dark:bg-[oklch(0.704_0.191_22.216)/12%] dark:border-[oklch(0.704_0.191_22.216)/40%] dark:text-[oklch(0.704_0.191_22.216)] shadow-sm animate-in fade-in slide-in-from-top-1 duration-200",
        className
      )}
    >
      <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-[oklch(0.62_0.23_27)] dark:text-[oklch(0.704_0.191_22.216)]" />
      <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="p-1 rounded-lg hover:bg-[oklch(0.62_0.23_27)/10%] dark:hover:bg-[oklch(0.704_0.191_22.216)/10%] transition-colors duration-150 shrink-0"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
