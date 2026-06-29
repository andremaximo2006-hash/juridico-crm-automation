import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const roteiros = await prisma.whatsAppRoteiro.findMany({
      include: { steps: { orderBy: { order: "asc" } } }
    });

    return NextResponse.json(roteiros);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, description, steps } = await request.json();

    const roteiro = await prisma.whatsAppRoteiro.create({
      data: {
        name,
        description,
        is_active: true,
        steps: {
          create: steps.map((s: any, i: number) => ({
            order: i + 1,
            pergunta: s.pergunta,
            tipo: s.tipo || "text",
            is_required: true,
            proximo_step: i < steps.length - 1 ? i + 2 : null
          }))
        }
      },
      include: { steps: true }
    });

    return NextResponse.json(roteiro, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
