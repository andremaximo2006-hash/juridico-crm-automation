# 📋 PADRÃO PARA IMPORTAÇÃO — CANAIS DE TRÁFEGO PAGO

**Localização:** Previsibilidade → Configurações → Seção B (Canais de Tráfego Pago)

---

## 📊 ESTRUTURA DA PLANILHA

Para importar dados de Canais de Tráfego Pago, use a seguinte estrutura:

### **Colunas Obrigatórias:**

| # | Coluna | Tipo | Exemplo | Descrição |
|---|--------|------|---------|-----------|
| 1 | **Canal** | Texto | Meta Ads | Meta Ads, Google Ads, TikTok Ads, LinkedIn Ads |
| 2 | **Meta Orçamento (R$)** | Número | 8000.00 | Orçamento mensal em reais |
| 3 | **CPC Médio (R$)** | Número | 2.50 | Custo por clique da plataforma |
| 4 | **Conv. Clique→Lead (%)** | Decimal | 0.08 | Taxa de conversão clique → lead (0-1) |
| 5 | **CPL Meta (R$)** | Número | 180.00 | Custo por lead máximo desejado |
| 6 | **% Retorno** | Número | 0 | Placeholder para futuro (deixar 0) |
| 7 | **Observações** | Texto | "Facebook/Instagram" | Contexto do canal |

---

## 📝 EXEMPLOS DE PREENCHIMENTO

### **Exemplo 1: Meta Ads**
```
Canal: Meta Ads
Meta Orçamento: 8000.00
CPC Médio: 2.50
Conv. Clique→Lead: 0.08
CPL Meta: 180.00
% Retorno: 0
Observações: Facebook/Instagram · remarketing
```

### **Exemplo 2: Google Ads**
```
Canal: Google Ads
Meta Orçamento: 10000.00
CPC Médio: 6.00
Conv. Clique→Lead: 0.12
CPL Meta: 200.00
% Retorno: 0
Observações: Search + Display
```

### **Exemplo 3: TikTok Ads**
```
Canal: TikTok Ads
Meta Orçamento: 4000.00
CPC Médio: 1.80
Conv. Clique→Lead: 0.05
CPL Meta: 222.00
% Retorno: 0
Observações: Vídeo curto - público jovem
```

---

## 🔢 COMO CALCULAR OS VALORES

### **CPC Médio (Custo Por Clique)**
```
CPC = Investimento Total / Total de Cliques

Exemplo:
- Investimento: R$ 8.000
- Cliques: 3.200
- CPC = 8.000 / 3.200 = R$ 2,50
```

### **Conv. Clique→Lead (%)**
```
Conversão = Total de Leads / Total de Cliques

Exemplo:
- Cliques: 3.200
- Leads: 256
- Conversão = 256 / 3.200 = 0,08 (8%)
```

### **CPL Meta (Custo Por Lead - MÁXIMO)**
```
CPL = Investimento / Total de Leads

Exemplo:
- Investimento: R$ 8.000
- Leads: ~45 (calculado como: 3.200 cliques × 0,08 conversão)
- CPL = 8.000 / 45 = R$ 177,78 ≈ R$ 180 (meta)
```

---

## 🔗 RELAÇÃO COM OUTRAS SEÇÕES

Ao adicionar um Canal na **Seção B**, ele será automaticamente disponível para uso em:

1. **Aba Lançamentos** (dropdown de canal ao criar campanha)
2. **Aba Fechamentos** (identificar origem do cliente)
3. **Resumo Mensal** (consolidação de investimento por canal)
4. **Dashboard** (KPIs por canal)

---

## 📥 COMO ADICIONAR/EDITAR/DELETAR CANAIS

### **Adicionar Novo Canal:**
1. Clique no botão **"+ Adicionar Canal"** (Seção B)
2. Preencha os 7 campos
3. Clique em **"Adicionar"**

### **Editar Canal Existente:**
1. Na tabela, clique no ícone **✏️ (Editar)** da linha
2. Modifique os valores
3. Clique em **"Atualizar"**

### **Deletar Canal:**
1. Na tabela, clique no ícone **🗑️ (Deletar)** da linha
2. Confirme a exclusão
3. O canal será removido (dados em Lançamentos permanecerão)

### **Duplicar Canal:**
1. Na tabela, clique no ícone **📋 (Duplicar)** da linha
2. Um novo canal igual será criado
3. Edite os valores conforme necessário

---

## 📊 PLANILHA EXCEL/GOOGLE SHEETS — TEMPLATE

