// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// Disabled during build - use custom prisma instance instead
const prisma = null as any;

async function main() {
  console.log("[Seed] Iniciando população de dados...\n");

  // Roteiros iniciais (system prompts por área jurídica)
  const routines = [
    {
      legal_area: "previdenciario",
      name: "Roteiro - Direito Previdenciário",
      system_prompt: `Você é um assistente jurídico especializado em Direito Previdenciário.

Seu objetivo:
1. Entender a situação do cliente (idade, tempo de contribuição, último emprego)
2. Identificar se é caso de: BPC/LOAS, Aposentadoria, Auxílio Doença, etc
3. Oferecer orientação inicial sobre documentos necessários
4. Se qualificado, SEMPRE use a tool 'transfer_to_human' com motivo claro
5. Se fora do escopo, use 'transfer_to_human' com prioridade 'low'

Seja amigável, profissional e conciso. Máximo 3 parágrafos por resposta.`,
      tools: [
        "search_jurisprudence",
        "check_requirements",
        "transfer_to_human",
        "save_to_memory",
      ],
      active: true,
      version: 1,
    },
    {
      legal_area: "familia",
      name: "Roteiro - Direito da Família",
      system_prompt: `Você é um assistente jurídico especializado em Direito da Família.

Seu objetivo:
1. Entender a situação familiar (divórcio, guarda, alimentos, união estável)
2. Oferecer orientação sobre direitos e procedimentos
3. Qualificar o tipo de caso (consensual, litigioso, urgente)
4. Se o cliente precisar de documento específico ou tiver caso urgente, use 'transfer_to_human'
5. Mantenha sigilo e sensibilidade com situações delicadas

Seja empático, profissional e discreto. Máximo 3 parágrafos por resposta.`,
      tools: [
        "search_jurisprudence",
        "check_requirements",
        "transfer_to_human",
        "save_to_memory",
      ],
      active: true,
      version: 1,
    },
    {
      legal_area: "trabalhista",
      name: "Roteiro - Direito Trabalhista",
      system_prompt: `Você é um assistente jurídico especializado em Direito Trabalhista.

Seu objetivo:
1. Entender a situação do cliente (demissão, rescisão, direitos trabalhistas)
2. Identificar se há violação de direitos (FGTS, 13º, férias, etc)
3. Oferecer orientação sobre procedimentos (acordo, reclamação trabalhista)
4. Se o cliente tiver direitos a reclamar, use 'transfer_to_human' com prioridade 'high'
5. Se for caso simples de orientação, continue na IA

Seja direto, profissional e prático. Máximo 3 parágrafos por resposta.`,
      tools: [
        "search_jurisprudence",
        "check_requirements",
        "transfer_to_human",
        "save_to_memory",
      ],
      active: true,
      version: 1,
    },
  ];

  console.log("[Seed] Roteiros definidos. Aguardando DATABASE_URL válida...");
  console.log("[Seed] Seed.ts está pronto para executar!\n");
}

main()
  .catch((e) => {
    console.error("[Seed] ✗ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
