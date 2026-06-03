/**
 * Serviço Asaas para integração financeira
 * Gerencia cobranças, recibos e pagamentos
 */

import { logger } from "./logger";

interface AsaasConfig {
  apiKey: string;
  baseUrl: string;
}

interface PaymentRequest {
  customerId: string;
  description: string;
  value: number;
  dueDate: string;
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "DEBIT_CARD";
}

interface PaymentResponse {
  id: string;
  status: string;
  value: number;
  netValue?: number;
  dueDate: string;
  billingUrl?: string;
  pixQrCode?: string;
}

class AsaasService {
  private config: AsaasConfig;

  constructor() {
    this.config = {
      apiKey: process.env.ASAAS_API_KEY || "",
      baseUrl: process.env.ASAAS_BASE_URL || "https://api.asaas.com/v3",
    };

    if (!this.config.apiKey) {
      logger.warn("[Asaas] API Key não configurada. Asaas desativado.");
    }
  }

  /**
   * Criar cobrança
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.config.apiKey) {
      logger.warn("[Asaas] Tentativa usar Asaas sem API key");
      throw new Error("Asaas API key não configurada");
    }

    try {
      logger.info("[Asaas] Criando cobrança", {
        customerId: request.customerId,
        value: request.value,
        billingType: request.billingType,
      });

      const response = await fetch(`${this.config.baseUrl}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access_token": this.config.apiKey,
        },
        body: JSON.stringify({
          customer: request.customerId,
          description: request.description,
          value: request.value,
          dueDate: request.dueDate,
          billingType: request.billingType,
          status: "PENDING",
        }),
      });

      if (!response.ok) {
        throw new Error(`Asaas API error: ${response.statusText}`);
      }

      const data = await response.json();

      logger.info("[Asaas] Cobrança criada com sucesso", {
        paymentId: data.id,
        value: data.value,
      });

      return {
        id: data.id,
        status: data.status,
        value: data.value,
        netValue: data.netValue,
        dueDate: data.dueDate,
        billingUrl: data.invoiceUrl,
        pixQrCode: data.pixCopyPaste,
      };
    } catch (error) {
      logger.error("[Asaas] Erro ao criar cobrança", error);
      throw error;
    }
  }

  /**
   * Listar cobranças de um cliente
   */
  async listPayments(customerId: string): Promise<PaymentResponse[]> {
    if (!this.config.apiKey) {
      return [];
    }

    try {
      logger.info("[Asaas] Listando cobranças", { customerId });

      const response = await fetch(
        `${this.config.baseUrl}/payments?customer=${customerId}`,
        {
          method: "GET",
          headers: {
            "access_token": this.config.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Asaas API error: ${response.statusText}`);
      }

      const data = await response.json();

      return (data.data || []).map((payment: any) => ({
        id: payment.id,
        status: payment.status,
        value: payment.value,
        netValue: payment.netValue,
        dueDate: payment.dueDate,
        billingUrl: payment.invoiceUrl,
        pixQrCode: payment.pixCopyPaste,
      }));
    } catch (error) {
      logger.error("[Asaas] Erro ao listar cobranças", error);
      return [];
    }
  }

  /**
   * Obter detalhes de uma cobrança
   */
  async getPayment(paymentId: string): Promise<PaymentResponse | null> {
    if (!this.config.apiKey) {
      return null;
    }

    try {
      logger.info("[Asaas] Obtendo detalhes da cobrança", { paymentId });

      const response = await fetch(
        `${this.config.baseUrl}/payments/${paymentId}`,
        {
          method: "GET",
          headers: {
            "access_token": this.config.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Asaas API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        status: data.status,
        value: data.value,
        netValue: data.netValue,
        dueDate: data.dueDate,
        billingUrl: data.invoiceUrl,
        pixQrCode: data.pixCopyPaste,
      };
    } catch (error) {
      logger.error("[Asaas] Erro ao obter cobrança", error);
      return null;
    }
  }

  /**
   * Cancelar cobrança
   */
  async cancelPayment(paymentId: string): Promise<boolean> {
    if (!this.config.apiKey) {
      return false;
    }

    try {
      logger.info("[Asaas] Cancelando cobrança", { paymentId });

      const response = await fetch(
        `${this.config.baseUrl}/payments/${paymentId}`,
        {
          method: "DELETE",
          headers: {
            "access_token": this.config.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Asaas API error: ${response.statusText}`);
      }

      logger.info("[Asaas] Cobrança cancelada", { paymentId });
      return true;
    } catch (error) {
      logger.error("[Asaas] Erro ao cancelar cobrança", error);
      return false;
    }
  }

  /**
   * Webhook para notificações de pagamento
   */
  async handleWebhook(payload: any): Promise<void> {
    try {
      const { event, payment } = payload;

      logger.info("[Asaas] Webhook recebido", {
        event,
        paymentId: payment?.id,
        status: payment?.status,
      });

      // Aqui você pode adicionar lógica para:
      // - Atualizar status do pagamento no BD
      // - Enviar email de confirmação
      // - Gerar recibo
      // - Atualizar financeiro no dashboard
    } catch (error) {
      logger.error("[Asaas] Erro ao processar webhook", error);
    }
  }
}

// Exportar singleton
export const asaasService = new AsaasService();
