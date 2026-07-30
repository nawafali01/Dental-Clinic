import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getUserByToken } from "@/services/user.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { passwordSchema } from "@/schemas/passwordSchema";
import { ROLE_LABELS } from "@/constants/roles";
import { toast } from "sonner";
import { Button } from "@/shared/ui/Button";
import { AuthField } from "@/shared/ui/AuthField";
import { ShieldCheck, User as UserIcon } from "lucide-react";

export default function AcceptInviteForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const { handleAcceptInvite, isLoading: isSubmitting } = useAuth();
  
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function fetchUser() {
      if (!token) {
        setLoadingUser(false);
        return;
      }
      const { data, error } = await getUserByToken(token);
      if (error || !data) {
        toast.error("Invite expired or invalid.");
      } else {
        setUser(data);
      }
      setLoadingUser(false);
    }
    fetchUser();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = passwordSchema.safeParse(values);
    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach(issue => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    await handleAcceptInvite(token, values.password);
  };

  if (loadingUser) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <ShieldCheck className="mx-auto mb-4 size-12 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">Invalid Invite</h1>
          <p className="mt-2 text-gray-500">This invite link has expired or is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
            <UserIcon className="size-6 text-primary" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-gray-900">Welcome to Aurea</h1>
          <p className="mt-1 text-sm text-gray-500">Set up your password to activate your account</p>
        </div>

        {/* Read-only User Info */}
        <div className="mb-8 rounded-lg bg-gray-50 p-4 text-sm">
          <div className="grid grid-cols-3 gap-2 py-1">
            <span className="text-gray-500">Name</span>
            <span className="col-span-2 font-medium text-gray-900">{user.fullName}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-1">
            <span className="text-gray-500">Email</span>
            <span className="col-span-2 font-medium text-gray-900">{user.email}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-1">
            <span className="text-gray-500">Role</span>
            <span className="col-span-2 font-medium text-gray-900">{ROLE_LABELS[user.role] || user.role}</span>
          </div>
          {user.clinic && (
            <div className="grid grid-cols-3 gap-2 py-1">
              <span className="text-gray-500">Clinic</span>
              <span className="col-span-2 font-medium text-gray-900">{user.clinic}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthField
            label="Password"
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

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Activate Account
          </Button>
        </form>
      </div>
    </div>
  );
}
