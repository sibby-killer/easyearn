"use client";

import { useEffect, useState } from "react";

const OFFERWALL_URL = "https://www.fastsvr.com/wall/QLSoikF";

export default function OfferwallTab() {
  const [visitorId, setVisitorId] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);
  const [screenshot, setScreenshot] = useState("");
  const [redditUser, setRedditUser] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem("ow_visitor");
    if (existing) {
      setVisitorId(existing);
    } else {
      fetch("/api/offerwall/register", { method: "POST" })
        .then(r => r.json())
        .then((d: { visitorId: string }) => {
          localStorage.setItem("ow_visitor", d.visitorId);
          setVisitorId(d.visitorId);
        });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot || !redditUser || !name) return;
    setSubmitting(true);
    setMessage("");

    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: "offerwall-default",
        screenshot,
        redditUsername: redditUser,
        workerName: name,
        workerPhone: phone,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setMessage("Submitted! Waiting for approval.");
      setScreenshot("");
    } else {
      setMessage(data.error || "Submission failed");
    }
    setSubmitting(false);
  };

  const wallUrl = visitorId ? `${OFFERWALL_URL}?subid=${visitorId}` : OFFERWALL_URL;

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text">Offers Wall</h3>
            <p className="text-sm text-text-muted">Complete any offer below. Your progress tracks automatically.</p>
          </div>
          {visitorId && (
            <span className="text-[10px] text-text-muted/40 font-mono">ID: {visitorId}</span>
          )}
        </div>

        <div className="bg-dark rounded-lg overflow-hidden">
          <iframe
            sandbox="allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
            src={wallUrl}
            style={{ width: "100%", height: "690px", border: "none" }}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <button
          onClick={() => setShowSubmit(!showSubmit)}
          className="text-sm font-medium text-primary hover:text-primary-dark transition"
        >
          {showSubmit ? "− Hide manual submission" : "+ Submit proof manually"}
        </button>

        {showSubmit && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {message && (
              <div className={`text-sm rounded-lg px-4 py-3 ${message.includes("fail") ? "bg-danger/10 text-danger" : "bg-green-500/10 text-green-400"}`}>
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Your Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required
                  className="w-full bg-card-hover border border-border rounded-lg px-4 py-2.5 text-sm text-text placeholder-text-muted/50 focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Phone (optional)</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890"
                  className="w-full bg-card-hover border border-border rounded-lg px-4 py-2.5 text-sm text-text placeholder-text-muted/50 focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-1">Reddit Username</label>
              <input type="text" value={redditUser} onChange={e => setRedditUser(e.target.value)} placeholder="u/yourusername" required
                className="w-full bg-card-hover border border-border rounded-lg px-4 py-2.5 text-sm text-text placeholder-text-muted/50 focus:outline-none focus:border-primary" />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-1">Screenshot URL (proof)</label>
              <input type="url" value={screenshot} onChange={e => setScreenshot(e.target.value)} placeholder="https://imgur.com/..." required
                className="w-full bg-card-hover border border-border rounded-lg px-4 py-2.5 text-sm text-text placeholder-text-muted/50 focus:outline-none focus:border-primary" />
            </div>

            <button type="submit" disabled={submitting || !screenshot || !redditUser || !name}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit Proof"}
            </button>
          </form>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 text-sm text-text-muted">
        <p className="font-medium text-text mb-1">How it works</p>
        <ol className="space-y-1 list-decimal list-inside">
          <li>Browse offers above &mdash; they adjust to your location automatically</li>
          <li>Complete any offer you qualify for</li>
          <li>Earnings are tracked via your unique ID and credited on approval</li>
          <li>You can also submit a screenshot manually if auto-tracking doesn&apos;t catch it</li>
          <li>Completed offers count toward unlocking the tricks above</li>
        </ol>
      </div>
    </div>
  );
}
