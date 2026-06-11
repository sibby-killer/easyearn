"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  status: string;
  reward: number;
  createdAt: string;
  referrerName: string;
  refereeName: string;
}

export default function AdminReferrals() {
  const router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchReferrals = useCallback(async () => {
    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    if (!meData.user?.isAdmin) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }
    const res = await fetch("/api/referrals/all");
    const data = await res.json();
    setReferrals(data.referrals);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const filtered =
    statusFilter === "all"
      ? referrals
      : referrals.filter((r) => r.status === statusFilter);

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
        <h1 className="text-3xl font-bold">Referral Management</h1>
        <button
          onClick={() => router.push("/admin")}
          className="text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back
        </button>
      </div>

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
              <th className="text-left py-3 px-2">Referrer</th>
              <th className="text-left py-3 px-2">Referee</th>
              <th className="text-left py-3 px-2">Status</th>
              <th className="text-left py-3 px-2">Reward</th>
              <th className="text-left py-3 px-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                <td className="py-3 px-2 font-medium">{r.referrerName}</td>
                <td className="py-3 px-2">{r.refereeName}</td>
                <td className="py-3 px-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      r.status === "completed"
                        ? "bg-green-600/20 text-green-400"
                        : r.status === "rejected"
                        ? "bg-red-600/20 text-red-400"
                        : "bg-amber-600/20 text-amber-400"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="py-3 px-2 text-emerald-400">
                  ${r.reward.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No referrals found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
