"use client";

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
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  Survey: "bg-blue-500/20 text-blue-400",
  "App Download": "bg-green-500/20 text-green-400",
  Video: "bg-purple-500/20 text-purple-400",
  "Sign Up": "bg-orange-500/20 text-orange-400",
  Other: "bg-zinc-500/20 text-zinc-400",
};

export default function TaskCard({ task }: { task: Task }) {
  return (
    <div className="group rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:bg-card-hover">
      {task.image ? (
        <img
          src={task.image}
          alt={task.title}
          className="h-44 w-full rounded-t-xl object-cover"
        />
      ) : (
        <div className="flex h-44 w-full items-center justify-center rounded-t-xl bg-gradient-to-br from-primary/20 to-primary-dark/10">
          <span className="text-4xl font-bold text-primary/30">
            {task.category === "Survey"
              ? "📋"
              : task.category === "App Download"
                ? "📱"
                : task.category === "Video"
                  ? "🎬"
                  : task.category === "Sign Up"
                    ? "✍️"
                    : "📌"}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <span
            className={`rounded-md px-2.5 py-0.5 text-xs font-medium ${categoryColors[task.category] || categoryColors["Other"]}`}
          >
            {task.category}
          </span>
          <span className="text-sm text-text-muted">
            {task.requiredCompletions > 1
              ? `Complete ${task.requiredCompletions}x`
              : "1x"}
          </span>
        </div>

        <h3 className="font-semibold text-text">{task.title}</h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-text-muted">
          {task.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl font-bold text-primary">
            {task.payout.toFixed(2)} MT
          </span>
          <Link
            href={`/task/${task.id}`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Start Task
          </Link>
        </div>
      </div>
    </div>
  );
}
