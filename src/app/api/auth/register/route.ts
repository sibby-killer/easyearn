import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { hashPassword, generateId } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, phone, password, location, gender, employment, dailyGoal } = body;

    if (!fullName || !email || !phone || !password || !location || !gender || !employment || !dailyGoal) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existingEmail = await db.select().from(schema.users).where(eq(schema.users.email, email)).get();
    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const existingPhone = await db.select().from(schema.users).where(eq(schema.users.phone, phone)).get();
    if (existingPhone) {
      return NextResponse.json({ error: "Phone number already registered" }, { status: 400 });
    }

    const id = generateId();
    const hashed = await hashPassword(password);

    await db.insert(schema.users).values({
      id,
      fullName,
      email,
      phone,
      password: hashed,
      location,
      gender,
      employment,
      dailyGoal,
      isAdmin: 0,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: "Account created. Please login." });
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
