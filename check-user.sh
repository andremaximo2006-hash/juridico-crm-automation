#!/bin/bash

# Script para verificar/resetar usuário no PostgreSQL
# Uso: ./check-user.sh <email> [nova-senha]

EMAIL="${1:-andre.maximo@gabriellenunes.com.br}"
NEW_PASSWORD="${2}"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "════════════════════════════════════════════════════════════════"
echo "🔍 Verificando usuário: $EMAIL"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Verificar se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ DATABASE_URL não definida${NC}"
  echo "Configure no .env:"
  echo "  DATABASE_URL=postgresql://user:password@localhost:5432/database"
  exit 1
fi

# Verificar usuário
echo -e "${YELLOW}1. Verificando se usuário existe...${NC}"
psql "$DATABASE_URL" -c "SELECT id, name, email, \"isActive\" FROM users WHERE email = '$EMAIL';" 2>/dev/null

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Usuário encontrado${NC}"
else
  echo -e "${RED}❌ Erro ao conectar ao banco de dados${NC}"
  exit 1
fi

# Se password foi fornecida, resetar
if [ ! -z "$NEW_PASSWORD" ]; then
  echo ""
  echo -e "${YELLOW}2. Resetando senha...${NC}"

  # Gerar hash bcrypt (usando Node.js)
  HASHED=$(node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('$NEW_PASSWORD', 10))" 2>/dev/null)

  if [ -z "$HASHED" ]; then
    echo -e "${RED}❌ Erro ao gerar hash da senha${NC}"
    exit 1
  fi

  # Atualizar no banco
  psql "$DATABASE_URL" -c "UPDATE users SET password = '$HASHED' WHERE email = '$EMAIL';" 2>/dev/null

  echo -e "${GREEN}✅ Senha resetada com sucesso!${NC}"
  echo ""
  echo "🔐 Novas credenciais:"
  echo "  Email: $EMAIL"
  echo "  Senha: $NEW_PASSWORD"
  echo ""
  echo -e "${YELLOW}⚠️  Aviso:${NC}"
  echo "  • Compartilhe com segurança"
  echo "  • Peça ao usuário trocar na primeira vez"
else
  echo ""
  echo "Para resetar a senha, use:"
  echo "  ./check-user.sh \"$EMAIL\" \"nova-senha\""
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
