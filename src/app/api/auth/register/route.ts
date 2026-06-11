import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { hashPassword, createSession, generateId } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, phone, password, location, gender, employment, dailyGoal } = body;

    if (!fullName || !phone || !password || !location || !gender || !employment || !dailyGoal) {
      return NextResponse.json({ error: "All fields except email are required" }, { status: 400 });
    }

    const existing = await db.select().from(schema.users).where(eq(schema.users.phone, phone)).get();
    if (existing) {
      return NextResponse.json({ error: "Phone number already registered" }, { status: 400 });
    }

    const id = generateId();
    const hashed = await hashPassword(password);

    await db.insert(schema.users).values({
      id,
      fullName,
      email: email || "",
      phone,
      password: hashed,
      location,
      gender,
      employment,
      dailyGoal,
      isAdmin: 0,
      createdAt: new Date().toISOString(),
    });

    await createSession(id);

    return NextResponse.json({ success: true, user: { id, fullName, email: email || "", phone, location, gender, employment, dailyGoal, isAdmin: 0 } });
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
