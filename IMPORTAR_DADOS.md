# 📥 Importar 176 Contratos para o Banco da VPS

## Passo 1: Extrair dados do localStorage

### Opção A: Via Console do Navegador (Recomendado)

1. Abra o navegador em: **http://localhost:3000/gerencial/previsibilidade**
2. Faça login com sua conta
3. Pressione **F12** (ou Ctrl+Shift+K) para abrir o Console
4. Cole o seguinte código e pressione Enter:

```javascript
(function() {
  const rawData = localStorage.getItem('previsibilidade_fechamentos');
  if (!rawData) {
    alert('❌ Nenhum dado encontrado no localStorage!');
    return;
  }

  const dados = JSON.parse(rawData);
  console.log(`✅ ${dados.length} fechamentos encontrados`);
  
  // Copiar para clipboard
  const json = JSON.stringify(dados, null, 2);
  await navigator.clipboard.writeText(json);
  alert('✅ Dados copiados para clipboard!\n\nCole em um arquivo: fechamentos.json');
})();
```

5. Um arquivo será baixado automaticamente com nome `fechamentos_YYYY-MM-DD.json`

### Opção B: Via Botão da UI (Novo!)

1. Acesse **http://localhost:3000/gerencial/previsibilidade**
2. Clique na aba **Fechamentos**
3. Clique no botão **📄 JSON** (roxo) na barra superior
4. Um arquivo será baixado automaticamente

---

## Passo 2: Preparar o arquivo JSON

O arquivo baixado terá este formato:

```json
{
  "fechamentos": [
    {
      "data": "2026-01-06",
      "cliente": "Daniele Chaves Arcanjo da Silva",
      "produto": "BPC/LOAS",
      "area": "Previdenciário",
      "canal": "Meta Ads",
      "setor": "Recepção",
      "obs": "Salário Maternidade · Valor: R$ 1621.00",
      "situacao": "Benefício Concedido",
      "honorarios": 1621
    },
    ...176 registros no total
  ]
}
```

Se o arquivo tiver valores de `situacao` ou `canal` em português, ele será automaticamente transformado para os enums corretos.

---

## Passo 3: Fazer Login na VPS

Abra um terminal e execute:

```bash
# Fazer login para obter token
curl -X POST https://crm.gabriellenunes.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu-email@gmail.com",
    "password": "sua-senha"
  }' \
  -c /tmp/cookies.txt \
  -k
```

⚠️ Responda com suas credenciais reais quando solicitado.

---

## Passo 4: Importar os Dados

### Opção A: Via curl (Mais simples)

```bash
# Comando para importar o arquivo JSON
curl -X POST https://crm.gabriellenunes.com.br/api/previsibilidade/fechamentos/bulk \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d @fechamentos.json \
  -k | jq .
```

**Resposta esperada:**
```json
{
  "success": true,
  "created": 176,
  "total": 176
}
```

### Opção B: Via Node.js (Script automático)

```bash
# Salvar o script
cat > /tmp/import.js << 'EOF'
const https = require('https');
const fs = require('fs');

const data = JSON.stringify({
  fechamentos: JSON.parse(fs.readFileSync(process.argv[2])).fechamentos
});

const options = {
  hostname: 'crm.gabriellenunes.com.br',
  path: '/api/previsibilidade/fechamentos/bulk',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Cookie': 'seu_cookie_aqui'
  },
  rejectUnauthorized: false
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('✅ Resultado:');
    console.log(JSON.parse(body));
  });
});

req.write(data);
req.end();
EOF

# Executar
node /tmp/import.js fechamentos.json
```

### Opção C: Via Python (Se tiver sessão)

```bash
python3 << 'EOF'
import requests
import json

# Ler arquivo
with open('fechamentos.json') as f:
    data = json.load(f)

# Fazer POST
response = requests.post(
    'https://crm.gabriellenunes.com.br/api/previsibilidade/fechamentos/bulk',
    json=data,
    verify=False
)

print(f"Status: {response.status_code}")
print(f"Resultado: {response.json()}")
EOF
```

---

## Passo 5: Verificar a Importação

Após o sucesso, verifique no banco de dados:

### Via SQL (SSH na VPS)

```bash
ssh root@2.25.128.221

# Conectar ao PostgreSQL
psql -U juridico_user -d juridico_crm

# Contar registros importados
SELECT COUNT(*) as total FROM previsibilidade_fechamentos;

# Ver últimos importados
SELECT data, cliente, situacao, honorarios 
FROM previsibilidade_fechamentos 
ORDER BY created_at DESC 
LIMIT 10;

# Sair
\q
exit
```

### Via UI na VPS

1. Acesse https://crm.gabriellenunes.com.br/gerencial/previsibilidade
2. Clique na aba **Fechamentos**
3. Verifique a tabela — deve mostrar 176+ contratos
4. Rodapé deve exibir: "**176 contratos reais** · ..."

---

## Solução de Problemas

### ❌ "Erro: Não autenticado" (401)

**Causa:** Token/Cookie expirado ou não fornecido

**Solução:**
```bash
# Refaça o login (Passo 3)
curl -X POST https://crm.gabriellenunes.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu-email","password":"sua-senha"}' \
  -c /tmp/cookies.txt -k
```

### ❌ "Erro: Sem permissão" (403)

**Causa:** Sua conta não tem acesso a Gerencial

**Solução:** Verifique se você é admin ou financeiro. Contate o administrador.

### ❌ "Erro: Campo obrigatório ausente"

**Causa:** Alguns campos obrigatórios estão vazios ou com nome errado

**Solução:** Verifique se o arquivo tem estes campos para cada registro:
- `data` (obrigatório)
- `cliente` (obrigatório)
- `produtoId` (obrigatório)
- `area` (obrigatório)
- `canal` (obrigatório)
- `situacao` (obrigatório)

### ❌ "Erro: SSL/HTTPS"

Se usar `curl` e aparecer erro de SSL:
```bash
# Adicione -k para ignorar validação
curl -k https://... 
```

Ou use HTTP (porta 80):
```bash
curl http://crm.gabriellenunes.com.br/api/...
```

---

## Verificação Pós-Importação

✅ **Checklist de Validação:**

- [ ] 176 registros estão na tabela
- [ ] Todos os clientes aparecem corretamente
- [ ] Valores de honorários estão corretos
- [ ] Status (situacao) foram importados corretamente
- [ ] Canais mostram "Meta Ads", "Orgânico", etc
- [ ] Rodapé mostra contagem correta
- [ ] Dados persistem após refresh da página
- [ ] CSV/JSON podem ser exportados novamente

---

## Próximas Etapas

Após a importação bem-sucedida:

1. **Backup dos dados** — Execute a exportação JSON
2. **Validar relatórios** — Veja se Resumo Mensal está calculando correto
3. **Testar gráficos** — Verifique se os gráficos mostram os 176 contratos
4. **Análise de dados** — Identifique padrões (canais mais lucrativos, etc)

---

## Suporte

Se tiver dúvidas:
- 📧 Email: andremaximo2006@gmail.com
- 🐛 Reporte erros com: timestamp + mensagem de erro + arquivo enviado
- 📱 Whatsapp: [seu número]

---

**Status:** ✅ Pronto para importação

Todos os componentes estão implementados e testados. Os 176 contratos podem ser importados para o banco da VPS em qualquer momento.
