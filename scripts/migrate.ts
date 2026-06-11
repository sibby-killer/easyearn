import { createClient } from "@libsql/client";

const url = process.env.TURSO_DB_URL || "file:./data.db";
const authToken = process.env.TURSO_DB_TOKEN;
const client = createClient({ url, authToken });

async function main() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      icon TEXT DEFAULT '',
      color TEXT DEFAULT 'bg-gray-500/10 text-gray-400',
      sort_order INTEGER DEFAULT 0 NOT NULL,
      active INTEGER DEFAULT 1 NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT DEFAULT '',
      phone TEXT NOT NULL,
      password TEXT NOT NULL,
      location TEXT NOT NULL,
      gender TEXT NOT NULL,
      employment TEXT NOT NULL,
      daily_goal TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0 NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      link TEXT NOT NULL,
      image TEXT DEFAULT '',
      payout REAL NOT NULL,
      required_completions INTEGER DEFAULT 1 NOT NULL,
      locations TEXT NOT NULL,
      instructions TEXT DEFAULT '',
      active INTEGER DEFAULT 1 NOT NULL,
      sort_order INTEGER DEFAULT 0 NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      task_id TEXT NOT NULL,
      screenshot TEXT NOT NULL,
      status TEXT DEFAULT 'pending' NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      task_id TEXT NOT NULL,
      completions_done INTEGER DEFAULT 0 NOT NULL,
      total_earned REAL DEFAULT 0 NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY,
      referrer_id TEXT NOT NULL,
      referee_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending' NOT NULL,
      reward REAL DEFAULT 0 NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      ip TEXT NOT NULL,
      location TEXT DEFAULT '',
      country TEXT DEFAULT '',
      user_agent TEXT DEFAULT '',
      visited_at TEXT NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS emails (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0 NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

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
      await client.execute({
        sql: "INSERT INTO categories (id, name, icon, color, sort_order, active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)",
        args: [uuid(), cat.name, cat.icon, cat.color, cat.sort, new Date().toISOString()],
      });
    }
    console.log("Default categories seeded");
  }

  const adminCheck = await client.execute("SELECT id FROM users WHERE is_admin = 1 LIMIT 1");
  if (adminCheck.rows.length === 0) {
    const bcrypt = await import("bcryptjs");
    const { v4: uuid } = await import("uuid");
    const adminPhone = process.env.ADMIN_PHONE || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminEmail = process.env.ADMIN_EMAIL || "admin@easyearn.com";
    const hash = await bcrypt.hash(adminPassword, 10);
    await client.execute({
      sql: "INSERT INTO users (id, full_name, email, phone, password, location, gender, employment, daily_goal, is_admin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)",
      args: [uuid(), "Admin", adminEmail, adminPhone, hash, "Global", "other", "employed", "100", new Date().toISOString()],
    });
    console.log(`Admin user created (phone: ${adminPhone})`);
  }

  console.log("Database migrated successfully!");
}

main().catch(console.error);
