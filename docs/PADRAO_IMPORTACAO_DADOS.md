# 📥 PADRÃO DE IMPORTAÇÃO DE DADOS

**Última atualização:** 3 de Junho de 2026

---

## 🎯 **RESUMO: FORMATOS SUPORTADOS**

Atualmente você pode importar dados em 3 formatos:

1. **CSV** (Comma-Separated Values) — ✅ Recomendado
2. **JSON** (JavaScript Object Notation) — ✅ Estruturado
3. **Excel/Google Sheets** — ✅ Mais fácil visualmente

---

## 📋 **FORMATO CSV — PADRÃO RECOMENDADO**

### **Estrutura Básica:**
```
canal,metaOrcamento,cpcMedio,convCliqueLead,cplMeta,retornoPercent,obs
Meta Ads,8000.00,2.50,0.08,180.00,0,"Facebook/Instagram · remarketing"
Google Ads,10000.00,6.00,0.12,200.00,0,"Search + Display"
TikTok Ads,4000.00,1.80,0.05,222.00,0,"Vídeo curto - público jovem"
LinkedIn Ads,5000.00,4.20,0.10,180.00,0,"B2B · Profissionais"
```

### **Separador:** Vírgula `,`
### **Encoding:** UTF-8
### **Quebra de linha:** LF (Unix) ou CRLF (Windows)

### **Exemplo completo (com mais canais):**

```csv
canal,metaOrcamento,cpcMedio,convCliqueLead,cplMeta,retornoPercent,obs
Meta Ads,8000.00,2.50,0.08,180.00,0,"Facebook/Instagram · remarketing"
Google Ads,10000.00,6.00,0.12,200.00,0,"Search + Display"
TikTok Ads,4000.00,1.80,0.05,222.00,0,"Vídeo curto - público jovem"
LinkedIn Ads,5000.00,4.20,0.10,180.00,0,"B2B · Profissionais"
Pinterest Ads,3000.00,1.50,0.06,250.00,0,"Visual · Mulheres 25-45"
YouTube Ads,6000.00,3.80,0.09,160.00,0,"Display · Vídeos"
```

---

## 📊 **FORMATO JSON — ESTRUTURADO**

### **Estrutura:**

```json
{
  "canaisPago": [
    {
      "canal": "Meta Ads",
      "metaOrcamento": 8000.00,
      "cpcMedio": 2.50,
      "convCliqueLead": 0.08,
      "cplMeta": 180.00,
      "retornoPercent": 0,
      "obs": "Facebook/Instagram · remarketing"
    },
    {
      "canal": "Google Ads",
      "metaOrcamento": 10000.00,
      "cpcMedio": 6.00,
      "convCliqueLead": 0.12,
      "cplMeta": 200.00,
      "retornoPercent": 0,
      "obs": "Search + Display"
    },
    {
      "canal": "TikTok Ads",
      "metaOrcamento": 4000.00,
      "cpcMedio": 1.80,
      "convCliqueLead": 0.05,
      "cplMeta": 222.00,
      "retornoPercent": 0,
      "obs": "Vídeo curto - público jovem"
    }
  ]
}
```

### **Validações JSON:**
- Cada número SEM aspas (ex: `8000.00` não `"8000.00"`)
- Cada string COM aspas (ex: `"Meta Ads"`)
- Decimais COM ponto (ex: `0.08` não `0,08`)
- Vírgulas entre objetos, NUNCA após o último

---

## 📑 **FORMATO EXCEL/GOOGLE SHEETS**

### **Cabeçalhos (Linha 1):**

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| canal | metaOrcamento | cpcMedio | convCliqueLead | cplMeta | retornoPercent | obs |

### **Dados (Linha 2 em diante):**

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Meta Ads | 8000.00 | 2.50 | 0.08 | 180.00 | 0 | Facebook/Instagram · remarketing |
| Google Ads | 10000.00 | 6.00 | 0.12 | 200.00 | 0 | Search + Display |
| TikTok Ads | 4000.00 | 1.80 | 0.05 | 222.00 | 0 | Vídeo curto - público jovem |
| LinkedIn Ads | 5000.00 | 4.20 | 0.10 | 180.00 | 0 | B2B · Profissionais |

### **Como exportar de Excel:**
1. Abra sua planilha
2. Menu: **Arquivo** → **Salvar como**
3. Formato: **CSV (Com separação por vírgula) (.csv)**
4. Salve o arquivo

### **Como exportar de Google Sheets:**
1. Abra sua planilha
2. Menu: **Arquivo** → **Baixar** → **Valores separados por vírgula (.csv)**
3. Arquivo baixado está pronto!

