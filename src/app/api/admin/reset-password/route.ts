import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * POST /api/admin/reset-password
 * Endpoint para resetar senhas (requer chave secreta)
 *
 * Body:
 * {
 *   "adminKey": "seu-codigo-secreto",
 *   "email": "usuario@example.com",
 *   "newPassword": "nova-senha"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { adminKey, email, newPassword } = await request.json();

    // Validação da chave de administrador
    const ADMIN_RESET_KEY = process.env.ADMIN_RESET_KEY || "reset-2026-juridico";
    if (adminKey !== ADMIN_RESET_KEY) {
      return NextResponse.json(
        { error: "Chave de acesso inválida" },
        { status: 403 }
      );
    }

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Email e nova senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar força da senha
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Senha deve ter no mínimo 8 caracteres" },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Buscar e atualizar o usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isActive: true, // Ativa o usuário se estava inativo
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    console.log(`✓ Senha resetada para: ${updated.email}`);

    return NextResponse.json(
      {
        success: true,
        message: `Senha atualizada para ${updated.email}`,
        user: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    return NextResponse.json(
      { error: "Erro ao resetar senha" },
      { status: 500 }
    );
  }
}
