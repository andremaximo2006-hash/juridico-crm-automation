import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

// In-memory rate limiter: 5 attempts per IP per 5 minutes
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente em 5 minutos." }, { status: 429 });
  }

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Login e senha obrigatórios" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  await createSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role as "admin" | "financeiro" | "padrao",
  });

  return NextResponse.json({ ok: true, role: user.role, name: user.name });
}
