/**
 * Utilitário para importar dados de Fechamentos a partir de arquivo TSV/CSV
 * Exemplo: Previsibilidade_Contratos.xlsx exportado como TSV
 *
 * Uso:
 * const dados = await parseArquivoFechamentos(arquivo);
 * importarFechamentosParaLocalStorage(dados);
 */

interface FechamentoRaw {
  numero: string;
  cliente: string;
  beneficio: string;
  origem: string;
  data: string;
  valorUnit: number;
  certeza: number;
  valorPrevisto: number;
}

interface Fechamento {
  id: string;
  data: string;
  cliente: string;
  produto: string;
  area: string;
  canal: string;
  setor: string;
  obs: string;
  situacao: string;
  honorarios: number;
}

// Mapeamento de Benefício → Produto Jurídico
const MAPA_BENEFICIO_PRODUTO: Record<string, string> = {
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

// Mapear benefício para área jurídica
const MAPA_BENEFICIO_AREA: Record<string, string> = {
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

// Mapear certeza % para situação
const MAPA_CERTEZA_SITUACAO = (certeza: number): string => {
  if (certeza === 100) return "Benefício Concedido";
  if (certeza === 0) return "Benefício Negado";
  if (certeza >= 80) return "Em Andamento";
  if (certeza >= 50) return "Em Andamento";
  return "Sem Viabilidade";
};

/**
 * Parse TSV/CSV com header na primeira linha
 * Esperado: # | Cliente | Benefício | Origem | Data | Valor Unit (R$) | Certeza % | Valor Previsto (R$)
 */
export function parseTSVFechamentos(conteudo: string): FechamentoRaw[] {
  const linhas = conteudo.split("\n").filter((linha) => linha.trim());

  if (linhas.length < 2) {
    throw new Error("Arquivo vazio ou sem dados");
  }

  // Header: # | Cliente | Benefício | Origem | Data | Valor Unit (R$) | Certeza % | Valor Previsto (R$)
  const dados: FechamentoRaw[] = [];

  // Pular primeira linha (header) e processar dados
  for (let i = 1; i < linhas.length; i++) {
    const partes = linhas[i].split("\t").map((p) => p.trim());

    // Validar formato
    if (partes.length < 8) continue;

    const [numero, cliente, beneficio, origem, data, valorUnitStr, certezaStr] =
      partes;

    // Parsear valores
    const valorUnit = parseFloat(valorUnitStr.replace("R$", "").replace(",", "."))
      || 0;
    const certeza = parseInt(certezaStr.replace("%", "").trim()) || 0;

    // Valor previsto é valorUnit quando certeza 100%
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

/**
 * Converter data format DD/MM/YYYY → YYYY-MM-DD
 */
function converterDataBR(dataBR: string): string {
  try {
    const [dia, mes, ano] = dataBR.split("/");
    return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

/**
 * Transformar FechamentoRaw em Fechamento com ID
 */
export function transformarParaFechamento(raw: FechamentoRaw): Fechamento {
  // Gerar ID único
  const id = `fech_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const produto = MAPA_BENEFICIO_PRODUTO[raw.beneficio] || raw.beneficio;
  const area = MAPA_BENEFICIO_AREA[raw.beneficio] || "Cível";
  const canal = raw.origem === "Lead" ? "Meta Ads" : "Orgânico";
  const situacao = MAPA_CERTEZA_SITUACAO(raw.certeza);

  return {
    id,
    data: raw.data,
    cliente: raw.cliente,
    produto,
    area,
    canal,
    setor: "Recepção", // Default
    obs: `${raw.beneficio} · Certeza: ${raw.certeza}% · Valor: R$ ${raw.valorUnit.toFixed(2)}`,
    situacao,
    honorarios: raw.valorPrevisto,
  };
}

/**
 * Importar todos os fechamentos para localStorage
 */
export function importarFechamentosParaLocalStorage(
  fechamentos: Fechamento[]
): void {
  // Puxar dados existentes
  const existentes = JSON.parse(
    localStorage.getItem("previsibilidade_fechamentos") || "[]"
  );

  // Mesclar com novos (evitando duplicatas por cliente+data+produto)
  const chavesDuplicatas = new Set(
    existentes.map((f: Fechamento) => `${f.cliente}|${f.data}|${f.produto}`)
  );

  const novos = fechamentos.filter(
    (f) => !chavesDuplicatas.has(`${f.cliente}|${f.data}|${f.produto}`)
  );

  const todosOsFechamentos = [...existentes, ...novos];

  // Salvar em localStorage
  localStorage.setItem(
    "previsibilidade_fechamentos",
    JSON.stringify(todosOsFechamentos)
  );

  console.log(`✅ Importados ${novos.length} fechamentos (${existentes.length} existentes)`);
}

/**
 * Wrapper completo: string TSV → localStorage
 */
export function importarTSVFechamentos(conteudoTSV: string): {
  total: number;
  importados: number;
  erro?: string;
} {
  try {
    // Parse TSV
    const crus = parseTSVFechamentos(conteudoTSV);
    console.log(`📊 Parse: ${crus.length} registros lidos`);

    // Transformar
    const fechamentos = crus.map(transformarParaFechamento);
    console.log(`🔄 Transformação: ${fechamentos.length} fechamentos criados`);

    // Importar
    importarFechamentosParaLocalStorage(fechamentos);

    return {
      total: fechamentos.length,
      importados: fechamentos.length,
    };
  } catch (erro) {
    console.error("❌ Erro na importação:", erro);
    return {
      total: 0,
      importados: 0,
      erro: String(erro),
    };
  }
}
