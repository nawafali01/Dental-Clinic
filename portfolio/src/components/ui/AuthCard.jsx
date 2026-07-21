import React from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable AuthCard layout wrapper.
 * Employs clean enterprise aesthetics, dental branding, and responsiveness.
 */
export function AuthCard({
  children,
  title,
  subtitle,
  className,
  headerAddon,
}) {
  return (
    <div className="w-full max-w-[520px] mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Dental Platform Logo/Branding Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 mb-4 animate-float-slow hover:rotate-12 transition-transform duration-300">
          <Activity className="w-6 h-6" />
        </div>
        <span className="text-sm font-semibold tracking-wider text-primary uppercase font-display">
          Aurea Dental CRM
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mt-2 font-display">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
            {subtitle}
          </p>
        )}
        {headerAddon && <div className="mt-4">{headerAddon}</div>}
      </div>

      {/* Main card panel */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 soft-shadow dark:bg-card/75 dark:backdrop-blur-md",
          className
        )}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />
        
        {children}
      </div>

      {/* Footer copyright */}
      <p className="text-center text-xs text-muted-foreground mt-8">
        &copy; {new Date().getFullYear()} Aurea &bull; Enterprise Dental CRM + AI Platform
      </p>
    </div>
  );
}

export default AuthCard;
