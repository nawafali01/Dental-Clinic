import React, { forwardRef } from "react";
import { Shield, Users, DollarSign, Headset } from "lucide-react";
import { cn } from "@/lib/utils";

// Roles list with visual assets (labels, descriptions, and icons)
const ROLE_OPTIONS = [
  {
    id: "clinic_manager",
    label: "Clinic Manager",
    description: "Manage clinical operations, schedules, and staff settings.",
    icon: Shield,
    color: "text-primary bg-[oklch(0.972_0.028_165)] dark:bg-[oklch(0.208_0.042_265.755)]",
  },
  {
    id: "reception",
    label: "Receptionist",
    description: "Handle appointments, intake forms, and patient check-ins.",
    icon: Users,
    color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30",
  },
  {
    id: "finance",
    label: "Finance Staff",
    description: "Oversee billing, claims processing, and transactions.",
    icon: DollarSign,
    color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30",
  },
  {
    id: "agent",
    label: "Support Agent",
    description: "Assist patients with general enquiries and technical support.",
    icon: Headset,
    color: "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30",
  },
];

/**
 * Enterprise RoleSelector component in shadcn/ui Radio Group style.
 * Supports React Hook Form value binding via value/onChange props or forwardRef.
 */
export const RoleSelector = forwardRef(
  ({ value, onChange, error, className }, ref) => {
    return (
      <div className={cn("space-y-3 text-left", className)}>
        <div>
          <span className="block text-sm font-medium text-foreground">
            Select Your Role <span className="text-destructive">*</span>
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose your assigned role to access correct workstation layout.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" ref={ref}>
          {ROLE_OPTIONS.map((role) => {
            const Icon = role.icon;
            const isSelected = value === role.id;
            
            return (
              <label
                key={role.id}
                className={cn(
                  "relative flex flex-col p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/50 hover:bg-muted/30 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-0 transition-all duration-200 select-none",
                  isSelected && "border-primary ring-1 ring-primary bg-[oklch(0.972_0.028_165)/15%] dark:bg-[oklch(0.208_0.042_265.755)/15%]"
                )}
              >
                <input
                  type="radio"
                  name="role-selector"
                  value={role.id}
                  checked={isSelected}
                  onChange={() => onChange && onChange(role.id)}
                  className="sr-only"
                />
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("p-2 rounded-lg shrink-0", role.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-sm text-foreground">
                    {role.label}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground leading-normal mt-auto">
                  {role.description}
                </span>
              </label>
            );
          })}
        </div>

        {error && (
          <p className="mt-1 text-xs text-destructive font-medium animate-in fade-in duration-150">
            {error}
          </p>
        )}
      </div>
    );
  }
);

RoleSelector.displayName = "RoleSelector";

export default RoleSelector;
