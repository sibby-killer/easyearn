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

function WithdrawalSection({ totalEarned }: { totalEarned: number }) {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("paypal");
  const [account, setAccount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/withdrawals").then(r => r.json()).then(d => setWithdrawals(d.withdrawals || [])).catch(() => {});
  }, []);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), method, account }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: "Withdrawal requested! Admin will review shortly." });
        setAmount(""); setAccount("");
        setShowForm(false);
        const d2 = await fetch("/api/withdrawals").then(r => r.json());
        setWithdrawals(d2.withdrawals || []);
      } else {
        setMsg({ type: "error", text: data.error || "Failed" });
      }
    } catch {
      setMsg({ type: "error", text: "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  const usdEarned = Math.min(5, (totalEarned / 30) * 5);
  const canWithdraw = totalEarned >= 2;

  return (
    <div className="bg-card border border-border rounded-xl p-6 mt-8">
      <h2 className="text-lg font-semibold text-text mb-1">Withdraw Earnings</h2>
      <p className="text-text-muted text-sm mb-4">
        Your <strong>{totalEarned.toFixed(2)} MT</strong> = ${usdEarned.toFixed(2)} USD toward first $5. Minimum withdrawal: $2
      </p>

      {/* Mini progress to $5 */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-text-muted mb-1">
          <span>Progress to $5 withdrawal ({30 - Math.min(30, totalEarned)} MT remaining)</span>
          <span>${usdEarned.toFixed(2)} / $5.00</span>
        </div>
        <div className="w-full bg-dark rounded-full h-2.5">
          <div className="h-full bg-success rounded-full transition-all" style={{ width: `${Math.min(100, (totalEarned / 30) * 100)}%` }} />
        </div>
      </div>

      {msg && (
        <div className={`text-sm rounded-lg px-4 py-3 mb-4 ${msg.type === "success" ? "bg-green-500/10 text-green-400" : "bg-danger/10 text-danger"}`}>
          {msg.text}
        </div>
      )}

      {withdrawals.filter(w => w.status === "pending").length > 0 && (
        <p className="text-amber-400 text-sm mb-3">⏳ You have a pending withdrawal request</p>
      )}

      {showForm ? (
        <form onSubmit={handleRequest} className="space-y-3">
          <div>
            <label className="block text-xs text-text-muted mb-1">Amount ($)</label>
            <input type="number" step="0.01" min="2" required value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-dark border border-border rounded-lg px-3 py-2 text-text text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">Method</label>
              <select value={method} onChange={e => setMethod(e.target.value)}
                className="w-full bg-dark border border-border rounded-lg px-3 py-2 text-text text-sm focus:outline-none focus:border-primary">
                <option value="paypal">PayPal</option>
                <option value="mpesa">M-Pesa</option>
                <option value="airtel">Airtel Money</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Account / Email</label>
              <input type="text" required value={account}
                onChange={e => setAccount(e.target.value)}
                className="w-full bg-dark border border-border rounded-lg px-3 py-2 text-text text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-success hover:bg-green-600 text-white text-sm font-medium rounded-lg transition disabled:opacity-50">
              {submitting ? "Requesting..." : "Request Withdrawal"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-text-muted hover:text-text text-sm transition">Cancel</button>
          </div>
        </form>
      ) : (
        <button onClick={() => canWithdraw ? setShowForm(true) : null}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${canWithdraw ? "bg-success hover:bg-green-600 text-white" : "bg-border text-text-muted cursor-not-allowed"}`}>
          {canWithdraw ? "Request Withdrawal" : "Earn 2 MT to withdraw"}
        </button>
      )}

      {/* Withdrawal history */}
      {withdrawals.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-text mb-2">History</h3>
          <div className="space-y-1.5">
            {withdrawals.slice(0, 5).map((w: any) => (
              <div key={w.id} className="flex items-center justify-between text-sm">
                <span className="text-text-muted">${w.amount.toFixed(2)} via {w.method}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${w.status === "approved" ? "text-green-400" : w.status === "rejected" ? "text-red-400" : "text-amber-400"}`}>{w.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
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

        {/* Withdrawal Section */}
        <WithdrawalSection totalEarned={totalEarned} />
      </div>
    </div>
  );
}
