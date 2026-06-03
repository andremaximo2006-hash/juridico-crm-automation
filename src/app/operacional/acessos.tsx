"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, X, Loader2, Lock, Eye, EyeOff } from "lucide-react";

interface AcessoEntry {
  id: string;
  sistema: string;
  login: string | null;
  senha: string | null;
}

const TABLE_COLS = "grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)]";

export default function AcessosTab() {
  const [rows, setRows] = useState<AcessoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      const res = await fetch(`/api/operacional/acessos?${params}`);
      setRows(await res.json());
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { fetch_(); }, [fetch_]);

  function toggleReveal(id: string) {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 inline-block">
        <p className="text-xs text-gray-500 font-medium mb-1">Sistemas cadastrados</p>
        <p className="text-2xl font-bold text-indigo-600">{rows.length}</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por sistema ou login..."
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
          {["Sistema","Login","Senha"].map((h) => (
            <span key={h} className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-gray-300" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center">
            <Lock size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400 font-medium">Nenhum acesso cadastrado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rows.map((r) => {
              const revealed = revealedIds.has(r.id);
              return (
                <div key={r.id} className={`grid ${TABLE_COLS} gap-4 items-center px-5 py-3.5 hover:bg-gray-50 transition-colors`}>
                  <div className="flex items-center gap-2">
                    <Lock size={13} className="text-indigo-400 shrink-0" />
                    <p className="text-sm font-semibold text-gray-900">{r.sistema}</p>
                  </div>
                  <p className="text-sm text-gray-700 font-mono truncate">{r.login || <span className="text-gray-300 font-sans">—</span>}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-700 font-mono truncate">
                      {r.senha
                        ? revealed ? r.senha : "•".repeat(Math.min(r.senha.length, 12))
                        : <span className="text-gray-300 font-sans">—</span>
                      }
                    </p>
                    {r.senha && (
                      <button
                        onClick={() => toggleReveal(r.id)}
                        className="text-gray-400 hover:text-gray-700 shrink-0"
                        title={revealed ? "Ocultar senha" : "Revelar senha"}
                      >
                        {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
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
