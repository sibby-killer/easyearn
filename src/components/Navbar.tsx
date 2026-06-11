"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  fullName: string;
  email: string;
  isAdmin: number;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const logoClicks = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogoClicks = () => {
    logoClicks.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { logoClicks.current = 0; }, 1500);
    if (logoClicks.current >= 5) {
      logoClicks.current = 0;
      router.push("/login");
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-dark/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={handleLogoClicks} className="flex items-center gap-2 cursor-pointer" type="button">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            MT
          </div>
          <span className="text-lg font-bold text-text">Money Tricks</span>
        </button>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-5 w-20 animate-pulse rounded bg-border" />
          ) : user ? (
            <>
              <button onClick={() => router.push("/dashboard")} className="text-sm font-medium text-text-muted hover:text-text transition-colors cursor-pointer" type="button">
                Dashboard
              </button>
              <span className="text-sm text-text-muted">{user.fullName}</span>
            </>
          ) : (
            <>
              <button onClick={() => router.push("/login")} className="text-sm font-medium text-text-muted hover:text-text transition-colors cursor-pointer" type="button">
                Login
              </button>
              <button onClick={() => router.push("/register")} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors cursor-pointer" type="button">
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
