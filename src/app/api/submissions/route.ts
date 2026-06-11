import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { generateId, getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let query = db.select().from(schema.submissions).orderBy(desc(schema.submissions.createdAt));

  if (user.isAdmin) {
    if (status) {
      query.where(eq(schema.submissions.status, status));
    }
  } else {
    query.where(eq(schema.submissions.userId, user.id));
    if (status) {
      query.where(and(eq(schema.submissions.userId, user.id), eq(schema.submissions.status, status)));
    }
  }

  const submissions = await query.all();
  return NextResponse.json({ submissions });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { taskId, screenshot } = await req.json();
    if (!taskId || !screenshot) {
      return NextResponse.json({ error: "Task ID and screenshot required" }, { status: 400 });
    }

    const id = generateId();
    await db.insert(schema.submissions).values({
      id,
      userId: user.id,
      taskId,
      screenshot,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
