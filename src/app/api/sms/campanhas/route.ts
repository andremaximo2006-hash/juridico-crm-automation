import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const campanhas = await prisma.sMSCampanha.findMany({
      where: status ? { status: status as any } : {},
      include: { template: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(campanhas);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { nome, descricao, templateId, telefones, tagsDestino, agendadoEm } = body;

    if (!nome || !templateId || !telefones || !Array.isArray(telefones)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const campanha = await prisma.sMSCampanha.create({
      data: {
        nome,
        descricao,
        templateId,
        telefones,
        tagsDestino: tagsDestino || [],
        totalDestina: telefones.length,
        status: agendadoEm ? "agendado" : "rascunho",
        agendadoEm: agendadoEm ? new Date(agendadoEm) : null
      },
      include: { template: true }
    });

    return NextResponse.json(campanha, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
