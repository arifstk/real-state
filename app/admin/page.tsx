// app/admin/page.tsx (Super Admin Only)

"use client";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

type UserRow = {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  role: "superadmin" | "vendor" | "user";
  provider: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      } else {
        toast.error(data.message || "Failed to load users");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const changeRole = async (id: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Role changed successfully");
        loadUsers();
      } else {
        toast.error(data.message || "Failed to change role");
      }
    } catch {
      toast.error("Error updating user role");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("User successfully deleted!");
        loadUsers();
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch {
      toast.error("Error deleting user");
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Super Admin Panel</h1>
        <p className="text-slate-500 text-xs mb-6">
          Manage system users, assign roles (Vendor / Super Admin / User), or remove accounts.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200 bg-slate-50">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Role</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-800">{u.name}</td>
                    <td className="p-4 text-slate-600">{u.email}</td>
                    <td className="p-4 text-slate-500">{u.mobile || "-"}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u._id, e.target.value)}
                        className="border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium text-slate-700 bg-white cursor-pointer"
                      >
                        <option value="user">User</option>
                        <option value="vendor">Vendor</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

