"use client";

import Link from "next/link";

interface CartTask {
  id: string;
  title: string;
  payout: number;
}

interface TaskCartProps {
  tasks: CartTask[];
  onRemove: (id: string) => void;
  trickName: string;
}

export default function TaskCart({ tasks, onRemove, trickName }: TaskCartProps) {
  const total = tasks.reduce((s, t) => s + t.payout, 0);

  if (tasks.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
      <h3 className="text-lg font-semibold text-text mb-1">Your Tasks</h3>
      <p className="text-xs text-text-muted mb-4">For: {trickName}</p>

      <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-2 bg-dark rounded-lg px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-text truncate">{t.title}</p>
              <p className="text-xs text-text-muted">${t.payout.toFixed(2)}</p>
            </div>
            <button onClick={() => onRemove(t.id)} className="text-danger/60 hover:text-danger text-xs shrink-0 px-1">&times;</button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
        <span className="text-text-muted text-sm">Total value</span>
        <span className="text-text font-semibold">${total.toFixed(2)}</span>
      </div>

      <Link
        href={`/task/${tasks[0].id}`}
        className="block w-full text-center py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition text-sm"
      >
        Start Tasks ({tasks.length})
      </Link>
    </div>
  );
}
