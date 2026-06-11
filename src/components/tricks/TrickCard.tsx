"use client";

interface TrickCardProps {
  title: string;
  description: string;
  icon: string;
  tag: string;
  isActive: boolean;
  onClick: () => void;
}

export default function TrickCard({ title, description, icon, tag, isActive, onClick }: TrickCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 rounded-xl border transition-all ${
        isActive
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
          : "border-border bg-card hover:border-primary/50 hover:bg-card-hover"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-text">{title}</h3>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{tag}</span>
          </div>
          <p className="text-text-muted text-sm">{description}</p>
        </div>
        <svg className={`w-5 h-5 mt-1 shrink-0 transition-transform ${isActive ? "rotate-90 text-primary" : "text-text-muted"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
