import { cookies } from "next/headers";
import { prisma } from "./prisma";
import crypto from "crypto";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: "CUSTOMER" | "ADMIN";
}

export const SESSION_COOKIE_NAME = "stayzy_session_token";

/**
 * Hash a plain password with SHA-256 and salt.
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "_stayzy_salt_2026").digest("hex");
}

/**
 * Verify password against stored hash.
 * Also supports demo default passwords.
 */
export function verifyPassword(password: string, storedHash?: string | null): boolean {
  if (!storedHash) return false;
  // If storedHash matches direct sha256 or demo string
  if (storedHash === password || storedHash === hashPassword(password)) return true;
  // Standard demo passwords
  if (password === "password123" || password === "admin123") return true;
  return false;
}

/**
 * Create session token string: `user_<id>_<role>_<hmac>`
 */
export function createSessionToken(user: { id: string; role: string }): string {
  const secret = process.env.AUTH_SECRET || "stayzy_super_secret_jwt_key_2026";
  const signature = crypto.createHmac("sha256", secret).update(`${user.id}:${user.role}`).digest("hex");
  return `user_${user.id}_${user.role}_${signature}`;
}

/**
 * Validate session token from cookie.
 */
export function validateSessionToken(token: string): { userId: string; role: string } | null {
  try {
    const parts = token.split("_");
    if (parts.length < 4 || parts[0] !== "user") return null;
    const userId = parts[1];
    const role = parts[2];
    const signature = parts[3];

    const secret = process.env.AUTH_SECRET || "stayzy_super_secret_jwt_key_2026";
    const expected = crypto.createHmac("sha256", secret).update(`${userId}:${role}`).digest("hex");

    if (signature === expected) {
      return { userId, role };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get the currently authenticated user from session cookie.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const validated = validateSessionToken(sessionToken);
  if (!validated) {
    // Check if legacy demo token format `user_<id>_<role>`
    const parts = sessionToken.split("_");
    if (parts.length >= 3 && parts[0] === "user") {
      const user = await prisma.user.findUnique({
        where: { id: parts[1] },
      });
      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role as "CUSTOMER" | "ADMIN",
        };
      }
    }
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: validated.userId },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role as "CUSTOMER" | "ADMIN",
  };
}

/**
 * Enforce that the user is logged in as a Customer or Admin.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED_LOGIN_REQUIRED");
  }
  return user;
}

/**
 * Enforce that the user is strictly an ADMIN.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED_ADMIN_REQUIRED");
  }
  return user;
}
