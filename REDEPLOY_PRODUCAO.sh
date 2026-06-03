#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🚀 REDEPLOY AUTOMÁTICO — Atualizando Páginas IA em Produção   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

VPS_IP="2.25.128.221"
PROJECT_DIR="/opt/juridico-crm-automation"

echo "📍 Conectando à VPS: $VPS_IP"
echo ""

ssh root@$VPS_IP << 'EOSSH'
  echo "✅ Conectado à VPS"
  echo ""
  
  cd /opt/juridico-crm-automation
  echo "📂 Entrando em: $PWD"
  echo ""
  
  echo "📥 Fazendo git pull..."
  git pull origin main
  echo "✅ Git pull completo"
  echo ""
  
  echo "📦 Rebuilding Next.js (isto pode levar 1-2 minutos)..."
  npm run build
  echo "✅ Build completo"
  echo ""
  
  echo "🔄 Restarting PM2..."
  pm2 restart juridico-crm-app
  echo "✅ Restart completo"
  echo ""
  
  echo "⏳ Aguardando aplicação subir (10 segundos)..."
  sleep 10
  echo "✅ Pronto!"
  echo ""
  
  echo "🧪 Testando health check..."
  RESPONSE=$(curl -s https://crm.gabriellenunes.com.br/api/health)
  
  if echo "$RESPONSE" | grep -q "healthy"; then
    echo "✅ API online e respondendo!"
  else
    echo "⚠️ Verificar status com: pm2 logs juridico-crm-app"
  fi
  
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo "✅ REDEPLOY CONCLUÍDO!"
  echo "═══════════════════════════════════════════════════════════════"
  echo ""
  echo "🌐 Acesse as novas páginas em:"
  echo "   • Roteiros:         https://crm.gabriellenunes.com.br/ia/roteiros"
  echo "   • Conversas:        https://crm.gabriellenunes.com.br/ia/conversas"
  echo "   • Atendimento:      https://crm.gabriellenunes.com.br/ia/atendimento-humano"
  echo ""
EOSSH

echo "✅ Redeploy automático finalizado!"
