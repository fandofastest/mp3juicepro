"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api-client";
import { Users, Edit2, Trash2, Shield, Award, CheckCircle } from "lucide-react";

export default function UsersManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form fields
  const [role, setRole] = useState("User");
  const [status, setStatus] = useState("active");
  const [premium, setPremium] = useState(false);
  const [verified, setVerified] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    apiRequest("/users")
      .then((res) => {
        setUsers(res.users || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load users");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setRole(user.role);
    setStatus(user.status);
    setPremium(user.premium);
    setVerified(user.verified);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/users", "PUT", {
        userId: selectedUser._id,
        role,
        status,
        premium,
        verified,
      });
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Failed to update user");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiRequest(`/users?id=${id}`, "DELETE");
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Users Directory</h1>
        <p className="text-sm text-stone-400 mt-1">Manage user accounts, roles, premium subscriptions, and statuses.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-300">
            <thead className="border-b border-stone-800 bg-stone-950/40 text-stone-400 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Premium</th>
                <th className="p-4">Verified</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/40">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-stone-800/20">
                  <td className="p-4">
                    <div>
                      <p className="font-bold text-white text-sm">{u.displayName}</p>
                      <p className="text-xs text-stone-500">@{u.username} • {u.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 text-xs">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      u.status === "active" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : u.status === "suspended" 
                        ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                        : "bg-stone-800 text-stone-400"
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.premium ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                        <Award className="w-4 h-4" />
                        PRO
                      </span>
                    ) : (
                      <span className="text-xs text-stone-500">Free</span>
                    )}
                  </td>
                  <td className="p-4">
                    {u.verified ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <span className="text-xs text-stone-500">No</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 rounded bg-stone-850 hover:bg-stone-800 text-emerald-400 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="p-1.5 rounded bg-stone-850 hover:bg-red-500/10 text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md p-6 bg-stone-900 border border-stone-800 rounded-xl shadow-xl z-10">
            <h2 className="text-lg font-bold text-white mb-6">
              Manage User: {selectedUser?.displayName}
            </h2>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  System Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="User">User (Standard Listener)</option>
                  <option value="Premium">Premium Listener</option>
                  <option value="Moderator">Moderator (Content Editor)</option>
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  Profile Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="premium"
                    checked={premium}
                    onChange={(e) => setPremium(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 bg-stone-950 border-stone-800 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="premium" className="ml-2 text-sm font-semibold text-stone-300">
                    Premium Subscriber
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={verified}
                    onChange={(e) => setVerified(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 bg-stone-950 border-stone-800 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="verified" className="ml-2 text-sm font-semibold text-stone-300">
                    Verified Account
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition"
                >
                  Save Profile changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
