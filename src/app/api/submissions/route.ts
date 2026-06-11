import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and, desc, like } from "drizzle-orm";
import { generateId, getCurrentUser } from "@/lib/auth";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@moneytricks.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "alfrednyongesa411@gmail.com";

async function notifyAdmin(submission: Record<string, unknown>, taskTitle: string) {
  if (!RESEND_API_KEY) {
    console.log(`[NOTIFICATION] New submission from ${submission.workerName || submission.redditUsername} for task: ${taskTitle}`);
    return;
  }
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `New submission: ${taskTitle}`,
        html: `
          <h2>New Task Submission</h2>
          <p><strong>Task:</strong> ${taskTitle}</p>
          <p><strong>Worker:</strong> ${submission.workerName || "N/A"}</p>
          <p><strong>Phone:</strong> ${submission.workerPhone || "N/A"}</p>
          <p><strong>Reddit:</strong> ${submission.redditUsername || "N/A"}</p>
          <p><strong>Screenshot:</strong> <a href="${submission.screenshot}">View</a></p>
          <p><a href="https://moneytricks.vercel.app/admin/submissions">Review in Admin Panel</a></p>
        `,
      }),
    });
  } catch {}
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const phone = searchParams.get("phone");

  let query = db.select().from(schema.submissions).orderBy(desc(schema.submissions.createdAt));

  if (user?.isAdmin) {
    if (status) {
      query.where(eq(schema.submissions.status, status));
    }
  } else if (user) {
    query.where(eq(schema.submissions.userId, user.id));
    if (status) {
      query.where(and(eq(schema.submissions.userId, user.id), eq(schema.submissions.status, status)));
    }
  } else if (phone) {
    query.where(eq(schema.submissions.workerPhone, phone));
  } else {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await query.all();
  return NextResponse.json({ submissions });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { taskId, screenshot, redditUsername, workerName, workerPhone } = body;

    if (!taskId || !screenshot) {
      return NextResponse.json({ error: "Task ID and screenshot required" }, { status: 400 });
    }

    const user = await getCurrentUser();

    const id = generateId();
    await db.insert(schema.submissions).values({
      id,
      userId: user?.id || "",
      taskId,
      screenshot,
      redditUsername: redditUsername || "",
      workerName: workerName || "",
      workerPhone: workerPhone || "",
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    const task = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).get();
    notifyAdmin({ ...body, id }, task?.title || "Unknown task");

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
