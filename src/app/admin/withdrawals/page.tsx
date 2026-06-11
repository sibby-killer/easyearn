"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  userCountry: string;
  amount: number;
  method: string;
  account: string;
  status: string;
  createdAt: string;
}

export default function AdminWithdrawals() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string } | null>(null);

  const fetchData = useCallback(async () => {
    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    if (!meData.user?.isAdmin) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }
    const res = await fetch("/api/withdrawals/all");
    const data = await res.json();
    setWithdrawals(data.withdrawals || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAction(id: string, status: string) {
    await fetch(`/api/withdrawals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setActionMsg({ text: `Withdrawal ${status}` });
    setTimeout(() => setActionMsg(null), 2000);
    fetchData();
  }

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="text-gray-400 text-lg">Loading...</div></div>;
  if (unauthorized) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="text-red-400 text-2xl font-bold">Unauthorized</div></div>;

  const pending = withdrawals.filter(w => w.status === "pending");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Withdrawals</h1>
        <button onClick={() => router.push("/admin")} className="text-gray-400 hover:text-white transition-colors">&larr; Back</button>
      </div>

      {actionMsg && <div className="mb-4 bg-emerald-600/20 text-emerald-400 px-4 py-2 rounded-lg">{actionMsg.text}</div>}

      {pending.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-3 text-amber-400">Pending ({pending.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            {pending.map((w) => (
              <div key={w.id} className="bg-gray-900 rounded-xl p-5 border border-amber-800/50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-amber-400">${w.amount.toFixed(2)}</h3>
                  <span className="text-xs bg-amber-600/20 text-amber-400 px-2 py-1 rounded">{w.method}</span>
                </div>
                <p className="text-sm text-gray-300">{w.userName || w.userId}</p>
                {w.userCountry && <p className="text-xs text-gray-500">📍 {w.userCountry}</p>}
                <p className="text-xs text-gray-500 mt-1">Account: {w.account}</p>
                <p className="text-xs text-gray-500">{new Date(w.createdAt).toLocaleString()}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleAction(w.id, "approved")} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">Approve</button>
                  <button onClick={() => handleAction(w.id, "rejected")} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="text-xl font-semibold mb-3">History ({withdrawals.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
              <th className="text-left py-3 px-2">User</th>
              <th className="text-left py-3 px-2">Amount</th>
              <th className="text-left py-3 px-2">Method</th>
              <th className="text-left py-3 px-2">Account</th>
              <th className="text-left py-3 px-2">Status</th>
              <th className="text-left py-3 px-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                <td className="py-3 px-2 font-medium">{w.userName || w.userId}</td>
                <td className="py-3 px-2 text-emerald-400">${w.amount.toFixed(2)}</td>
                <td className="py-3 px-2 text-gray-400">{w.method}</td>
                <td className="py-3 px-2 text-gray-400">{w.account}</td>
                <td className="py-3 px-2">
                  <span className={`text-xs px-2 py-1 rounded ${w.status === "approved" ? "bg-green-600/20 text-green-400" : w.status === "rejected" ? "bg-red-600/20 text-red-400" : "bg-amber-600/20 text-amber-400"}`}>{w.status}</span>
                </td>
                <td className="py-3 px-2 text-gray-400">{new Date(w.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {withdrawals.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-500">No withdrawals</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
