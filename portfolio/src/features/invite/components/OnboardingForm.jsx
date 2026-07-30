import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "@/services/user.service";
import { onboardingSchema } from "@/schemas/onboardingSchema";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ROLE_REDIRECTS, ROLE_LABELS } from "@/constants/roles";
import { toast } from "sonner";
import { Button } from "@/shared/ui/Button";
import { AuthField } from "@/shared/ui/AuthField";

export default function OnboardingForm() {
  const { user, refetch } = useCurrentUser();
  const navigate = useNavigate();
  
  const [values, setValues] = useState({
    phone: "",
    avatar: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // If already complete, just redirect
  if (user?.onboardingComplete) {
    const redirectPath = ROLE_REDIRECTS[user.role] || "/dashboard";
    navigate(redirectPath);
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = onboardingSchema.safeParse(values);
    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach(issue => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await updateProfile(user.id, values);
    setIsLoading(false);

    if (error) {
      toast.error(error);
    } else {
      await refetch();
      toast.success("Profile updated");
      const redirectPath = ROLE_REDIRECTS[user.role] || "/dashboard";
      navigate(redirectPath);
    }
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h1 className="font-display text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Just a few more details to get you started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Read-Only Fields */}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
                <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-500">{user.email}</div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-500">
                  {ROLE_LABELS[user.role] || user.role}
                </div>
              </div>
              {user.clinic && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Assigned Clinic</label>
                  <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-500">{user.clinic}</div>
                </div>
              )}
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <AuthField
                label="Phone Number (Optional)"
                id="phone"
                type="tel"
                value={values.phone}
                onChange={(e) => {
                  setValues({ ...values, phone: e.target.value });
                  setErrors({ ...errors, phone: "" });
                }}
                error={errors.phone}
              />
              <AuthField
                label="Avatar URL (Optional)"
                id="avatar"
                type="url"
                value={values.avatar}
                onChange={(e) => {
                  setValues({ ...values, avatar: e.target.value });
                  setErrors({ ...errors, avatar: "" });
                }}
                error={errors.avatar}
                placeholder="https://example.com/avatar.jpg"
              />
              <div>
                <label htmlFor="timezone" className="mb-1 block text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <select
                  id="timezone"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={values.timezone}
                  onChange={(e) => {
                    setValues({ ...values, timezone: e.target.value });
                    setErrors({ ...errors, timezone: "" });
                  }}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/Denver">Mountain Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Karachi">Karachi</option>
                </select>
                {errors.timezone && <p className="mt-1 text-xs text-red-500">{errors.timezone}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 text-right">
            <Button type="submit" isLoading={isLoading}>
              Complete Setup
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
