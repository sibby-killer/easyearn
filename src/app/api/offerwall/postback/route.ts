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

function getParams(searchParams: URLSearchParams) {
  const subid = searchParams.get("subid") || searchParams.get("tracking_id");
  const amount = searchParams.get("amount") || searchParams.get("payout") || searchParams.get("event_amount");
  const campaignName = searchParams.get("campaign_name") || searchParams.get("offer_name") || searchParams.get("offer") || searchParams.get("offer_id") || "Offerwall Offer";
  const password = searchParams.get("password");
  return { subid, amount, campaignName, password };
}

async function handlePostback(subid: string, payout: number) {
  await ensureOfferwallTask();

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
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const { subid, amount, campaignName, password } = getParams(searchParams);

  const expectedPassword = process.env.OFFERWALL_PASSWORD;
  if (expectedPassword && password !== expectedPassword) {
    return new NextResponse("invalid password", { status: 403 });
  }

  if (!subid) {
    return new NextResponse("missing subid", { status: 400 });
  }

  const payout = amount ? parseFloat(amount) : 1;
  await handlePostback(subid, payout);
  return new NextResponse("ok");
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";

  let params: URLSearchParams;

  if (contentType.includes("application/json")) {
    const body = await req.json();
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(body)) {
      if (typeof v === "string" || typeof v === "number") qs.set(k, String(v));
    }
    params = qs;
  } else {
    const text = await req.text();
    params = new URLSearchParams(text);
  }

  const { subid, amount, campaignName, password } = getParams(params);

  const expectedPassword = process.env.OFFERWALL_PASSWORD;
  if (expectedPassword && password !== expectedPassword) {
    return new NextResponse("invalid password", { status: 403 });
  }

  if (!subid) {
    return new NextResponse("missing subid", { status: 400 });
  }

  const payout = amount ? parseFloat(amount) : 1;
  await handlePostback(subid, payout);
  return new NextResponse("ok");
}
