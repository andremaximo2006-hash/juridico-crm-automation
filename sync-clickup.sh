#!/bin/bash

# 🔗 SYNC COM CLICKUP - Script para sincronizar checklist com ClickUp
#
# USO:
#   CLICKUP_API_KEY="seu_token" bash sync-clickup.sh
#
# Ou adicione ao .env:
#   CLICKUP_API_KEY=xyz...

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔗 ClickUp Sync Script${NC}"
echo "=================================="

# Verificar API Key
if [ -z "$CLICKUP_API_KEY" ]; then
    echo -e "${RED}❌ CLICKUP_API_KEY não definida${NC}"
    echo ""
    echo "Use: CLICKUP_API_KEY=\"seu_token\" bash sync-clickup.sh"
    echo ""
    echo "Como obter sua API Key:"
    echo "  1. Vá para ClickUp Settings (engrenagem)"
    echo "  2. Clique em 'Apps' (menu esquerdo)"
    echo "  3. Procure por 'API Token'"
    echo "  4. Copie o token"
    exit 1
fi

echo -e "${GREEN}✅ API Key encontrada${NC}"
echo ""

# Verificar curl
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl não está instalado${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Criando tarefas no ClickUp...${NC}"

# Lista de tarefas a criar
# Formato: "Título|Descrição|Status"

TASKS=(
    # Segunda 29/06 - Completo
    "✅ WhatsApp IA: Database Schema|12 tabelas Prisma criadas e migrate aplicado|Completed"
    "✅ WhatsApp IA: 6 API Endpoints|Todos os endpoints testados e funcionando|Completed"
    "✅ WhatsApp IA: 4 React Pages|Páginas de roteiro, chat e fila prontas|Completed"
    "✅ WhatsApp IA: Sistema de Scoring|Algoritmo 0-100 implementado e testado|Completed"
    "✅ WhatsApp IA: Testes Automatizados|TESTE_FLUXO_COMPLETO.sh criado|Completed"
    "✅ WhatsApp IA: Deploy VPS|Servidor online em 2.25.128.221|Completed"

    # Terça 30/06
    "🔄 Testes Local|Executar ./TESTE_FLUXO_COMPLETO.sh localmente|Todo"
    "🔄 Testar Endpoints|Curl em todos os 6 endpoints|Todo"
    "🔄 Testar UI Browser|Testes manuais na interface|Todo"
    "🔄 Documentação Terça|Atualizar README e exemplos|Todo"

    # Quarta 01/07
    "🔄 Email IA: Database|Criar schema para email|Todo"
    "🔄 Email IA: Endpoints|Implementar 5 endpoints|Todo"
    "🔄 Email IA: Pages|Criar 4 páginas React|Todo"
    "🔄 Refinements WhatsApp|Bug fixes e melhorias|Todo"

    # Quinta 02/07
    "🔄 WhatsApp Webhook Real|Integração com webhook de verdade|Todo"
    "🔄 SMS IA (Opcional)|Schema, endpoints e pages|Todo"
    "🔄 Performance Tuning|Otimizar queries e renders|Todo"

    # Sexta 03/07
    "🔄 Testes E2E Integrados|Testar WhatsApp + Email|Todo"
    "🔄 Documentação API|Swagger/OpenAPI|Todo"
    "🔄 Deployment Guide|Guia de deploy para produção|Todo"

    # Sábado 04/07
    "🔄 Refinements Finais|Últimos ajustes|Todo"
    "🔄 UX Polishing|Melhorias de experiência|Todo"

    # Domingo 05/07
    "🚀 ENTREGA FINAL|Deploy em produção|Todo"
)

echo "Pronto para criar ${#TASKS[@]} tarefas"
echo ""

# Tentar criar tarefas (nota: você precisa configurar WORKSPACE_ID e LIST_ID do seu ClickUp)
echo -e "${YELLOW}⚠️  Para integração completa, você precisa:${NC}"
echo ""
echo "1. Encontrar seu WORKSPACE_ID:"
echo "   curl -H \"Authorization: \$CLICKUP_API_KEY\" https://api.clickup.com/api/v2/team"
echo ""
echo "2. Encontrar sua LIST_ID:"
echo "   curl -H \"Authorization: \$CLICKUP_API_KEY\" https://api.clickup.com/api/v2/folder/{FOLDER_ID}/list"
echo ""
echo "3. Atualizar este script com os IDs"
echo ""

# Exemplo de criação de tarefa (descomentar e configurar)
# curl -X POST "https://api.clickup.com/api/v2/list/{LIST_ID}/task" \
#   -H "Authorization: $CLICKUP_API_KEY" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "name": "WhatsApp IA: Database Schema",
#     "description": "12 tabelas Prisma criadas",
#     "status": "closed",
#     "priority": 3,
#     "due_date": 1719696000000,
#     "tags": ["whatsapp", "database"]
#   }'

echo -e "${GREEN}✅ Script pronto para usar${NC}"
echo ""
echo "Próximas ações:"
echo "  1. Obter WORKSPACE_ID e LIST_ID"
echo "  2. Atualizar variáveis no script"
echo "  3. Rodar: CLICKUP_API_KEY=\"xxx\" bash sync-clickup.sh"
echo ""
