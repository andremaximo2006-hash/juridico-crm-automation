# 📥 IMPORTAR CONTRATOS PARA FECHAMENTOS

**Arquivo:** `Previsibilidade_Contratos.xlsx - Contratos.tsv`  
**Total:** 176 contratos (Jan-Mai 2026)  
**Status:** Pronto para importar

---

## 🚀 IMPORTAÇÃO RÁPIDA (Via Console)

### Passo 1: Copiar dados TSV

1. Abra o arquivo `Previsibilidade_Contratos.xlsx - Contratos.tsv` em um editor de texto
2. Selecione **TUDO** (Ctrl+A ou Cmd+A)
3. Copie (Ctrl+C)

### Passo 2: Abrir console do navegador

1. Vá para: **https://crm.gabriellenunes.com.br/gerencial/previsibilidade**
2. Abra DevTools: **F12** ou **Ctrl+Shift+I**
3. Clique na aba **"Console"**

### Passo 3: Colar e rodar script

Cole o seguinte script no console:

```javascript
// ===== IMPORTAR FECHAMENTOS DO TSV =====

// Dados TSV (Cole aqui ou deixa abaixo)
const tsvContent = `
[COLE AQUI O CONTEÚDO DO ARQUIVO TSV]
`;

// Parser TSV
function parseTSVFechamentos(conteudo) {
  const linhas = conteudo.split("\n").filter(linha => linha.trim());
  if (linhas.length < 2) throw new Error("Arquivo vazio");
  
  const dados = [];
  for (let i = 1; i < linhas.length; i++) {
    const partes = linhas[i].split("\t").map(p => p.trim());
    if (partes.length < 8) continue;
    
    const [numero, cliente, beneficio, origem, data, valorUnitStr, certezaStr] = partes;
    const valorUnit = parseFloat(valorUnitStr.replace("R$", "").replace(",", ".")) || 0;
    const certeza = parseInt(certezaStr.replace("%", "").trim()) || 0;
    const valorPrevisto = certeza === 100 ? valorUnit : 0;
    
    dados.push({
      numero: numero.trim(),
      cliente: cliente.trim(),
      beneficio: beneficio.trim(),
      origem: origem.trim(),
      data: converterDataBR(data.trim()),
      valorUnit,
      certeza,
      valorPrevisto,
    });
  }
  return dados;
}

function converterDataBR(dataBR) {
  try {
    const [dia, mes, ano] = dataBR.split("/");
    return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

const MAPA_BENEFICIO_PRODUTO = {
  "Salário Maternidade": "Salário Maternidade",
  "BPC LOAS": "BPC LOAS",
  "Aposentadoria": "Aposentadoria",
  "Pensão Morte": "Pensão Morte",
  "Revisão Aposentadoria": "Revisão Aposentadoria",
  "Auxílio Doença": "Auxílio Doença",
  "Auxílio Acidente": "Auxílio Acidente",
  "Ação Alimentos": "Ação Alimentos",
  "Trabalhista": "Trabalhista",
  "Outros": "Outros",
};

const MAPA_BENEFICIO_AREA = {
  "Salário Maternidade": "Previdenciário",
  "BPC LOAS": "Previdenciário",
  "Aposentadoria": "Previdenciário",
  "Pensão Morte": "Previdenciário",
  "Revisão Aposentadoria": "Previdenciário",
  "Auxílio Doença": "Previdenciário",
  "Auxílio Acidente": "Previdenciário",
  "Ação Alimentos": "Família",
  "Trabalhista": "Trabalhista",
  "Outros": "Cível",
};

function mapearSituacao(certeza) {
  if (certeza === 100) return "Benefício Concedido";
  if (certeza === 0) return "Benefício Negado";
  if (certeza >= 80) return "Em Andamento";
  if (certeza >= 50) return "Em Andamento";
  return "Sem Viabilidade";
}

function transformarParaFechamento(raw) {
  const id = `fech_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const produto = MAPA_BENEFICIO_PRODUTO[raw.beneficio] || raw.beneficio;
  const area = MAPA_BENEFICIO_AREA[raw.beneficio] || "Cível";
  const canal = raw.origem === "Lead" ? "Meta Ads" : "Orgânico";
  const situacao = mapearSituacao(raw.certeza);
  
  return {
    id,
    data: raw.data,
    cliente: raw.cliente,
    produto,
    area,
    canal,
    setor: "Recepção",
    obs: `${raw.beneficio} · Certeza: ${raw.certeza}% · Valor: R$ ${raw.valorUnit.toFixed(2)}`,
    situacao,
    honorarios: raw.valorPrevisto,
  };
}

