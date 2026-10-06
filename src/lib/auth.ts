import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { db } from "./db";
import { HttpError, authorize, type Permission } from "./policy";
export const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export async function issueSession(userId: string, organizationId: string) {
  const token = randomBytes(32).toString("hex");
  await db.session.create({
    data: {
      id: digest(token),
      userId,
      organizationId,
      expiresAt: new Date(Date.now() + 86400000),
    },
  });
  (await cookies()).set("drinkarto_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 86400,
  });
}
export async function context(permission: Permission = "read") {
  const token = (await cookies()).get("drinkarto_session")?.value;
  if (!token) throw new HttpError(401, "Sign in required");
  const session = await db.session.findUnique({ where: { id: digest(token) } });
  if (!session || session.expiresAt < new Date())
    throw new HttpError(401, "Session expired");
  const member = await db.member.findUnique({
    where: {
      organizationId_userId: {
        organizationId: session.organizationId,
        userId: session.userId,
      },
    },
    include: {
      organization: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!member) throw new HttpError(403, "Membership revoked");
  authorize(member.role, permission);
  return {
    organizationId: member.organizationId,
    userId: member.userId,
    role: member.role,
    organization: member.organization,
    user: member.user,
  };
}
export function checkOrigin(request: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  const configured = process.env.APP_ORIGIN;
  const allowed = new Set<string>();
  // Next supplies the request's public origin for same-origin requests. This
  // keeps local/dev ports and preview hosts functional without opening CORS.
  try { allowed.add(new URL(request.url).origin); } catch { /* malformed URL stays denied */ }
  if (configured) {
    try { allowed.add(new URL(configured).origin); } catch { /* invalid configuration remains denied */ }
  } else {
    // Local development commonly uses different ports for the same app.
    for (const host of ["localhost", "127.0.0.1", "[::1]"]) {
      allowed.add(`http://${host}:${new URL(request.url).port}`);
      allowed.add(`https://${host}:${new URL(request.url).port}`);
    }
  }
  if (!origin || !allowed.has(origin) || fetchSite === "cross-site")
    throw new HttpError(403, "Invalid request origin");
}
export async function throttle(email: string) {
  const key = digest(email.toLowerCase());
  const limit = await db.loginAttempt.upsert({
    where: { key },
    create: { key },
    update: { count: { increment: 1 } },
  });
  if (Date.now() - limit.windowStart.getTime() > 900000) {
    await db.loginAttempt.update({
      where: { key },
      data: { count: 1, windowStart: new Date() },
    });
    return;
  }
  if (limit.count > 10)
    throw new HttpError(429, "Too many attempts. Try again in 15 minutes.");
}
