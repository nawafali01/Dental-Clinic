import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { staffLoginSchema } from "../schemas/authSchemas";
import { AuthCard } from "../../../components/ui/AuthCard";
import { Input } from "../../../components/ui/Input";
import { PasswordInput } from "../../../components/ui/PasswordInput";
import { RoleSelector } from "../../../components/ui/RoleSelector";
import { Button } from "../../../components/ui/Button";
import { ErrorAlert } from "../../../components/ui/Alerts";
import { ROLES } from "../constants/authConstants";

/**
 * Staff Login Portal View `/login`
 */
export function StaffLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(staffLoginSchema),
    defaultValues: {
      role: "",
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setGlobalError("");
    try {
      await login({
        email: data.email,
        password: data.password,
        role: data.role,
      });
      toast.success("Signed in successfully!");
      navigate("/dashboard");
    } catch (err) {
      const message = err?.data?.message || err?.message || "An unexpected login error occurred";
      setGlobalError(message);
      toast.error(message);
    }
  };

  return (
    <AuthCard
      title="Staff Workstation Portal"
      subtitle="Complete shift sign-in to access patient charts and clinical tools."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <ErrorAlert message={globalError} onClose={() => setGlobalError("")} />

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <RoleSelector
              value={field.value}
              onChange={field.onChange}
              error={errors.role?.message}
            />
          )}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="yourname@dentalcrm.example"
          required
          error={errors.email?.message}
          disabled={isSubmitting}
          {...register("email")}
        />

        <PasswordInput
          label="Password"
          placeholder="••••••••"
          required
          error={errors.password?.message}
          disabled={isSubmitting}
          {...register("password")}
        />

        <div className="flex items-center justify-between text-sm select-none">
          <label className="flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-input text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer accent-primary"
              disabled={isSubmitting}
              {...register("rememberMe")}
            />
            <span>Remember Me</span>
          </label>
          
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="font-medium text-primary hover:text-[oklch(0.53_0.09_165)] transition-colors duration-150 cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        {/* Sign in submit */}
        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Sign In
        </Button>

        {/* Link to Register */}
        <div className="text-center text-sm text-muted-foreground mt-4 select-none">
          New to Aurea?{" "}
          <button
            type="button"
            onClick={() => navigate("/register", { state: { defaultRole: ROLES.CLINIC_MANAGER } })}
            className="font-semibold text-primary hover:underline cursor-pointer"
          >
            Sign Up
          </button>
        </div>

        {/* Portal Switcher Links */}
        <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground select-none">
          <button
            type="button"
            onClick={() => navigate("/admin-login")}
            className="hover:text-foreground hover:underline transition-colors cursor-pointer"
          >
            Practice Admin
          </button>
          <span>&bull;</span>
          <button
            type="button"
            onClick={() => navigate("/super-admin-login")}
            className="hover:text-foreground hover:underline transition-colors cursor-pointer"
          >
            Platform Ops
          </button>
        </div>
      </form>
    </AuthCard>
  );
}

export default StaffLogin;
