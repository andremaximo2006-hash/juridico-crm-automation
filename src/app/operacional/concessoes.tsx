"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, X, Loader2, Award, ChevronDown, ChevronUp } from "lucide-react";

interface ConcessaoEntry {
  id: string;
  data: string | null;
  cliente: string;
  beneficio: string | null;
  dataRecebimento: string | null;
  valorHonorarios: string | null;
  boletos: string | null;
}

function fmtDate(v: string | null) {
  if (!v) return null;
  return new Date(v).toLocaleDateString("pt-BR");
}

const TABLE_COLS = "grid-cols-[100px_minmax(0,2.5fr)_minmax(0,2fr)_120px_minmax(0,1.5fr)_minmax(0,1.5fr)]";

export default function ConcoesTab() {
  const [rows, setRows] = useState<ConcessaoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      const res = await fetch(`/api/operacional/concessoes?${params}`);
      setRows(await res.json());
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Total de concessões</p>
          <p className="text-2xl font-bold text-indigo-600">{rows.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Com honorários registrados</p>
          <p className="text-2xl font-bold text-green-600">
            {rows.filter((r) => r.valorHonorarios).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por cliente, benefício ou honorários..."
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className={`hidden lg:grid ${TABLE_COLS} gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200`}>
          {["Data","Cliente","Benefício","Data Recebimento","Valor Honorários","Boletos"].map((h) => (
            <span key={h} className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-gray-300" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center">
            <Award size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400 font-medium">Nenhuma concessão encontrada</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rows.map((r) => {
              const dt = fmtDate(r.data);
              const dr = fmtDate(r.dataRecebimento);
              const expanded = expandedId === r.id;

              return (
                <div key={r.id} className="group">
                  {/* Desktop row */}
                  <div className={`hidden lg:grid ${TABLE_COLS} gap-4 items-center px-5 py-3 hover:bg-gray-50 transition-colors`}>
                    <p className="text-xs font-medium text-gray-600 tabular-nums whitespace-nowrap">{dt ?? "—"}</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{r.cliente}</p>
                    <p className="text-xs text-gray-600 truncate">{r.beneficio || "—"}</p>
                    <p className="text-xs text-gray-600 tabular-nums whitespace-nowrap">{dr ?? "—"}</p>
                    <p className="text-xs font-semibold text-green-700 truncate">{r.valorHonorarios || "—"}</p>
                    <p className="text-xs text-gray-500 truncate">{r.boletos || "—"}</p>
                  </div>

                  {/* Mobile card */}
                  <div className="lg:hidden">
                    <div
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer"
                      onClick={() => setExpandedId(expanded ? null : r.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{r.cliente}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {dt ?? "Sem data"}
                          {r.beneficio && ` · ${r.beneficio}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {r.valorHonorarios && (
                          <span className="text-xs font-semibold text-green-700">{r.valorHonorarios}</span>
                        )}
                        {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </div>
                    </div>
                    {expanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                        {dr && <p><span className="text-gray-400 w-28 inline-block">Data recebimento:</span> {dr}</p>}
                        {r.beneficio && <p><span className="text-gray-400 w-28 inline-block">Benefício:</span> {r.beneficio}</p>}
                        {r.valorHonorarios && <p><span className="text-gray-400 w-28 inline-block">Honorários:</span> {r.valorHonorarios}</p>}
                        {r.boletos && <p><span className="text-gray-400 w-28 inline-block">Boletos:</span> {r.boletos}</p>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
