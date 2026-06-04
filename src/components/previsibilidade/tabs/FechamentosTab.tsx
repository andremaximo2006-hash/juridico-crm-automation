"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Copy, Loader } from "lucide-react";
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

// Função auxiliar para remover acentos e normalizar texto
const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Remove acentos
    .toLowerCase()
    .replace(/ /g, ''); // Remove espaços
};

// Mapa de conversão para valores do localStorage → enums da API
const CONVERSAO_AREA = {
  'previdenciario': 'previdenciario',
  'trabalhista': 'trabalhista',
  'familia': 'familia',
  'civil': 'civil',
  'civel': 'civil', // Alternativa com acento/v extra
  'outro': 'outro',
};

const CONVERSAO_SITUACAO = {
  'beneficioconcedido': 'beneficioConcedido',
  'beneficionegado': 'beneficioNegado',
  'emandamento': 'emAndamento',
  'semviabilidade': 'semViabilidade',
};

export function FechamentosTab() {
  const [fechamentos, setFechamentos] = useState<Fechamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string }>({
    open: false,
    id: "",
  });

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

  // Adicionar novo fechamento
  const handleAdd = async (data: Omit<Fechamento, "id">) => {
    try {
      const res = await fetch("/api/previsibilidade/fechamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erro ao criar fechamento");
      const newFechamento = await res.json();
      setFechamentos([...fechamentos, newFechamento]);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar fechamento");
    }
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
      await handleAdd({
        ...dataWithoutId,
        obs: `${fechToDuplicate.obs} (Cópia)`,
      });
    }
  };

  // Importar dados do localStorage
  const handleImportFromLocalStorage = async () => {
    try {
      const localData = localStorage.getItem("previsibilidade_fechamentos");
      if (!localData) {
        alert("Nenhum dado encontrado no localStorage");
        return;
      }

      const dados = JSON.parse(localData);
      if (!Array.isArray(dados) || dados.length === 0) {
        alert("localStorage vazio ou formato inválido");
        return;
      }

      // Transformar dados do localStorage para o formato da API
      const payload = {
        fechamentos: dados.map((d: any) => {
          const areaNormalizada = normalizeText(d.area || "previdenciario");
          const situacaoNormalizada = normalizeText(d.situacao || "emandamento");

          return {
            data: d.data,
            cliente: d.cliente,
            produtoId: "prod-1",
            area: (CONVERSAO_AREA[areaNormalizada as keyof typeof CONVERSAO_AREA] || areaNormalizada) as any,
            canal: d.canal?.includes("Meta") ? "metaAds" : d.canal?.includes("Orgânico") ? "organico" : "metaAds",
            setor: d.setor || "Recepção",
            obs: d.obs || "",
            situacao: (CONVERSAO_SITUACAO[situacaoNormalizada as keyof typeof CONVERSAO_SITUACAO] || situacaoNormalizada) as any,
            honorarios: d.honorarios || 0,
          };
        }),
      };

      const res = await fetch("/api/previsibilidade/fechamentos/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao importar");
      const result = await res.json();
      alert(`✅ ${result.created} contratos importados com sucesso!`);

      // Recarregar dados
      const reloadRes = await fetch("/api/previsibilidade/fechamentos");
      const newData = await reloadRes.json();
      setFechamentos(newData);
    } catch (err) {
      alert("❌ Erro na importação: " + (err instanceof Error ? err.message : "desconhecido"));
    }
  };

  // Exportar dados para CSV
  const handleExportCSV = () => {
    if (fechamentos.length === 0) {
      alert("Nenhum dado para exportar");
      return;
    }

    const headers = ["Data", "Cliente", "Produto", "Área", "Canal", "Setor", "Status", "Honorários"];
    const rows = fechamentos.map((f) => [
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

  // Exportar dados para JSON
  const handleExportJSON = () => {
    if (fechamentos.length === 0) {
      alert("Nenhum dado para exportar");
      return;
    }

    const json = JSON.stringify({ fechamentos, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fechamentos_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalFechamentos = fechamentos.length;
  const totalHonorarios = fechamentos.reduce((sum, f) => sum + (f.honorarios || 0), 0);

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
          <p className="text-3xl font-bold text-green-600">R$ {totalHonorarios.toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">Taxa Conversão</p>
          <p className="text-3xl font-bold text-blue-600">{totalFechamentos > 0 ? ((totalFechamentos / 50) * 100).toFixed(0) : "0"}%</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          📋 CONTROLE DE PRAZOS E STATUS
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleImportFromLocalStorage}
            className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            title="Importar do navegador"
          >
            📥 Importar
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
          <button
            onClick={() => handleAdd({
              data: new Date().toISOString().split('T')[0],
              cliente: "",
              produto: "BPC/LOAS",
              area: "Previdenciário",
              canal: "metaAds",
              setor: "Triagem",
              obs: "",
              situacao: "emAndamento",
              honorarios: 0,
            })}
            className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Novo Contrato
          </button>
        </div>
      </div>

      {fechamentos.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800">
          <p className="text-slate-600 dark:text-slate-400">Nenhum fechamento registrado. Clique em "Novo Contrato" para começar.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-3 text-left font-semibold">Data</th>
                <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                <th className="px-4 py-3 text-left font-semibold">Produto</th>
                <th className="px-4 py-3 text-left font-semibold bg-blue-50 dark:bg-blue-900/10">Área</th>
                <th className="px-4 py-3 text-left font-semibold bg-blue-50 dark:bg-blue-900/10">Canal</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Honorários</th>
                <th className="px-4 py-3 text-center font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {fechamentos.map((fech) => (
                <tr key={fech.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3 text-sm text-slate-600">{fech.data}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{fech.cliente}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{fech.produto}</td>
                  <td className="px-4 py-3 bg-blue-50 dark:bg-blue-900/10 text-sm">{fech.area}</td>
                  <td className="px-4 py-3 bg-blue-50 dark:bg-blue-900/10 text-sm">{fech.canal}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        fech.situacao === "beneficioConcedido"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {fech.situacao}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">
                    {fech.honorarios ? `R$ ${fech.honorarios.toLocaleString("pt-BR")}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button className="inline text-blue-600 hover:text-blue-700" title="Editar">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ open: true, id: fech.id })}
                      className="inline text-red-600 hover:text-red-700"
                      title="Deletar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(fech.id)}
                      className="inline text-green-600 hover:text-green-700"
                      title="Duplicar"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

      <p className="text-sm text-slate-600 dark:text-slate-400">
        <strong>{totalFechamentos} contratos reais</strong> · Rastreamento desde entrada até conclusão
      </p>
    </div>
  );
}
