import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const templates = await prisma.sMSTemplate.findMany({
      where: { isAtivo: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { nome, descricao, conteudo, variaveis } = body;

    if (!nome || !conteudo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (conteudo.length > 160) {
      return NextResponse.json({ error: "SMS must be <= 160 characters" }, { status: 400 });
    }

    const template = await prisma.sMSTemplate.create({
      data: {
        nome,
        descricao,
        conteudo,
        variaveis: variaveis || []
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
