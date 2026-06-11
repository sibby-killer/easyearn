"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Submission {
  id: string;
  userId: string;
  taskId: string;
  screenshot: string;
  status: string;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
}

interface User {
  id: string;
  fullName: string;
}

export default function AdminSubmissions() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tasksMap, setTasksMap] = useState<Map<string, string>>(new Map());
  const [usersMap, setUsersMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [actionMsg, setActionMsg] = useState<{
    id: string;
    text: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    const meRes = await fetch("/api/auth/me");
    const meData = await meRes.json();
    if (!meData.user?.isAdmin) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }

    const [subRes, tasksRes, usersRes] = await Promise.all([
      fetch("/api/submissions?status=pending"),
      fetch("/api/tasks?category=all"),
      fetch("/api/users"),
    ]);

    const subData = await subRes.json();
    const tasksData = await tasksRes.json();
    const usersData = await usersRes.json();

    setSubmissions(subData.submissions);

    const tMap = new Map<string, string>();
    for (const t of tasksData.tasks as Task[]) {
      tMap.set(t.id, t.title);
    }
    setTasksMap(tMap);

    const uMap = new Map<string, string>();
    for (const u of usersData.users as User[]) {
      uMap.set(u.id, u.fullName);
    }
    setUsersMap(uMap);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleAction(submissionId: string, status: string) {
    const res = await fetch(`/api/submissions/${submissionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) {
      setActionMsg({ id: submissionId, text: `${status} successfully` });
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      setTimeout(() => setActionMsg(null), 2000);
    }
  }

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
        <h1 className="text-3xl font-bold">Submission Review</h1>
        <button
          onClick={() => router.push("/admin")}
          className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          &larr; Back
        </button>
      </div>

      <p className="text-gray-400 text-sm mb-6">Pending submissions: {submissions.length}. Approve or reject each submission.</p>

      <div className="flex gap-4 mb-6">
        <button onClick={() => router.push("/admin/submissions")} className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-amber-600 text-white">Pending</button>
        <button onClick={() => router.push("/admin/submissions?status=approved")} className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700">Approved</button>
        <button onClick={() => router.push("/admin/submissions?status=rejected")} className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700">Rejected</button>
      </div>

      {actionMsg && (
        <div className="mb-4 bg-emerald-600/20 text-emerald-400 px-4 py-2 rounded-lg">
          {actionMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {submissions.map((sub) => (
          <div
            key={sub.id}
            className="bg-gray-900 rounded-xl p-5 border border-gray-800"
          >
            <div className="mb-3">
              <h3 className="font-semibold text-lg">
                {tasksMap.get(sub.taskId) || "Loading..."}
              </h3>
              <p className="text-sm text-gray-400">
                by {usersMap.get(sub.userId) || "Loading..."}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(sub.createdAt).toLocaleString()}
              </p>
            </div>
            {sub.screenshot && (
              <a
                href={sub.screenshot}
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-4"
              >
                <img
                  src={sub.screenshot}
                  alt="Screenshot"
                  className="w-full h-40 object-cover rounded-lg bg-gray-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='100'><rect fill='%23333' width='200' height='100'/><text x='50%25' y='50%25' fill='%23666' text-anchor='middle' dy='.3em' font-size='12'>No preview</text></svg>";
                  }}
                />
              </a>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => handleAction(sub.id, "approved")}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(sub.id, "rejected")}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {submissions.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-500">
            No pending submissions
          </div>
        )}
      </div>
    </div>
  );
}
