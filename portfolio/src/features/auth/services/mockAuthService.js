import { toast } from "sonner";

const mockInvite = {
  token: "abc123",
  email: "sarah@clinic.com",
  role: "Clinic Manager",
  clinic: "Manchester Central Clinic",
};

const roleRedirectMap = {
  super_admin: "/dashboard",
  organization_admin: "/dashboard",
  clinic_manager: "/dashboard",
  sales_agent: "/dashboard",
  reception: "/dashboard",
  finance: "/dashboard",
  auditor: "/dashboard",
};

export async function mockLogin({ email, password }) {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  if (!email || !password) {
    throw new Error("Please provide your email and password.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const role = normalizedEmail.includes("admin") ? "super_admin" : "clinic_manager";

  toast.success("Signed in successfully.");

  return {
    role,
    redirectTo: roleRedirectMap[role] || "/dashboard",
  };
}

export async function mockInviteActivation({ fullName, password, confirmPassword }) {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  if (!fullName || !password || !confirmPassword) {
    throw new Error("Please complete all required fields.");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  toast.success("Invitation activated successfully.");

  return { success: true };
}

export function getMockInvite(token) {
  if (!token || token !== mockInvite.token) {
    return null;
  }

  return mockInvite;
}
