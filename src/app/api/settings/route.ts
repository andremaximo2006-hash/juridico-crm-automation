import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const rows = await prisma.appSetting.findMany();
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const body = await req.json() as Record<string, string>;

  await Promise.all(
    Object.entries(body).map(([key, value]) =>
      prisma.appSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
