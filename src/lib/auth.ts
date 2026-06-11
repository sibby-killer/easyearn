import { cookies } from "next/headers";
import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

const SESSION_DURATION_SECONDS = 3 * 60 * 60; // 3 hours
const CODE_EXPIRY_MINUTES = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateId(): string {
  return uuid();
}

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set("session", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  });
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value || null;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getCurrentUser() {
  const sessionId = await getSession();
  if (!sessionId) return null;
  const user = await db.select().from(schema.users).where(eq(schema.users.id, sessionId)).get();
  return user || null;
}

export async function createVerificationCode(userId: string): Promise<string> {
  const code = generateCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CODE_EXPIRY_MINUTES * 60 * 1000).toISOString();

  await db.insert(schema.verificationCodes).values({
    id: generateId(),
    userId,
    code,
    expiresAt,
    used: 0,
    createdAt: now.toISOString(),
  });

  return code;
}

export async function verifyCode(userId: string, code: string): Promise<boolean> {
  const now = new Date().toISOString();
  const record = await db.select()
    .from(schema.verificationCodes)
    .where(and(
      eq(schema.verificationCodes.userId, userId),
      eq(schema.verificationCodes.code, code),
      eq(schema.verificationCodes.used, 0),
    ))
    .get();

  if (!record) return false;
  if (record.expiresAt < now) return false;

  await db.update(schema.verificationCodes)
    .set({ used: 1 })
    .where(eq(schema.verificationCodes.id, record.id))
    .run();

  return true;
}
