import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const existing = await db.select().from(schema.emails).where(eq(schema.emails.email, email)).get();
    if (existing) {
      return NextResponse.json({ success: true, message: "Already subscribed" });
    }

    await db.insert(schema.emails).values({
      id: generateId(),
      email,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
