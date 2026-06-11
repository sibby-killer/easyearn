import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { verifyPassword, createVerificationCode } from "@/lib/auth";
import { sendVerificationCode } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await db.select().from(schema.users).where(eq(schema.users.email, email)).get();
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const code = await createVerificationCode(user.id);
    const sent = await sendVerificationCode(user.email || email, code);

    return NextResponse.json({
      success: true,
      userId: user.id,
      emailSent: sent,
      message: sent
        ? "Verification code sent to your email"
        : `Code: ${code} (email not configured, use this code)`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
