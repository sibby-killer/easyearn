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

  let conditions = [eq(schema.tasks.active, 1)];

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

  // Auto-create CPAgrip task if missing
  const cpagripExists = await db.select().from(schema.tasks).where(eq(schema.tasks.id, "cpagrip-offers")).get();
  if (!cpagripExists) {
    await db.insert(schema.tasks).values({
      id: "cpagrip-offers",
      title: "Complete CPAgrip Offers",
      description: "Complete offers on our partner offerwall. Opens in a new tab — pick any offer and finish it.",
      category: "Offerwall",
      link: "/cpagrip",
      image: "",
      payout: 2,
      adminEarnings: 1,
      difficulty: "easy",
      cpType: "CPA",
      requiredCompletions: 1,
      locations: "Global",
      instructions: "Click 'Start Task', complete any offer on the page that opens, then submit your proof.",
      active: 1,
      sortOrder: -1,
      createdAt: new Date().toISOString(),
    });
  }
  // Re-fetch to include the new CPAgrip task
  const allTasks = await db.select().from(schema.tasks).where(and(...conditions)).orderBy(asc(schema.tasks.sortOrder)).all();

  return NextResponse.json({ tasks: allTasks });
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
      sortOrder: body.sortOrder || 0,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
