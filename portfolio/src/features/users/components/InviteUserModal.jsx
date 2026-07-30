import { useState } from "react";
import { inviteUser } from "@/services/user.service";
import { inviteSchema } from "@/schemas/inviteSchema";
import { ROLES, ROLE_LABELS } from "@/constants/roles";
import { toast } from "sonner";
import { Button } from "@/shared/ui/Button";
import { AuthField } from "@/shared/ui/AuthField";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function InviteUserModal({ isOpen, onClose, onSuccess }) {
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    role: ROLES.AGENT,
    clinic: "",
    organization: "Aurea Dental Group",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const { user: currentUser } = useCurrentUser();

  // Filter roles: Admins cannot be created via this modal.
  const availableRoles = Object.values(ROLES).filter((r) => {
    if (r === ROLES.SUPER_ADMIN || r === ROLES.ORG_ADMIN) return false;
    return true;
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setInviteLink("");

    const result = inviteSchema.safeParse(values);
    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setIsLoading(true);
    const { data: user, error } = await inviteUser(values);
    setIsLoading(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success("User invited successfully!");
      // Simulate sending email by providing the link directly in UI for testing
      const link = `${window.location.origin}/accept-invite?token=${user.inviteToken}`;
      setInviteLink(link);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="font-display text-xl font-bold text-gray-900 mb-4">Invite New User</h2>
        
        {!inviteLink ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthField
              label="Full Name"
              id="fullName"
              value={values.fullName}
              onChange={(e) => setValues({ ...values, fullName: e.target.value })}
              error={errors.fullName}
            />
            <AuthField
              label="Email Address"
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              error={errors.email}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                <select
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={values.role}
                  onChange={(e) => setValues({ ...values, role: e.target.value })}
                >
                  {availableRoles.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
              <AuthField
                label="Clinic (Optional)"
                id="clinic"
                value={values.clinic}
                onChange={(e) => setValues({ ...values, clinic: e.target.value })}
                error={errors.clinic}
              />
            </div>
            
            <AuthField
              label="Organization"
              id="organization"
              value={values.organization}
              onChange={(e) => setValues({ ...values, organization: e.target.value })}
              error={errors.organization}
            />

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Send Invite
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 rounded-lg bg-green-50 p-4 border border-green-200">
            <h3 className="text-sm font-bold text-green-800">Invite Created Successfully</h3>
            <p className="text-xs text-green-700">
              In a real application, an email would be sent. For this demo, you can open the invite link below to simulate the user flow:
            </p>
            <div className="break-all rounded bg-white p-2 text-xs border border-green-100 text-gray-600">
              {inviteLink}
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button type="button" onClick={() => window.open(inviteLink, "_blank")}>
                Open Invite
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
