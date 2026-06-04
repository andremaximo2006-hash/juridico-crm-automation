import { prisma } from '../src/lib/prisma.ts';
import bcrypt from 'bcryptjs';

async function resetPasswords() {
  try {
    console.log('🔄 Conectando ao banco de dados...');

    const testPassword = 'Teste@123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    console.log(`✓ Senha hashada com bcrypt`);

    // Check existing users
    console.log('\n📋 Verificando usuários existentes...');
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, isActive: true }
    });

    if (users.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado. Criando...');

      const admin = await prisma.user.create({
        data: {
          email: 'andre.maximo@gabriellenunes.com.br',
          name: 'André Maximo',
          password: hashedPassword,
          role: 'admin',
          isActive: true,
        },
      });
      console.log(`✓ Admin criado: ${admin.email}`);

      const test = await prisma.user.create({
        data: {
          email: 'teste@gabriellenunes.com.br',
          name: 'Usuário Teste',
          password: hashedPassword,
          role: 'padrao',
          isActive: true,
        },
      });
      console.log(`✓ Teste criado: ${test.email}`);
    } else {
      console.log(`✓ ${users.length} usuários encontrados. Atualizando senhas...`);

      for (const user of users) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
            isActive: true,
          },
        });
        console.log(`✓ ${user.email}: senha atualizada`);
      }
    }

    console.log('\n✅ Sucesso!');
    console.log(`Próximo passo: Teste o login em https://crm.gabriellenunes.com.br/login`);
    console.log(`Email: andre.maximo@gabriellenunes.com.br`);
    console.log(`Senha: Teste@123`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPasswords();
