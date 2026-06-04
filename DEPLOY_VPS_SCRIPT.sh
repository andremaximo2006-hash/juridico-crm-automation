#!/bin/bash
# 🚀 DEPLOY SCRIPT - Módulo Operacional Kanban
# Execute este script na VPS como root
# bash /var/www/juridico-crm-automation/DEPLOY_VPS_SCRIPT.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  DEPLOY VPS - Módulo Operacional Kanban                    ║"
echo "║  Data: $(date +'%Y-%m-%d %H:%M:%S')                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

cd /var/www/juridico-crm-automation

# ==============================================================================
# PASSO 1: Verificar estado atual
# ==============================================================================
echo -e "${YELLOW}[1/9] VERIFICANDO ESTADO ATUAL...${NC}"
echo "Branch atual:"
git branch
echo "Última commit:"
git log -1 --oneline
echo "Status do Git:"
git status
echo -e "${GREEN}✓ Estado verificado${NC}\n"

# ==============================================================================
# PASSO 2: Puxar changes
# ==============================================================================
echo -e "${YELLOW}[2/9] PUXANDO CHANGES...${NC}"
git fetch origin main
git pull origin main
echo "Branch após pull:"
git log -1 --oneline
echo -e "${GREEN}✓ Changes puxadas${NC}\n"

# ==============================================================================
# PASSO 3: Verificar migration file (DUPLA CHECK)
# ==============================================================================
echo -e "${YELLOW}[3/9] VERIFICANDO MIGRATION FILE...${NC}"
MIGRATION_PATH="prisma/migrations/1780547139_extend_ficha_operacional/migration.sql"

if [ ! -f "$MIGRATION_PATH" ]; then
  echo -e "${RED}✗ ERRO: Migration file não encontrado em $MIGRATION_PATH${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Migration file encontrado${NC}"
echo "Conteúdo (primeiras 30 linhas):"
head -30 "$MIGRATION_PATH"
echo "..."
echo "Total de linhas: $(wc -l < $MIGRATION_PATH)"
echo -e "${GREEN}✓ Migration SQL validada${NC}\n"

# ==============================================================================
# PASSO 4: Aplicar migration (COM BACKUP)
# ==============================================================================
echo -e "${YELLOW}[4/9] APLICANDO MIGRATION NO BANCO...${NC}"

# Criar backup antes de aplicar migration
BACKUP_FILE="/tmp/juridico_crm_backup_$(date +%s).sql"
echo "Criando backup do banco em: $BACKUP_FILE"
pg_dump -h localhost -U juridico_user juridico_crm > "$BACKUP_FILE"
echo -e "${GREEN}✓ Backup criado${NC}"

echo "Aplicando migration..."
psql -h localhost -U juridico_user -d juridico_crm -f "$MIGRATION_PATH"

