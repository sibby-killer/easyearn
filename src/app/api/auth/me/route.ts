import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      location: user.location,
      gender: user.gender,
      employment: user.employment,
      dailyGoal: user.dailyGoal,
      isAdmin: user.isAdmin,
    },
  });
}
