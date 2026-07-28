import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { AuthField } from "@/shared/ui/AuthField";
import {
  getMockInvite,
  mockInviteActivation,
} from "@/features/auth/services/mockAuthService";

function validateActivation(values) {
  const nextErrors = {};

  if (!values.fullName.trim()) {
    nextErrors.fullName = "Full name is required.";
  }

  if (!values.password) {
    nextErrors.password = "Password is required.";
  } else if (values.password.length < 8) {
    nextErrors.password = "Password must be at least 8 characters.";
  }

  if (!values.confirmPassword) {
    nextErrors.confirmPassword = "Please confirm your password.";
  } else if (values.password && values.password !== values.confirmPassword) {
    nextErrors.confirmPassword = "Passwords do not match.";
  }

  return nextErrors;
}

function InvalidInvitation({ onBackToLogin }) {
  return (
    <div className="min-h-screen bg-muted/40 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-2xl items-center justify-center">
        <div className="w-full rounded-[32px] border border-border bg-background/95 p-8 text-center shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold text-secondary">
            Invalid or Expired Invitation
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            This invitation link is invalid or has expired. Please contact your
            administrator for a new invitation.
          </p>
          <Button className="mt-8 h-11 rounded-2xl" onClick={onBackToLogin}>
            <span className="inline-flex items-center gap-2">
              <ArrowLeft className="size-4" />
              <span>Back to Login</span>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function StaffSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const invite = getMockInvite(token);

  const [values, setValues] = useState({
    fullName: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => values.fullName.trim() && values.password && values.confirmPassword,
    [values.fullName, values.password, values.confirmPassword],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateActivation(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    setIsSubmitting(true);

    try {
      await mockInviteActivation({
        fullName: values.fullName,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Unable to activate the invitation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!invite) {
    return <InvalidInvitation onBackToLogin={() => navigate("/login")} />;
  }

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl items-center justify-center">
        <div className="w-full rounded-[32px] border border-border bg-background/95 p-8 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex items-center gap-3 text-primary">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Invite Activation
              </p>
              <p className="text-sm text-muted-foreground">
                Complete your staff account setup
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h1 className="font-display text-3xl font-semibold text-secondary">
              Activate your account
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              You were invited to join the internal CRM for the clinic
              management platform.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <AuthField
              id="fullName"
              label="Full Name"
              name="fullName"
              value={values.fullName}
              onChange={handleChange}
              placeholder="Sarah Khan"
              autoComplete="name"
              error={errors.fullName}
            />
            <AuthField
              id="email"
              label="Email"
              value={invite?.email || ""}
              readOnly
              disabled
              className="bg-neutral-50"
            />
            <AuthField
              id="role"
              label="Assigned Role"
              value={invite?.role || ""}
              readOnly
              disabled
              className="bg-neutral-50"
            />
            <AuthField
              id="clinic"
              label="Assigned Clinic"
              value={invite?.clinic || ""}
              readOnly
              disabled
              className="bg-neutral-50"
            />
            <AuthField
              id="password"
              label="Password"
              name="password"
              value={values.password}
              onChange={handleChange}
              type="password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              error={errors.password}
            />
            <AuthField
              id="confirmPassword"
              label="Confirm Password"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              error={errors.confirmPassword}
            />

            <Button
              type="submit"
              className="h-11 w-full rounded-2xl"
              disabled={!canSubmit || isSubmitting}
              isLoading={isSubmitting}
            >
              <span>{isSubmitting ? "Activating..." : "Activate account"}</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
