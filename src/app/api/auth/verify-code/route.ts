import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { verifyCode, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { userId, code } = await req.json();
    if (!userId || !code) {
      return NextResponse.json({ error: "User ID and code required" }, { status: 400 });
    }

    const valid = await verifyCode(userId, code);
    if (!valid) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
    }

    await createSession(userId);

    const user = await db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        location: user.location,
        gender: user.gender,
        employment: user.employment,
        dailyGoal: user.dailyGoal,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
