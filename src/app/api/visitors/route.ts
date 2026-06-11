import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import { generateId } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { ip, location, country, userAgent } = await req.json();
    await db.insert(schema.visitors).values({
      id: generateId(),
      ip: ip || "unknown",
      location: location || "",
      country: country || "",
      userAgent: userAgent || "",
      visitedAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
