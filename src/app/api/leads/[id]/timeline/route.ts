import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await props.params;

  const events = await prisma.leadTimeline.findMany({
    where: { leadId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(events);
}
