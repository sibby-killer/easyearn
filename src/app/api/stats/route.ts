import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, count, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const totalVisitors = await db.select({ count: count() }).from(schema.visitors).get();
  const totalUsers = await db.select({ count: count() }).from(schema.users).get();
  const totalTasks = await db.select({ count: count() }).from(schema.tasks).get();
  const pendingSubmissions = await db.select({ count: count() }).from(schema.submissions).where(eq(schema.submissions.status, "pending")).get();

  const topLocations = await db.select({ location: schema.visitors.location, count: count() })
    .from(schema.visitors)
    .groupBy(schema.visitors.location)
    .orderBy(desc(count()))
    .limit(5)
    .all();

  const recentVisitors = await db.select()
    .from(schema.visitors)
    .orderBy(desc(schema.visitors.visitedAt))
    .limit(10)
    .all();

  return NextResponse.json({
    totalVisitors: totalVisitors?.count || 0,
    totalUsers: totalUsers?.count || 0,
    totalTasks: totalTasks?.count || 0,
    pendingSubmissions: pendingSubmissions?.count || 0,
    topLocations,
    recentVisitors,
  });
}
