"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Search, Plus, Upload, Filter, X, Pencil, Trash2,
  ChevronDown, ChevronUp, Loader2, FileText, ClipboardList,
} from "lucide-react";

interface InicialEntry {
  id: string;
  cliente: string;
  processo: string | null;
  dataInicial: string | null;
  protocolo: string | null;
  responsavel: string | null;
  status: string | null;
  observacoes: string | null;
}

const AREAS = ["Previdenciário", "Cível", "Trabalhista", "Família", "Criminal", "Consumidor", "Outro"];

const PROCESSOS = [
  "Requerimento Administrativo",
  "Petição inicial",
  "Inicial - Judicial",
  "Judicial",
  "Mandado de segurança",
  "Requerimento Administrativo / Judicial",
  "Inicial - Requerimento administrativo",
  "Outro",
];

const STATUS_OPTIONS = [
  "Distribuído",
  "Realizado",
  "Protocolado",
  "Em andamento",
  "Aguardando",
  "PROTOCOLAR",
  "CORRIGIR",
  "Desistência",
  "Concluído",
];

const EMPTY_FORM = {
  cliente: "",
  processo: "",
  dataInicial: "",
  protocolo: "",
  responsavel: "",
  status: "",
  observacoes: "",
};

// Data | Protocolo | Cliente | Processo | Área/Tipo | Responsável | Status | Observações | Ações
const TABLE_COLS = "grid-cols-[90px_90px_minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_130px_110px_minmax(0,1.5fr)_56px]";

function statusBadge(s: string | null) {
  if (!s) return null;
  const u = s.toUpperCase();
  if (u === "PROTOCOLAR") return "bg-red-100 text-red-700";
  if (u === "CORRIGIR") return "bg-orange-100 text-orange-700";
  if (u.includes("REALIZ") || u.includes("CONCLU") || u.includes("DISTRIBU") || u.includes("PROTOCOLA"))
    return "bg-green-100 text-green-700";
  if (u.includes("AGUARD") || u.includes("ANDAMENTO"))
    return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-600";
}

// ─── Modal de registro ─────────────────────────────────────────────────────────

