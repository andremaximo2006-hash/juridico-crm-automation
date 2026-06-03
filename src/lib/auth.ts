import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: "admin" | "financeiro" | "padrao";
}

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "juridico-crm-secret-change-in-production"
);

const COOKIE_NAME = "juridico_session";
const EXPIRES_IN = 60 * 60 * 8; // 8 horas

export async function signJWT(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRES_IN}s`)
    .sign(SECRET);
}

export async function verifyJWT(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJWT(token);
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await signJWT(payload);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: EXPIRES_IN,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export function canAccessFinanceiro(role: SessionPayload["role"]): boolean {
  return role === "admin" || role === "financeiro";
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME;
