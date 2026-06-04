# 🚀 Deploy Manual — VPS 2.25.128.221

Como o acesso SSH automático não funciona, siga este guia para fazer o deploy manualmente.

---

## 📋 Pré-requisitos

- Acesso SSH à VPS: `root@2.25.128.221`
- Senha SSH configurada
- `git`, `npm`, `Node.js 18+` instalado na VPS
- PM2 instalado: `npm install -g pm2`

---

## 🔧 Procedimento de Deploy

### Passo 1: Conectar à VPS via SSH

```bash
ssh root@2.25.128.221
```

Você será solicitado a confirmar a chave do host. Digite `yes`.

Insira a senha quando pedido.

### Passo 2: Navegar até o diretório da aplicação

```bash
cd /var/www/juridico-crm-automation
```

### Passo 3: Fazer pull da última versão

```bash
git pull origin main
```

Se houver conflitos, execute:
```bash
git reset --hard origin/main
```

### Passo 4: Instalar dependências

```bash
npm install --production
```

Isso pode levar 2-3 minutos.

### Passo 5: Compilar a aplicação

```bash
npm run build
```

Isso pode levar 1-2 minutos. Verifique se termina sem erros.

### Passo 6: Parar e reiniciar a aplicação

```bash
# Parar
pm2 stop juridico-crm

# Aguardar 2 segundos
sleep 2

# Reiniciar
pm2 restart juridico-crm

# Salvar configuração
pm2 save
```

### Passo 7: Verificar status

```bash
# Ver status
pm2 status

# Ver logs (últimas 20 linhas)
pm2 logs juridico-crm --lines 20

# Sair dos logs: Ctrl+C
```

Procure por mensagens de erro ou "Ready on".

### Passo 8: Testar

```bash
# Teste de health
curl http://localhost:3000/api/health

# Sair da VPS
exit
```

---

## ✅ Validação Pós-Deploy

Após o deploy:

1. **Acesse a aplicação:**
   - https://crm.gabriellenunes.com.br/login

2. **Faça login com suas credenciais**

3. **Vá para Previsibilidade:**
   - Menu → Gerencial → Previsibilidade

4. **Clique em Fechamentos**

5. **Clique em 📥 Importar**

6. **Confirme a importação dos 176 contratos**

---

## 🆘 Solução de Problemas

### Erro: "npm: command not found"

A VPS não tem Node.js instalado. Execute:

```bash
# Instalar Node.js
curl -sL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verificar
node -v
npm -v
```

### Erro: "pm2: command not found"

```bash
npm install -g pm2
pm2 startup
pm2 save
```

### Erro: "git: command not found"

```bash
apt-get install -y git
```

### Erro de permissão ao fazer deploy

```bash
# Dar permissões ao diretório
chown -R root:root /var/www/juridico-crm-automation
chmod -R 755 /var/www/juridico-crm-automation
```

### Aplicação não inicia após deploy

1. Verificar logs:
   ```bash
   pm2 logs juridico-crm --lines 50
   ```

2. Verificar banco de dados:
   ```bash
   psql -U juridico_user -d juridico_crm -c "SELECT COUNT(*) FROM previsibilidade_fechamentos;"
   ```

3. Verificar porta 3000:
   ```bash
   netstat -tlnp | grep 3000
   lsof -i :3000
   ```

4. Se nada funcionar, restaurar backup:
   ```bash
   rm -rf /var/www/juridico-crm-automation
   mv /var/www/juridico-crm-automation-old /var/www/juridico-crm-automation
   pm2 restart juridico-crm
   ```

---

## 📊 Comandos Úteis de Manutenção

```bash
# Ver logs em tempo real
pm2 logs juridico-crm

# Ver logs histórico
tail -f /home/root/.pm2/logs/juridico-crm-out.log

# Reiniciar aplicação
pm2 restart juridico-crm

# Parar aplicação
pm2 stop juridico-crm

# Iniciar aplicação
pm2 start juridico-crm

# Deletar do PM2
pm2 delete juridico-crm

# Verificar espaço em disco
df -h

# Ver uso de memória
free -h

# Conectar ao banco de dados
psql -U juridico_user -d juridico_crm

# Contar registros
SELECT COUNT(*) as total_fechamentos FROM previsibilidade_fechamentos;

# Ver últimos 5 contratos
SELECT data, cliente, honorarios FROM previsibilidade_fechamentos ORDER BY created_at DESC LIMIT 5;
```

---

## 🔄 Rollback (Reverter para versão anterior)

Se algo der errado:

```bash
# Parar aplicação
pm2 stop juridico-crm

# Ir para diretório anterior
cd /var/www
rm -rf juridico-crm-automation
mv juridico-crm-automation-old juridico-crm-automation

# Reinstalar e reiniciar
cd juridico-crm-automation
npm install --production
npm run build
pm2 restart juridico-crm
```

---

## 📝 Checklist de Deploy

- [ ] SSH conecta sem erro
- [ ] `git pull` executa sem conflitos
- [ ] `npm install` completa sem erros
- [ ] `npm run build` completa sem erros
- [ ] `pm2 restart` inicia sem erro
- [ ] `curl http://localhost:3000` responde
- [ ] Logs não mostram erro ECONNREFUSED
- [ ] Aplicação acessível em https://crm.gabriellenunes.com.br
- [ ] Login funciona
- [ ] Menu de Previsibilidade aparece
- [ ] Botão 📥 Importar está visível
- [ ] Importação de 176 contratos funciona

---

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs: `pm2 logs juridico-crm --lines 50`
2. Verifique se o banco está ativo: `psql -U juridico_user -d juridico_crm`
3. Verifique se há espaço em disco: `df -h`
4. Verifique conectividade: `curl -I https://crm.gabriellenunes.com.br`

---

**Status:** Deploy pronto para execução manual ✅

Executar este guia para fazer o deploy na VPS.
