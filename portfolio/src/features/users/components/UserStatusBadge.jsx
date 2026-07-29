import { STATUS } from "@/constants/roles";

export function UserStatusBadge({ status }) {
  const styles = {
    [STATUS.ACTIVE]: "bg-green-100 text-green-700 border-green-200",
    [STATUS.INVITED]: "bg-amber-100 text-amber-700 border-amber-200",
    [STATUS.DISABLED]: "bg-red-100 text-red-700 border-red-200",
  };

  const labels = {
    [STATUS.ACTIVE]: "Active",
    [STATUS.INVITED]: "Invited",
    [STATUS.DISABLED]: "Disabled",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
