import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and, sql } from "drizzle-orm";
import { getCurrentUser, generateId } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await db.update(schema.submissions).set({ status }).where(eq(schema.submissions.id, id)).run();

  const submission = await db.select().from(schema.submissions).where(eq(schema.submissions.id, id)).get();
  if (submission && status === "approved") {
    const task = await db.select().from(schema.tasks).where(eq(schema.tasks.id, submission.taskId)).get();
    if (task) {
      const workerId = submission.userId || submission.workerPhone;
      if (workerId) {
        const existing = await db.select().from(schema.userProgress)
          .where(and(eq(schema.userProgress.userId, workerId), eq(schema.userProgress.taskId, submission.taskId)))
          .get();

        const payout = task.payout;
        if (existing) {
          await db.update(schema.userProgress)
            .set({
              completionsDone: existing.completionsDone + 1,
              totalEarned: existing.totalEarned + payout,
            })
            .where(eq(schema.userProgress.id, existing.id))
            .run();
        } else {
          await db.insert(schema.userProgress).values({
            id: generateId(),
            userId: workerId,
            taskId: submission.taskId,
            completionsDone: 1,
            totalEarned: payout,
          });
        }

        // Referral bonus: if user was referred and reached >= $2 total, reward referrer
        const referral = await db.select().from(schema.referrals)
          .where(eq(schema.referrals.refereeId, workerId))
          .get();
        if (referral && referral.status === "pending") {
          const totalProgress = await db.select({
            total: sql`SUM(${schema.userProgress.totalEarned})`.as<number>(),
          }).from(schema.userProgress)
            .where(eq(schema.userProgress.userId, workerId))
            .get();
          const totalEarned = Number(totalProgress?.total || 0) + payout;
          if (totalEarned >= 2) {
            await db.update(schema.referrals)
              .set({ status: "completed", reward: 1 })
              .where(eq(schema.referrals.id, referral.id))
              .run();
            // Add $1 to referrer's progress
            const refProgress = await db.select().from(schema.userProgress)
              .where(and(eq(schema.userProgress.userId, referral.referrerId), eq(schema.userProgress.taskId, "__referral_bonus__")))
              .get();
            if (refProgress) {
              await db.update(schema.userProgress)
                .set({ totalEarned: refProgress.totalEarned + 1 })
                .where(eq(schema.userProgress.id, refProgress.id))
                .run();
            } else {
              await db.insert(schema.userProgress).values({
                id: generateId(),
                userId: referral.referrerId,
                taskId: "__referral_bonus__",
                completionsDone: 1,
                totalEarned: 1,
              });
            }
          }
        }
      }
    }
  }

  return NextResponse.json({ success: true });
}
