"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

interface CartItem {
  id: string;
  title: string;
  payout: number;
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"info" | "submit">("info");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [redditUser, setRedditUser] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    fetch(`/api/tasks/${id}`).then(r => r.json()).then(d => {
      setTask(d.task);
      setLoading(false);
    });
    const saved = localStorage.getItem("taskCart");
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch {}
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot || !name || !redditUser) return;
    setSubmitting(true);
    setMessage("");

    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: id,
        screenshot,
        redditUsername: redditUser,
        workerName: name,
        workerPhone: phone,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setMessage("Submitted! Waiting for admin approval.");

      const updated = cart.filter(t => t.id !== id);
      setCart(updated);
      localStorage.setItem("taskCart", JSON.stringify(updated));

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="text-text-muted hover:text-text mb-6 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            {task.image ? (
              <img src={task.image} alt={task.title} className="w-full h-48 object-cover rounded-lg mb-4" />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-4xl text-primary/40">📋</span>
              </div>
            )}

            <h1 className="text-2xl font-bold text-text mb-2">{task.title}</h1>
            <p className="text-text-muted mb-4">{task.description}</p>

            <div className="flex flex-wrap gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {task.payout.toFixed(2)} MT value
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-card-hover text-text-muted">
                {task.category}
              </span>
            </div>

            {task.instructions && (
              <div className="bg-card-hover rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-text mb-2">Instructions</h3>
                <p className="text-text-muted text-sm whitespace-pre-wrap">{task.instructions}</p>
              </div>
            )}

            {/* Tab navigation */}
            <div className="flex gap-2 border-b border-border pb-3 mb-4">
              <button
                onClick={() => setTab("info")}
                className={`text-sm font-medium px-3 py-1 rounded-lg transition ${tab === "info" ? "bg-primary/10 text-primary" : "text-text-muted hover:text-text"}`}
              >
                Task Info
              </button>
              <button
                onClick={() => setTab("submit")}
                className={`text-sm font-medium px-3 py-1 rounded-lg transition ${tab === "submit" ? "bg-primary/10 text-primary" : "text-text-muted hover:text-text"}`}
              >
                Submit Completion
              </button>
            </div>

            {tab === "info" && (
              <div>
                <a
                  href={task.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg transition"
                >
                  Open Task Link
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                {cart.length > 0 && (
                  <div className="mt-6 bg-dark rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-text mb-2">Your task list ({cart.length})</h4>
                    <div className="space-y-1.5">
                      {cart.map((c) => (
                        <div key={c.id} className="flex items-center justify-between text-sm">
                          <Link href={`/task/${c.id}`} className={`text-text-muted hover:text-text ${c.id === id ? "text-primary font-medium" : ""}`}>
                            {c.title}
                          </Link>
                          <span className="text-text-muted text-xs">{c.payout.toFixed(2)} MT</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "submit" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                  <div className={`text-sm rounded-lg px-4 py-3 ${message.includes("fail") ? "bg-danger/10 text-danger" : "bg-green-500/10 text-green-400"}`}>
                    {message}
                  </div>
                )}

                <div>
                  <label className="block text-sm text-text-muted mb-1">Your Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required
                    className="w-full bg-card-hover border border-border rounded-lg px-4 py-2.5 text-text placeholder-text-muted/50 focus:outline-none focus:border-primary" />
                </div>

                <div>
                  <label className="block text-sm text-text-muted mb-1">Phone (optional, for progress tracking)</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890"
                    className="w-full bg-card-hover border border-border rounded-lg px-4 py-2.5 text-text placeholder-text-muted/50 focus:outline-none focus:border-primary" />
                </div>

                <div>
                  <label className="block text-sm text-text-muted mb-1">Reddit Username</label>
                  <input type="text" value={redditUser} onChange={e => setRedditUser(e.target.value)} placeholder="u/yourusername" required
                    className="w-full bg-card-hover border border-border rounded-lg px-4 py-2.5 text-text placeholder-text-muted/50 focus:outline-none focus:border-primary" />
                </div>

                <div>
                  <label className="block text-sm text-text-muted mb-1">Screenshot URL (proof of completion)</label>
                  <input type="url" value={screenshot} onChange={e => setScreenshot(e.target.value)} placeholder="https://imgur.com/..." required
                    className="w-full bg-card-hover border border-border rounded-lg px-4 py-2.5 text-text placeholder-text-muted/50 focus:outline-none focus:border-primary" />
                </div>

                <button type="submit" disabled={submitting || !screenshot || !name || !redditUser}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? "Submitting..." : "Submit for Approval"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text mb-2">Task Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Category</span>
                <span className="text-text">{task.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Value</span>
                <span className="text-primary font-semibold">{task.payout.toFixed(2)} MT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Completions</span>
                <span className="text-text">{task.requiredCompletions}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text mb-2">Quick Steps</h2>
            <ol className="text-sm text-text-muted space-y-2 list-decimal list-inside">
              <li>Click "Open Task Link"</li>
              <li>Complete the required action</li>
              <li>Take a screenshot as proof</li>
              <li>Upload to imgur or similar</li>
              <li>Submit with your Reddit username</li>
            </ol>
          </div>

          {cart.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text mb-2">Your Tasks ({cart.length})</h2>
              <div className="space-y-2">
                {cart.map((c) => (
                  <Link key={c.id} href={`/task/${c.id}`}
                    className={`block text-sm py-1.5 px-3 rounded-lg transition ${c.id === id ? "bg-primary/10 text-primary" : "text-text-muted hover:bg-card-hover hover:text-text"}`}>
                    {c.title} — <span className="text-primary">{c.payout.toFixed(2)} MT</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
