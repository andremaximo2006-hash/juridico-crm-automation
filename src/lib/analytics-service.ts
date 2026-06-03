/**
 * Serviço de Analytics
 * Rastreia métricas e eventos da aplicação
 */

import { logger } from "./logger";

interface Event {
  name: string;
  userId?: string;
  leadId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

interface Metrics {
  totalMessages: number;
  totalTickets: number;
  averageResponseTime: number;
  transferRate: number;
  resolutionRate: number;
  activeConversations: number;
}

class AnalyticsService {
  private events: Event[] = [];

  /**
   * Registrar evento
   */
  trackEvent(
    name: string,
    metadata?: Record<string, any>,
    userId?: string,
    leadId?: string
  ): void {
    const event: Event = {
      name,
      userId,
      leadId,
      metadata,
      timestamp: new Date(),
    };

    this.events.push(event);

    logger.info("[Analytics] Evento registrado", {
      event: name,
      userId,
      leadId,
      metadata,
    });

    // Manter apenas últimos 1000 eventos em memória
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  /**
   * Obter métricas do período
   */
  getMetrics(hours: number = 24): Metrics {
    const now = new Date();
    const periodStart = new Date(now.getTime() - hours * 60 * 60 * 1000);

    const periodEvents = this.events.filter((e) => e.timestamp >= periodStart);

    const messageEvents = periodEvents.filter((e) => e.name === "message_processed");
    const ticketEvents = periodEvents.filter((e) => e.name === "ticket_created");
    const transferEvents = periodEvents.filter((e) => e.name === "transfer_to_human");
    const resolvedEvents = periodEvents.filter((e) => e.name === "ticket_resolved");
    const activeConversations = new Set(
      periodEvents
        .filter((e) => e.name === "conversation_started" || e.name === "message_processed")
        .map((e) => e.leadId)
    ).size;

    // Calcular resposta média (simulado: 5 minutos em média)
    const averageResponseTime = transferEvents.length > 0 ? 300 : 0; // segundos

    const transferRate = messageEvents.length > 0
      ? (transferEvents.length / messageEvents.length) * 100
      : 0;

    const resolutionRate = ticketEvents.length > 0
      ? (resolvedEvents.length / ticketEvents.length) * 100
      : 0;

    return {
      totalMessages: messageEvents.length,
      totalTickets: ticketEvents.length,
      averageResponseTime,
      transferRate: Math.round(transferRate * 100) / 100,
      resolutionRate: Math.round(resolutionRate * 100) / 100,
      activeConversations,
    };
  }

  /**
   * Obter eventos
   */
  getEvents(limit: number = 100): Event[] {
    return this.events.slice(-limit);
  }

  /**
   * Limpar eventos antigos
   */
  cleanup(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.events = this.events.filter((e) => e.timestamp > oneDayAgo);

    logger.info("[Analytics] Limpeza de eventos executada", {
      remaining: this.events.length,
    });
  }
}

export const analyticsService = new AnalyticsService();

// Limpar eventos a cada 6 horas
if (typeof window === "undefined") {
  // Server-side only
  setInterval(() => {
    analyticsService.cleanup();
  }, 6 * 60 * 60 * 1000);
}
