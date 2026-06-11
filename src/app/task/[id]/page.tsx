"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  link: string;
  image: string;
  payout: number;
  requiredCompletions: number;
  locations: string;
  instructions: string;
  active: number;
}

interface UserProgress {
  completionsDone: number;
  totalEarned: number;
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [screenshot, setScreenshot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      setUser(meData.user);

      const taskRes = await fetch(`/api/tasks/${id}`);
      const taskData = await taskRes.json();
      setTask(taskData.task);

      setLoading(false);
    }
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot) return;
    setSubmitting(true);
    setMessage("");

    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: id, screenshot }),
    });

    const data = await res.json();
    if (data.success) {
      setMessage("Screenshot submitted! Waiting for approval.");
      setScreenshot("");
    } else {
      setMessage(data.error || "Submission failed");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-text-muted">Task not found</p>
      </div>
    );
  }

  const remaining = task.requiredCompletions - (progress?.completionsDone || 0);
  const percentDone = task.requiredCompletions > 0
    ? Math.min(100, ((progress?.completionsDone || 0) / task.requiredCompletions) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="text-text-muted hover:text-text mb-6 inline-flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            {task.image ? (
              <img
                src={task.image}
                alt={task.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-4xl text-primary/40">
                  {task.category === "Survey" ? "📋" : task.category === "App Download" ? "📱" : task.category === "Video" ? "🎬" : task.category === "Sign Up" ? "✍️" : "💰"}
                </span>
              </div>
            )}

            <h1 className="text-2xl font-bold text-text mb-2">{task.title}</h1>
            <p className="text-text-muted mb-4">{task.description}</p>

            <div className="flex flex-wrap gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                task.category === "Survey" ? "bg-green-500/10 text-green-400" :
                task.category === "App Download" ? "bg-blue-500/10 text-blue-400" :
                task.category === "Video" ? "bg-purple-500/10 text-purple-400" :
                task.category === "Sign Up" ? "bg-yellow-500/10 text-yellow-400" :
                "bg-gray-500/10 text-gray-400"
              }`}>
                {task.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                ${task.payout.toFixed(2)} per completion
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-card-hover text-text-muted">
                Need {task.requiredCompletions} completion{task.requiredCompletions > 1 ? "s" : ""}
              </span>
            </div>

            {task.instructions && (
              <div className="bg-card-hover rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-text mb-2">Instructions</h3>
                <p className="text-text-muted text-sm whitespace-pre-wrap">{task.instructions}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {user ? (
            <>
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-text mb-4">Your Progress</h2>
                {progress ? (
                  <>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-muted">Completed</span>
                      <span className="text-text font-medium">{progress.completionsDone} / {task.requiredCompletions}</span>
                    </div>
                    <div className="w-full bg-card-hover rounded-full h-2 mb-4">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${percentDone}%` }}
                      ></div>
                    </div>
                    {remaining > 0 ? (
                      <p className="text-text-muted text-sm">
                        {remaining} more completion{remaining > 1 ? "s" : ""} needed
                      </p>
                    ) : (
                      <p className="text-green-400 text-sm font-medium">
                        ✓ All completions done!
                      </p>
                    )}
                    <p className="text-text-muted text-sm mt-2">
                      Earned so far: <span className="text-green-400 font-medium">${progress.totalEarned.toFixed(2)}</span>
                    </p>
                  </>
                ) : (
                  <p className="text-text-muted text-sm">No completions yet</p>
                )}
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-text mb-4">Submit Screenshot</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Screenshot URL</label>
                    <input
                      type="url"
                      value={screenshot}
                      onChange={(e) => setScreenshot(e.target.value)}
                      placeholder="Paste image URL here"
                      className="w-full bg-card-hover border border-border rounded-lg px-4 py-2.5 text-text placeholder-text-muted/50 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !screenshot}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Submit for Approval"}
                  </button>
                  {message && (
                    <p className={`text-sm text-center ${message.includes("failed") ? "text-danger" : "text-green-400"}`}>
                      {message}
                    </p>
                  )}
                </form>
              </div>

              <a
                href={task.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-card-hover border border-border hover:border-primary text-text font-medium py-2.5 rounded-lg text-center transition-colors"
              >
                Open Task Link →
              </a>
            </>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-text-muted mb-4">Login to start this task and track your progress</p>
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
