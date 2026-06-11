import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { getCurrentUser, generateId } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const withdrawals = await db.select()
    .from(schema.withdrawals)
    .where(eq(schema.withdrawals.userId, user.id))
    .orderBy(desc(schema.withdrawals.createdAt))
    .all();

  return NextResponse.json({ withdrawals });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount, method, account } = await req.json();
  if (!amount || !method || !account) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (amount < 2) {
    return NextResponse.json({ error: "Minimum withdrawal is $2" }, { status: 400 });
  }

  // Check user has enough total earnings
  const totalProgress = await db.select({
    total: sql`SUM(${schema.userProgress.totalEarned})`.as<number>(),
  }).from(schema.userProgress)
    .where(eq(schema.userProgress.userId, user.id))
    .get();
  const totalEarned = Number(totalProgress?.total || 0);
  if (totalEarned < amount) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  // Check pending withdrawals
  const pending = await db.select().from(schema.withdrawals)
    .where(and(eq(schema.withdrawals.userId, user.id), eq(schema.withdrawals.status, "pending")))
    .all();
  if (pending.length > 0) {
    return NextResponse.json({ error: "You already have a pending withdrawal request" }, { status: 400 });
  }

  await db.insert(schema.withdrawals).values({
    id: generateId(),
    userId: user.id,
    userName: user.fullName,
    userCountry: user.location || "",
    amount,
    method,
    account,
    status: "pending",
    createdAt: new Date().toISOString(),
    approvedAt: "",
  });

  return NextResponse.json({ success: true });
}
