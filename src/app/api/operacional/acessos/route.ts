import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() ?? "";

  const rows = await prisma.acessosEntry.findMany({
    orderBy: { sistema: "asc" },
  });

  const filtered = q
    ? rows.filter(
        (r) =>
          r.sistema.toLowerCase().includes(q) ||
          (r.login ?? "").toLowerCase().includes(q)
      )
    : rows;

  return NextResponse.json(filtered);
}
