/**
 * Serviço de Notificações
 * Envia emails e notificações quando eventos importantes ocorrem
 */

import { logger } from "./logger";

interface EmailNotification {
  to: string;
  subject: string;
  htmlBody: string;
  plainTextBody: string;
}

class NotificationService {
  private emailProvider: string;

  constructor() {
    this.emailProvider = process.env.EMAIL_PROVIDER || "console";
  }

  /**
   * Enviar email
   */
  async sendEmail(notification: EmailNotification): Promise<boolean> {
    try {
      logger.info("[Notification] Enviando email", {
        to: notification.to,
        subject: notification.subject,
      });

      if (this.emailProvider === "sendgrid") {
        return await this.sendViaS endGrid(notification);
      } else if (this.emailProvider === "resend") {
        return await this.sendViaResend(notification);
      } else {
        // Console para desenvolvimento
        logger.info("[Notification] Email (console mode)", {
          to: notification.to,
          subject: notification.subject,
          body: notification.plainTextBody,
        });
        return true;
      }
    } catch (error) {
      logger.error("[Notification] Erro ao enviar email", error);
      return false;
    }
  }

  /**
   * Notificar novo ticket para atendente
   */
  async notifyNewTicket(
    attendantEmail: string,
    ticketData: {
      ticketId: string;
      clientName: string;
      reason: string;
      priority: string;
      phone: string;
    }
  ): Promise<boolean> {
    const subject = `🎫 Novo Ticket: ${ticketData.clientName} (${ticketData.priority.toUpperCase()})`;

    const htmlBody = `
      <h2>Novo Ticket Atribuído</h2>
      <p>Um novo ticket foi atribuído para você!</p>

      <table style="border: 1px solid #ddd; border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr style="background: #f5f5f5;">
          <td style="padding: 10px; font-weight: bold;">Cliente:</td>
          <td style="padding: 10px;">${ticketData.clientName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Telefone:</td>
          <td style="padding: 10px;">${ticketData.phone}</td>
        </tr>
        <tr style="background: #f5f5f5;">
          <td style="padding: 10px; font-weight: bold;">Motivo:</td>
          <td style="padding: 10px;">${ticketData.reason}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Prioridade:</td>
          <td style="padding: 10px;">
            <span style="padding: 5px 10px; background: ${this.getPriorityColor(
              ticketData.priority
            )}; color: white; border-radius: 4px;">
              ${ticketData.priority.toUpperCase()}
            </span>
          </td>
        </tr>
      </table>

      <p>
        <a href="${process.env.BASE_URL || 'http://localhost:3000'}/ia/atendimento-humano"
           style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Atender Agora
        </a>
      </p>
    `;

    const plainTextBody = `
      NOVO TICKET

      Cliente: ${ticketData.clientName}
      Telefone: ${ticketData.phone}
      Motivo: ${ticketData.reason}
      Prioridade: ${ticketData.priority.toUpperCase()}

      Acesse: ${process.env.BASE_URL || 'http://localhost:3000'}/ia/atendimento-humano
    `;

    return this.sendEmail({
      to: attendantEmail,
      subject,
      htmlBody,
      plainTextBody,
    });
  }

  /**
   * Notificar cliente de transferência
   */
  async notifyClientTransferred(
    clientEmail: string,
    clientName: string
  ): Promise<boolean> {
    const subject = "Seu atendimento foi transferido para um especialista";

    const htmlBody = `
      <h2>Olá ${clientName}!</h2>
      <p>
        Sua solicitação foi transferida para um especialista que poderá ajudá-lo melhor.
      </p>
      <p>
        Um atendente especializado entrará em contato em breve através do WhatsApp.
      </p>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        Obrigado por escolher nossos serviços!
      </p>
    `;

    const plainTextBody = `
      Olá ${clientName}!

      Sua solicitação foi transferida para um especialista.
      Um atendente especializado entrará em contato em breve.

      Obrigado!
    `;

    return this.sendEmail({
      to: clientEmail,
      subject,
      htmlBody,
      plainTextBody,
    });
  }

  /**
   * Notificar resolução de ticket
   */
  async notifyTicketResolved(
    clientEmail: string,
    clientName: string,
    resolution: string
  ): Promise<boolean> {
    const subject = "Seu ticket foi resolvido";

    const htmlBody = `
      <h2>Ticket Resolvido</h2>
      <p>Olá ${clientName},</p>
      <p>Seu ticket foi resolvido com sucesso!</p>

      <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p><strong>Resolução:</strong></p>
        <p>${resolution}</p>
      </div>

      <p>Se tiver dúvidas, entre em contato conosco!</p>
    `;

    const plainTextBody = `
      TICKET RESOLVIDO

      Olá ${clientName},

      Seu ticket foi resolvido com sucesso!

      Resolução:
      ${resolution}

      Se tiver dúvidas, entre em contato!
    `;

    return this.sendEmail({
      to: clientEmail,
      subject,
      htmlBody,
      plainTextBody,
    });
  }

  /**
   * Enviar via SendGrid
   */
  private async sendViaSendGrid(
    notification: EmailNotification
  ): Promise<boolean> {
    try {
      const sgMail = await import("@sendgrid/mail");
      const msg = {
        to: notification.to,
        from: process.env.SENDGRID_FROM_EMAIL || "noreply@juridico-crm.com",
        subject: notification.subject,
        html: notification.htmlBody,
        text: notification.plainTextBody,
      };

      await sgMail.send(msg);
      logger.info("[Notification] Email enviado via SendGrid", {
        to: notification.to,
      });
      return true;
    } catch (error) {
      logger.error("[Notification] Erro ao enviar via SendGrid", error);
      return false;
    }
  }

  /**
   * Enviar via Resend
   */
  private async sendViaResend(
    notification: EmailNotification
  ): Promise<boolean> {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@juridico-crm.com",
        to: notification.to,
        subject: notification.subject,
        html: notification.htmlBody,
      });

      logger.info("[Notification] Email enviado via Resend", {
        to: notification.to,
      });
      return true;
    } catch (error) {
      logger.error("[Notification] Erro ao enviar via Resend", error);
      return false;
    }
  }

  /**
   * Obter cor por prioridade
   */
  private getPriorityColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case "high":
        return "#dc2626";
      case "normal":
        return "#f59e0b";
      case "low":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  }
}

export const notificationService = new NotificationService();
