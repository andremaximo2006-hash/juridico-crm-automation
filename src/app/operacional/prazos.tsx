"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search, X, Loader2, ClipboardList, ChevronDown, ChevronUp,
  Pencil, User,
} from "lucide-react";

interface PrazoEntry {
  id: string;
  cliente: string;
  processo: string | null;
  tipoPrazo: string | null;
  dataInicial: string | null;
  dataFinal: string | null;
  responsavel: string | null;
  status: string | null;
  observacoes: string | null;
  updatedAt: string;
}

function fmtDate(v: string | null) {
  if (!v) return null;
  return new Date(v).toLocaleDateString("pt-BR");
}

function toInputDate(v: string | null) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function statusBadge(s: string | null) {
  if (!s) return "bg-gray-100 text-gray-500";
  const u = s.toUpperCase();
  if (/CONCLU|FINALIZ|REALIZ/.test(u)) return "bg-green-100 text-green-700";
  if (/PEND|AGUARD|ANDAMENTO/.test(u)) return "bg-amber-100 text-amber-700";
  if (/VENC|ATRAS/.test(u)) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

function isOverdue(r: PrazoEntry) {
  if (!r.dataFinal) return false;
  if (/CONCLU|REALIZ|FINALIZ/i.test(r.status ?? "")) return false;
  return new Date(r.dataFinal) < new Date();
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  "PENDENTE", "EM ANDAMENTO", "AGUARDANDO", "CONCLUÍDO", "FINALIZADO",
  "VENCIDO", "CANCELADO",
];

function EditModal({
  entry,
  onClose,
  onSaved,
}: {
  entry: PrazoEntry;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    cliente:     entry.cliente,
    processo:    entry.processo     ?? "",
    tipoPrazo:   entry.tipoPrazo    ?? "",
    dataInicial: toInputDate(entry.dataInicial),
    dataFinal:   toInputDate(entry.dataFinal),
    responsavel: entry.responsavel  ?? "",
    status:      entry.status       ?? "",
    observacoes: entry.observacoes  ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.cliente.trim()) { setError("Cliente obrigatório"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/operacional/prazos/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dataInicial: form.dataInicial || null,
          dataFinal:   form.dataFinal   || null,
          processo:    form.processo    || null,
          tipoPrazo:   form.tipoPrazo   || null,
          responsavel: form.responsavel || null,
          status:      form.status      || null,
          observacoes: form.observacoes || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Erro ao salvar");
        return;
      }
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  function field(label: string, key: string, type = "text") {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <input
          type={type}
          value={form[key as keyof typeof form]}
          onChange={(e) => set(key, e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-base font-semibold text-gray-900">Editar prazo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          {field("Cliente *", "cliente")}

          <div className="grid grid-cols-2 gap-3">
            {field("Processo", "processo")}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {field("Tipo de prazo", "tipoPrazo")}
            {field("Responsável", "responsavel")}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {field("Data inicial", "dataInicial", "date")}
            {field("Data final", "dataFinal", "date")}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">—</option>
              {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={(e) => set("observacoes", e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
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
              {loading ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

const TABLE_COLS = "grid-cols-[100px_100px_minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.5fr)_110px_110px_minmax(0,1.5fr)_minmax(0,2fr)_40px]";

export default function PrazosTab() {
  const [rows, setRows] = useState<PrazoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<PrazoEntry | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (filterStatus) params.set("status", filterStatus);
      const res = await fetch(`/api/operacional/prazos?${params}`);
      setRows(await res.json());
    } finally {
      setLoading(false);
    }
  }, [query, filterStatus]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const statuses = Array.from(new Set(rows.map((r) => r.status).filter(Boolean))) as string[];

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Total de prazos</p>
          <p className="text-2xl font-bold text-indigo-600">{rows.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Pendentes / Andamento</p>
          <p className="text-2xl font-bold text-amber-600">
            {rows.filter((r) => /PEND|AGUARD|ANDAMENTO/i.test(r.status ?? "")).length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Concluídos</p>
          <p className="text-2xl font-bold text-green-600">
            {rows.filter((r) => /CONCLU|FINALIZ|REALIZ/i.test(r.status ?? "")).length}
          </p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, processo, área ou status..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Todos os status</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className={`hidden lg:grid ${TABLE_COLS} gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200`}>
          {["Data Final","Data Inicial","Cliente","Processo","Área","Tipo Prazo","Responsável","Status","Modificado por","Observações",""].map((h) => (
            <span key={h} className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-gray-300" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardList size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400 font-medium">Nenhum prazo encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rows.map((r) => {
              const sc = statusBadge(r.status);
              const df = fmtDate(r.dataFinal);
              const di = fmtDate(r.dataInicial);
              const overdue = isOverdue(r);
              const expanded = expandedId === r.id;

              return (
                <div key={r.id} className="group">
                  {/* Desktop row */}
                  <div className={`hidden lg:grid ${TABLE_COLS} gap-3 items-start px-5 py-3 hover:bg-gray-50 transition-colors`}>

                    <p className={`text-xs font-semibold tabular-nums whitespace-nowrap ${overdue ? "text-red-600" : df ? "text-gray-700" : "text-gray-300"}`}>
                      {df ?? "—"}
                    </p>

                    <p className="text-xs text-gray-500 tabular-nums whitespace-nowrap">{di ?? "—"}</p>

                    <p className="text-sm font-semibold text-gray-900 truncate leading-snug">{r.cliente}</p>

                    <p className="text-xs text-gray-500 truncate">{r.processo || "—"}</p>


                    <p className="text-xs text-gray-600 truncate">{r.tipoPrazo || "—"}</p>

                    <p className="text-xs text-gray-600 truncate">{r.responsavel || "—"}</p>

                    <div>
                      {r.status ? (
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${sc}`}>{r.status}</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>

                    {/* Data de atualização */}
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {new Date(r.updatedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-2">{r.observacoes || "—"}</p>

                    {/* Editar */}
                    <div className="flex items-start justify-end pt-0.5">
                      <button
                        onClick={() => setEditEntry(r)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Editar"
                      >
                        <Pencil size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="lg:hidden">
                    <div
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer"
                      onClick={() => setExpandedId(expanded ? null : r.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{r.cliente}</p>
                        <p className={`text-xs mt-0.5 ${overdue ? "text-red-500" : "text-gray-400"}`}>
                          {df ? `Prazo: ${df}` : "Sem data"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 mt-0.5">
                        {r.status && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${sc}`}>{r.status}</span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditEntry(r); }}
                          className="p-1 text-gray-400 hover:text-indigo-600"
                        >
                          <Pencil size={12} />
                        </button>
                        {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </div>
                    </div>
                    {expanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                        {di && <p><span className="text-gray-400 w-24 inline-block">Data inicial:</span> {di}</p>}
                        {df && <p><span className="text-gray-400 w-24 inline-block">Data final:</span> {df}</p>}
                        {r.processo && <p><span className="text-gray-400 w-24 inline-block">Processo:</span> {r.processo}</p>}
                        {r.tipoPrazo && <p><span className="text-gray-400 w-24 inline-block">Tipo:</span> {r.tipoPrazo}</p>}
                        {r.responsavel && <p><span className="text-gray-400 w-24 inline-block">Responsável:</span> {r.responsavel}</p>}
                        {r.observacoes && <p><span className="text-gray-400 w-24 inline-block">Obs:</span> {r.observacoes}</p>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editEntry && (
        <EditModal
          entry={editEntry}
          onClose={() => setEditEntry(null)}
          onSaved={fetchRows}
        />
      )}
    </div>
  );
}
