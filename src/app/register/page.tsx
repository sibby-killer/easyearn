"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GENDERS = ["Male", "Female", "Other"] as const;
const EMPLOYMENTS = ["Employed", "Unemployed", "Student"] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    location: "",
    gender: "",
    employment: "",
    dailyGoal: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card rounded-2xl p-8 shadow-xl border border-border">
        <h1 className="text-2xl font-bold text-text text-center mb-2">
          Create Account
        </h1>
        <p className="text-text-muted text-center text-sm mb-8">
          Join and start earning today
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Full Name</label>
            <input type="text" value={form.fullName} onChange={update("fullName")} placeholder="John Doe" required
              className="w-full px-4 py-2.5 bg-dark border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={update("email")} placeholder="john@example.com" required
              className="w-full px-4 py-2.5 bg-dark border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Phone Number</label>
            <input type="tel" value={form.phone} onChange={update("phone")} placeholder="+1234567890" required
              className="w-full px-4 py-2.5 bg-dark border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={update("password")} placeholder="At least 6 characters" required minLength={6}
              className="w-full px-4 py-2.5 bg-dark border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Location</label>
            <input type="text" value={form.location} onChange={update("location")} placeholder="City, Country" required
              className="w-full px-4 py-2.5 bg-dark border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Gender</label>
              <select value={form.gender} onChange={update("gender")} required
                className="w-full px-4 py-2.5 bg-dark border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition appearance-none">
                <option value="" disabled>Select</option>
                {GENDERS.map((g) => (<option key={g} value={g}>{g}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Employment</label>
              <select value={form.employment} onChange={update("employment")} required
                className="w-full px-4 py-2.5 bg-dark border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition appearance-none">
                <option value="" disabled>Select</option>
                {EMPLOYMENTS.map((e) => (<option key={e} value={e}>{e}</option>))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Daily Goal</label>
            <input type="text" value={form.dailyGoal} onChange={update("dailyGoal")} placeholder="How much do you want to earn daily?" required
              className="w-full px-4 py-2.5 bg-dark border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition mt-2">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-text-muted text-sm text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary-dark transition">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
