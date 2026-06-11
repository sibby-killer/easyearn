import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DB_URL || "file:./data.db";
const authToken = process.env.TURSO_DB_TOKEN;

export async function GET() {
  const client = createClient({ url, authToken });
  const results: string[] = [];

  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, icon TEXT DEFAULT '', color TEXT DEFAULT 'bg-gray-500/10 text-gray-400', sort_order INTEGER DEFAULT 0 NOT NULL, active INTEGER DEFAULT 1 NOT NULL, created_at TEXT NOT NULL)`);
    results.push("categories table OK");

    await client.execute(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, full_name TEXT NOT NULL, email TEXT DEFAULT '', phone TEXT NOT NULL, password TEXT NOT NULL, location TEXT NOT NULL, gender TEXT NOT NULL, employment TEXT NOT NULL, daily_goal TEXT NOT NULL, is_admin INTEGER DEFAULT 0 NOT NULL, created_at TEXT NOT NULL)`);
    results.push("users table OK");

    await client.execute(`CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL, link TEXT NOT NULL, image TEXT DEFAULT '', payout REAL NOT NULL, required_completions INTEGER DEFAULT 1 NOT NULL, locations TEXT NOT NULL, instructions TEXT DEFAULT '', active INTEGER DEFAULT 1 NOT NULL, sort_order INTEGER DEFAULT 0 NOT NULL, created_at TEXT NOT NULL)`);
    results.push("tasks table OK");

    await client.execute(`CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, user_id TEXT DEFAULT '', task_id TEXT NOT NULL, screenshot TEXT NOT NULL, reddit_username TEXT DEFAULT '', worker_name TEXT DEFAULT '', worker_phone TEXT DEFAULT '', status TEXT DEFAULT 'pending' NOT NULL, created_at TEXT NOT NULL)`);
    results.push("submissions table OK");

    try { await client.execute("ALTER TABLE submissions ADD COLUMN reddit_username TEXT DEFAULT ''"); } catch {}
    try { await client.execute("ALTER TABLE submissions ADD COLUMN worker_name TEXT DEFAULT ''"); } catch {}
    try { await client.execute("ALTER TABLE submissions ADD COLUMN worker_phone TEXT DEFAULT ''"); } catch {}

    await client.execute(`CREATE TABLE IF NOT EXISTS user_progress (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, task_id TEXT NOT NULL, completions_done INTEGER DEFAULT 0 NOT NULL, total_earned REAL DEFAULT 0 NOT NULL)`);
    results.push("user_progress table OK");

    await client.execute(`CREATE TABLE IF NOT EXISTS referrals (id TEXT PRIMARY KEY, referrer_id TEXT NOT NULL, referee_id TEXT NOT NULL, status TEXT DEFAULT 'pending' NOT NULL, reward REAL DEFAULT 0 NOT NULL, created_at TEXT NOT NULL)`);
    results.push("referrals table OK");

    await client.execute(`CREATE TABLE IF NOT EXISTS visitors (id TEXT PRIMARY KEY, ip TEXT NOT NULL, location TEXT DEFAULT '', country TEXT DEFAULT '', user_agent TEXT DEFAULT '', visited_at TEXT NOT NULL)`);
    results.push("visitors table OK");

    await client.execute(`CREATE TABLE IF NOT EXISTS emails (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL)`);
    results.push("emails table OK");

    await client.execute(`CREATE TABLE IF NOT EXISTS verification_codes (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, code TEXT NOT NULL, expires_at TEXT NOT NULL, used INTEGER DEFAULT 0 NOT NULL, created_at TEXT NOT NULL)`);
    results.push("verification_codes table OK");

    await client.execute(`CREATE TABLE IF NOT EXISTS withdrawals (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, user_name TEXT DEFAULT '', user_country TEXT DEFAULT '', amount REAL NOT NULL, method TEXT DEFAULT 'paypal' NOT NULL, account TEXT NOT NULL, status TEXT DEFAULT 'pending' NOT NULL, created_at TEXT NOT NULL, approved_at TEXT DEFAULT '')`);
    results.push("withdrawals table OK");

    try { await client.execute("ALTER TABLE tasks ADD COLUMN admin_earnings REAL DEFAULT 0"); } catch {}
    try { await client.execute("ALTER TABLE tasks ADD COLUMN difficulty TEXT DEFAULT 'easy'"); } catch {}
    try { await client.execute("ALTER TABLE tasks ADD COLUMN cp_type TEXT DEFAULT 'CPA'"); } catch {}
    try { await client.execute("ALTER TABLE tasks ADD COLUMN visible INTEGER DEFAULT 1"); } catch {}
    try { await client.execute("ALTER TABLE submissions ADD COLUMN country TEXT DEFAULT ''"); } catch {}

    const catCount = await client.execute("SELECT COUNT(*) as c FROM categories");
    if (catCount.rows[0].c === 0) {
      const { v4: uuid } = await import("uuid");
      const defaultCats = [
        { name: "Survey", icon: "📋", color: "bg-green-500/10 text-green-400", sort: 0 },
        { name: "App Download", icon: "📱", color: "bg-blue-500/10 text-blue-400", sort: 1 },
        { name: "Video", icon: "🎬", color: "bg-purple-500/10 text-purple-400", sort: 2 },
        { name: "Sign Up", icon: "✍️", color: "bg-yellow-500/10 text-yellow-400", sort: 3 },
        { name: "Other", icon: "💰", color: "bg-gray-500/10 text-gray-400", sort: 99 },
      ];
      for (const cat of defaultCats) {
        await client.execute({ sql: "INSERT INTO categories (id, name, icon, color, sort_order, active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)", args: [uuid(), cat.name, cat.icon, cat.color, cat.sort, new Date().toISOString()] });
      }
      results.push("Default categories seeded");
    } else {
      results.push("Categories already exist");
    }

    const adminCheck = await client.execute("SELECT id, email, phone FROM users WHERE is_admin = 1 LIMIT 1");
    if (adminCheck.rows.length === 0) {
      const bcrypt = await import("bcryptjs");
      const { v4: uuid } = await import("uuid");
      const adminPhone = process.env.ADMIN_PHONE || "admin";
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      const adminEmail = process.env.ADMIN_EMAIL || "alfrednyongesa411@gmail.com";
      const hash = await bcrypt.hash(adminPassword, 10);
      await client.execute({
        sql: "INSERT INTO users (id, full_name, email, phone, password, location, gender, employment, daily_goal, is_admin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)",
        args: [uuid(), "Admin", adminEmail, adminPhone, hash, "Global", "other", "employed", "100", new Date().toISOString()],
      });
      results.push(`Admin created (email: ${adminEmail}, phone: ${adminPhone})`);
    } else {
      const row = adminCheck.rows[0];
      results.push(`Admin exists (email: ${row.email}, phone: ${row.phone})`);
    }

    return NextResponse.json({ success: true, results });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg, results }, { status: 500 });
  }
}
