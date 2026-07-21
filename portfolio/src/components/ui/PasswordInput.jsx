import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable PasswordInput component with built-in show/hide toggle.
 */
export const PasswordInput = forwardRef(
  ({ label, error, className, id, required, ...props }, ref) => {
    const inputId = id || `password-${Math.random().toString(36).substr(2, 9)}`;
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div className="w-full text-left">
        {label && (
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor={inputId}
              className="block text-sm font-medium text-foreground"
            >
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </label>
          </div>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={showPassword ? "text" : "password"}
            ref={ref}
            className={cn(
              "flex h-11 w-full rounded-xl border border-input bg-card pl-3 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
            tabIndex="-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4.5 w-4.5" />
            ) : (
              <Eye className="h-4.5 w-4.5" />
            )}
          </button>
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

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
