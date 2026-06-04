# 📥 Como Extrair os 176 Contratos do localStorage

## Opção 1: Extrair via Console do Navegador (Recomendado)

### Passo 1: Abrir o localStorage
1. Abra o navegador em: **http://localhost:3000/gerencial/previsibilidade**
2. Faça login
3. Pressione **F12** para abrir o Developer Tools
4. Clique na aba **Console**

### Passo 2: Cole este script

```javascript
(function() {
  // Obter dados do localStorage
  const rawData = localStorage.getItem('previsibilidade_fechamentos');
  
  if (!rawData) {
    console.error('❌ Nenhum dado encontrado no localStorage');
    return;
  }

  const dados = JSON.parse(rawData);
  console.log(`✅ ${dados.length} fechamentos encontrados`);

  // Transformar para formato correto
  const transformed = {
    fechamentos: dados.map(d => ({
      data: d.data,
      cliente: d.cliente,
      produtoId: d.produtoId || 'prod-1',
      area: d.area?.toLowerCase() || 'previdenciario',
      canal: d.canal?.includes('Meta') ? 'metaAds' 
           : d.canal?.includes('Orgânico') ? 'organico' 
           : d.canal?.toLowerCase() || 'metaAds',
      setor: d.setor || 'Recepção',
      obs: d.obs || '',
      situacao: d.situacao?.toLowerCase().replace(/ /g, '') || 'emAndamento',
      honorarios: d.honorarios ? parseFloat(String(d.honorarios)) : 0
    }))
  };

  // Download automático
  const json = JSON.stringify(transformed, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fechamentos_${new Date().toISOString().split('T')[0]}.json`;
  a.click();

  console.log(`✅ Arquivo baixado: ${a.download}`);
  console.log(`   Próximo passo: Enviará para a VPS`);

  URL.revokeObjectURL(url);
})();
```

### Passo 3: Um arquivo será baixado
- Nome: `fechamentos_YYYY-MM-DD.json`
- Contém seus 176 contratos transformados para o formato correto

---

## Opção 2: Usar Botão 📄 JSON da Aplicação

1. Acesse: **http://localhost:3000/gerencial/previsibilidade**
2. Clique na aba: **Fechamentos**
3. Clique no botão: **📄 JSON** (roxo)
4. Um arquivo será baixado automaticamente

---

## Opção 3: Extrair via Curl (Se tiver acesso SSH local)

```bash
# Conectar ao banco e exportar
psql -U juridico_user -d juridico_crm \
  -c "SELECT row_to_json(t) FROM (SELECT * FROM previsibilidade_fechamentos) t" \
  > fechamentos.json
```

---

## Próximo Passo: Importar para a VPS

Uma vez que você tenha o arquivo JSON, há duas formas:

### Forma 1: Via API (Recomendado)

```bash
# Com o arquivo em mãos, faça POST para a VPS
curl -X POST https://crm.gabriellenunes.com.br/api/previsibilidade/fechamentos/bulk \
  -H "Content-Type: application/json" \
  -d @fechamentos_YYYY-MM-DD.json
```

### Forma 2: Via Script na VPS

```bash
# Copiar arquivo para VPS
scp fechamentos_YYYY-MM-DD.json root@2.25.128.221:/var/www/juridico-crm-automation/

# Na VPS, executar script
ssh root@2.25.128.221
cd /var/www/juridico-crm-automation
bash import_auto.sh fechamentos_YYYY-MM-DD.json
```

---

## Validação

Após importação, verificar:

```bash
# Via SQL
psql -U juridico_user -d juridico_crm
SELECT COUNT(*) FROM previsibilidade_fechamentos;

# Via API
curl https://crm.gabriellenunes.com.br/api/previsibilidade/fechamentos | jq length

# Via UI
Acessar https://crm.gabriellenunes.com.br/gerencial/previsibilidade
Verificar tabela de Fechamentos
```

---

## Troubleshooting

**Erro: "Nenhum dado encontrado no localStorage"**
- localStorage pode estar vazio
- Você não fez login
- Dados foram limpos do navegador
- Solução: Reabra a aplicação e tente novamente

**Erro: "Arquivo não encontrado"**
- Verifique se o arquivo foi realmente baixado
- Verifique o nome exato do arquivo
- Coloque o arquivo na pasta correta

**Erro: "POST 401 Unauthorized"**
- Você não está autenticado
- Solução: Faça login antes de fazer o POST

---

## Support

Se tiver dúvidas, verifique:
1. Os dados estão em localStorage?
2. O arquivo JSON foi criado?
3. O arquivo tem o formato correto?
4. Você tem autenticação ativa?

