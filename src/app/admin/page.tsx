"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Stats {
  totalVisitors: number;
  totalUsers: number;
  totalTasks: number;
  pendingSubmissions: number;
  topLocations: { location: string; count: number }[];
  recentVisitors: {
    id: string;
    ip: string;
    location: string;
    country: string;
    userAgent: string;
    visitedAt: string;
  }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user?.isAdmin) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
      setLoading(false);
    })();
  }, []);

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

  const maxLocationCount = stats?.topLocations.length
    ? Math.max(...stats.topLocations.map((l) => l.count))
    : 1;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Visitors"
          value={stats?.totalVisitors ?? 0}
          icon={<EyeIcon />}
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={<UsersIcon />}
        />
        <StatCard
          title="Total Tasks"
          value={stats?.totalTasks ?? 0}
          icon={<TasksIcon />}
        />
        <StatCard
          title="Pending Submissions"
          value={stats?.pendingSubmissions ?? 0}
          icon={<ClockIcon />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Top Locations</h2>
          {stats?.topLocations.length ? (
            <div className="space-y-3">
              {stats.topLocations.map((loc) => (
                <div key={loc.location}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{loc.location || "Unknown"}</span>
                    <span className="text-gray-400">{loc.count}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2.5">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full transition-all"
                      style={{
                        width: `${(loc.count / maxLocationCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No data</p>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Visitors</h2>
          {stats?.recentVisitors.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left py-2">IP</th>
                    <th className="text-left py-2">Location</th>
                    <th className="text-left py-2">Country</th>
                    <th className="text-left py-2">Visited</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentVisitors.map((v) => (
                    <tr key={v.id} className="border-b border-gray-800/50">
                      <td className="py-2">{v.ip}</td>
                      <td className="py-2">{v.location || "-"}</td>
                      <td className="py-2">{v.country || "-"}</td>
                      <td className="py-2 text-gray-400">
                        {new Date(v.visitedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No visitors yet</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => router.push("/admin/tasks")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Manage Tasks
        </button>
        <button
          onClick={() => router.push("/admin/users")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Manage Users
        </button>
        <button
          onClick={() => router.push("/admin/submissions")}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Review Submissions
        </button>
        <button
          onClick={() => router.push("/admin/referrals")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          View Referrals
        </button>
        <button
          onClick={() => router.push("/admin/withdrawals")}
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Withdrawals
        </button>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 rounded-xl p-5 flex items-center gap-4">
      <div className="text-emerald-400">{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );
}

function TasksIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
