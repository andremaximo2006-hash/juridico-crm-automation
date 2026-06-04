# 📥 📤 Funcionalidades de Importação e Exportação — Fechamentos

## Resumo

Adicionadas três novas funcionalidades ao componente **FechamentosTab** para gerenciar dados de contratos:

1. **📥 Importar** — Migra contratos do localStorage do navegador para o banco de dados via API
2. **📊 CSV** — Exporta tabela de contratos em formato CSV para backup
3. **📄 JSON** — Exporta tabela de contratos em formato JSON com timestamp

---

## 1. Importação do localStorage

### Fluxo

```
Browser localStorage
    ↓ (JSON parse)
Dados brutos (arrays)
    ↓ (transformação de enums)
Formato correto da API
    ↓ (POST /bulk)
Banco de dados PostgreSQL
    ↓ (fetch GET)
Tabela React atualizada
```

### Transformação de Dados

A função `handleImportFromLocalStorage` converte automaticamente:

| Campo localStorage | Transformação | Campo API |
|---|---|---|
| `area: "Previdenciário"` | `.toLowerCase()` | `area: "previdenciario"` |
| `canal: "Meta Ads"` | Verifica substring | `canal: "metaAds"` |
| `canal: "Orgânico"` | Verifica substring | `canal: "organico"` |
| `situacao: "Benefício Concedido"` | `.toLowerCase().replace(/ /g, "")` | `situacao: "beneficioConcedido"` |
| `honorarios: 0` | `parseFloat()` | `honorarios: 0` |

### Exemplo de Uso

1. Usuário clica em **📥 Importar**
2. Sistema lê `localStorage.getItem("previsibilidade_fechamentos")`
3. Transforma dados para enums corretos
4. POST para `/api/previsibilidade/fechamentos/bulk` com payload:

```json
{
  "fechamentos": [
    {
      "data": "2026-01-06",
      "cliente": "Daniele Chaves Arcanjo da Silva",
      "produtoId": "prod-1",
      "area": "previdenciario",
      "canal": "metaAds",
      "setor": "Recepção",
      "obs": "Salário Maternidade · Valor: R$ 1621.00",
      "situacao": "beneficioConcedido",
      "honorarios": 1621
    }
  ]
}
```

4. API retorna: `{ success: true, created: 176, total: 176 }`
5. Tabela é recarregada com GET `/api/previsibilidade/fechamentos`
6. Alert mostra: ✅ 176 contratos importados com sucesso!

---

## 2. Exportação para CSV

### Formato

Arquivo baixado como `fechamentos_YYYY-MM-DD.csv`:

```csv
"Data","Cliente","Produto","Área","Canal","Setor","Status","Honorários"
"2026-01-06","Daniele Chaves Arcanjo da Silva","BPC/LOAS","previdenciario","metaAds","Recepção","beneficioConcedido","1621"
"2026-01-07","Maria Silva","Aposentadoria","previdenciario","organico","Triagem","emAndamento","3000"
```

### Características

- Escapamento de valores com aspas duplas (`"`)
- Colunas separadas por vírgulas
- Timestamp no nome do arquivo (YYYY-MM-DD)
- Compatível com Excel, Google Sheets, etc.

---

## 3. Exportação para JSON

### Formato

Arquivo baixado como `fechamentos_YYYY-MM-DD.json`:

```json
{
  "fechamentos": [
    {
      "id": "uuid-123",
      "data": "2026-01-06",
      "cliente": "Daniele Chaves Arcanjo da Silva",
      "produto": "BPC/LOAS",
      "area": "previdenciario",
      "canal": "metaAds",
      "setor": "Recepção",
      "obs": "Salário Maternidade",
      "situacao": "beneficioConcedido",
      "honorarios": 1621
    }
  ],
  "exportedAt": "2026-06-04T01:30:00.000Z"
}
```

### Características

- Metadata com timestamp de exportação
- Preserva IDs originais do banco de dados
- Easily reimportable (formato nativo do banco)
- Pretty-printed com indentação (2 espaços)

---

## Modificações de Código

### Arquivo: `src/components/previsibilidade/tabs/FechamentosTab.tsx`

#### Novas Funções Adicionadas

1. **`handleImportFromLocalStorage()`** (linhas 104-150)
   - Lê dados do localStorage
   - Transforma formato dos enums
   - Chama API bulk
   - Recarrega tabela

2. **`handleExportCSV()`** (linhas 152-179)
   - Coleta dados da tabela
   - Formata como CSV
   - Cria blob e download

3. **`handleExportJSON()`** (linhas 181-196)
   - Coleta dados da tabela
   - Adiciona timestamp
   - Cria blob e download

