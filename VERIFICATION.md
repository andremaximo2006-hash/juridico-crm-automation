# ✅ Verificação Pós-Deploy - CRM Jurídico

Use este checklist após fazer o deploy para confirmar que tudo está funcionando.

---

## 1. Verificação do Servidor

```bash
# Via SSH no servidor:
pm2 status
# Esperado: juridico-crm online e uptime > 0

pm2 logs juridico-crm | tail -20
# Esperado: "Ready on http://localhost:3000" e sem erros

curl http://localhost:3000/login
# Esperado: HTML da página de login (não JSON error)
```

---

## 2. Verificação no Navegador

### 2.1 Acesso à página de login

- [ ] Abra: https://crm.gabriellenunes.com.br/login
- [ ] Esperado: Página de login carrega normalmente
- [ ] Abra DevTools (F12) → Console
- [ ] Esperado: Sem erros de ChunkLoadError

### 2.2 Teste de Login

- [ ] Email: `andre.maximo@gabriellenunes.com.br`
- [ ] Senha: `Teste@123` (ou sua senha)
- [ ] Clique "Entrar"
- [ ] Esperado: Redirecionamento para Dashboard (sem erro de conexão)

### 2.3 Teste de Navegação

- [ ] Dashboard (`/`) - Deve carregar com cards e estatísticas
- [ ] Leads (`/leads`) - Deve exibir kanban
- [ ] Clientes (`/clientes`) - Deve listar clientes
- [ ] Financeiro (`/financeiro`) - Deve exibir tabela
- [ ] IA → Roteiros (`/ia/roteiros`) - Deve listar roteiros
- [ ] IA → Conversas (`/ia/conversas`) - Deve listar conversas
- [ ] IA → Atendimento Humano (`/ia/atendimento-humano`) - Deve listar tickets

### 2.4 Teste de Features

- [ ] Dark Mode: Clique no ícone de lua no canto superior direito
- [ ] Atalho Ctrl+K: Pressione e veja o modal de busca
- [ ] Atalho Ctrl+N: Pressione para novo lead/cliente

---

## 3. Performance

```bash
# No navegador, DevTools → Network
# Verifique tempos de carregamento:
- [ ] Login page: < 2s
- [ ] Dashboard: < 3s
- [ ] Leads/Clientes: < 3s
```

---

## 4. Console (DevTools)

Abra F12 → Console e verifique:

```
✓ Sem erros vermelhos
✓ Sem warnings sobre chunks faltando
✓ Sem CORS errors
✓ Mensagens de inicialização normais
```

---

## 5. Testes Específicos

### Database
```bash
# Verifique conexão com PostgreSQL
curl https://crm.gabriellenunes.com.br/api/users -H "Authorization: Bearer {TOKEN}"
# Esperado: JSON com usuários ou 401 (não error 500)
```

### WhatsApp Integration
```bash
# Verifique se roteiros estão carregando
curl https://crm.gabriellenunes.com.br/api/whatsapp/routines
# Esperado: JSON array com roteiros
```

### Asaas Integration
```bash
# (Requer API Key configurada no .env)
# Verifique se está integrado
# Acesse: /financeiro
# Esperado: Aba "Integrações" visível
```

---

## 6. Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| ChunkLoadError ainda aparece | Limpe cache do navegador (Ctrl+Shift+Delete) e recarregue |
| Erro de conexão ao fazer login | Verifique DATABASE_URL e PostgreSQL |
| Página em branco | Verifique `pm2 logs juridico-crm` |
| 404 em rotas | Verifique se build completou: `npm run build` |
| Timeout | Aumente timeout do nginx ou database |

---

## 7. Checklist Final

- [ ] Página de login carrega sem erros
- [ ] Login bem-sucedido com credenciais válidas
- [ ] Dashboard renderizado
- [ ] Todos os módulos acessíveis
- [ ] Dark mode funciona
- [ ] Atalhos de teclado funcionam
- [ ] Console do navegador limpo
- [ ] pm2 status mostra "online"

---

## ✅ Status: PRONTO PARA USAR

Se todos os itens acima passarem, o deploy foi bem-sucedido!

---

## 📞 Se algo não funcionar

1. **Verifique logs:**
   ```bash
   pm2 logs juridico-crm --lines 50
   ```

2. **Reinicie a aplicação:**
   ```bash
   pm2 restart juridico-crm
   ```

3. **Consulte DEPLOYMENT-GUIDE.md** para troubleshooting avançado

4. **Verifique .env:**
   ```bash
   cat /var/www/juridico-crm-automation/.env
   # DATABASE_URL deve estar configurada
   # NEXT_PUBLIC_API_BASE_URL deve ser https://crm.gabriellenunes.com.br
   ```

---

**Última atualização:** 03/06/2026  
**Válido para:** Next.js 16.2.6 + PostgreSQL + PM2
