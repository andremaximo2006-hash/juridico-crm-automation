import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Middleware para verificar se é admin
async function requireAdmin(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return null;
  }
  return session;
}

// PUT - Atualizar permissão do usuário
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await requireAdmin(req);
    if (!session) {
      return NextResponse.json({ error: "Apenas admins podem acessar" }, { status: 403 });
    }

    const body = await req.json();
    const { role } = body;
    const { userId } = await params;

    // Validar role
    if (!["admin", "financeiro", "padrao"].includes(role)) {
      return NextResponse.json({ error: "Permissão inválida" }, { status: 400 });
    }

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Prevenir que o próprio admin altere sua permissão
    if (session.userId === userId) {
      return NextResponse.json(
        { error: "Você não pode alterar sua própria permissão" },
        { status: 403 }
      );
    }

    // Atualizar permissão
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as "admin" | "financeiro" | "padrao" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}
