import nodemailer from "nodemailer";
import { prisma } from "./prisma";

interface SendEmailParams {
  para: string;
  paraNome?: string;
  assunto: string;
  corpo: string;
  campanhaId: string;
  mensagemId: string;
}

export async function enviarEmailSMTP(params: SendEmailParams) {
  try {
    // Buscar configuração SMTP ativa
    const config = await prisma.emailConfig.findFirst({
      where: {
        isAtivo: true,
        provider: "smtp"
      }
    });

    if (!config) {
      throw new Error("Nenhuma configuração SMTP ativa encontrada");
    }

    // Criar transportador SMTP
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword
      }
    });

    // Enviar email
    const info = await transporter.sendMail({
      from: `${config.fromName} <${config.fromEmail}>`,
      to: `${params.paraNome} <${params.para}>`,
      subject: params.assunto,
      html: params.corpo,
      // Tracking pixel (para abertos)
      headers: {
        "X-CAMPAIGN-ID": params.campanhaId,
        "X-MESSAGE-ID": params.mensagemId
      }
    });

    // Atualizar status da mensagem
    await prisma.emailMensagem.update({
      where: { id: params.mensagemId },
      data: {
        status: "enviado",
        msgId: info.messageId,
        enviadoEm: new Date()
      }
    });

    console.log(`✅ Email enviado para ${params.para}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Erro ao enviar email para ${params.para}:`, error);

    // Atualizar status com erro
    await prisma.emailMensagem.update({
      where: { id: params.mensagemId },
      data: {
        status: "falha",
        errorMsg: String(error)
      }
    }).catch(() => {});

    return {
      success: false,
      error: String(error)
    };
  }
}

export async function enviarEmailSendGrid(params: SendEmailParams) {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error("SENDGRID_API_KEY não configurada");
    }

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [
              {
                email: params.para,
                name: params.paraNome
              }
            ]
          }
        ],
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || "noreply@example.com",
          name: process.env.SENDGRID_FROM_NAME || "Sistema"
        },
        subject: params.assunto,
        content: [
          {
            type: "text/html",
            value: params.corpo
          }
        ],
        custom_args: {
          campaign_id: params.campanhaId,
          message_id: params.mensagemId
        }
      })
    });

    if (!response.ok) {
      throw new Error(`SendGrid API Error: ${response.statusText}`);
    }

    const messageId = response.headers.get("X-Message-Id");

    // Atualizar status
    await prisma.emailMensagem.update({
      where: { id: params.mensagemId },
      data: {
        status: "enviado",
        msgId: messageId || undefined,
        enviadoEm: new Date()
      }
    });

    console.log(`✅ Email SendGrid enviado para ${params.para}`);
    return { success: true, messageId };
  } catch (error) {
    console.error(`❌ Erro SendGrid para ${params.para}:`, error);

    await prisma.emailMensagem.update({
      where: { id: params.mensagemId },
      data: {
        status: "falha",
        errorMsg: String(error)
      }
    }).catch(() => {});

    return {
      success: false,
      error: String(error)
    };
  }
}

export async function interpolarVariaveisEmail(
  corpo: string,
  parametros: Record<string, string>
): Promise<string> {
  let result = corpo;
  for (const [key, value] of Object.entries(parametros)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return result;
}
