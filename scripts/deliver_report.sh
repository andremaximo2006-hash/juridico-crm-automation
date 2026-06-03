#!/bin/bash
# Entrega do Relatório Noturno — CRM Jurídico
# Roda todo dia às 7h00 para entregar o relatório da sessão noturna

set -euo pipefail

PROJECT_DIR="/Users/andreluis/juridico-crm-automation"
REPORT_FILE="${PROJECT_DIR}/RELATORIO_NOTURNO.md"
DELIVERY_LOG="${PROJECT_DIR}/logs/delivery_$(date +%Y%m%d).log"

echo "[$(date)] Iniciando entrega de relatório — CRM Jurídico" >> "$DELIVERY_LOG"

# Verifica se o relatório existe
if [ ! -f "$REPORT_FILE" ]; then
  echo "[$(date)] ERRO: Arquivo de relatório não encontrado: $REPORT_FILE" >> "$DELIVERY_LOG"
  exit 1
fi

# Copia relatório para arquivo datado
DATED_REPORT="${PROJECT_DIR}/logs/relatorio_$(date +%Y%m%d).md"
cp "$REPORT_FILE" "$DATED_REPORT"
echo "[$(date)] Relatório copiado para: $DATED_REPORT" >> "$DELIVERY_LOG"

# Aqui você pode adicionar lógica de envio:
# - Enviar por email
# - Fazer upload para cloud storage
# - Notificar via webhook
# - Etc.

echo "[$(date)] Relatório entregue com sucesso" >> "$DELIVERY_LOG"
exit 0
