import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and, like, asc } from "drizzle-orm";
import { generateId, getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");
  const location = searchParams.get("location");
  const q = searchParams.get("q");
  const admin = searchParams.get("admin");

  let conditions = [eq(schema.tasks.active, 1)];

  // Only filter by visible for non-admin requests
  if (admin !== "1") {
    conditions.push(eq(schema.tasks.visible, 1));
  }

  if (category && category !== "all") {
    conditions.push(eq(schema.tasks.category, category));
  }
  if (difficulty && difficulty !== "all") {
    conditions.push(eq(schema.tasks.difficulty, difficulty));
  }
  if (location) {
    conditions.push(like(schema.tasks.locations, `%${location}%`));
  }
  if (q) {
    conditions.push(like(schema.tasks.title, `%${q}%`));
  }

  const tasks = await db.select().from(schema.tasks).where(and(...conditions)).orderBy(asc(schema.tasks.sortOrder)).all();

  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = generateId();
    await db.insert(schema.tasks).values({
      id,
      title: body.title,
      description: body.description,
      category: body.category,
      link: body.link,
      image: body.image || "",
      payout: body.payout,
      adminEarnings: body.adminEarnings || 0,
      difficulty: body.difficulty || "easy",
      cpType: body.cpType || "CPA",
      requiredCompletions: body.requiredCompletions || 1,
      locations: body.locations || "Global",
      instructions: body.instructions || "",
      active: 1,
      visible: body.visible !== undefined ? body.visible : 1,
      sortOrder: body.sortOrder || 0,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
