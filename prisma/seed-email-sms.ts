import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed: Email e SMS Templates...");

  // ─── EMAIL TEMPLATES ──────────────────────────────────────────────────

  // Template 1: Confirmação de Atendimento
  await prisma.emailTemplate.upsert({
    where: { id: "template_email_1" },
    update: {},
    create: {
      id: "template_email_1",
      nome: "Confirmação de Atendimento",
      descricao: "Confirma agendamento de atendimento jurídico",
      assunto: "Seu atendimento foi confirmado!",
      corpo: `
        <h1>Olá {{nome}}</h1>
        <p>Seu atendimento foi confirmado com sucesso!</p>
        <p><strong>Data:</strong> {{data}}</p>
        <p><strong>Horário:</strong> {{horario}}</p>
        <p><strong>Advogado:</strong> {{advogado}}</p>
        <p>Se precisar reagendar, entre em contato conosco.</p>
      `,
      variaveis: ["nome", "data", "horario", "advogado"],
      isAtivo: true
    }
  });

  // Template 2: Documentos Pendentes
  await prisma.emailTemplate.upsert({
    where: { id: "template_email_2" },
    update: {},
    create: {
      id: "template_email_2",
      nome: "Documentos Pendentes",
      descricao: "Avisa sobre documentos que precisam ser enviados",
      assunto: "Atenção: Documentos pendentes",
      corpo: `
        <h1>Olá {{nome}}</h1>
        <p>Precisamos dos seguintes documentos para prosseguir:</p>
        <ul>
          <li>{{documento1}}</li>
          <li>{{documento2}}</li>
          <li>{{documento3}}</li>
        </ul>
        <p>Por favor, envie os documentos até {{prazo}}.</p>
      `,
      variaveis: ["nome", "documento1", "documento2", "documento3", "prazo"],
      isAtivo: true
    }
  });

  // Template 3: Nova Mensagem
  await prisma.emailTemplate.upsert({
    where: { id: "template_email_3" },
    update: {},
    create: {
      id: "template_email_3",
      nome: "Aviso de Mensagem",
      descricao: "Notifica sobre nova mensagem no sistema",
      assunto: "Você tem uma nova mensagem",
      corpo: `
        <h1>Olá {{nome}}</h1>
        <p>Você recebeu uma nova mensagem de {{remetente}}:</p>
        <blockquote>{{mensagem}}</blockquote>
        <p><a href="{{link}}">Ver mensagem completa</a></p>
      `,
      variaveis: ["nome", "remetente", "mensagem", "link"],
      isAtivo: true
    }
  });

  // ─── SMS TEMPLATES ───────────────────────────────────────────────────

  // Template 1: Confirmação Rápida
  await prisma.sMSTemplate.upsert({
    where: { id: "template_sms_1" },
    update: {},
    create: {
      id: "template_sms_1",
      nome: "Confirmação Rápida",
      descricao: "SMS rápido de confirmação",
      conteudo: "Olá {{nome}}, seu atendimento foi confirmado para {{data}} às {{hora}}. Obrigado!",
      variaveis: ["nome", "data", "hora"],
      isAtivo: true
    }
  });

  // Template 2: Lembrete
  await prisma.sMSTemplate.upsert({
    where: { id: "template_sms_2" },
    update: {},
    create: {
      id: "template_sms_2",
      nome: "Lembrete",
      descricao: "SMS de lembrete de atendimento",
      conteudo: "Lembrete: Seu atendimento é amanhã às {{hora}}. Confirme presença respondendo SIM.",
      variaveis: ["hora"],
      isAtivo: true
    }
  });

  // Template 3: Aviso Urgente
  await prisma.sMSTemplate.upsert({
    where: { id: "template_sms_3" },
    update: {},
    create: {
      id: "template_sms_3",
      nome: "Aviso Urgente",
      descricao: "SMS urgente com aviso importante",
      conteudo: "⚠️ URGENTE: {{assunto}}. Responda confirmando recebimento.",
      variaveis: ["assunto"],
      isAtivo: true
    }
  });

  // ─── EMAIL CONFIG (Exemplo) ────────────────────────────────────────

  await prisma.emailConfig.upsert({
    where: { provider: "smtp" },
    update: {},
    create: {
      provider: "smtp",
      fromEmail: "noreply@juridico.com.br",
      fromName: "Sistema Jurídico",
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpUser: "seu-email@gmail.com",
      smtpPassword: "sua-senha-app",
      isAtivo: false // Desativado - precisa configurar
    }
  });

  // ─── SMS CONFIG (Exemplo) ─────────────────────────────────────────

  await prisma.sMSConfig.upsert({
    where: { provider: "twilio" },
    update: {},
    create: {
      provider: "twilio",
      accountSid: "AC...",
      apiKey: "sk_...",
      fromNumber: "+5585XXXXXXXX",
      isAtivo: false // Desativado - precisa configurar
    }
  });

  console.log("✅ Seed completo!");
  console.log("");
  console.log("📧 Email Templates criados:");
  console.log("  - Confirmação de Atendimento");
  console.log("  - Documentos Pendentes");
  console.log("  - Aviso de Mensagem");
  console.log("");
  console.log("💬 SMS Templates criados:");
  console.log("  - Confirmação Rápida");
  console.log("  - Lembrete");
  console.log("  - Aviso Urgente");
  console.log("");
  console.log("⚙️  Configurações (desativadas - precisam ser configuradas):");
  console.log("  - SMTP (Gmail)");
  console.log("  - Twilio SMS");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