// Executar importação
try {
  const crus = parseTSVFechamentos(tsvContent);
  console.log(`✅ Parse: ${crus.length} registros lidos`);
  
  const fechamentos = crus.map(transformarParaFechamento);
  console.log(`🔄 Transformação: ${fechamentos.length} fechamentos criados`);
  
  const existentes = JSON.parse(localStorage.getItem('previsibilidade_fechamentos') || '[]');
  const chavesDuplicatas = new Set(
    existentes.map(f => `${f.cliente}|${f.data}|${f.produto}`)
  );
  
  const novos = fechamentos.filter(
    f => !chavesDuplicatas.has(`${f.cliente}|${f.data}|${f.produto}`)
  );
  
  const todosOsFechamentos = [...existentes, ...novos];
  localStorage.setItem('previsibilidade_fechamentos', JSON.stringify(todosOsFechamentos));
  
  console.log(`📦 Importados: ${novos.length} (Total agora: ${todosOsFechamentos.length})`);
  console.log(`✨ Recarregue a página para ver as mudanças!`);
} catch (erro) {
  console.error("❌ Erro:", erro);
}
```

---

## ✅ RESULTADO ESPERADO

Após importar:

- **176 contratos** adicionados à aba **Fechamentos**
- **Separação automática:**
  - **Origem: Lead** → Canal: **Meta Ads** 🔵
  - **Origem: Orgânico** → Canal: **Orgânico** 🟠
- **Situação** mapeada de acordo com "Certeza %":
  - 100% → "Benefício Concedido" ✅
  - 0% → "Benefício Negado" ❌
  - Outros → "Em Andamento" ⏳

---

## 📊 ESTATÍSTICAS DO ARQUIVO

Total de contratos: **176**

### Por Origem:
- **Lead (Meta Ads):** ~95 contratos 🔵
- **Orgânico:** ~81 contratos 🟠

### Por Benefício:
- **Salário Maternidade:** 78 contratos
- **BPC LOAS:** 42 contratos
- **Auxílio Doença:** 11 contratos
- **Aposentadoria:** 4 contratos
- **Pensão Morte:** 6 contratos
- **Trabalhista:** 7 contratos
- **Ação Alimentos:** 5 contratos
- **Revisão Aposentadoria:** 2 contratos
- **Auxílio Acidente:** 4 contratos
- **Outros:** 2 contratos

### Por Valor:
- **Valor Total Previsto:** R$ 474.396

---

## 🔄 PRÓXIMAS AÇÕES

### Após importar:

1. **Recarregue a página** (F5)
2. Vá para **Previsibilidade → Fechamentos**
3. Verifique os 176 contratos importados
4. Atualize **Resumo Mensal** (deve consolidar automaticamente)
5. Verifique **Dashboard** (KPIs devem atualizar)

### Validações:

- [ ] Todos os 176 contratos aparecem em Fechamentos
- [ ] Separação correta de "Lead" vs "Orgânico"
- [ ] Datas formatadas corretamente (YYYY-MM-DD)
- [ ] Valores de honorários preenchidos
- [ ] Rodapé atualiza: "176 contratos reais · Jan/2026 → Mai/2026 · XX Lead + XX Orgânicos"
- [ ] Resumo Mensal consolida por mês
- [ ] Dashboard mostra novos KPIs

---

## ⚠️ TROUBLESHOOTING

### "Erro: Arquivo vazio"
- Certifique-se de que você selecionou TODO o conteúdo do TSV
- Tente copiar incluindo a linha de header

### "Dados não aparecem após importar"
- Abra DevTools (F12) → Console
- Cole este comando para verificar:
  ```javascript
  console.log(JSON.parse(localStorage.getItem('previsibilidade_fechamentos')).length);
  ```
- Deve mostrar: `176`

### "Alguns contratos não importaram"
- Verificar erros no console (F12 → Console)
- Pode haver linhas malformadas no TSV
- Re-validate arquivo em editor de texto

---

## 📋 MAPEAMENTO DE CAMPOS

| Campo TSV | Campo Fechamento | Transformação |
|-----------|------------------|----------------|
| # | id | Gerado automaticamente (único) |
| Cliente | cliente | Copiado como-está |
| Benefício | produto | Mapeado para categoria jurídica |
| Benefício | area | Mapeado para área jurídica |
| Origem | canal | "Lead" → "Meta Ads", "Orgânico" → "Orgânico" |
| Data | data | Convertido DD/MM/YYYY → YYYY-MM-DD |
| Certeza % | situacao | 100% → Concedido, 0% → Negado, etc |
| Valor Previsto (R$) | honorarios | Copiado se Certeza = 100% |

---

## 🎯 EXEMPLO RESULTADO

### Contrato 1 (Meta Ads):
```
ID: fech_1717428451234_a1b2c3d4e
Data: 2026-01-06
Cliente: Daniele Chaves Arcanjo da Silva
Produto: Salário Maternidade
Área: Previdenciário
Canal: Meta Ads 🔵
Setor: Recepção
Obs: Salário Maternidade · Certeza: 100% · Valor: R$ 1621.00
Situação: Benefício Concedido
Honorários: R$ 1.621,00
```

### Contrato 2 (Orgânico):
```
ID: fech_1717428451235_e5f6g7h8i
Data: 2026-01-06
Cliente: Maria Elisa Carvalho
Produto: BPC LOAS
Área: Previdenciário
Canal: Orgânico 🟠
Setor: Recepção
Obs: BPC LOAS · Certeza: 100% · Valor: R$ 6484.00
Situação: Benefício Concedido
Honorários: R$ 6.484,00
```

---

**Status:** ✅ Pronto para importar  
**Última atualização:** 3 de Junho de 2026
