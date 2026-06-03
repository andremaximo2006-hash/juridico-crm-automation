/**
 * Logger estruturado para o CRM
 * Formato: [NIVEL] [Módulo] Mensagem { dados }
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: any;
}

export const logger = {
  /**
   * Info: Eventos normais de sistema
   */
  info: (message: string, context?: LogContext) => {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    console.log(`[${timestamp}] [INFO] ${message}${contextStr}`);
  },

  /**
   * Warn: Situações incomuns mas não críticas
   */
  warn: (message: string, context?: LogContext) => {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    console.warn(`[${timestamp}] [WARN] ${message}${contextStr}`);
  },

  /**
   * Error: Erros críticos
   */
  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    const timestamp = new Date().toISOString();
    const errorStr = error instanceof Error ? ` ${error.message}` : "";
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    console.error(
      `[${timestamp}] [ERROR] ${message}${errorStr}${contextStr}`
    );
  },

  /**
   * Debug: Informações detalhadas para debug
   */
  debug: (message: string, context?: LogContext) => {
    if (process.env.DEBUG === "true") {
      const timestamp = new Date().toISOString();
      const contextStr = context ? ` ${JSON.stringify(context)}` : "";
      console.debug(`[${timestamp}] [DEBUG] ${message}${contextStr}`);
    }
  },
};
