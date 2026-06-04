#!/bin/bash

# Script de Deploy para VPS
# Executa na VPS para atualizar o código e reiniciar a aplicação

echo "🚀 Iniciando deploy na VPS..."
echo "📍 Servidor: 2.25.128.221"
echo "📁 Caminho: /var/www/juridico-crm-automation"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está na pasta certa
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado${NC}"
    echo "Execute este script dentro de /var/www/juridico-crm-automation"
    exit 1
fi

# 1. Git Pull
echo -e "${YELLOW}1️⃣  Atualizando código do Git...${NC}"
git pull origin main
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao fazer git pull${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Código atualizado${NC}"
echo ""

# 2. Build
echo -e "${YELLOW}2️⃣  Reconstruindo aplicação...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao reconstruir${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build concluído${NC}"
echo ""

# 3. Restart PM2
echo -e "${YELLOW}3️⃣  Reiniciando com PM2...${NC}"
pm2 restart all
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao reiniciar PM2${NC}"
    exit 1
fi
echo -e "${GREEN}✓ PM2 reiniciado${NC}"
echo ""

# 4. Status
echo -e "${YELLOW}4️⃣  Verificando status...${NC}"
pm2 status
echo ""

# 5. Test
echo -e "${YELLOW}5️⃣  Testando aplicação...${NC}"
sleep 3
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://localhost/login)
if [ "$STATUS_CODE" = "200" ] || [ "$STATUS_CODE" = "301" ]; then
    echo -e "${GREEN}✓ Aplicação está online (HTTP $STATUS_CODE)${NC}"
else
    echo -e "${RED}⚠️  Verificar status (HTTP $STATUS_CODE)${NC}"
fi
echo ""

echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Executar reset de senha:"
echo "   curl -X POST https://crm.gabriellenunes.com.br/api/admin/reset-password \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"adminKey\":\"reset-2026-juridico\",\"email\":\"andre.maximo@gabriellenunes.com.br\",\"newPassword\":\"Teste@123\"}'"
echo ""
echo "2. Testar login em https://crm.gabriellenunes.com.br/login"
echo ""
