import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "@/services/auth.service";
import { passwordSchema } from "@/schemas/passwordSchema";
import { toast } from "sonner";
import { Button } from "@/shared/ui/Button";
import { AuthField } from "@/shared/ui/AuthField";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();

  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Invalid reset link");
      return;
    }

    const result = passwordSchema.safeParse(values);
    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach(issue => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(email, values.password);
    setIsLoading(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Password reset successfully. You can now log in.");
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="mt-2 text-sm text-gray-500">Create a new password for {email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthField
            label="New Password"
            id="password"
            type="password"
            value={values.password}
            onChange={(e) => {
              setValues({ ...values, password: e.target.value });
              setErrors({ ...errors, password: "" });
            }}
            error={errors.password}
          />
          <AuthField
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={(e) => {
              setValues({ ...values, confirmPassword: e.target.value });
              setErrors({ ...errors, confirmPassword: "" });
            }}
            error={errors.confirmPassword}
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}
