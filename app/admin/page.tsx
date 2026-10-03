// app/admin/page.tsx (Super Admin Only)

"use client";
import { useEffect, useState } from "react";
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

  const loadUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.ok) setUsers(data.users);
    else toast.error(data.message);
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
      toast.success("Role changed");
      loadUsers();
    } else {
      toast.error(data.message);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      toast.success("User successfully Deleted!");
      loadUsers();
    } else {
      toast.error(data.message);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-dark mb-1">Super Admin Panel</h1>
        <p className="text-dark-soft text-xs mb-6">
          From here you can make or delete any user as vendor / superadmin / user.
        </p>

        <div className="bg-background-card rounded-xl2 shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-dark-soft border-b border-gray-100">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Role</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-dark-soft">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading &&
                users.map((u) => (
                  <tr key={u._id} className="border-b border-gray-50 last:border-0">
                    <td className="p-4 font-medium text-dark">{u.name}</td>
                    <td className="p-4 text-dark-soft">{u.email}</td>
                    <td className="p-4 text-dark-soft">{u.mobile || "-"}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u._id, e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="user">user</option>
                        <option value="vendor">vendor</option>
                        <option value="superadmin">superadmin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
