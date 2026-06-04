"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Edit2, Trash2, Copy, Loader, ChevronDown, ChevronRight, X } from "lucide-react";
import { ConfirmacaoDeleteDialog } from "../dialogs/ConfirmacaoDeleteDialog";

interface Fechamento {
  id: string;
  data: string;
  cliente: string;
  produto: string;
  area: string;
  canal: string;
  setor?: string | null;
  obs?: string | null;
  situacao: string;
  honorarios?: number | null;
}

const AREAS = ["Previdenciário", "Trabalhista", "Família", "Cível", "Outro"];
const CANAIS = ["metaAds", "googleAds", "organico", "tiktokAds", "outro"];
const SETORES = ["Triagem", "Iniciais", "Recepção", "Relacionamento"];
const SITUACOES = [
  "beneficioConcedido",
  "beneficioNegado",
  "emAndamento",
  "semViabilidade",
];

// Função para formatar valor monetário em formato brasileiro
const formatarMoeda = (valor: number | null | undefined): string => {
  if (!valor && valor !== 0) return "—";
  const numValue = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(numValue)) return "—";
  return `R$ ${numValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Função para formatar data (remove timestamp)
const formatarData = (data: string): string => {
  if (!data) return "—";
  return data.split('T')[0]; // Remove timestamp
};

interface Filtros {
  cliente: string;
  situacao: string;
  canal: string;
  dataInicio: string;
  dataFim: string;
}

interface YearMonthData {
  year: number;
  months: {
    month: number;
    monthName: string;
    contratos: Fechamento[];
    total: number;
    totalHonorarios: number;
  }[];
}

export function FechamentosTab() {
  const [fechamentos, setFechamentos] = useState<Fechamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string }>({
    open: false,
    id: "",
  });

  // Estados de expansão
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Estados de filtro
  const [filtros, setFiltros] = useState<Filtros>({
    cliente: "",
    situacao: "",
    canal: "",
    dataInicio: "",
    dataFim: "",
  });

  // Sugestões de cliente (autocomplete)
  const [clienteSugestoes, setClienteSugestoes] = useState<string[]>([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  // Carregar fechamentos da API
  useEffect(() => {
    const loadFechamentos = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/previsibilidade/fechamentos");
        if (!res.ok) throw new Error("Erro ao carregar fechamentos");
        const data = await res.json();
        setFechamentos(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        setFechamentos([]);
      } finally {
        setLoading(false);
      }
    };

    loadFechamentos();
  }, []);

  // Filtrar dados
  const filtrados = useMemo(() => {
    return fechamentos.filter(f => {
      if (filtros.cliente && !f.cliente.toLowerCase().includes(filtros.cliente.toLowerCase())) return false;
      if (filtros.situacao && f.situacao !== filtros.situacao) return false;
      if (filtros.canal && f.canal !== filtros.canal) return false;
      if (filtros.dataInicio && new Date(f.data) < new Date(filtros.dataInicio)) return false;
      if (filtros.dataFim && new Date(f.data) > new Date(filtros.dataFim)) return false;
      return true;
    });
  }, [fechamentos, filtros]);

  // Agrupar por ano e mês
  const agrupadosPorAnoMes = useMemo(() => {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const grupos: { [key: number]: { [key: number]: Fechamento[] } } = {};

    filtrados.forEach(f => {
      const [year, month] = f.data.split('-').slice(0, 2).map(Number);
      if (!grupos[year]) grupos[year] = {};
      if (!grupos[year][month]) grupos[year][month] = [];
      grupos[year][month].push(f);
    });

    const resultado: YearMonthData[] = [];
    Object.keys(grupos)
      .map(Number)
      .sort((a, b) => b - a)
      .forEach(year => {
        const months = Object.keys(grupos[year])
          .map(Number)
          .sort((a, b) => b - a)
          .map(month => {
            const contratos = grupos[year][month].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
            const monthTotal = contratos.reduce((sum, c) => {
              const valor = typeof c.honorarios === 'string' ? parseFloat(c.honorarios) : (c.honorarios || 0);
              return sum + (isNaN(valor) ? 0 : valor);
            }, 0);
            return {
              month,
              monthName: meses[month - 1],
              contratos,
              total: contratos.length,
              totalHonorarios: monthTotal,
            };
          });

        resultado.push({ year, months });
      });

    return resultado;
  }, [filtrados]);

  // Atualizar sugestões de cliente
  useEffect(() => {
    const clientesUnicos = [...new Set(fechamentos.map(f => f.cliente))].sort();
    setClienteSugestoes(clientesUnicos);
  }, [fechamentos]);

  // Importar do servidor (TSV)
  const handleImportFromServer = async () => {
    try {
      const res = await fetch("/api/previsibilidade/import-tsv", {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro ao importar");

      alert(`✅ ${result.created} de ${result.total} contratos importados com sucesso!`);

      // Recarregar dados
      const reloadRes = await fetch("/api/previsibilidade/fechamentos");
      const newData = await reloadRes.json();
      setFechamentos(newData);
    } catch (err) {
      alert("❌ Erro: " + (err instanceof Error ? err.message : "desconhecido"));
    }
  };

  // Importar dados de arquivo
  const handleImportFromFile = async () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json,.tsv";
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const text = await file.text();
        let dados;

        if (file.name.endsWith('.json')) {
          dados = JSON.parse(text);
        } else if (file.name.endsWith('.tsv')) {
          // Parse TSV
          const linhas = text.trim().split('\n');
          const headers = linhas[0].split('\t');
          dados = linhas.slice(1).map((linha: string) => {
            const valores = linha.split('\t');
            const obj: any = {};
            headers.forEach((h: string, i: number) => {
              obj[h] = valores[i];
            });
            return obj;
          });
        }

        const fechamentos = Array.isArray(dados) ? dados : dados.fechamentos;

        const res = await fetch("/api/previsibilidade/fechamentos/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fechamentos }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error);

        alert(`✅ ${result.created} de ${result.total} contratos importados com sucesso!`);

        // Recarregar dados
        const reloadRes = await fetch("/api/previsibilidade/fechamentos");
        const newData = await reloadRes.json();
        setFechamentos(newData);
      };
      input.click();
    } catch (err) {
      alert("❌ Erro na importação: " + (err instanceof Error ? err.message : "desconhecido"));
    }
  };

  // Exportar CSV
  const handleExportCSV = () => {
    if (filtrados.length === 0) {
      alert("Nenhum dado para exportar");
      return;
    }

    const headers = ["Data", "Cliente", "Produto", "Área", "Canal", "Setor", "Situação", "Honorários"];
    const rows = filtrados.map((f) => [
      f.data,
      f.cliente,
      f.produto,
      f.area,
      f.canal,
      f.setor || "",
      f.situacao,
      f.honorarios || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fechamentos_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Exportar JSON
  const handleExportJSON = () => {
    if (filtrados.length === 0) {
      alert("Nenhum dado para exportar");
      return;
    }

    const json = JSON.stringify({ fechamentos: filtrados, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fechamentos_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Adicionar novo contrato
  const handleAddNew = async () => {
    const res = await fetch("/api/previsibilidade/fechamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: new Date().toISOString().split('T')[0],
        cliente: "",
        produto: "BPC/LOAS",
        area: "previdenciario",
        canal: "metaAds",
        setor: "Triagem",
        obs: "",
        situacao: "emAndamento",
        honorarios: 0,
      }),
    });
    if (!res.ok) {
      alert("Erro ao criar contrato");
      return;
    }
    const newFechamento = await res.json();
    setFechamentos([...fechamentos, newFechamento]);
  };

  // Deletar fechamento
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/previsibilidade/fechamentos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao deletar fechamento");
      setFechamentos(fechamentos.filter((f) => f.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar fechamento");
    }
  };

  // Duplicar fechamento
  const handleDuplicate = async (id: string) => {
    const fechToDuplicate = fechamentos.find((f) => f.id === id);
    if (fechToDuplicate) {
      const { id: _, ...dataWithoutId } = fechToDuplicate;
      try {
        const res = await fetch("/api/previsibilidade/fechamentos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataWithoutId),
        });
        if (!res.ok) throw new Error("Erro ao duplicar");
        const newFechamento = await res.json();
        setFechamentos([...fechamentos, newFechamento]);
      } catch (err) {
        console.error(err);
        alert("Erro ao duplicar fechamento");
      }
    }
  };

  const toggleYear = (year: number) => {
    const nova = new Set(expandedYears);
    if (nova.has(year)) {
      nova.delete(year);
    } else {
      nova.add(year);
    }
    setExpandedYears(nova);
  };

  const toggleMonth = (year: number, month: number) => {
    const key = `${year}-${month}`;
    const nova = new Set(expandedMonths);
    if (nova.has(key)) {
      nova.delete(key);
    } else {
      nova.add(key);
    }
    setExpandedMonths(nova);
  };

  const limparFiltros = () => {
    setFiltros({
      cliente: "",
      situacao: "",
      canal: "",
      dataInicio: "",
      dataFim: "",
    });
  };

  const totalFechamentos = filtrados.length;
  const totalHonorarios = filtrados.reduce((sum, f) => {
    const valor = typeof f.honorarios === 'string' ? parseFloat(f.honorarios) : (f.honorarios || 0);
    return sum + (isNaN(valor) ? 0 : valor);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Carregando fechamentos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400">❌ Erro ao carregar fechamentos: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total de Contratos</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalFechamentos}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">Honorários Acertados</p>
          <p className="text-3xl font-bold text-green-600">{formatarMoeda(totalHonorarios)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">Taxa Conversão</p>
          <p className="text-3xl font-bold text-blue-600">{totalFechamentos > 0 ? ((totalFechamentos / 50) * 100).toFixed(0) : "0"}%</p>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            onClick={handleImportFromFile}
            className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            title="Importar arquivo JSON/TSV"
          >
            📥 Importar
          </button>
          <button
            onClick={handleImportFromServer}
            className="flex items-center gap-2 rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            title="Importar do servidor (TSV)"
          >
            🖥️ Servidor
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
            title="Exportar como CSV"
          >
            📊 CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            title="Exportar como JSON"
          >
            📄 JSON
          </button>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Novo Contrato
        </button>
      </div>

      {/* Filtros */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">🔍 Filtros</h3>
          <button
            onClick={limparFiltros}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Limpar filtros
          </button>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {/* Cliente com autocomplete */}
          <div className="relative">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Cliente</label>
            <input
              type="text"
              placeholder="Digite o cliente..."
              value={filtros.cliente}
              onChange={(e) => {
                setFiltros({ ...filtros, cliente: e.target.value });
                setMostrarSugestoes(true);
              }}
              onFocus={() => setMostrarSugestoes(true)}
              onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm dark:bg-slate-800 dark:border-slate-600"
            />
            {mostrarSugestoes && filtros.cliente && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded shadow-lg z-10">
                {clienteSugestoes
                  .filter(c => c.toLowerCase().includes(filtros.cliente.toLowerCase()))
                  .slice(0, 5)
                  .map(cliente => (
                    <button
                      key={cliente}
                      onClick={() => {
                        setFiltros({ ...filtros, cliente });
                        setMostrarSugestoes(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
                    >
                      {cliente}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Situação */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Situação</label>
            <select
              value={filtros.situacao}
              onChange={(e) => setFiltros({ ...filtros, situacao: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm dark:bg-slate-800 dark:border-slate-600"
            >
              <option value="">Todas</option>
              {SITUACOES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Canal */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Canal</label>
            <select
              value={filtros.canal}
              onChange={(e) => setFiltros({ ...filtros, canal: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm dark:bg-slate-800 dark:border-slate-600"
            >
              <option value="">Todos</option>
              {CANAIS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Data Início */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Data Início</label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm dark:bg-slate-800 dark:border-slate-600"
            />
          </div>

          {/* Data Fim */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Data Fim</label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm dark:bg-slate-800 dark:border-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Hierarquia Ano/Mês */}
      <div className="space-y-2">
        {agrupadosPorAnoMes.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800">
            <p className="text-slate-600 dark:text-slate-400">Nenhum fechamento encontrado com os filtros aplicados.</p>
          </div>
        ) : (
          agrupadosPorAnoMes.map(yearData => (
            <div key={yearData.year}>
              {/* Year Header */}
              <button
                onClick={() => toggleYear(yearData.year)}
                className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-colors"
              >
                {expandedYears.has(yearData.year) ? (
                  <ChevronDown className="h-5 w-5 text-blue-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-blue-600" />
                )}
                <span className="font-semibold text-blue-900 dark:text-blue-100">{yearData.year}</span>
                <span className="text-sm text-blue-700 dark:text-blue-300 ml-auto">
                  {yearData.months.reduce((sum, m) => sum + m.total, 0)} contratos
                </span>
              </button>

              {/* Months */}
              {expandedYears.has(yearData.year) && (
                <div className="ml-4 space-y-2 mt-2">
                  {yearData.months.map(monthData => (
                    <div key={`${yearData.year}-${monthData.month}`}>
                      {/* Month Header */}
                      <button
                        onClick={() => toggleMonth(yearData.year, monthData.month)}
                        className="w-full flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        {expandedMonths.has(`${yearData.year}-${monthData.month}`) ? (
                          <ChevronDown className="h-4 w-4 text-slate-600" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-600" />
                        )}
                        <span className="font-medium text-slate-900 dark:text-white">{monthData.monthName}</span>
                        <span className="text-xs text-slate-600 dark:text-slate-400 ml-auto">
                          {monthData.total} contratos • {formatarMoeda(monthData.totalHonorarios)}
                        </span>
                      </button>

                      {/* Contratos */}
                      {expandedMonths.has(`${yearData.year}-${monthData.month}`) && (
                        <div className="ml-4 mt-2 space-y-1">
                          {monthData.contratos.map(fech => (
                            <div
                              key={fech.id}
                              className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-white">{fech.cliente}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {formatarData(fech.data)} • <span className="font-semibold text-blue-600 dark:text-blue-400">{fech.produto}</span> • {fech.canal} • {fech.area}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <p className="text-right">
                                  <span className="font-semibold text-green-600">{formatarMoeda(fech.honorarios)}</span>
                                  <br />
                                  <span className="text-xs text-slate-600 dark:text-slate-400">{fech.situacao}</span>
                                </p>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleDuplicate(fech.id)}
                                    className="text-green-600 hover:text-green-700 dark:text-green-400"
                                    title="Duplicar"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm({ open: true, id: fech.id })}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                                    title="Deletar"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmacaoDeleteDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="Deletar Contrato?"
        description="Esta ação não pode ser desfeita. O contrato será permanentemente removido."
        onConfirm={() => {
          handleDelete(deleteConfirm.id);
          setDeleteConfirm({ open: false, id: "" });
        }}
      />
    </div>
  );
}