---

## 🔄 **MAPEAMENTO DE CAMPOS**

| Campo no Sistema | Campo no Import | Tipo | Obrigatório | Exemplo |
|---|---|---|---|---|
| `canal` | canal | String | ✅ Sim | Meta Ads |
| `metaOrcamento` | metaOrcamento | Number | ✅ Sim | 8000.00 |
| `cpcMedio` | cpcMedio | Number | ✅ Sim | 2.50 |
| `convCliqueLead` | convCliqueLead | Number (0-1) | ✅ Sim | 0.08 |
| `cplMeta` | cplMeta | Number | ✅ Sim | 180.00 |
| `retornoPercent` | retornoPercent | Number | ✅ Sim | 0 |
| `obs` | obs | String | ❌ Não | "Facebook/Instagram" |

---

## 📥 **COMO IMPORTAR DADOS**

### **Método 1: Via Interface (Futuro)**
```
Aba "Dados Importados"
└─ Clicar "Importar CSV/JSON"
   └─ Selecionar arquivo
   └─ Clicar "Importar"
   └─ Dados aparecem em Configurações
```

### **Método 2: Manual (Hoje)**
```
1. Copiar dados do arquivo (CSV/JSON)
2. Abrir Configurações → Seção B
3. Clicar "+ Adicionar Canal"
4. Preencher cada campo manualmente
5. Clicar "Adicionar"
```

### **Método 3: Colar em Massa (Excel)**
```
1. Abrir Excel/Google Sheets com seus dados
2. Manter mesmos cabeçalhos (canal, metaOrcamento, etc)
3. Copiar todas as linhas
4. Vir para a aplicação e adicionar manualmente
```

---

## 📤 **EXPORTAR DADOS ATUAIS**

### **Via Navegador (DevTools Console):**

```javascript
// 1. Copiar e colar no console (F12)
const canaisPago = JSON.parse(localStorage.getItem('previsibilidade_canais_pago')) || [];
console.log(JSON.stringify(canaisPago, null, 2));

// 2. Copiar a saída
// 3. Colar em um arquivo JSON e salvar como canais_backup.json
```

### **Exportar como CSV:**

```javascript
// No console:
const canaisPago = JSON.parse(localStorage.getItem('previsibilidade_canais_pago')) || [];
const csv = ['canal,metaOrcamento,cpcMedio,convCliqueLead,cplMeta,retornoPercent,obs'];
canaisPago.forEach(c => {
  csv.push(`${c.nome},${c.metaOrcamento},${c.cpcMedio},${c.convCliqueLead},${c.cplMeta},${c.retornoPercent},"${c.obs}"`);
});
console.log(csv.join('\n'));

// Copiar saída e salvar em arquivo .csv
```

---

## ✅ **VALIDAÇÕES OBRIGATÓRIAS**

Ao importar, o sistema valida:

### **❌ Erros que impedem importação:**

1. **Nome duplicado** — Canal "Meta Ads" já existe
2. **Campo obrigatório vazio** — Falta `canal`, `metaOrcamento`, etc
3. **Tipo de dados incorreto** — `metaOrcamento` precisa ser número, não texto
4. **Valor inválido** — `convCliqueLead` deve estar entre 0 e 1
5. **Número negativo** — `cpcMedio` não pode ser menor que 0

### **✅ Dados válidos:**

```csv
canal,metaOrcamento,cpcMedio,convCliqueLead,cplMeta,retornoPercent,obs
Meta Ads,8000.00,2.50,0.08,180.00,0,""
Google Ads,10000.00,6.00,0.12,200.00,0,"Search"
```

---

## 📋 **TEMPLATE PRONTO PARA COPIAR**

### **CSV Template:**

```
canal,metaOrcamento,cpcMedio,convCliqueLead,cplMeta,retornoPercent,obs
Meta Ads,8000.00,2.50,0.08,180.00,0,"Facebook/Instagram · remarketing"
Google Ads,10000.00,6.00,0.12,200.00,0,"Search + Display"
TikTok Ads,4000.00,1.80,0.05,222.00,0,"Vídeo curto - público jovem"
LinkedIn Ads,5000.00,4.20,0.10,180.00,0,"B2B · Profissionais"
Pinterest Ads,3000.00,1.50,0.06,250.00,0,"Visual · Mulheres"
YouTube Ads,6000.00,3.80,0.09,160.00,0,"Display · Vídeos"
Quora Ads,2500.00,2.00,0.07,285.00,0,"Q&A · Especialistas"
```

### **JSON Template:**

