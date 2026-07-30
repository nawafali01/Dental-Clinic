import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthField({
  id,
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  error,
  readOnly = false,
  disabled = false,
  inputMode,
  className,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;

  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-secondary">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          type={resolvedType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          readOnly={readOnly}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "flex h-11 w-full rounded-2xl border bg-background px-3.5 py-2 text-sm text-secondary shadow-sm outline-none transition-colors placeholder:text-muted-foreground",
            error
              ? "border-destructive/50 focus:border-destructive"
              : "border-border focus:border-primary",
            readOnly && "bg-neutral-50 text-muted-foreground",
            className
          )}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-primary"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
