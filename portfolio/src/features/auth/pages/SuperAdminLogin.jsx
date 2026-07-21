import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { superAdminLoginSchema } from "../schemas/authSchemas";
import { AuthCard } from "../../../components/ui/AuthCard";
import { Input } from "../../../components/ui/Input";
import { PasswordInput } from "../../../components/ui/PasswordInput";
import { Button } from "../../../components/ui/Button";
import { ErrorAlert } from "../../../components/ui/Alerts";
import { ROLES } from "../constants/authConstants";

/**
 * Super Admin Login View `/super-admin-login`
 */
export function SuperAdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(superAdminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setGlobalError("");
    try {
      await login({
        email: data.email,
        password: data.password,
        role: ROLES.SUPER_ADMIN,
      });
      toast.success("Welcome back, Super Admin!");
      navigate("/super-admin/dashboard");
    } catch (err) {
      const message = err?.data?.message || err?.message || "An unexpected login error occurred";
      setGlobalError(message);
      toast.error(message);
    }
  };

  return (
    <AuthCard
      title="Platform Operations Portal"
      subtitle="Super Admin access panel to manage multi-clinic tenants, system metrics and billing cycles."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <ErrorAlert message={globalError} onClose={() => setGlobalError("")} />

        <Input
          label="Super Admin Email"
          type="email"
          placeholder="superadmin@dentalcrm.example"
          required
          error={errors.email?.message}
          disabled={isSubmitting}
          {...register("email")}
        />

        <PasswordInput
          label="Super Admin Password"
          placeholder="••••••••"
          required
          error={errors.password?.message}
          disabled={isSubmitting}
          {...register("password")}
        />

        <div className="flex items-center justify-end text-sm select-none">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="font-medium text-primary hover:text-[oklch(0.53_0.09_165)] transition-colors duration-150 cursor-pointer"
          >
            Report security issues?
          </button>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Sign In to System Ops
        </Button>

        {/* Link to Register */}
        <div className="text-center text-sm text-muted-foreground mt-4 select-none">
          Deploying new clinic?{" "}
          <button
            type="button"
            onClick={() => navigate("/register-super-admin")}
            className="font-semibold text-primary hover:underline cursor-pointer"
          >
            Sign Up
          </button>
        </div>

        {/* Portal Switcher Links */}
        <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground select-none">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="hover:text-foreground hover:underline transition-colors cursor-pointer"
          >
            Staff Workstation
          </button>
          <span>&bull;</span>
          <button
            type="button"
            onClick={() => navigate("/admin-login")}
            className="hover:text-foreground hover:underline transition-colors cursor-pointer"
          >
            Practice Admin
          </button>
        </div>
      </form>
    </AuthCard>
  );
}

export default SuperAdminLogin;
