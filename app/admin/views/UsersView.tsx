"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type UserRow = {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  role: "superadmin" | "vendor" | "user";
};

export default function AdminUsersView() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.ok) setUsers(data.users);
    else toast.error(data.message || "Failed to fetch users");
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const changeRole = async (id: string, role: string) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Role updated");
      loadUsers();
    } else {
      toast.error(data.error || data.message);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("User deleted");
      loadUsers();
    } else {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800">User Management</h2>
      <p className="text-xs text-slate-500 mt-1 mb-6">Manage application registered accounts and privilege roles.</p>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-scroll md:overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Mobile</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">Loading...</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50">
                  <td className="p-4 text-xs font-semibold text-slate-800">{u.name}</td>
                  <td className="p-4 text-xs text-slate-600">{u.email}</td>
                  <td className="p-4 text-xs text-slate-500">{u.mobile || "-"}</td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u._id, e.target.value)}
                      className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                    >
                      <option value="user">User</option>
                      <option value="vendor">Vendor</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => deleteUser(u._id)} className="text-xs text-red-600 hover:underline font-medium cursor-pointer">
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
  );
}

