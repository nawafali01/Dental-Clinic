import { useState, useEffect } from "react";
import { getUsers } from "@/services/user.service";
import { ROLE_LABELS, STATUS } from "@/constants/roles";
import { UserStatusBadge } from "./UserStatusBadge";
import { InviteUserModal } from "./InviteUserModal";
import { Button } from "@/shared/ui/Button";
import { Search, Plus, MoreVertical, ShieldAlert } from "lucide-react";
import { handleUserAction } from "@/utils/userUtils";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [filters, setFilters] = useState({ search: "", role: "", status: "", clinic: "" });

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await getUsers(filters);
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleAction = (action, user) => {
    handleUserAction(action, user, { onSuccess: fetchUsers });
  };


  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">Manage team members and invitations across clinics.</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)} className="gap-2">
          <Plus className="size-4" />
          Invite User
        </Button>
      </div>

      {/* Filters (Basic implementation) */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className="rounded-md border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-primary focus:outline-none"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value={STATUS.ACTIVE}>Active</option>
          <option value={STATUS.INVITED}>Invited</option>
          <option value={STATUS.DISABLED}>Disabled</option>
        </select>
        {/* Additional filters can be added here */}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium">Name / Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Clinic</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.fullName || "—"}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">{ROLE_LABELS[user.role] || user.role}</td>
                    <td className="px-6 py-4">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4">{user.clinic || "All"}</td>
                    <td className="px-6 py-4 text-right">
                      {/* Simple action buttons instead of dropdown for ease of implementation */}
                      <div className="flex justify-end gap-2 text-xs">
                        {user.status === STATUS.INVITED && (
                          <>
                            <button onClick={() => handleAction("resend", user)} className="text-blue-600 hover:underline">Resend</button>
                            <button onClick={() => handleAction("revoke", user)} className="text-red-600 hover:underline">Revoke</button>
                          </>
                        )}
                        {user.status === STATUS.ACTIVE && (
                          <button onClick={() => handleAction("disable", user)} className="text-red-600 hover:underline">Disable</button>
                        )}
                        {user.status === STATUS.DISABLED && (
                          <button onClick={() => handleAction("enable", user)} className="text-green-600 hover:underline">Enable</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => fetchUsers()}
      />
    </div>
  );
}
