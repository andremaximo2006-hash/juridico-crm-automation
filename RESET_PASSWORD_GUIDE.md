# Guia de Reset de Senha - CRM Jurídico

## Situação Atual

O login estava retornando erro **"Credenciais inválidas"** porque as senhas dos usuários no banco de dados estão incorretas ou corrompidas.

## Solução Implementada

Foi criado um endpoint administrativo `/api/admin/reset-password` que permite resetar senhas com uma chave secreta.

### Passo 1: Fazer Deploy na VPS

Execute na VPS (servidor):

```bash
cd /var/www/juridico-crm-automation

# Atualizar código
git pull origin main

# Reconstruir aplicação
npm run build

# Reiniciar PM2
pm2 restart all

# Confirmar que está rodando
pm2 status
```

### Passo 2: Resetar a Senha via API

Depois que o deploy terminar, execute um dos comandos abaixo para resetar a senha:

#### Opção A: Com curl (terminal)

```bash
curl -X POST https://crm.gabriellenunes.com.br/api/admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "adminKey": "reset-2026-juridico",
    "email": "andre.maximo@gabriellenunes.com.br",
    "newPassword": "Teste@123"
  }'
```

#### Opção B: Com JavaScript/Node.js

```javascript
const response = await fetch('https://crm.gabriellenunes.com.br/api/admin/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminKey: 'reset-2026-juridico',
    email: 'andre.maximo@gabriellenunes.com.br',
    newPassword: 'Teste@123'
  })
});

const data = await response.json();
console.log(data);
```

### Passo 3: Testar o Login

Após o reset bem-sucedido:

1. Acesse: https://crm.gabriellenunes.com.br/login
2. Email: `andre.maximo@gabriellenunes.com.br`
3. Senha: `Teste@123`
4. Clique em "Entrar"

## Mudanças Implementadas

### Novos Arquivos

- `src/app/api/admin/reset-password/route.ts` - Endpoint de reset de senha

### Arquivos Modificados

- `src/middleware.ts` - Adicionado `/api/admin/reset-password` à lista de rotas públicas

### Detalhes Técnicos

O endpoint:
- ✅ Requer uma chave secreta (`adminKey: "reset-2026-juridico"`)
- ✅ Reseta a senha com hash bcrypt
- ✅ Automaticamente ativa usuários inativos
- ✅ Valida força da senha (mínimo 8 caracteres)
- ✅ Retorna 404 se usuário não existir
- ✅ Retorna 403 se chave estiver incorreta

## Segurança

⚠️ **IMPORTANTE**: Depois de resetar todas as senhas, você deve:

1. Mudar a chave secreta no arquivo `.env` na VPS:
   ```
   ADMIN_RESET_KEY="nova-chave-secreta-aleatoria"
   ```

2. Reconstruir a aplicação:
   ```bash
   npm run build && pm2 restart all
   ```

Isso previne que outros executem resets de senha sem autorização.

## Próximas Etapas

Após login bem-sucedido:

1. Acesse o módulo de **Configurações** (⚙️ ícone)
2. Altere a senha para uma mais segura
3. Configure novos usuários conforme necessário

## Troubleshooting

### Erro: "Chave de acesso inválida"

A `adminKey` está incorreta. Use: `reset-2026-juridico`

### Erro: "Usuário não encontrado"

O email não existe no banco. Crie o usuário primeiro ou verifique o email correto.

### Erro: "Erro ao resetar senha"

Pode ser problema de conexão com banco de dados. Verifique se:
- PostgreSQL está rodando: `psql -U juridico_user -d juridico_crm -h localhost`
- Aplicação está online: `pm2 status`
- Build foi bem-sucedido: `npm run build`

---

**Data de criação**: 04/06/2026
**Status**: Pronto para deployment
