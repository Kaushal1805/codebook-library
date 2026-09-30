import { SignJWT, jwtVerify } from "jose";

const cookieName = "admin_session";
const sessionDurationSeconds = 60 * 60 * 8;

function getSessionKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export async function createAdminSession() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${sessionDurationSeconds}s`)
    .sign(getSessionKey());
}

export async function verifyAdminSession(token?: string) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSessionKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export const adminSession = { cookieName, duration: sessionDurationSeconds };
