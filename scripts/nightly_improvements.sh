#!/bin/bash
# Sessão noturna automática — CRM Jurídico
# Roda via LaunchAgent todo dia às 22h05

set -euo pipefail

PROJECT_DIR="/Users/andreluis/juridico-crm-automation"
LOG_FILE="${PROJECT_DIR}/logs/nightly_$(date +%Y%m%d).log"
PROMPT_FILE="${PROJECT_DIR}/scripts/nightly_prompt.md"

# Encontra o binário do Claude Code (pega a versão mais recente instalada)
CLAUDE_BIN=$(find /Users/andreluis/.vscode/extensions -name "claude" -path "*/native-binary/claude" 2>/dev/null | sort -V | tail -1)

if [ -z "$CLAUDE_BIN" ]; then
  echo "[$(date)] ERRO: Binário do Claude não encontrado." >> "$LOG_FILE"
  exit 1
fi

echo "[$(date)] Iniciando sessão noturna — CRM Jurídico" >> "$LOG_FILE"
echo "[$(date)] Usando: $CLAUDE_BIN" >> "$LOG_FILE"

cd "$PROJECT_DIR"

# Executa Claude em modo não-interativo com o prompt da noite
"$CLAUDE_BIN" \
  --print \
  --dangerously-skip-permissions \
  --model claude-sonnet-4-6 \
  "$(cat "$PROMPT_FILE")" \
  >> "$LOG_FILE" 2>&1

EXIT_CODE=$?
echo "[$(date)] Sessão encerrada. Exit code: $EXIT_CODE" >> "$LOG_FILE"

# Remove logs com mais de 30 dias
find "${PROJECT_DIR}/logs" -name "nightly_*.log" -mtime +30 -delete 2>/dev/null || true

exit $EXIT_CODE
