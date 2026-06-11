import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const withdrawals = await db.select()
    .from(schema.withdrawals)
    .orderBy(desc(schema.withdrawals.createdAt))
    .all();

  return NextResponse.json({ withdrawals });
}
