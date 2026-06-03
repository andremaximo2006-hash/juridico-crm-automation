"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Search, Plus, Upload, Filter, X,
  Loader2, FileText, Phone, Mail, Tag, Calendar, AlertCircle,
  Users, Briefcase, ClipboardList, Building2, ChevronRight,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import type { Entry } from "@/components/operacional/FechamentosTable";

// ─── Constants ───────────────────────────────────────────────────────────────

const NATUREZAS = ["LEAD", "ORGÂNICO"];

const AREAS = [
  "Previdenciário",
  "Cível",
  "Trabalhista",
  "Família",
  "Criminal",
  "Consumidor",
  "Outro",
];

const DEMANDAS = [
  "BPC/LOAS",
  "Salário maternidade",
  "Auxílio doença",
  "Auxílio acidente",
  "Aposentadoria",
  "Pensão por Morte",
  "Conversão de aposentadoria",
  "Ação trabalhista",
  "Reclamação Trabalhista",
  "Ação de cobrança",
  "Ação indenizatória",
  "Inventário",
  "Alimentos",
  "Exoneração de alimentos",
  "Execução",
  "Dissolução União estável",
  "RPV",
  "Outro",
];

const SETORES = ["Relacionamento", "Iniciais", "Recepção"];
const CADSENHAOPTIONS = ["OK", "PENDENTE", "-"];

// ─── Kanban Status ────────────────────────────────────────────────────────────

type StatusKanban = "novo" | "triagem" | "em-andamento" | "concluido";

const STATUS_LABELS: Record<StatusKanban, string> = {
  novo: "Novo",
  triagem: "Triagem",
  "em-andamento": "Em Andamento",
  concluido: "Concluído",
};

const STATUS_COLORS: Record<StatusKanban, string> = {
  novo: "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300",
  triagem: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  "em-andamento": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
  concluido: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
};

// Mapeia entry para status Kanban
function getEntryStatus(e: Entry): StatusKanban {
  if ((e.statusAtual ?? "").toLowerCase().includes("concluído") || (e.statusAtual ?? "").toLowerCase().includes("fechado")) {
    return "concluido";
  }
  if ((e.setor ?? "").toLowerCase().includes("recep")) {
    return "novo";
  }
  if ((e.cadSenha ?? "").toUpperCase() === "PENDENTE") {
    return "triagem";
  }
  return "em-andamento";
}

// ─── Form modal ──────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  dataEntrada: new Date().toISOString().slice(0, 10),
  cliente: "",
  contato: "",
  natureza: "LEAD",
  areaAtuacao: "",
  beneficioDemanda: "",
  setor: "",
  cadSenha: "",
  statusAtual: "",
};

