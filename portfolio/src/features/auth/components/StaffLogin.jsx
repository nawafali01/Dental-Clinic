import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { AuthField } from "@/shared/ui/AuthField";
import { mockLogin } from "@/features/auth/services/mockAuthService";

function validateLogin(values) {
  const nextErrors = {};

  if (!values.email.trim()) {
    nextErrors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    nextErrors.email = "Please enter a valid email address.";
  }

  if (!values.password) {
    nextErrors.password = "Password is required.";
  }

  return nextErrors;
}

export default function StaffLoginFeature() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => values.email.trim() && values.password.trim(),
    [values.email, values.password],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await mockLogin({
        email: values.email,
        password: values.password,
      });
      navigate(response.redirectTo);
    } catch (error) {
      toast.error(error.message || "Unable to sign in right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-[32px] border border-border bg-background/95 p-8 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex items-center gap-3 text-primary">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Internal Staff CRM
              </p>
              <p className="text-sm text-muted-foreground">
                Invite-only access
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h1 className="font-display text-3xl font-semibold text-secondary">
              Sign in
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Access the dental clinic management platform for internal staff
              members only.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <AuthField
              id="email"
              label="Email"
              name="email"
              value={values.email}
              onChange={handleChange}
              type="email"
              placeholder="name@clinic.com"
              autoComplete="email"
              inputMode="email"
              error={errors.email}
            />

            <AuthField
              id="password"
              label="Password"
              name="password"
              value={values.password}
              onChange={handleChange}
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              error={errors.password}
            />

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-2xl"
              disabled={!canSubmit || isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
