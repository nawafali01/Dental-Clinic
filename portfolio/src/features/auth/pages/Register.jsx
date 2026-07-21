import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { registerSchema } from "../schemas/authSchemas";
import { AuthCard } from "../../../components/ui/AuthCard";
import { Input } from "../../../components/ui/Input";
import { PasswordInput } from "../../../components/ui/PasswordInput";
import { Button } from "../../../components/ui/Button";
import { ErrorAlert } from "../../../components/ui/Alerts";
import { ROLES } from "../constants/authConstants";
import { Shield, ShieldAlert, Users, DollarSign, Headset, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Roles list with visual assets for new account creations (Staff only)
const STAFF_REGISTRATION_ROLES = [
  {
    id: ROLES.CLINIC_MANAGER,
    label: "Clinic Manager",
    description: "Manage clinical operations, schedules, and staff profiles.",
    icon: UserCheck,
    color: "text-primary bg-[oklch(0.972_0.028_165)] dark:bg-[oklch(0.208_0.042_265.755)]",
  },
  {
    id: ROLES.RECEPTION,
    label: "Receptionist",
    description: "Handle appointments, digital intakes, and patient check-ins.",
    icon: Users,
    color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20",
  },
  {
    id: ROLES.FINANCE,
    label: "Finance Staff",
    description: "Oversee billing ledger, claims settlement, and transaction receipts.",
    icon: DollarSign,
    color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20",
  },
  {
    id: ROLES.AGENT,
    label: "Support Agent",
    description: "Assist patient enquiries, chatbot queries, and ticketing queues.",
    icon: Headset,
    color: "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/20",
  },
];

export function Register() {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [globalError, setGlobalError] = useState("");

  const currentPath = location.pathname;

  // Determine role locking and page descriptions from route
  let title = "Sign Up";
  let subtitle = "Register a new workstation access account with your practice details.";
  let lockedRole = "";
  let isRoleSelectorVisible = true;
  let defaultSignInPath = "/login";

  if (currentPath === "/register-admin") {
    title = "Clinic Administrator Registration";
    subtitle = "Register as an administrator to manage services, invoicing policies, and staff profiles.";
    lockedRole = ROLES.ADMIN;
    isRoleSelectorVisible = false;
    defaultSignInPath = "/admin-login";
  } else if (currentPath === "/register-super-admin") {
    title = "Super Admin Registration";
    subtitle = "Configure global system registry, manage Multi-Clinic tenants, and setup developer integrations.";
    lockedRole = ROLES.SUPER_ADMIN;
    isRoleSelectorVisible = false;
    defaultSignInPath = "/super-admin-login";
  } else {
    // Default /register -> Staff signup
    title = "Staff Account Registration";
    subtitle = "Select your department workstation and fill in details to create your access account.";
    // Default to the first staff role if no state preselection
    lockedRole = location.state?.defaultRole || ROLES.CLINIC_MANAGER;
    isRoleSelectorVisible = true;
    defaultSignInPath = "/login";
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: lockedRole,
    },
  });

  const onSubmit = async (data) => {
    setGlobalError("");
    const submissionRole = isRoleSelectorVisible ? data.role : lockedRole;
    try {
      await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        role: submissionRole,
      });
      toast.success("Account created successfully!");
      
      // Reroute appropriately based on role
      if (submissionRole === ROLES.SUPER_ADMIN) {
        navigate("/super-admin/dashboard");
      } else if (submissionRole === ROLES.ADMIN) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const message = err?.data?.message || err?.message || "An unexpected error occurred during signup";
      setGlobalError(message);
      toast.error(message);
    }
  };

  return (
    <AuthCard title={title} subtitle={subtitle}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <ErrorAlert message={globalError} onClose={() => setGlobalError("")} />

        {/* Name field */}
        <Input
          label="Full Name"
          type="text"
          placeholder="E.g. Dr. Julia Roberts"
          required
          error={errors.name?.message}
          disabled={isSubmitting}
          {...register("name")}
        />

        {/* Email field */}
        <Input
          label="Email Address"
          type="email"
          placeholder="julia.roberts@dentalcrm.example"
          required
          error={errors.email?.message}
          disabled={isSubmitting}
          {...register("email")}
        />

        {/* Password field */}
        <PasswordInput
          label="Password"
          placeholder="••••••••"
          required
          error={errors.password?.message}
          disabled={isSubmitting}
          {...register("password")}
        />

        {/* Confirm Password field */}
        <PasswordInput
          label="Confirm Password"
          placeholder="••••••••"
          required
          error={errors.confirmPassword?.message}
          disabled={isSubmitting}
          {...register("confirmPassword")}
        />

        {/* Custom Role Selector inside grid (Only visible for Staff Registration) */}
        {isRoleSelectorVisible && (
          <div className="space-y-3 text-left">
            <div>
              <span className="block text-sm font-medium text-foreground">
                Select Your Workstation Department <span className="text-destructive">*</span>
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose your department to load the correct layout panel.
              </p>
            </div>

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {STAFF_REGISTRATION_ROLES.map((role) => {
                    const Icon = role.icon;
                    const isSelected = field.value === role.id;
                    
                    return (
                      <label
                        key={role.id}
                        className={cn(
                          "relative flex items-start p-3 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/50 hover:bg-muted/30 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-0 transition-all duration-200 select-none",
                          isSelected && "border-primary ring-1 ring-primary bg-[oklch(0.972_0.028_165)/8%] dark:bg-[oklch(0.208_0.042_265.755)/8%]"
                        )}
                      >
                        <input
                          type="radio"
                          name="register-role"
                          value={role.id}
                          checked={isSelected}
                          onChange={() => field.onChange(role.id)}
                          className="sr-only"
                        />
                        <div className={cn("p-2 rounded-lg shrink-0 mr-3", role.color)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-foreground">
                            {role.label}
                          </span>
                          <span className="text-xs text-muted-foreground leading-normal mt-0.5">
                            {role.description}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            />
            {errors.role?.message && (
              <p className="mt-1 text-xs text-destructive font-medium">
                {errors.role.message}
              </p>
            )}
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Sign Up
        </Button>

        {/* Link back to corresponding Login */}
        <div className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate(defaultSignInPath)}
            className="font-semibold text-primary hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </form>
    </AuthCard>
  );
}

export default Register;
