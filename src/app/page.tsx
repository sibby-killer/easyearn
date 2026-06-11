"use client";

import { useEffect, useState } from "react";
import TrickCard from "@/components/tricks/TrickCard";
import TaskCard from "@/components/TaskCard";
import TaskCart from "@/components/tricks/TaskCart";

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
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const TRICKS = [
  {
    id: "reddit-earnings",
    title: "Reddit Earnings Method",
    description: "Earn $1–2 per comment and post on Reddit. Complete tasks below to unlock the full guide.",
    icon: "💬",
    tag: "Trick 1",
    threshold: 20,
  },
  {
    id: "daily-200",
    title: "$200 Daily System",
    description: "Learn how to earn $200 every day with a proven system. Complete Trick 1 + $50 in tasks to unlock.",
    icon: "🚀",
    tag: "Trick 2",
    threshold: 50,
    requiresTrick1: true,
  },
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState("All");
  const [selectedTrick, setSelectedTrick] = useState<string | null>(null);
  const [cart, setCart] = useState<Task[]>([]);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [myPhone, setMyPhone] = useState("");
  const [myEarned, setMyEarned] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => setCategories(d.categories || []));
    const saved = localStorage.getItem("taskCart");
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    fetch(`/api/tasks?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks || []));
  }, [category]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
            const geo = await res.json();
            fetch("/api/visitors", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ip: "", location: geo.address?.city || geo.address?.town || "", country: geo.address?.country || "", userAgent: navigator.userAgent,
              }),
            });
          } catch {}
        },
        () => { fetch("/api/visitors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ip: "", location: "", country: "", userAgent: navigator.userAgent }) }); }
      );
    }
  }, []);

  const addToCart = (task: Task) => {
    if (cart.find(t => t.id === task.id)) return;
    const updated = [...cart, task];
    setCart(updated);
    localStorage.setItem("taskCart", JSON.stringify(updated));
  };

  const removeFromCart = (id: string) => {
    const updated = cart.filter(t => t.id !== id);
    setCart(updated);
    localStorage.setItem("taskCart", JSON.stringify(updated));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus("loading");
    try {
      const res = await fetch("/api/emails", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (res.ok) { setEmailStatus("success"); setEmail(""); }
      else setEmailStatus("error");
    } catch { setEmailStatus("error"); }
  };

  const checkProgress = async () => {
    if (!myPhone) return;
    const res = await fetch(`/api/submissions?phone=${encodeURIComponent(myPhone)}`);
    if (!res.ok) return;
    const data = await res.json();
    let total = 0;
    for (const sub of data.submissions || []) {
      if (sub.status === "approved") {
        const task = tasks.find((t: Task) => t.id === sub.taskId);
        if (task) total += task.payout;
      }
    }
    setMyEarned(total);
    setShowProgress(true);
  };

  const trickTasks = selectedTrick ? tasks : [];
  const cartTotal = cart.reduce((s, t) => s + t.payout, 0);

  const trick1Progress = Math.min(100, (myEarned / 20) * 100); // $20 threshold for trick 1
  const trick1Unlocked = myEarned >= 20;
  const trick2Progress = Math.min(100, (myEarned / 50) * 100);
  const trick2Unlocked = myEarned >= 50 && trick1Unlocked;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Complete Tasks.
            <br />
            <span className="text-primary">Unlock Earnings Methods.</span>
          </h1>
          <p className="mt-4 text-lg text-text-muted max-w-xl mx-auto">
            Do simple tasks like surveys and app downloads. Once you complete enough, we show you how to earn real money on Reddit and beyond.
          </p>
        </div>
      </section>

      {/* Tricks Section */}
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-text">Choose Your Path</h2>
          <p className="text-sm text-text-muted mt-1">Pick a method below, then complete the required tasks to unlock it.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {TRICKS.map((trick) => {
            const isTrick1 = trick.id === "reddit-earnings";
            const unlocked = isTrick1 ? trick1Unlocked : trick2Unlocked;
            const progress = isTrick1 ? trick1Progress : trick2Progress;

            return (
              <TrickCard
                key={trick.id}
                title={trick.title}
                description={trick.description}
                icon={trick.icon}
                tag={trick.tag}
                isActive={selectedTrick === trick.id}
                onClick={() => setSelectedTrick(selectedTrick === trick.id ? null : trick.id)}
              />
            );
          })}
        </div>

        {/* Progress Tracker */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text">Your Progress</h3>
            <div className="flex gap-2">
              <input
                type="tel"
                value={myPhone}
                onChange={e => setMyPhone(e.target.value)}
                placeholder="Phone to check progress"
                className="bg-dark border border-border rounded-lg px-3 py-1.5 text-sm text-text placeholder-text-muted/50 w-48 focus:outline-none focus:border-primary"
              />
              <button onClick={checkProgress} className="bg-primary hover:bg-primary-dark text-white text-sm px-3 py-1.5 rounded-lg transition">Check</button>
            </div>
          </div>
          {showProgress && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-text-muted mb-1">
                  <span>Reddit Earnings Method (need $20 in tasks)</span>
                  <span className={trick1Unlocked ? "text-green-400" : ""}>{trick1Unlocked ? "✓ UNLOCKED" : `$${myEarned.toFixed(2)} / $20.00`}</span>
                </div>
                <div className="w-full bg-dark rounded-full h-2">
                  <div className={`h-full rounded-full transition-all ${trick1Unlocked ? "bg-green-500" : "bg-primary"}`} style={{ width: `${Math.min(100, trick1Progress)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-text-muted mb-1">
                  <span>$200 Daily System (need Trick 1 + $50)</span>
                  <span className={trick2Unlocked ? "text-green-400" : ""}>{trick2Unlocked ? "✓ UNLOCKED" : !trick1Unlocked ? "Locked (unlock Trick 1 first)" : `$${myEarned.toFixed(2)} / $50.00`}</span>
                </div>
                <div className="w-full bg-dark rounded-full h-2">
                  <div className={`h-full rounded-full transition-all ${trick2Unlocked ? "bg-green-500" : trick1Unlocked ? "bg-primary" : "bg-border"}`} style={{ width: `${trick1Unlocked ? Math.min(100, trick2Progress) : 0}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tasks Section */}
      <section className={`border-t border-border px-4 py-12 sm:px-6 lg:px-8 ${!selectedTrick ? "bg-card/50" : ""}`}>
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-text">Available Tasks</h2>
              <p className="text-sm text-text-muted">
                {selectedTrick
                  ? `Add tasks to your list for "${TRICKS.find(t => t.id === selectedTrick)?.title}". Need \$${TRICKS.find(t => t.id === selectedTrick)?.threshold} in total value.`
                  : "Select a method above to get started, or browse all tasks."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => setCategory("All")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${category === "All" ? "bg-primary text-white" : "border border-border bg-card text-text-muted hover:border-primary/50 hover:text-text"}`}>
              All
            </button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setCategory(cat.name)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${category === cat.name ? "bg-primary text-white" : "border border-border bg-card text-text-muted hover:border-primary/50 hover:text-text"}`}>
                {cat.icon && <span className="mr-1">{cat.icon}</span>}{cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className={`grid gap-6 ${cart.length > 0 && selectedTrick ? "sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4 col-span-full"}`}>
              {tasks.map((task) => (
                <div key={task.id} className="relative group">
                  <TaskCard task={task} />
                  {selectedTrick && (
                    <button
                      onClick={() => addToCart(task)}
                      disabled={!!cart.find(t => t.id === task.id)}
                      className="mt-2 w-full py-2 text-sm font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed bg-primary/10 text-primary hover:bg-primary hover:text-white"
                    >
                      {cart.find(t => t.id === task.id) ? "✓ Added" : "+ Add to Tasks"}
                    </button>
                  )}
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="col-span-full text-center py-16 text-text-muted">No tasks available in this category. Check back soon!</p>
              )}
            </div>

            {cart.length > 0 && selectedTrick && (
              <div>
                <TaskCart
                  tasks={cart}
                  onRemove={removeFromCart}
                  trickName={TRICKS.find(t => t.id === selectedTrick)?.title || ""}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Unlocked Content */}
      {trick1Unlocked && (
        <section className="border-t border-border bg-card/30 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-text mb-6">🎉 Unlocked: Reddit Earnings Method</h2>
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <p className="text-text-muted">Congratulations! You've unlocked the Reddit method. Here's how it works:</p>
              <div className="bg-dark rounded-lg p-4">
                <h3 className="font-semibold text-text mb-2">💬 Earn $1–2 per Reddit Post & Comment</h3>
                <ul className="text-text-muted text-sm space-y-2 list-disc list-inside">
                  <li>Find subreddits related to the task categories you completed</li>
                  <li>Post engaging content and comments</li>
                  <li>Each quality post pays $1.50, each comment pays $1.00</li>
                  <li>Payments sent weekly via your preferred method</li>
                </ul>
              </div>
              {!trick2Unlocked && (
                <p className="text-sm text-text-muted">Keep going! Complete $50 total in tasks to unlock the <strong>$200 Daily System</strong> →</p>
              )}
            </div>
          </div>
        </section>
      )}

      {trick2Unlocked && (
        <section className="border-t border-border bg-card/50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-text mb-6">🚀 Unlocked: $200 Daily System</h2>
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="bg-dark rounded-lg p-4">
                <h3 className="font-semibold text-text mb-2">🔥 The $200/day Blueprint</h3>
                <p className="text-text-muted text-sm mb-3">This system combines multiple income streams:</p>
                <ul className="text-text-muted text-sm space-y-2 list-disc list-inside">
                  <li>Reddit posting & commenting ($30-50/day)</li>
                  <li>CPA offer stacking across multiple platforms</li>
                  <li>Referral bonuses from completed users</li>
                  <li>Automated content scheduling</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Email Opt-in */}
      <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-xl font-bold text-text">Get notified when new tasks drop</h2>
          <p className="mt-2 text-sm text-text-muted">Be the first to know about high-paying tasks.</p>
          <form onSubmit={handleEmailSubmit} className="mt-6 flex gap-3">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email"
              className="flex-1 rounded-lg border border-border bg-dark px-4 py-3 text-sm text-text placeholder-text-muted outline-none focus:border-primary" />
            <button type="submit" disabled={emailStatus === "loading"}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
              {emailStatus === "loading" ? "Sending..." : "Notify Me"}
            </button>
          </form>
          {emailStatus === "success" && <p className="mt-3 text-sm text-green-400">You're subscribed!</p>}
          {emailStatus === "error" && <p className="mt-3 text-sm text-danger">Something went wrong.</p>}
        </div>
      </section>

      <footer className="border-t border-border px-4 py-8 text-center text-sm text-text-muted">
        &copy; {new Date().getFullYear()} EasyEarn. All rights reserved.
      </footer>
    </div>
  );
}