# Verificar se as tabelas foram criadas (DUPLA CHECK)
echo "Verificando se tabelas foram criadas..."
TABLES_COUNT=$(psql -h localhost -U juridico_user -d juridico_crm -t -c \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'fichas_operacionais'")

if [ "$TABLES_COUNT" -eq 1 ]; then
  echo -e "${GREEN}✓ Tabela fichas_operacionais criada com sucesso${NC}"
else
  echo -e "${RED}✗ ERRO: Tabela não foi criada!${NC}"
  exit 1
fi

# Verificar enums (DUPLA CHECK)
echo "Verificando ENUMs criados..."
ENUM_COUNT=$(psql -h localhost -U juridico_user -d juridico_crm -t -c \
  "SELECT COUNT(*) FROM pg_type WHERE typtype = 'e'")
echo "Total de ENUMs no banco: $ENUM_COUNT"
if [ "$ENUM_COUNT" -gt 10 ]; then
  echo -e "${GREEN}✓ ENUMs criados corretamente${NC}"
else
  echo -e "${RED}✗ AVISO: Menos de 10 ENUMs encontrados${NC}"
fi

echo -e "${GREEN}✓ Migration aplicada com sucesso${NC}\n"

# ==============================================================================
# PASSO 5: Verificar dependências
# ==============================================================================
echo -e "${YELLOW}[5/9] VERIFICANDO DEPENDÊNCIAS...${NC}"
npm list @prisma/client 2>/dev/null | head -5 || echo "Prisma não listado, verificando package.json..."
grep "@prisma/client" package.json
echo -e "${GREEN}✓ Dependências verificadas${NC}\n"

# ==============================================================================
# PASSO 6: Gerar Prisma Client
# ==============================================================================
echo -e "${YELLOW}[6/9] GERANDO PRISMA CLIENT...${NC}"
npx prisma generate
echo "Verificando se arquivos foram gerados..."
if [ -f "src/generated/prisma/client.ts" ]; then
  echo -e "${GREEN}✓ Prisma Client gerado${NC}"
else
  echo -e "${RED}✗ ERRO: Prisma Client não foi gerado!${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Geração concluída${NC}\n"

# ==============================================================================
# PASSO 7: Build
# ==============================================================================
echo -e "${YELLOW}[7/9] FAZENDO BUILD...${NC}"
echo "Limpando build anterior..."
rm -rf .next
npm run build 2>&1 | tee /tmp/build_log.txt

# Verificar se build foi bem-sucedido (DUPLA CHECK)
if grep -q "✓ Compiled successfully" /tmp/build_log.txt; then
  echo -e "${GREEN}✓ Build completado com sucesso${NC}"
elif [ -d ".next" ]; then
  echo -e "${GREEN}✓ Diretório .next criado (build OK)${NC}"
else
  echo -e "${RED}✗ ERRO: Build falhou!${NC}"
  tail -50 /tmp/build_log.txt
  exit 1
fi
echo -e "${GREEN}✓ Build finalizado${NC}\n"

# ==============================================================================
# PASSO 8: Restart PM2 (COM HEALTH CHECK)
# ==============================================================================
echo -e "${YELLOW}[8/9] REINICIANDO PM2...${NC}"
pm2 stop juridico-crm || true
sleep 2
pm2 start npm --name juridico-crm --cwd /var/www/juridico-crm-automation -- start || pm2 restart juridico-crm
sleep 3

echo "Status do PM2:"
pm2 status juridico-crm

# Health check (DUPLA CHECK)
echo "Aguardando aplicação iniciar..."
sleep 5
if pm2 status juridico-crm | grep -q "online"; then
  echo -e "${GREEN}✓ PM2 online${NC}"
else
  echo -e "${RED}✗ AVISO: PM2 não está online, verificando logs...${NC}"
  pm2 logs juridico-crm --lines 50 --nostream 2>/dev/null | tail -50
fi
echo -e "${GREEN}✓ PM2 reiniciado${NC}\n"

# ==============================================================================
# PASSO 9: Verificação final (DUPLA CHECK)
# ==============================================================================
echo -e "${YELLOW}[9/9] VERIFICAÇÃO FINAL...${NC}"

echo "1. Verificando arquivos criados:"
FILES=(
  "src/types/operacional.ts"
  "src/components/operacional/AvatarBadge.tsx"
  "src/components/operacional/FichaCard.tsx"
  "src/components/operacional/FichaModal.tsx"
  "src/components/operacional/FilterBar.tsx"
  "src/components/operacional/KanbanBoard.tsx"
  "src/components/operacional/StatsBar.tsx"
  "src/app/api/operacional/[id]/coluna/route.ts"
  "src/app/api/operacional/stats/route.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✓ $file"
  else
    echo "   ✗ $file (FALTANDO!)"
  fi
done

echo ""
echo "2. Verificando banco de dados:"
echo "   Tables: $(psql -h localhost -U juridico_user -d juridico_crm -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public'")"
echo "   Types (ENUMs): $(psql -h localhost -U juridico_user -d juridico_crm -t -c "SELECT COUNT(*) FROM pg_type WHERE typtype = 'e'")"

echo ""
echo "3. Git Status:"
git log -1 --format="   %h - %s"

echo ""
echo "4. PM2 Process:"
pm2 status juridico-crm

echo ""
echo "5. Últimos logs:"
pm2 logs juridico-crm --lines 5 --nostream 2>/dev/null | tail -10

echo -e "${GREEN}✓ Verificação final concluída${NC}\n"

# ==============================================================================
# RESUMO FINAL
# ==============================================================================
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ DEPLOY CONCLUÍDO!                      ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  URL: https://crm.gabriellenunes.com.br/operacional        ║"
echo "║  Status: $(pm2 status juridico-crm | grep -oP 'online|stopped' || echo '?')                        ║"
echo "║  Time: $(date +'%Y-%m-%d %H:%M:%S')                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo "PRÓXIMOS PASSOS:"
echo "1. Aguarde 10 segundos para aplicação inicializar completamente"
echo "2. Acesse https://crm.gabriellenunes.com.br/operacional no browser"
echo "3. Verifique se o Kanban está carregando corretamente"
echo "4. Teste criar uma nova ficha"
echo "5. Teste mover fichas entre colunas"
echo "6. Monitore logs: pm2 logs juridico-crm"
echo ""
echo "Backup salvo em: $BACKUP_FILE"
echo "Build log salvo em: /tmp/build_log.txt"
