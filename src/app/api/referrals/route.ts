import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";
import { generateId, getCurrentUser } from "@/lib/auth";
import { isTopCountry } from "@/lib/utils";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const referralList = await db.select()
    .from(schema.referrals)
    .where(eq(schema.referrals.referrerId, user.id))
    .all();

  const completedCount = referralList.filter(r => r.status === "completed").length;
  const pendingCount = referralList.filter(r => r.status === "pending").length;

  let bonusAmount = 0;
  if (completedCount >= 10) {
    bonusAmount = isTopCountry(user.location) ? 100 : 20;
  }

  return NextResponse.json({
    referrals: referralList,
    completedCount,
    pendingCount,
    bonusAmount,
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { refereeId } = await req.json();
    if (!refereeId) {
      return NextResponse.json({ error: "Referee ID required" }, { status: 400 });
    }

    const existing = await db.select()
      .from(schema.referrals)
      .where(and(eq(schema.referrals.referrerId, user.id), eq(schema.referrals.refereeId, refereeId)))
      .get();

    if (existing) {
      return NextResponse.json({ error: "Referral already exists" }, { status: 400 });
    }

    await db.insert(schema.referrals).values({
      id: generateId(),
      referrerId: user.id,
      refereeId,
      status: "pending",
      reward: 0,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create referral" }, { status: 500 });
  }
}
