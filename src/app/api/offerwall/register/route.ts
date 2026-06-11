import { NextResponse } from "next/server";
import { generateId } from "@/lib/auth";

export async function POST() {
  const visitorId = generateId().slice(0, 8);
  return NextResponse.json({ visitorId });
}
