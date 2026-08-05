import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, ArrowRight, Activity, Heart } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { loginSchema } from "@/schemas/loginSchema";
import { Button } from "@/shared/ui/Button";
import { AuthField } from "@/shared/ui/AuthField";
import { SpinnerSvg } from "@/assets/svg/SpinnerSvg";

const DentalLogo = ({ size = "size-5" }) => (
  <img
    src="/dental-favicon.svg"
    alt="Aurea Dental"
    className="size-5"
    style={{ filter: "brightness(0) invert(1)" }}
  />
);



/* ---------- left panel illustration ---------- */
function AuthIllustrationPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
      style={{
        background: "linear-gradient(135deg, #0f4c35 0%, #1F8A70 45%, #2dd4a4 100%)",
      }}
    >
      {/* animated blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-blob absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #7fffd4 0%, transparent 70%)" }}
        />
        <div className="animate-blob absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #34d399 0%, transparent 70%)", animationDelay: "4s" }}
        />
        <div className="animate-blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)", animationDelay: "8s" }}
        />
      </div>

      {/* top logo mark */}
      <div className="relative z-10 flex items-center gap-2">
        <span
          className="grid size-9 place-items-center rounded-xl shadow-lg"
          style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}
        >
          <DentalLogo />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight text-white">
          Aurea<span className="text-white/60">.</span>
        </span>
      </div>

      {/* center content */}
      <div className="relative z-10 space-y-8">
        {/* stat cards */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Activity, label: "Appointments Today", value: "148" },
            { icon: Heart, label: "Patient Satisfaction", value: "98.4%" },
            { icon: Activity, label: "Active Doctors", value: "32" },
            { icon: ShieldCheck, label: "Clinics Managed", value: "12" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label}
              className="rounded-2xl p-4 transition-transform hover:scale-[1.03]"
              style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.18)" }}
            >
              <Icon className="mb-2 size-4 text-white/70" />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="mt-0.5 text-xs text-white/60">{label}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="font-display text-4xl font-bold leading-tight text-white">
            Manage your clinic<br />with intelligence.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            One secure portal for doctors, managers, and administrators across all Aurea Dental clinics nationwide.
          </p>
        </div>
      </div>

      {/* bottom tag */}
      <div className="relative z-10">
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Aurea Dental · Internal Staff Platform
        </p>
      </div>
    </div>
  );
}

/* ---------- main component ---------- */
export default function StaffLoginFeature() {
  const { handleLogin, isLoading: isSubmitting } = useAuth();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

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
    
    const result = loginSchema.safeParse(values);
    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach(issue => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    await handleLogin(values.email, values.password);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left illustration panel ── */}
      <AuthIllustrationPanel />

      {/* ── Right form panel ── */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-1/2 xl:px-20"
        style={{ background: "linear-gradient(160deg, #f0fdf8 0%, #ffffff 60%)" }}
      >
        {/* mobile logo (hidden on lg) */}
        <div className="mb-10 flex items-center gap-2 lg:hidden">
          <span className="grid size-9 place-items-center rounded-xl bg-primary">
            <DentalLogo />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-secondary">
            Aurea<span className="text-primary">.</span>
          </span>
        </div>

        <div className="mx-auto w-full max-w-md">
          {/* badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ background: "rgba(31,138,112,0.08)", border: "1px solid rgba(31,138,112,0.2)" }}
          >
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
              Invite-only Access
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Sign in to access the internal dental clinic management platform.
          </p>

          <form className="mt-10 space-y-5" onSubmit={handleSubmit} noValidate>
            {/* email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={values.email}
                onChange={handleChange}
                placeholder="name@clinic.com"
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all placeholder:text-gray-400 focus:ring-2"
                style={{
                  borderColor: errors.email ? "#ef4444" : "#d1fae5",
                  background: errors.email ? "#fff5f5" : "#f0fdf4",
                  color: "#111827",
                  "--tw-ring-color": "rgba(31,138,112,0.3)",
                }}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-800"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={values.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border px-4 py-3 pr-11 text-sm outline-none transition-all placeholder:text-gray-400 focus:ring-2"
                  style={{
                    borderColor: errors.password ? "#ef4444" : "#d1fae5",
                    background: errors.password ? "#fff5f5" : "#f0fdf4",
                    color: "#111827",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-emerald-200/60 hover:shadow-xl active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #1F8A70 0%, #16a085 100%)",
              }}
            >
              {isSubmitting ? (
                <>
                  <SpinnerSvg />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
              {/* shimmer */}
              <span className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
            </button>
          </form>

          {/* divider */}
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-gray-400">Staff portal only</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Don't have access?{" "}
            <span className="font-medium text-emerald-600">Contact your administrator</span>
            {" "}to get an invitation.
          </p>
        </div>
      </div>
    </div>
  );
}
