/**
 * SCRIPT DE IMPORTAÇÃO DE FECHAMENTOS
 *
 * USE ASSIM:
 * 1. Abra DevTools (F12) → Console
 * 2. Cole este arquivo inteiro no console
 * 3. Ele perguntará onde colar o conteúdo do TSV
 * 4. Pronto! Os 176 contratos estarão em Fechamentos
 */

(function importarFechamentos() {
  console.log("🚀 IMPORTADOR DE FECHAMENTOS");
  console.log("============================");
  console.log("");
  console.log("📋 Instruções:");
  console.log("1. Abra o arquivo: Previsibilidade_Contratos.xlsx - Contratos.tsv");
  console.log("2. Selecione TUDO (Ctrl+A)");
  console.log("3. Copie (Ctrl+C)");
  console.log("4. Cole o conteúdo aqui:");
  console.log("");

  // Prompt para usuário colar dados
  const tsvContent = prompt(
    "Cole o conteúdo do arquivo TSV aqui:\n\n(Ctrl+A no editor → Ctrl+C → Ctrl+V aqui)",
    ""
  );

  if (!tsvContent || tsvContent.trim().length === 0) {
    console.error("❌ Nenhum dado foi colado. Operação cancelada.");
    return;
  }

  try {
    // ===== PARSER TSV =====
    function parseTSVFechamentos(conteudo) {
      const linhas = conteudo
        .split("\n")
        .filter((linha) => linha.trim());
      if (linhas.length < 2) throw new Error("Arquivo vazio ou sem dados");

      const dados = [];
      let erros = 0;

      for (let i = 1; i < linhas.length; i++) {
        try {
          const partes = linhas[i].split("\t").map((p) => p.trim());
          if (partes.length < 8) continue;

          const [numero, cliente, beneficio, origem, data, valorUnitStr, certezaStr] = partes;

          // Validar cliente
          if (!cliente || cliente.length === 0) continue;

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
        } catch (err) {
          erros++;
          continue;
        }
      }

      console.log(`📊 Parse: ${dados.length} registros lidos${erros > 0 ? ` (${erros} erros ignorados)` : ""}`);
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

    // ===== MAPEAMENTOS =====
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

    // ===== TRANSFORMAR =====
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

    // ===== EXECUTAR =====
    console.log("");
    console.log("⏳ Processando...");

    // Parse
    const crus = parseTSVFechamentos(tsvContent);
    if (crus.length === 0) {
      console.error("❌ Nenhum dado válido encontrado no arquivo");
      return;
    }

    // Transformar
    const fechamentos = crus.map(transformarParaFechamento);
    console.log(`🔄 Transformação: ${fechamentos.length} fechamentos criados`);

    // Carregar existentes
    const existentes = JSON.parse(localStorage.getItem("previsibilidade_fechamentos") || "[]");
    console.log(`📦 Existentes: ${existentes.length} fechamentos no localStorage`);

    // Detectar duplicatas
    const chavesDuplicatas = new Set(
      existentes.map((f) => `${f.cliente}|${f.data}|${f.produto}`)
    );

    const novos = fechamentos.filter(
      (f) => !chavesDuplicatas.has(`${f.cliente}|${f.data}|${f.produto}`)
    );

    // Mesclar
    const todosOsFechamentos = [...existentes, ...novos];

    // Salvar
    localStorage.setItem("previsibilidade_fechamentos", JSON.stringify(todosOsFechamentos));

    console.log("");
    console.log("✅ IMPORTAÇÃO CONCLUÍDA!");
    console.log("========================");
    console.log(`📌 Novos: ${novos.length}`);
    console.log(`📦 Total: ${todosOsFechamentos.length}`);
    console.log("");
    console.log("🎯 Próximos passos:");
    console.log("1. Recarregue a página (F5)");
    console.log("2. Vá para: Previsibilidade → Fechamentos");
    console.log("3. Verifique os contratos importados");
    console.log("");

    // Estatísticas
    const porCanal = {
      "Meta Ads": 0,
      "Orgânico": 0,
    };
    const porBeneficio = {};

    novos.forEach((f) => {
      porCanal[f.canal]++;
      porBeneficio[f.produto] = (porBeneficio[f.produto] || 0) + 1;
    });

    console.log("📊 Estatísticas:");
    console.log(
      `   • Meta Ads: ${porCanal["Meta Ads"]} contratos 🔵`
    );
    console.log(
      `   • Orgânico: ${porCanal["Orgânico"]} contratos 🟠`
    );
    console.log("");
    console.log("🏆 Por Benefício:");
    Object.entries(porBeneficio)
      .sort((a, b) => b[1] - a[1])
      .forEach(([beneficio, count]) => {
        console.log(`   • ${beneficio}: ${count}`);
      });

    console.log("");
    console.log("✨ Pronto! Recarregue a página para ver as mudanças.");
  } catch (erro) {
    console.error("❌ ERRO NA IMPORTAÇÃO:");
    console.error(erro.message);
    console.error("");
    console.error("Detalhes:");
    console.error(erro);
  }
})();