#### UI: Botões Adicionados (linhas 240-261)

```tsx
<button onClick={handleImportFromLocalStorage} className="... bg-green-600 ...">
  📥 Importar
</button>

<button onClick={handleExportCSV} className="... bg-orange-600 ...">
  📊 CSV
</button>

<button onClick={handleExportJSON} className="... bg-purple-600 ...">
  📄 JSON
</button>
```

---

## API Endpoints

### POST `/api/previsibilidade/fechamentos/bulk`

**Importa múltiplos contratos em uma única requisição**

**Request:**
```json
{
  "fechamentos": [
    {
      "data": "2026-01-06",
      "cliente": "string",
      "produtoId": "string",
      "area": "previdenciario|trabalhista|familia|civil|outro",
      "canal": "metaAds|googleAds|tiktokAds|linkedinAds|organico|outro",
      "setor": "string|null",
      "obs": "string|null",
      "situacao": "beneficioConcedido|beneficioNegado|emAndamento|semViabilidade",
      "honorarios": "number|null"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "created": 176,
  "total": 176
}
```

**Características:**
- Usa `createMany()` do Prisma para performance
- `skipDuplicates: true` (não falha se houver duplicados)
- Retorna número de registros criados e total processado
- Casting de tipos para enums (via `as any`)

---

## Validações e Tratamento de Erro

### Importação

```typescript
// Validação 1: localStorage vazio
if (!localData) alert("Nenhum dado encontrado no localStorage");

// Validação 2: Array inválido ou vazio
if (!Array.isArray(dados) || dados.length === 0) 
  alert("localStorage vazio ou formato inválido");

// Validação 3: API error
if (!res.ok) throw new Error("Erro ao importar");

// Tratamento: mostra mensagem amigável
alert("❌ Erro na importação: " + error.message);
```

### Exportação

```typescript
// Validação: tabela vazia
if (fechamentos.length === 0) alert("Nenhum dado para exportar");
```

---

## Status do Desenvolvimento

✅ **Funcionalidades implementadas:**
- [x] Botões de ação na UI
- [x] Função de importação do localStorage
- [x] Função de exportação CSV
- [x] Função de exportação JSON
- [x] API bulk endpoint
- [x] Transformação de enums automática
- [x] Compilação TypeScript sem erros
- [x] Next.js 16 compatibility

⏳ **Próximas etapas:**
- [ ] Testar importação com 176 contratos reais na VPS
- [ ] Implementar feedback visual durante importação (loading spinner)
- [ ] Adicionar opção de importação de CSV/XLSX (não apenas localStorage)
- [ ] Implementar histórico de importações
- [ ] Adicionar validação de duplicatas antes de importar

---

## Commits

1. **`0357422`** — Adicionar funcionalidades de import/export para Fechamentos
2. **`70ac904`** — Corrigir tipos de parâmetros de rota e imports de Prisma no Next.js 16

---

## Teste Manual

### Pré-requisitos

1. Dados no localStorage:
```javascript
// No console do navegador
localStorage.setItem("previsibilidade_fechamentos", JSON.stringify([
  {
    "data": "2026-01-06",
    "cliente": "Teste Cliente",
    "produto": "BPC/LOAS",
    "area": "Previdenciário",
    "canal": "Meta Ads",
    "setor": "Recepção",
    "obs": "Teste",
    "situacao": "Benefício Concedido",
    "honorarios": 1621
  }
]))
```

2. Navegue para `/gerencial/previsibilidade`
3. Clique em aba **Fechamentos**
4. Clique em **📥 Importar**
5. Confirme o alert de sucesso
6. Tabela deve atualizar com o novo contrato

### Teste de Exportação

1. Clique em **📊 CSV** ou **📄 JSON**
2. Arquivo é baixado
3. Verifique conteúdo no editor de texto ou Excel

---

## Notas de Segurança

⚠️ **Importante para produção:**

- [ ] API `/bulk` deve ser protegida por autenticação
- [ ] Validar `Content-Type: application/json`
- [ ] Limitar tamanho do payload (max 10MB)
- [ ] Adicionar rate limiting (máx 10 imports/dia por user)
- [ ] Logar cada importação para auditoria
- [ ] Validar campos obrigatórios (cliente, data, produtoId)

---

## Deploy para VPS

```bash
# Local
git push origin main

# VPS (2.25.128.221)
ssh root@2.25.128.221
cd /var/www/juridico-crm-automation
git pull origin main
npm install
npm run build
npm run start
```

Acessar: `https://crm.gabriellenunes.com.br/gerencial/previsibilidade`
