import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.delete(schema.users).where(eq(schema.users.id, id)).run();
  return NextResponse.json({ success: true });
}
