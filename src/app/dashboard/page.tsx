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
}

interface Task {
  id: string;
  title: string;
  payout: number;
  requiredCompletions: number;
}

interface Submission {
  id: string;
  userId: string;
  taskId: string;
  screenshot: string;
  status: string;
  createdAt: string;
}

interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  status: string;
  reward: number;
  createdAt: string;
}

interface ReferralData {
  referrals: Referral[];
  completedCount: number;
  pendingCount: number;
  bonusAmount: number;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusColor(status: string) {
  switch (status) {
    case "approved":
      return "text-success";
    case "rejected":
      return "text-danger";
    default:
      return "text-warning";
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [meRes, tasksRes, subsRes, refRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/tasks"),
        fetch("/api/submissions"),
        fetch("/api/referrals"),
      ]);

      const meData = await meRes.json();
      if (!meData.user) {
        router.push("/login");
        return;
      }

      const tasksData = await tasksRes.json();
      const subsData = await subsRes.json();
      const refData = await refRes.json();

      setUser(meData.user);
      setTasks(tasksData.tasks || []);
      setSubmissions(subsData.submissions || []);
      setReferralData(refData);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const taskMap = new Map<string, Task>();
  tasks.forEach((t) => taskMap.set(t.id, t));

  const approvedSubs = submissions.filter((s) => s.status === "approved");
  const pendingSubs = submissions.filter((s) => s.status === "pending");

  const totalEarned = approvedSubs.reduce((sum, s) => {
    const task = taskMap.get(s.taskId);
    return sum + (task ? task.payout : 0);
  }, 0);

  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const progressByTask = new Map<string, Submission[]>();
  submissions.forEach((s) => {
    const arr = progressByTask.get(s.taskId) || [];
    arr.push(s);
    progressByTask.set(s.taskId, arr);
  });

  const handleCopyLink = async () => {
    if (!user) return;
    const link = `${window.location.origin}/?ref=${user.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  const referralLink = `${window.location.origin}/?ref=${user.id}`;

  return (
    <div className="min-h-screen bg-dark">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">
            Welcome, {user.fullName}
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Here&apos;s your earning activity overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-text-muted text-sm">Total Tasks Done</p>
            <p className="text-3xl font-bold text-text mt-1">
              {submissions.length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-text-muted text-sm">Total Earned</p>
            <p className="text-3xl font-bold text-success mt-1">
              {totalEarned.toFixed(2)} MT
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-text-muted text-sm">Pending Approvals</p>
            <p className="text-3xl font-bold text-warning mt-1">
              {pendingSubs.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Submissions */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text mb-4">
              Recent Submissions
            </h2>
            {recentSubmissions.length === 0 ? (
              <p className="text-text-muted text-sm">
                No submissions yet. Start working on tasks!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 text-text-muted font-medium">
                        Task
                      </th>
                      <th className="text-left py-2 pr-4 text-text-muted font-medium">
                        Status
                      </th>
                      <th className="text-left py-2 text-text-muted font-medium">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSubmissions.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-3 pr-4 text-text">
                          {taskMap.get(s.taskId)?.title || "Unknown Task"}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`capitalize font-medium ${statusColor(s.status)}`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 text-text-muted">
                          {formatDate(s.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tasks In Progress */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text mb-4">
              Tasks In Progress
            </h2>
            {progressByTask.size === 0 ? (
              <p className="text-text-muted text-sm">
                No tasks in progress. Browse tasks to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {Array.from(progressByTask.entries()).map(
                  ([taskId, subs]) => {
                    const task = taskMap.get(taskId);
                    const required = task?.requiredCompletions || 1;
                    const approvedCount = subs.filter(
                      (s) => s.status === "approved"
                    ).length;
                    const pct = Math.min(
                      Math.round((approvedCount / required) * 100),
                      100
                    );

                    return (
                      <div key={taskId}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-text font-medium truncate mr-2">
                            {task?.title || "Unknown Task"}
                          </span>
                          <span className="text-xs text-text-muted shrink-0">
                            {approvedCount}/{required}
                          </span>
                        </div>
                        <div className="w-full bg-dark rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>

        {/* Referral Section */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-text mb-4">
            Refer & Earn
          </h2>
          <p className="text-text-muted text-sm mb-4">
            Share your referral link and earn bonuses when people sign up and
            complete tasks.
          </p>

          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 px-4 py-2.5 bg-dark border border-border rounded-lg text-text text-sm focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition shrink-0"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {referralData && (
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-text-muted">Total Referrals: </span>
                <span className="text-text font-semibold">
                  {referralData.completedCount + referralData.pendingCount}
                </span>
              </div>
              <div>
                <span className="text-text-muted">Completed: </span>
                <span className="text-success font-semibold">
                  {referralData.completedCount}
                </span>
              </div>
              <div>
                <span className="text-text-muted">Pending: </span>
                <span className="text-warning font-semibold">
                  {referralData.pendingCount}
                </span>
              </div>
              {referralData.bonusAmount > 0 && (
                <div>
                  <span className="text-text-muted">Bonus: </span>
                  <span className="text-success font-semibold">
                    +{referralData.bonusAmount.toFixed(2)} MT
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
