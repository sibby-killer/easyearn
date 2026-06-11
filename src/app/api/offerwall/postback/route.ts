import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";
import { generateId } from "@/lib/auth";

const OFFERWALL_TASK_ID = "offerwall-default";

async function ensureOfferwallTask() {
  const existing = await db.select().from(schema.tasks).where(eq(schema.tasks.id, OFFERWALL_TASK_ID)).get();
  if (!existing) {
    await db.insert(schema.tasks).values({
      id: OFFERWALL_TASK_ID,
      title: "Offerwall Task",
      description: "Complete any offer on the offerwall",
      category: "Offerwall",
      link: "https://www.fastsvr.com/wall/QLSoikF",
      image: "",
      payout: 0,
      requiredCompletions: 1,
      locations: "Global",
      instructions: "Complete any offer on the offerwall and submit proof.",
      active: 1,
      sortOrder: -1,
      createdAt: new Date().toISOString(),
    });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subid = searchParams.get("subid");
  const amount = searchParams.get("amount");
  const offerName = searchParams.get("offer") || "Offerwall Offer";

  if (!subid) {
    return new NextResponse("missing subid", { status: 400 });
  }

  await ensureOfferwallTask();

  const payout = amount ? parseFloat(amount) : 1;

  await db.insert(schema.submissions).values({
    id: generateId(),
    userId: subid,
    taskId: OFFERWALL_TASK_ID,
    screenshot: "",
    redditUsername: "",
    workerName: subid,
    workerPhone: subid,
    status: "approved",
    createdAt: new Date().toISOString(),
  });

  const existing = await db.select().from(schema.userProgress)
    .where(and(eq(schema.userProgress.userId, subid), eq(schema.userProgress.taskId, OFFERWALL_TASK_ID)))
    .get();

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
      userId: subid,
      taskId: OFFERWALL_TASK_ID,
      completionsDone: 1,
      totalEarned: payout,
    });
  }

  return new NextResponse("ok");
}
