"use client";

import { useEffect, useState } from "react";
import TaskCard from "@/components/TaskCard";

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

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState("All");
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);

    fetch(`/api/tasks?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks));
  }, [category]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
            );
            const geo = await res.json();
            const city = geo.address?.city || geo.address?.town || geo.address?.village || "";
            const country = geo.address?.country || "";
            fetch("/api/visitors", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ip: "",
                location: city,
                country,
                userAgent: navigator.userAgent,
              }),
            });
          } catch {
            // silently fail
          }
        },
        () => {
          // permission denied or error — send what we have
          fetch("/api/visitors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ip: "",
              location: "",
              country: "",
              userAgent: navigator.userAgent,
            }),
          });
        }
      );
    }
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus("loading");
    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setEmailStatus("success");
        setEmail("");
      } else {
        setEmailStatus("error");
      }
    } catch {
      setEmailStatus("error");
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Complete Simple Tasks.
            <br />
            <span className="text-primary">Earn Real Rewards.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-text-muted">
            Join thousands of users earning cash, gift cards, and prizes by completing surveys,
            downloading apps, watching videos, and more. Sign up in under a minute.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="/register"
              className="rounded-lg bg-primary px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Get Started Free
            </a>
            <a
              href="#tasks"
              className="rounded-lg border border-border px-8 py-3 text-base font-semibold text-text transition-colors hover:bg-card"
            >
              Browse Tasks
            </a>
          </div>
        </div>
      </section>

      {/* Tasks Section */}
      <section id="tasks" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-text">Available Tasks</h2>
          <p className="mt-2 text-text-muted">
            Choose a category below or browse all tasks.
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("All")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              category === "All"
                ? "bg-primary text-white"
                : "border border-border bg-card text-text-muted hover:border-primary/50 hover:text-text"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.name)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                category === cat.name
                  ? "bg-primary text-white"
                  : "border border-border bg-card text-text-muted hover:border-primary/50 hover:text-text"
              }`}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Task Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>

        {tasks.length === 0 && (
          <p className="py-16 text-center text-text-muted">
            No tasks available in this category yet. Check back soon!
          </p>
        )}
      </section>

      {/* Email Opt-in */}
      <section className="border-t border-border bg-card px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold text-text">
            Get notified when new tasks are available
          </h2>
          <p className="mt-3 text-text-muted">
            Be the first to know about high-paying tasks and exclusive offers.
          </p>

          <form onSubmit={handleEmailSubmit} className="mt-8 flex gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 rounded-lg border border-border bg-dark px-4 py-3 text-sm text-text placeholder-text-muted outline-none transition-colors focus:border-primary"
            />
            <button
              type="submit"
              disabled={emailStatus === "loading"}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {emailStatus === "loading" ? "Sending..." : "Notify Me"}
            </button>
          </form>

          {emailStatus === "success" && (
            <p className="mt-4 text-sm text-success">
              You&apos;re subscribed! We&apos;ll email you when new tasks drop.
            </p>
          )}
          {emailStatus === "error" && (
            <p className="mt-4 text-sm text-danger">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 text-center text-sm text-text-muted">
        &copy; {new Date().getFullYear()} Earn Hub. All rights reserved.
      </footer>
    </div>
  );
}
