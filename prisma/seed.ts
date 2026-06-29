import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed: Criando roteiros de template...");

  // Roteiro 1: Previdenciário
  const rot1 = await prisma.whatsAppRoteiro.create({
    data: {
      name: "Previdenciário",
      description: "Qualifica leads na área de previdência",
      is_active: true,
      steps: {
        create: [
          {
            order: 1,
            pergunta: "Qual é o seu nome completo?",
            tipo: "text",
            is_required: true,
            proximo_step: 2
          },
          {
            order: 2,
            pergunta: "Qual sua situação? (aposentadoria/pensão/BPC/outro)",
            tipo: "text",
            is_required: true,
            proximo_step: 3
          },
          {
            order: 3,
            pergunta: "Há quanto tempo está nessa situação?",
            tipo: "text",
            is_required: true,
            proximo_step: 4
          },
          {
            order: 4,
            pergunta: "Qual seu CPF? (formato: 000.000.000-00)",
            tipo: "text",
            is_required: true
          }
        ]
      }
    }
  });

  // Roteiro 2: Família
  const rot2 = await prisma.whatsAppRoteiro.create({
    data: {
      name: "Família",
      description: "Qualifica leads na área de direito de família",
      is_active: true,
      steps: {
        create: [
          {
            order: 1,
            pergunta: "Qual é o seu nome?",
            tipo: "text",
            is_required: true,
            proximo_step: 2
          },
          {
            order: 2,
            pergunta: "Qual sua situação? (divórcio/guarda/pensão/herança/outro)",
            tipo: "text",
            is_required: true,
            proximo_step: 3
          },
          {
            order: 3,
            pergunta: "Tem filhos menores envolvidos?",
            tipo: "text",
            is_required: true,
            proximo_step: 4
          },
          {
            order: 4,
            pergunta: "Qual seu CPF?",
            tipo: "text",
            is_required: true
          }
        ]
      }
    }
  });

  console.log(`✅ Roteiro 1: ${rot1.name} (ID: ${rot1.id})`);
  console.log(`✅ Roteiro 2: ${rot2.name} (ID: ${rot2.id})`);
}

main()
  .catch(e => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
