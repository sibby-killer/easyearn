import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").default(""),
  color: text("color").default("bg-gray-500/10 text-gray-400"),
  sortOrder: integer("sort_order").default(0).notNull(),
  active: integer("active").default(1).notNull(),
  createdAt: text("created_at").notNull(),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").default(""),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  location: text("location").notNull(),
  gender: text("gender").notNull(),
  employment: text("employment").notNull(),
  dailyGoal: text("daily_goal").notNull(),
  isAdmin: integer("is_admin").default(0).notNull(),
  createdAt: text("created_at").notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  link: text("link").notNull(),
  image: text("image").default(""),
  payout: real("payout").notNull(),
  requiredCompletions: integer("required_completions").default(1).notNull(),
  locations: text("locations").notNull(),
  instructions: text("instructions").default(""),
  active: integer("active").default(1).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: text("created_at").notNull(),
});

export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  userId: text("user_id").default(""),
  taskId: text("task_id").notNull(),
  screenshot: text("screenshot").notNull(),
  redditUsername: text("reddit_username").default(""),
  workerName: text("worker_name").default(""),
  workerPhone: text("worker_phone").default(""),
  status: text("status").default("pending").notNull(),
  createdAt: text("created_at").notNull(),
});

export const userProgress = sqliteTable("user_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  taskId: text("task_id").notNull(),
  completionsDone: integer("completions_done").default(0).notNull(),
  totalEarned: real("total_earned").default(0).notNull(),
});

export const referrals = sqliteTable("referrals", {
  id: text("id").primaryKey(),
  referrerId: text("referrer_id").notNull(),
  refereeId: text("referee_id").notNull(),
  status: text("status").default("pending").notNull(),
  reward: real("reward").default(0).notNull(),
  createdAt: text("created_at").notNull(),
});

export const visitors = sqliteTable("visitors", {
  id: text("id").primaryKey(),
  ip: text("ip").notNull(),
  location: text("location").default("").notNull(),
  country: text("country").default("").notNull(),
  userAgent: text("user_agent").default("").notNull(),
  visitedAt: text("visited_at").notNull(),
});

export const emails = sqliteTable("emails", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").notNull(),
});

export const verificationCodes = sqliteTable("verification_codes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  code: text("code").notNull(),
  expiresAt: text("expires_at").notNull(),
  used: integer("used").default(0).notNull(),
  createdAt: text("created_at").notNull(),
});
