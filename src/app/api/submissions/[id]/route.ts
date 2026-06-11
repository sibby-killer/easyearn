import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

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

        if (existing) {
          await db.update(schema.userProgress)
            .set({
              completionsDone: existing.completionsDone + 1,
              totalEarned: existing.totalEarned + task.payout,
            })
            .where(eq(schema.userProgress.id, existing.id))
            .run();
        } else {
          await db.insert(schema.userProgress).values({
            id: crypto.randomUUID(),
            userId: workerId,
            taskId: submission.taskId,
            completionsDone: 1,
            totalEarned: task.payout,
          });
        }
      }
    }
  }

  return NextResponse.json({ success: true });
}
