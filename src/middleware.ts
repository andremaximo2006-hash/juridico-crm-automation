import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "juridico-crm-secret-change-in-production"
);

const COOKIE_NAME = "juridico_session";
const PUBLIC_PATHS = ["/login", "/api/auth/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permite rotas públicas sem verificação
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  const isApi = pathname.startsWith("/api/");

  if (!token) {
    if (isApi) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let payload: { role?: string } | null = null;
  try {
    const { payload: p } = await jwtVerify(token, SECRET);
    payload = p as { role?: string };
  } catch {
    if (isApi) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  // Rota /financeiro exige role admin ou financeiro
  if (pathname.startsWith("/financeiro") || pathname.startsWith("/api/financeiro")) {
    if (payload.role !== "admin" && payload.role !== "financeiro") {
      if (isApi) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
      return NextResponse.redirect(new URL("/acesso-negado", req.url));
    }
  }

  // Rota /marketing exige admin
  if (pathname.startsWith("/marketing") || pathname.startsWith("/api/marketing")) {
    if (payload.role !== "admin") {
      if (isApi) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
      return NextResponse.redirect(new URL("/acesso-negado", req.url));
    }
  }

  // Rota /operacional exige admin, padrao ou financeiro
  if (pathname.startsWith("/operacional") || pathname.startsWith("/api/operacional")) {
    if (payload.role !== "admin" && payload.role !== "padrao" && payload.role !== "financeiro") {
      if (isApi) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
      return NextResponse.redirect(new URL("/acesso-negado", req.url));
    }
  }

  // Rota /configuracoes/usuarios e API de usuários exige admin
  if (pathname.startsWith("/api/usuarios") && payload.role !== "admin") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
