import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const referrals = await db.select()
    .from(schema.referrals)
    .orderBy(desc(schema.referrals.createdAt))
    .all();

  const userIds = new Set<string>();
  for (const r of referrals) {
    userIds.add(r.referrerId);
    userIds.add(r.refereeId);
  }

  const usersMap = new Map<string, typeof schema.users.$inferSelect>();
  if (userIds.size > 0) {
    const users = await db.select()
      .from(schema.users)
      .all();
    for (const u of users) {
      usersMap.set(u.id, u);
    }
  }

  const enriched = referrals.map(r => ({
    ...r,
    referrerName: usersMap.get(r.referrerId)?.fullName || "Unknown",
    refereeName: usersMap.get(r.refereeId)?.fullName || "Unknown",
  }));

  return NextResponse.json({ referrals: enriched });
}