```json
{
  "canaisPago": [
    {
      "canal": "Meta Ads",
      "metaOrcamento": 8000.00,
      "cpcMedio": 2.50,
      "convCliqueLead": 0.08,
      "cplMeta": 180.00,
      "retornoPercent": 0,
      "obs": "Facebook/Instagram · remarketing"
    },
    {
      "canal": "Google Ads",
      "metaOrcamento": 10000.00,
      "cpcMedio": 6.00,
      "convCliqueLead": 0.12,
      "cplMeta": 200.00,
      "retornoPercent": 0,
      "obs": "Search + Display"
    },
    {
      "canal": "TikTok Ads",
      "metaOrcamento": 4000.00,
      "cpcMedio": 1.80,
      "convCliqueLead": 0.05,
      "cplMeta": 222.00,
      "retornoPercent": 0,
      "obs": "Vídeo curto - público jovem"
    }
  ]
}
```

---

## 🔄 **SINCRONIZAÇÃO COM OUTRAS ABAS**

Quando você importa canais em **Configurações → Seção B**, eles ficam disponíveis em:

```
Configurações (Seção B)
    ↓
Lançamentos (dropdown de canal ao criar campanha)
    ↓
Resumo Mensal (consolidação por canal)
    ↓
Dashboard (KPIs por canal)
```

---

## 💾 **BACKUP DE DADOS**

### **Exportar tudo via Console:**

```javascript
// Copiar e colar no F12 Console
const backup = {
  canaisPago: JSON.parse(localStorage.getItem('previsibilidade_canais_pago')) || [],
  lancamentos: JSON.parse(localStorage.getItem('previsibilidade_lancamentos')) || [],
  organicos: JSON.parse(localStorage.getItem('previsibilidade_organicos')) || [],
  fechamentos: JSON.parse(localStorage.getItem('previsibilidade_fechamentos')) || [],
  produtos: JSON.parse(localStorage.getItem('previsibilidade_produtos')) || [],
};
console.log(JSON.stringify(backup, null, 2));

// Salvar a saída em um arquivo backup.json
```

### **Restaurar de Backup:**

```javascript
// 1. Ter o arquivo backup.json
// 2. Copiar seu conteúdo
// 3. No console, executar:
const backup = {
  // Cole o JSON aqui
};

localStorage.setItem('previsibilidade_canais_pago', JSON.stringify(backup.canaisPago));
localStorage.setItem('previsibilidade_lancamentos', JSON.stringify(backup.lancamentos));
localStorage.setItem('previsibilidade_organicos', JSON.stringify(backup.organicos));
localStorage.setItem('previsibilidade_fechamentos', JSON.stringify(backup.fechamentos));
localStorage.setItem('previsibilidade_produtos', JSON.stringify(backup.produtos));

// Recarregar página (F5)
```

---

## 📞 **DÚVIDAS FREQUENTES**

### **P: Posso importar de forma automatizada?**
**R:** Sim, futuramente será implementada aba "Dados Importados" com suporte a drag-drop. Por enquanto é manual.

### **P: E se meus dados têm outro formato?**
**R:** Converta para um dos 3 formatos acima (CSV, JSON, Excel).

### **P: Preciso deletar os dados antigos antes de importar?**
**R:** Não, você adiciona novos canais sem deletar os antigos. Se quiser limpar, clique 🗑️ em cada um.

### **P: Os dados são sincronizados com servidor?**
**R:** Não, estão em localStorage (local do navegador). Use backup se quiser guardar.

### **P: Posso importar de um Google Sheet?**
**R:** Sim, exporte como CSV e siga o padrão CSV acima.

---

## 🎯 **RESUMO: PASSO A PASSO**

### **1. Preparar dados (escolha 1):**
- ✅ Criar arquivo CSV
- ✅ Criar arquivo JSON
- ✅ Usar Excel/Google Sheets

### **2. Formatar conforme padrão:**
- Canal (texto)
- Meta Orçamento (número)
- CPC Médio (número)
- Conv. Clique→Lead (decimal 0-1)
- CPL Meta (número)
- % Retorno (número)
- Observações (texto opcional)

### **3. Adicionar na aplicação:**
- Abrir **Configurações**
- Ir para **Seção B: Canais de Tráfego Pago**
- Clicar **+ Adicionar Canal**
- Preencher campos
- Clicar **Adicionar**

### **4. Verificar sincronização:**
- Abrir **Lançamentos** (canal disponível no dropdown)
- Abrir **Resumo Mensal** (consolida por canal)
- Abrir **Dashboard** (mostra KPIs por canal)

---

**Versão:** 1.0 FINAL  
**Data:** 3 de Junho de 2026
