/**
 * Script para resetar senha de usuário
 * Uso: node reset-password.js <email> <nova-senha>
 */

const bcrypt = require("bcryptjs");
const { prisma } = require("./src/lib/prisma.ts");

async function resetPassword(email, newPassword) {
  if (!email || !newPassword) {
    console.error("❌ Uso: node reset-password.js <email> <senha>");
    process.exit(1);
  }

  try {
    console.log(`🔄 Resetando senha para ${email}...`);

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.error(`❌ Usuário não encontrado: ${email}`);
      process.exit(1);
    }

    // Hash nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar usuário
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { password: hashedPassword },
    });

    console.log("✅ Senha resetada com sucesso!");
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Nova senha: ${newPassword}`);
    console.log("\n⚠️  IMPORTANTE:");
    console.log("   1. Compartilhe a nova senha com segurança");
    console.log("   2. Peça ao usuário para trocar a senha na primeira vez");

  } catch (error) {
    console.error("❌ Erro:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect?.();
  }
}

// Pegar argumentos da linha de comando
const args = process.argv.slice(2);
resetPassword(args[0], args[1]);
