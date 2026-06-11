"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: string;
  fullName: string;
  email: string;
  isAdmin: number;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-dark/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            E
          </div>
          <span className="text-lg font-bold text-text">Earn Hub</span>
        </Link>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-5 w-20 animate-pulse rounded bg-border" />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-text-muted transition-colors hover:text-text"
              >
                Dashboard
              </Link>
              {user.isAdmin === 1 && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-primary transition-colors hover:text-primary-dark"
                >
                  Admin
                </Link>
              )}
              <span className="text-sm text-text-muted">{user.fullName}</span>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-text-muted transition-colors hover:text-text"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
