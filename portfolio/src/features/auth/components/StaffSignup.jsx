import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const DentalLogo = ({ size = "size-5" }) => (
  <img
    src="/dental-favicon.svg"
    alt="Aurea Dental"
    className={size}
    style={{ filter: "brightness(0) invert(1)" }}
  />
);
import {
  getMockInvite,
  mockInviteActivation,
} from "@/features/auth/services/mockAuthService";
import { SpinnerSvg } from "@/assets/svg/SpinnerSvg";

/* ─── validation ─── */
function validateActivation(values) {
  const nextErrors = {};
  if (!values.fullName.trim()) nextErrors.fullName = "Full name is required.";
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

/* ─── left illustration panel ─── */
function SignupPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12"
      style={{
        background:
          "linear-gradient(150deg, oklch(0.48 0.12 165) 0%, oklch(0.586 0.107 165) 50%, oklch(0.65 0.13 165) 100%)",
      }}
    >
      {/* decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="animate-blob absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, oklch(0.586 0.107 165) 0%, transparent 70%)",
          }}
        />
        <div
          className="animate-blob absolute bottom-10 left-0 h-72 w-72 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.586 0.107 165 / 80%) 0%, transparent 70%)",
            animationDelay: "6s",
          }}
        />
      </div>

      {/* logo — same as index.html */}
      <div className="relative z-10 flex items-center gap-2">
        <span
          className="grid size-9 place-items-center rounded-xl shadow-lg"
          style={{
            background: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          <DentalLogo />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight text-white">
          Aurea<span className="text-white/60">.</span>
        </span>
      </div>

      {/* center content */}
      <div className="relative z-10 space-y-8">
        <div className="space-y-3">
          {[
            "Access patient records & appointment history",
            "Coordinate with your assigned clinic branch",
            "Real-time scheduling and slot management",
            "Secure internal communications dashboard",
          ].map((perk) => (
            <div key={perk} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-sm leading-relaxed text-white/75">
                {perk}
              </span>
            </div>
          ))}
        </div>

        <div>
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <ShieldCheck className="size-3.5 text-primary" />
            <span className="text-xs font-medium text-white/70">
              Invite-only access
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight text-white">
            Join the team.
            <br />
            <span className="text-white">Start managing today.</span>
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
            Complete your account setup to access the Aurea Dental internal
            staff platform.
          </p>
        </div>
      </div>

      {/* footer */}
      <div className="relative z-10">
        <p className="text-xs text-white/30">
          © {new Date().getFullYear()} Aurea Dental · Internal Staff Platform
        </p>
      </div>
    </div>
  );
}

/* ─── invalid invite state ─── */
function InvalidInvitation({ onBackToLogin }) {
  return (
    <div className="flex min-h-screen">
      <SignupPanel />
      <div className="flex w-full items-center justify-center bg-background px-6 py-12 lg:w-[55%]">
        <div className="mx-auto w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-accent">
            <ShieldCheck className="size-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-secondary">
            Invalid Invitation
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            This invitation link is invalid or has expired. Please contact your
            administrator for a new invitation link.
          </p>
          <button
            onClick={onBackToLogin}
            className="group mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl active:scale-[0.98]"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── reusable field ─── */
function FormField({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly,
  disabled,
  error,
  children,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-foreground/80"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-55"
          style={
            error
              ? {
                  borderColor: "oklch(0.62 0.23 27)",
                  background: "oklch(0.99 0.005 27)",
                }
              : {}
          }
        />
        {children}
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

/* ─── main signup component ─── */
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
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const canSubmit = useMemo(
    () => values.fullName.trim() && values.password && values.confirmPassword,
    [values.fullName, values.password, values.confirmPassword],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((c) => ({ ...c, [name]: value }));
    setErrors((c) => ({ ...c, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateActivation(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

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
    <div className="flex min-h-screen">
      {/* ── left panel ── */}
      <SignupPanel />

      {/* ── right form panel ── */}
      <div className="flex w-full flex-col justify-center overflow-y-auto bg-background px-6 py-12 sm:px-10 lg:w-[55%] xl:px-16">
        {/* mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <span className="grid size-8 place-items-center rounded-xl bg-primary">
            <DentalLogo />
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-secondary">
            Aurea<span className="text-primary">.</span>
          </span>
        </div>

        <div className="mx-auto w-full max-w-md">
          {/* badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5">
            <ShieldCheck className="size-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Invite Activation
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight text-secondary">
            Activate your
            <br />
            account
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            You've been invited to join the internal CRM. Complete your profile
            to get started.
          </p>

          {/* invite info card */}
          <div className="mt-6 rounded-2xl border border-primary/15 bg-accent px-5 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
              Invite Details
            </p>
            <div className="space-y-2">
              {[
                { label: "Email", value: invite?.email },
                { label: "Role", value: invite?.role },
                { label: "Clinic", value: invite?.clinic },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-medium text-secondary">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* form */}
          <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
            <FormField
              id="fullName"
              label="Full Name"
              name="fullName"
              value={values.fullName}
              onChange={handleChange}
              placeholder="Sarah Khan"
              error={errors.fullName}
            />

            <FormField
              id="password"
              label="Password"
              name="password"
              value={values.password}
              onChange={handleChange}
              type={showPass ? "text" : "password"}
              placeholder="Create a strong password (min. 8 chars)"
              autoComplete="new-password"
              error={errors.password}
            >
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPass ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </FormField>

            <FormField
              id="confirmPassword"
              label="Confirm Password"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              error={errors.confirmPassword}
            >
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </FormField>

            {/* submit */}
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <SpinnerSvg className="size-4 animate-spin" />
                  Activating account...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Activate my account
                </>
              )}
              {/* shimmer */}
              <span className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
