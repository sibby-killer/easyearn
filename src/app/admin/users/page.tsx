"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  gender: string;
  employment: string;
  dailyGoal: string;
  isAdmin: number;
  createdAt: string;
}

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    if (!meData.user?.isAdmin) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data.users);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.location.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400 text-2xl font-bold">Unauthorized</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={() => router.push("/admin")}
          className="text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, location, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
              <th className="text-left py-3 px-2">Name</th>
              <th className="text-left py-3 px-2">Phone</th>
              <th className="text-left py-3 px-2">Location</th>
              <th className="text-left py-3 px-2">Gender</th>
              <th className="text-left py-3 px-2">Employment</th>
              <th className="text-left py-3 px-2">Daily Goal</th>
              <th className="text-left py-3 px-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <>
                <tr
                  key={u.id}
                  onClick={() =>
                    setExpandedId(expandedId === u.id ? null : u.id)
                  }
                  className="border-b border-gray-800/50 hover:bg-gray-900/50 cursor-pointer"
                >
                  <td className="py-3 px-2 font-medium">
                    {u.fullName}
                    {u.isAdmin ? (
                      <span className="ml-2 text-xs bg-amber-600/20 text-amber-400 px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3 px-2">{u.phone}</td>
                  <td className="py-3 px-2">{u.location}</td>
                  <td className="py-3 px-2">{u.gender}</td>
                  <td className="py-3 px-2">{u.employment}</td>
                  <td className="py-3 px-2">{u.dailyGoal}</td>
                  <td className="py-3 px-2 text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
                {expandedId === u.id && (
                  <tr key={`${u.id}-details`}>
                    <td colSpan={7} className="bg-gray-900/50 px-6 py-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <p>{u.email || "-"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Phone:</span>
                          <p>{u.phone}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <p>{u.location}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Gender:</span>
                          <p>{u.gender}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Employment:</span>
                          <p>{u.employment}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Daily Goal:</span>
                          <p>{u.dailyGoal}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Role:</span>
                          <p>{u.isAdmin ? "Admin" : "User"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Joined:</span>
                          <p>{new Date(u.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  {search ? "No users match your search" : "No users found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
