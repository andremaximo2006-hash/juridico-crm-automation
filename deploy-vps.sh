#!/bin/bash

# 🚀 Script de Deploy para VPS - WhatsApp IA SDR MVP
# Executa tudo direto na VPS: migration, seed, build, restart

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Dados da VPS
VPS_IP="2.25.128.221"
VPS_USER="root"
VPS_PORT="22"
PROJECT_DIR="/root/juridico-crm-automation"

echo -e "${BLUE}🚀 DEPLOY VPS - WhatsApp IA SDR MVP${NC}"
echo -e "${YELLOW}Alvo: $VPS_IP${NC}"
echo ""

# ============================================================
# PASSO 1: Pull do Git
# ============================================================
echo -e "${BLUE}📥 PASSO 1: Git Pull${NC}"
ssh -p $VPS_PORT $VPS_USER@$VPS_IP << 'EOF'
cd /root/juridico-crm-automation
git pull origin main
echo "✅ Git pull completo"
EOF

echo ""

# ============================================================
# PASSO 2: Install Dependencies
# ============================================================
echo -e "${BLUE}📦 PASSO 2: Install Dependencies${NC}"
ssh -p $VPS_PORT $VPS_USER@$VPS_IP << 'EOF'
cd /root/juridico-crm-automation
npm install --legacy-peer-deps
echo "✅ Dependências instaladas"
EOF

echo ""

# ============================================================
# PASSO 3: Prisma Migration
# ============================================================
echo -e "${BLUE}🗄️  PASSO 3: Prisma Migration${NC}"
ssh -p $VPS_PORT $VPS_USER@$VPS_IP << 'EOF'
cd /root/juridico-crm-automation
npx prisma migrate deploy
echo "✅ Migration executada"
EOF

echo ""

# ============================================================
# PASSO 4: Prisma Seed
# ============================================================
echo -e "${BLUE}🌱 PASSO 4: Seed de Templates${NC}"
ssh -p $VPS_PORT $VPS_USER@$VPS_IP << 'EOF'
cd /root/juridico-crm-automation

# Criar seed.ts se não existir
if [ ! -f prisma/seed.ts ]; then
cat > prisma/seed.ts << 'SEED'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Template 1: SDR Previdenciário
  const roteiro1 = await prisma.whatsAppRoteiro.create({
    data: {
      name: "Previdenciário",
      description: "Qualifica leads de previdência",
      is_active: true,
      steps: {
        create: [
          {
            order: 1,
            pergunta: "Qual é o seu nome completo?",
            tipo: "text",
            is_required: true,
            proximo_step: 2
          },
          {
            order: 2,
            pergunta: "Qual sua situação? (aposentadoria/pensão/BPC/outro)",
            tipo: "text",
            is_required: true,
            proximo_step: 3
          },
          {
            order: 3,
            pergunta: "Há quanto tempo está nessa situação?",
            tipo: "text",
            is_required: true,
            proximo_step: 4
          },
          {
            order: 4,
            pergunta: "Qual seu CPF? (formato: 000.000.000-00)",
            tipo: "text",
            is_required: true,
            regex: "^[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}$"
          }
        ]
      }
    }
  });

  // Template 2: SDR Família
  const roteiro2 = await prisma.whatsAppRoteiro.create({
    data: {
      name: "Família",
      description: "Qualifica leads de direito de família",
      is_active: true,
      steps: {
        create: [
          {
            order: 1,
            pergunta: "Qual é o seu nome?",
            tipo: "text",
            is_required: true,
            proximo_step: 2
          },
          {
            order: 2,
            pergunta: "Qual sua situação? (divórcio/guarda/pensão/herança)",
            tipo: "text",
            is_required: true,
            proximo_step: 3
          },
          {
            order: 3,
            pergunta: "Tem filhos menores envolvidos?",
            tipo: "text",
            is_required: true,
            proximo_step: 4
          },
          {
            order: 4,
            pergunta: "Qual seu CPF?",
            tipo: "text",
            is_required: true
          }
        ]
      }
    }
  });

  console.log("✅ Seed completo!");
  console.log(\`   - Roteiro 1: \${roteiro1.name} (ID: \${roteiro1.id})\`);
  console.log(\`   - Roteiro 2: \${roteiro2.name} (ID: \${roteiro2.id})\`);
}

main()
  .catch(e => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
SEED
fi

npx ts-node prisma/seed.ts
echo "✅ Seed executado"
EOF

echo ""

# ============================================================
# PASSO 5: Build
# ============================================================
echo -e "${BLUE}🏗️  PASSO 5: Build Next.js${NC}"
ssh -p $VPS_PORT $VPS_USER@$VPS_IP << 'EOF'
cd /root/juridico-crm-automation
npm run build
echo "✅ Build completo"
EOF

echo ""

# ============================================================
# PASSO 6: Restart PM2
# ============================================================
echo -e "${BLUE}🔄 PASSO 6: Restart PM2${NC}"
ssh -p $VPS_PORT $VPS_USER@$VPS_IP << 'EOF'
pm2 restart juridico-crm
pm2 save
echo "✅ PM2 reiniciado"
EOF

echo ""

# ============================================================
# PASSO 7: Verificar Status
# ============================================================
echo -e "${BLUE}🏥 PASSO 7: Status${NC}"
ssh -p $VPS_PORT $VPS_USER@$VPS_IP << 'EOF'
pm2 list | grep juridico-crm
echo ""
echo "Últimas linhas do log:"
tail -5 ~/.pm2/logs/juridico-crm-out.log 2>/dev/null || echo "(logs ainda não criados)"
EOF

echo ""
echo -e "${GREEN}✅ DEPLOY COMPLETO!${NC}"
echo -e "${YELLOW}URL: https://crm.gabriellenunes.com.br${NC}"
echo ""
