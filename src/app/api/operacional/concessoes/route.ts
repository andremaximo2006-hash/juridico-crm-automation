import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() ?? "";

  const rows = await prisma.concessaoEntry.findMany({
    orderBy: [{ data: "desc" }, { cliente: "asc" }],
  });

  const filtered = q
    ? rows.filter(
        (r) =>
          r.cliente.toLowerCase().includes(q) ||
          (r.beneficio ?? "").toLowerCase().includes(q) ||
          (r.valorHonorarios ?? "").toLowerCase().includes(q)
      )
    : rows;

  return NextResponse.json(filtered);
}