function InicialModal({
  entry,
  onClose,
  onSaved,
}: {
  entry?: InicialEntry | null;
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
        cliente: entry.cliente,
        processo: entry.processo ?? "",
        dataInicial: entry.dataInicial ? entry.dataInicial.slice(0, 10) : "",
        protocolo: entry.protocolo ?? "",
        responsavel: entry.responsavel ?? "",
        status: entry.status ?? "",
        observacoes: entry.observacoes ?? "",
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
    setLoading(true);
    try {
      const url = isEdit ? `/api/operacional/iniciais/${entry!.id}` : "/api/operacional/iniciais";
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

  function inp(label: string, key: string, type = "text", ph = "") {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <input type={type} value={form[key as keyof typeof form]}
          onChange={(e) => set(key, e.target.value)} placeholder={ph}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
    );
  }

  function sel(label: string, key: string, opts: string[]) {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <select value={form[key as keyof typeof form]} onChange={(e) => set(key, e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">—</option>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? "Editar inicial" : "Nova inicial"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          {inp("Cliente *", "cliente", "text", "Nome completo")}

          <div className="grid grid-cols-2 gap-3">
            {sel("Processo", "processo", PROCESSOS)}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {inp("Data inicial", "dataInicial", "date")}
            {inp("Protocolo", "protocolo", "text", "Data ou número do protocolo")}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {inp("Responsável", "responsavel", "text", "Advogado / Estagiário")}
            {sel("Status", "status", STATUS_OPTIONS)}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
            <textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)}
              rows={2} placeholder="Notas e observações..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Salvando...</>
                : isEdit ? "Salvar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal de importação ───────────────────────────────────────────────────────

function InicialImportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/operacional/iniciais/import", { method: "POST", body: fd });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    if (data.imported > 0) onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-900">Importar planilha — Iniciais</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-800 space-y-1">
            <p className="font-semibold">Colunas esperadas (aba INICIAIS):</p>
            <p className="text-indigo-600">Nº · · Cliente · Processo · Área · Tipo · Data Inicial · Protocolo · Responsável · Status · Observações</p>
            <p className="text-indigo-400">Cabeçalhos de mês e linhas sem cliente são ignorados automaticamente.</p>
          </div>

          <div onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
            <FileText size={28} className="mx-auto text-gray-300 mb-2" />
            {file
              ? <p className="text-sm font-medium text-indigo-700">{file.name}</p>
              : <><p className="text-sm font-medium text-gray-500">Clique para selecionar</p>
                  <p className="text-xs text-gray-400 mt-1">.xlsx, .xls ou .csv</p></>}
            <input ref={inputRef} type="file" accept=".xlsx,.csv,.xls,.tsv" className="hidden"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); }} />
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
                  {result.errors.slice(0, 10).map((err, i) => <p key={i} className="text-xs text-red-600">{err}</p>)}
                  {result.errors.length > 10 && <p className="text-xs text-red-400">...e mais {result.errors.length - 10} avisos</p>}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              {result ? "Fechar" : "Cancelar"}
            </button>
            {!result && (
              <button onClick={handleUpload} disabled={!file || loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Importando...</> : "Importar"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function IniciaisTab() {
  const [entries, setEntries] = useState<InicialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterArea, setFilterArea] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMes, setFilterMes] = useState("");
  const [editEntry, setEditEntry] = useState<InicialEntry | null | undefined>(undefined);
  const [showImport, setShowImport] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<InicialEntry | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filterArea) p.set("area", filterArea);
      if (filterStatus) p.set("status", filterStatus);
      if (filterMes) p.set("mes", filterMes);
      const res = await fetch(`/api/operacional/iniciais?${p}`);
      setEntries(await res.json());
    } finally {
      setLoading(false);
    }
  }, [filterArea, filterStatus, filterMes]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const filtered = useMemo(() => {
    let list = [...entries];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) =>
        e.cliente.toLowerCase().includes(q) ||
        (e.processo ?? "").toLowerCase().includes(q) ||
        (e.responsavel ?? "").toLowerCase().includes(q) ||
        (e.status ?? "").toLowerCase().includes(q) ||
        (e.observacoes ?? "").toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const da = a.dataInicial ? new Date(a.dataInicial).getTime() : 0;
      const db = b.dataInicial ? new Date(b.dataInicial).getTime() : 0;
      return sortDir === "asc" ? da - db : db - da;
    });
    return list;
  }, [entries, query, sortDir]);

  async function handleDelete(e: InicialEntry) {
    const res = await fetch(`/api/operacional/iniciais/${e.id}`, { method: "DELETE" });
    if (res.status === 204) { setDeleteConfirm(null); fetchEntries(); }
  }

  const activeFilters = [filterArea, filterStatus, filterMes].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Barra de ações */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          {filtered.length !== entries.length
            ? `${filtered.length} de ${entries.length} registros`
            : `${entries.length} registros`}
        </p>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
            <Upload size={14} /> Importar planilha
          </button>
          <button onClick={() => setEditEntry(null)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
            <Plus size={14} /> Nova inicial
          </button>
        </div>
      </div>

      {/* Busca + filtros */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar por cliente, tipo, responsável ou status..."
            value={query} onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {query && (
            <button onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>
        <button onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm border rounded-lg font-medium transition-colors ${
            showFilters || activeFilters > 0
              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}>
          <Filter size={13} />
          Filtros
          {activeFilters > 0 && (
            <span className="bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mês</label>
            <input type="month" value={filterMes} onChange={(e) => setFilterMes(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Área</label>
            <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[140px]">
              <option value="">Todas</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[140px]">
              <option value="">Todos</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {activeFilters > 0 && (
            <button onClick={() => { setFilterArea(""); setFilterStatus(""); setFilterMes(""); }}
              className="text-xs text-red-600 hover:underline ml-auto">
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Cabeçalho desktop */}
        <div className={`hidden lg:grid ${TABLE_COLS} gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200`}>
          <button onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-800 whitespace-nowrap">
            Data {sortDir === "asc"
              ? <ChevronUp size={11} className="text-indigo-500" />
              : <ChevronDown size={11} className="text-indigo-500" />}
          </button>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Protocolo</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Processo</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Área / Tipo</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Responsável</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Observações</span>
          <span />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-gray-300" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardList size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400 font-medium">Nenhum registro encontrado</p>
            {entries.length === 0 && (
              <button onClick={() => setShowImport(true)} className="mt-2 text-sm text-indigo-600 hover:underline">
                Importar planilha para começar
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((e) => {
              const sb = statusBadge(e.status);
              const expanded = expandedId === e.id;
              return (
                <div key={e.id} className="group">
                  {/* Linha desktop */}
                  <div className={`hidden lg:grid ${TABLE_COLS} gap-3 items-start px-5 py-3 hover:bg-gray-50 transition-colors`}>
                    <p className="text-xs font-medium text-gray-700 tabular-nums whitespace-nowrap pt-0.5">
                      {e.dataInicial
                        ? new Date(e.dataInicial).toLocaleDateString("pt-BR")
                        : <span className="text-gray-300">—</span>}
                    </p>

                    <p className="text-xs text-gray-500 truncate pt-0.5">
                      {e.protocolo || <span className="text-gray-300">—</span>}
                    </p>

                    <p className="text-sm font-semibold text-gray-900 truncate leading-snug pt-0.5">{e.cliente}</p>

                    <p className="text-xs text-gray-500 truncate pt-0.5">
                      {e.processo || <span className="text-gray-300">—</span>}
                    </p>

                    <div className="min-w-0 space-y-0.5">
                    </div>

                    <p className="text-xs text-gray-600 truncate pt-0.5">
                      {e.responsavel || <span className="text-gray-300">—</span>}
                    </p>

                    <div>
                      {sb && e.status
                        ? <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${sb}`}>{e.status}</span>
                        : <span className="text-xs text-gray-300">—</span>}
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {e.observacoes || <span className="text-gray-300">—</span>}
                    </p>

                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditEntry(e)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Editar">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeleteConfirm(e)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Excluir">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Card mobile */}
                  <div className="lg:hidden">
                    <div className="flex items-start gap-3 px-4 py-3 cursor-pointer"
                      onClick={() => setExpandedId(expanded ? null : e.id)}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{e.cliente}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {e.dataInicial ? new Date(e.dataInicial).toLocaleDateString("pt-BR") : "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 mt-0.5">
                        {sb && e.status && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${sb}`}>{e.status}</span>
                        )}
                        {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </div>
                    </div>
                    {expanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                        {e.processo      && <p><span className="text-gray-400 w-24 inline-block">Processo:</span>{e.processo}</p>}
                        {e.protocolo     && <p><span className="text-gray-400 w-24 inline-block">Protocolo:</span>{e.protocolo}</p>}
                        {e.responsavel   && <p><span className="text-gray-400 w-24 inline-block">Responsável:</span>{e.responsavel}</p>}
                        {e.observacoes   && <p><span className="text-gray-400 w-24 inline-block">Obs:</span>{e.observacoes}</p>}
                        <div className="flex gap-3 pt-1">
                          <button onClick={() => setEditEntry(e)} className="flex items-center gap-1 text-indigo-600 hover:underline">
                            <Pencil size={11} /> Editar
                          </button>
                          <button onClick={() => setDeleteConfirm(e)} className="flex items-center gap-1 text-red-600 hover:underline">
                            <Trash2 size={11} /> Excluir
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmação de exclusão */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Excluir registro</h3>
            <p className="text-sm text-gray-500 mb-4">
              Excluir <strong>{deleteConfirm.cliente}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {showImport && <InicialImportModal onClose={() => setShowImport(false)} onSuccess={fetchEntries} />}
      {editEntry !== undefined && (
        <InicialModal entry={editEntry} onClose={() => setEditEntry(undefined)} onSaved={fetchEntries} />
      )}
    </div>
  );
}
