import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, asc } from "drizzle-orm";
import { generateId, getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const showAll = searchParams.get("all") === "true";

  let cats;
  if (showAll) {
    cats = await db.select()
      .from(schema.categories)
      .orderBy(asc(schema.categories.sortOrder))
      .all();
  } else {
    cats = await db.select()
      .from(schema.categories)
      .where(eq(schema.categories.active, 1))
      .orderBy(asc(schema.categories.sortOrder))
      .all();
  }
  return NextResponse.json({ categories: cats });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { name, icon, color, sortOrder } = await req.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const id = generateId();
    await db.insert(schema.categories).values({
      id,
      name,
      icon: icon || "",
      color: color || "bg-gray-500/10 text-gray-400",
      sortOrder: sortOrder ?? 0,
      active: 1,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, name, icon, color, sortOrder, active } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (icon !== undefined) updates.icon = icon;
    if (color !== undefined) updates.color = color;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;
    if (active !== undefined) updates.active = active;
    await db.update(schema.categories).set(updates).where(eq(schema.categories.id, id)).run();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await db.delete(schema.categories).where(eq(schema.categories.id, id)).run();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
