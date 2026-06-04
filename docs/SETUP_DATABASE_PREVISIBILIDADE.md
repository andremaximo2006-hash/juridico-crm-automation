# 🗄️ CONFIGURAR BANCO DE DADOS PARA PREVISIBILIDADE

Para que a **persistência em banco de dados** funcione, você precisa:

## 1️⃣ ESCOLHER UM PROVEDOR DE BANCO DE DADOS

### **Opção A: Supabase (Recomendado - PostgreSQL gratuito)**

1. Crie uma conta em https://supabase.com
2. Crie um novo projeto
3. Vá para **Settings → Database**
4. Copie a **Connection String** (URI)
5. Atualize o `.env`:

```
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[SEU-ID].supabase.co:5432/postgres"
```

**Exemplo real:**
```
DATABASE_URL="postgresql://postgres:MyPassword123@db.xyzabc123.supabase.co:5432/postgres"
```

---

### **Opção B: RDS AWS (Produção)**

Se usar AWS RDS PostgreSQL:

```
DATABASE_URL="postgresql://admin:password@seu-db.xxxxxx.rds.amazonaws.com:5432/juridico"
```

---

### **Opção C: PostgreSQL Local (Desenvolvimento)**

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/juridico"
```

---

## 2️⃣ ATUALIZAR `.env` NA MÁQUINA LOCAL

Edite `/Users/andreluis/juridico-crm-automation/.env`:

```env
# Seu DATABASE_URL aqui
DATABASE_URL="postgresql://postgres:SUA-SENHA@seu-servidor:5432/seu-db"
```

---

## 3️⃣ EXECUTAR MIGRAÇÃO LOCAL

```bash
# Terminal no projeto local
npx prisma migrate dev --name add_previsibilidade_tables

# Ou se quiser apenas gerar as tabelas sem fazer commit
npx prisma migrate deploy
```

---

## 4️⃣ VERIFICAR SE CRIOU AS TABELAS

```bash
npx prisma studio
```

Você deve ver as tabelas:
- ✅ `previsibilidade_produtos`
- ✅ `previsibilidade_canais_pago`
- ✅ `previsibilidade_fechamentos`

---

## 5️⃣ ATUALIZAR `.env` NA VPS

SSH para a VPS:

```bash
sshpass -p '@Advprev@2026' ssh root@2.25.128.221
```

Edite `/var/www/juridico-crm/.env`:

```bash
nano /var/www/juridico-crm/.env
```

Atualize a `DATABASE_URL` com a mesma string:

```
DATABASE_URL="postgresql://postgres:SUA-SENHA@seu-servidor:5432/seu-db"
```

Salve (Ctrl+O, Enter, Ctrl+X).

---

## 6️⃣ EXECUTAR MIGRAÇÃO NA VPS

```bash
cd /var/www/juridico-crm
npx prisma migrate deploy
```

Você deve ver:

```
✓ Migração executada com sucesso
✓ Banco de dados atualizado
```

---

## 7️⃣ REINICIAR A APLICAÇÃO

```bash
pkill -9 node
sleep 2
npm run start &
```

Verifique se está rodando:

```bash
lsof -i :3000
```

---

## ✅ TESTAR AS APIS

### **Importar 176 fechamentos via API:**

```bash
curl -X POST http://localhost:3000/api/previsibilidade/fechamentos/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "fechamentos": [
      {
        "data": "2026-01-06",
        "cliente": "Daniele Chaves",
        "produtoId": "produto-1",
        "area": "previdenciario",
        "canal": "metaAds",
        "situacao": "beneficioConcedido",
        "honorarios": 1621
      }
    ]
  }'
```

---

## 📋 CHECKLIST ANTES DO DEPLOY

- [ ] Supabase/RDS/PostgreSQL criado e acessível
- [ ] `DATABASE_URL` atualizada no `.env` local
- [ ] Migração executada localmente (`npx prisma migrate dev`)
- [ ] `DATABASE_URL` atualizada no `.env` da VPS
- [ ] Migração executada na VPS (`npx prisma migrate deploy`)
- [ ] Aplicação reiniciada na VPS
- [ ] APIs testadas (GET, POST, DELETE)
- [ ] Dados dos 176 fechamentos importados

---

## 🚀 PRÓXIMAS AÇÕES

1. Configure o banco de dados (escolha uma opção acima)
2. Atualize os `.env` files
3. Execute as migrações
4. Reinicie a aplicação
5. Teste as APIs
6. Refatore o componente Fechamentos para usar API em vez de localStorage

---

**Precisa de ajuda?** Deixe uma mensagem e informarei os próximos passos!