function EntryModal({
  entry,
  onClose,
  onSaved,
}: {
  entry?: Entry | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!entry;
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (entry) {
      setForm({
        dataEntrada: entry.dataEntrada.slice(0, 10),
        cliente: entry.cliente,
        contato: entry.contato ?? "",
        natureza: entry.natureza,
        areaAtuacao: entry.areaAtuacao ?? "",
        beneficioDemanda: entry.beneficioDemanda ?? "",
        setor: entry.setor ?? "",
        cadSenha: entry.cadSenha ?? "",
        statusAtual: entry.statusAtual ?? "",
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
  }, [entry]);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.cliente.trim()) { setError("Cliente obrigatório"); return; }
    if (!form.dataEntrada) { setError("Data obrigatória"); return; }
    setLoading(true);
    try {
      const url = isEdit ? `/api/operacional/${entry!.id}` : "/api/operacional";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao salvar"); return; }
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  function selectField(label: string, key: string, options: string[], required = false) {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {label}{required && " *"}
        </label>
        <select
          value={form[key as keyof typeof form]}
          onChange={(e) => set(key, e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">—</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }

  function inputField(label: string, key: string, type = "text", required = false, placeholder = "") {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {label}{required && " *"}
        </label>
        <input
          type={type}
          value={form[key as keyof typeof form]}
          onChange={(e) => set(key, e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Editar registro" : "Novo registro operacional"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {inputField("Data de entrada *", "dataEntrada", "date", true)}
            {selectField("Natureza", "natureza", NATUREZAS)}
          </div>

          {inputField("Cliente *", "cliente", "text", true, "Nome completo")}

          <div className="grid grid-cols-2 gap-3">
            {inputField("Contato", "contato", "text", false, "(00) 00000-0000")}
            {selectField("Área de atuação", "areaAtuacao", AREAS)}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {selectField("Benefício / Demanda", "beneficioDemanda", DEMANDAS)}
            {selectField("Setor", "setor", SETORES)}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {selectField("Cad/Senha", "cadSenha", CADSENHAOPTIONS)}
            {inputField("Status atual", "statusAtual", "text", false, "Texto livre...")}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Salvando...</>
                : isEdit ? "Salvar alterações" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Import modal ─────────────────────────────────────────────────────────────

function ImportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/operacional/import", { method: "POST", body: fd });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    if (data.imported > 0) onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-900">Importar planilha operacional</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-800 space-y-1">
            <p className="font-semibold">Colunas esperadas (nessa ordem):</p>
            <p className="text-indigo-600">
              Data · Cliente · Contato · Natureza · Área · Benefício/Demanda · Observação · Setor · Cad/Senha · Status atual
            </p>
            <p className="text-indigo-400">Cabeçalhos de seção e linhas sem data são ignorados automaticamente.</p>
          </div>

          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
          >
            <FileText size={28} className="mx-auto text-gray-300 mb-2" />
            {file ? (
              <p className="text-sm font-medium text-indigo-700">{file.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-500">Clique para selecionar o arquivo</p>
                <p className="text-xs text-gray-400 mt-1">.xlsx ou .csv</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.csv,.xls"
              className="hidden"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); }}
            />
          </div>

          {result && (
            <div className="space-y-2">
              <div className="flex gap-3">
                <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{result.imported}</p>
                  <p className="text-xs text-gray-500 mt-0.5">importados</p>
                </div>
                <div className="flex-1 bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">{result.skipped}</p>
                  <p className="text-xs text-gray-500 mt-0.5">ignorados</p>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 max-h-28 overflow-y-auto space-y-0.5">
                  {result.errors.slice(0, 10).map((err, i) => (
                    <p key={i} className="text-xs text-red-600">{err}</p>
                  ))}
                  {result.errors.length > 10 && (
                    <p className="text-xs text-red-400">...e mais {result.errors.length - 10} avisos</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              {result ? "Fechar" : "Cancelar"}
            </button>
            {!result && (
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading
                  ? <><Loader2 size={14} className="animate-spin" /> Importando...</>
                  : "Importar"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OperacionalPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editEntry, setEditEntry] = useState<Entry | null | undefined>(undefined);
  const [showImport, setShowImport] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Entry | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/operacional?limit=500");
      const json = await res.json();
      setEntries(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const filtered = useMemo(() => {
    let list = entries;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) =>
        e.cliente.toLowerCase().includes(q) ||
        (e.contato ?? "").replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
        (e.beneficioDemanda ?? "").toLowerCase().includes(q) ||
        (e.areaAtuacao ?? "").toLowerCase().includes(q) ||
        (e.statusAtual ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [entries, query]);

  // Group entries by status
  const entriesByStatus = useMemo(() => {
    const grouped: Record<StatusKanban, Entry[]> = {
      novo: [],
      triagem: [],
      "em-andamento": [],
      concluido: [],
    };
    filtered.forEach((e) => {
      const status = getEntryStatus(e);
      grouped[status].push(e);
    });
    return grouped;
  }, [filtered]);

  async function handleDelete(e: Entry) {
    const res = await fetch(`/api/operacional/${e.id}`, { method: "DELETE" });
    if (res.status === 204) { setDeleteConfirm(null); fetchEntries(); }
  }

  // Stats
  const totalEntries = entries.length;
  const totalLeads = entries.filter((e) => e.natureza.toUpperCase() === "LEAD").length;

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Operacional"
        subtitle="Gerenciamento de procedimentos e tarefas"
      />

      {/* Busca */}
      <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, contato, área..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Upload size={16} /> Importar
          </button>
          <button
            onClick={() => setEditEntry(null)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} /> Novo
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto bg-slate-50 p-4 dark:bg-slate-800">
        <div className="grid grid-cols-4 gap-4 h-full">
          {(["novo", "triagem", "em-andamento", "concluido"] as StatusKanban[]).map((status) => {
            const cards = entriesByStatus[status] || [];
            return (
              <div key={status} className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden dark:border-slate-700 dark:bg-slate-900">
                {/* Column Header */}
                <div className={`p-4 border-b border-slate-200 dark:border-slate-700 ${STATUS_COLORS[status]}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{STATUS_LABELS[status]}</h3>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-white/50">
                      {cards.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {loading && cards.length === 0 ? (
                    <div className="text-center py-8">
                      <Loader2 size={20} className="animate-spin mx-auto text-slate-400" />
                    </div>
                  ) : cards.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-slate-400 text-sm">Nenhum registro</div>
                    </div>
                  ) : (
                    cards.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:shadow-md transition cursor-pointer dark:border-slate-700 dark:bg-slate-800"
                        onClick={() => setEditEntry(entry)}
                      >
                        <div className="space-y-2">
                          <div>
                            <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                              {entry.cliente}
                            </p>
                            {entry.beneficioDemanda && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                {entry.beneficioDemanda}
                              </p>
                            )}
                          </div>

                          {/* Info row */}
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            {entry.contato && (
                              <span className="flex items-center gap-1 truncate">
                                <Phone size={12} /> {entry.contato}
                              </span>
                            )}
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1">
                            {entry.areaAtuacao && (
                              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                                {entry.areaAtuacao}
                              </span>
                            )}
                            {entry.natureza && (
                              <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                                {entry.natureza}
                              </span>
                            )}
                          </div>

                          {/* Date */}
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Calendar size={12} />
                            {new Date(entry.dataEntrada).toLocaleDateString("pt-BR")}
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditEntry(entry);
                              }}
                              className="flex-1 text-xs px-2 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                              Editar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(entry);
                              }}
                              className="flex-1 text-xs px-2 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmação de exclusão */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm dark:bg-slate-900">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">Excluir registro</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Excluir <strong>{deleteConfirm.cliente}</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {showImport && <ImportModal onClose={() => setShowImport(false)} onSuccess={fetchEntries} />}
      {editEntry !== undefined && (
        <EntryModal entry={editEntry} onClose={() => setEditEntry(undefined)} onSaved={fetchEntries} />
      )}
    </div>
  );
}