```
┌─────────────┬───────────────────┬────────────────┬──────────────────────┬─────────────┬────────────┬─────────────────────────────┐
│ Canal       │ Meta Orçamento    │ CPC Médio      │ Conv. Clique→Lead   │ CPL Meta    │ % Retorno  │ Observações                 │
├─────────────┼───────────────────┼────────────────┼──────────────────────┼─────────────┼────────────┼─────────────────────────────┤
│ Meta Ads    │ 8000.00          │ 2.50           │ 0.08                 │ 180.00     │ 0          │ Facebook/Instagram          │
├─────────────┼───────────────────┼────────────────┼──────────────────────┼─────────────┼────────────┼─────────────────────────────┤
│ Google Ads  │ 10000.00         │ 6.00           │ 0.12                 │ 200.00     │ 0          │ Search + Display            │
├─────────────┼───────────────────┼────────────────┼──────────────────────┼─────────────┼────────────┼─────────────────────────────┤
│ TikTok Ads  │ 4000.00          │ 1.80           │ 0.05                 │ 222.00     │ 0          │ Vídeo curto - público jovem │
└─────────────┴───────────────────┴────────────────┴──────────────────────┴─────────────┴────────────┴─────────────────────────────┘
```

---

## 💾 PERSISTÊNCIA DE DADOS

- ✅ Todos os canais são salvos automaticamente em **localStorage**
- ✅ Dados persiste ao fechar/reabrir o navegador
- ✅ Não há necessidade de clicar "Salvar"

---

## ⚠️ VALIDAÇÕES

Ao adicionar/editar um canal, o sistema valida:

- ❌ **Nome duplicado** — Não pode haver 2 canais com mesmo nome
- ❌ **Valores negativos** — Meta Orçamento, CPC Médio, CPL Meta devem ser positivos
- ❌ **Conversão inválida** — Conv. Clique→Lead deve estar entre 0 e 1 (0-100%)

Se houver erro, mensagem aparecerá em **vermelho** no formulário.

---

## 🔄 FLUXO COMPLETO DE USO

```
1. Seção B: Configurações
   ↓
   [Adicionar Meta Ads, Google Ads, TikTok]
   
2. Aba Lançamentos
   ↓
   [Criar campanhas usando os canais]
   ↓
   [Preencher investimento, impressões, cliques, leads]
   
3. Resumo Mensal
   ↓
   [Ver consolidação por canal]
   ↓
   [Calcular ROAS, CPL, ROI]
   
4. Dashboard
   ↓
   [Ver KPIs executivos por canal]
```

---

## 📌 DADOS PADRÃO (PRÉ-CARREGADOS)

Se você deletar todos os canais e quiser restaurar os padrões, aqui estão:

```javascript
{
  nome: "Meta Ads",
  metaOrcamento: 8000,
  cpcMedio: 2.5,
  convCliqueLead: 0.08,
  cplMeta: 180,
  retornoPercent: 0,
  obs: "Facebook/Instagram · remarketing"
}

{
  nome: "Google Ads",
  metaOrcamento: 10000,
  cpcMedio: 6.0,
  convCliqueLead: 0.12,
  cplMeta: 200,
  retornoPercent: 0,
  obs: "Search + Display"
}

{
  nome: "TikTok Ads",
  metaOrcamento: 4000,
  cpcMedio: 1.8,
  convCliqueLead: 0.05,
  cplMeta: 222,
  retornoPercent: 0,
  obs: "Vídeo curto - público jovem"
}
```

---

## 🎯 DICAS PRÁTICAS

### ✅ Melhores Práticas:

1. **Atualize regularmente** — Revise os valores a cada mês
2. **Normalize CPL Meta** — Use um valor realista baseado em histórico
3. **Mantenha Observações** — Ajudam a lembrar contexto da campanha
4. **Não deixe em branco** — Todos os campos são importantes

### ❌ Erros Comuns:

1. **Deixar Conv. Clique→Lead muito alta** (ex: 0.5) — unrealista
2. **Orçamento zerado** — vai gerar cálculos incorretos
3. **CPL Meta muito baixo** — pode ser inatingível
4. **Nomes de canais diferentes** — use exatos (Meta Ads, não "Facebook")

---

## 📞 SUPORTE

Se tiver dúvidas sobre valores:

- **CPC Médio**: Extraia do Gerenciador de Anúncios da plataforma
- **Conversão Clique→Lead**: Analise histórico de campanhas
- **CPL Meta**: Defina baseado em rentabilidade (faturamento esperado / custo)
- **Observações**: Use para documentar regras/contexto

---

**Última atualização:** 3 de Junho de 2026  
**Versão:** 1.0 FINAL
