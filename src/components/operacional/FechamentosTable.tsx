"use client";

import { ChevronUp, ChevronDown, Pencil, Trash2, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, EmptySearch, Pagination } from "@/components/ui/EmptyState";

export interface Entry {
  id: string;
  dataEntrada: string;
  cliente: string;
  contato: string | null;
  natureza: string;
  areaAtuacao: string | null;
  beneficioDemanda: string | null;
  setor: string | null;
  cadSenha: string | null;
  statusAtual: string | null;
  honorarios?: number | null;
}

interface FechamentosTableProps {
  entries: Entry[];
  loading: boolean;
  isAdmin?: boolean;
  sortField: "dataEntrada" | "cliente";
  sortDir: "asc" | "desc";
  toggleSort: (f: "dataEntrada" | "cliente") => void;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  onEdit: (e: Entry) => void;
  onDelete: (e: Entry) => void;
  query: string;
  onClearQuery: () => void;
  onImport: () => void;
  total: number;
  limit: number;
  page: number;
  onPage: (p: number) => void;
}

const TABLE_COLS = "grid-cols-[90px_80px_minmax(0,2fr)_minmax(0,1.5fr)_110px_90px_minmax(0,2fr)_64px]";
const TABLE_COLS_ADMIN = "grid-cols-[90px_80px_minmax(0,2fr)_minmax(0,1.5fr)_110px_90px_minmax(0,2fr)_90px_64px]";

function naturezaBadge(v: string) {
  const isOrg = v.toUpperCase().includes("ORG");
  return isOrg
    ? { bg: "bg-teal-100", text: "text-teal-700" }
    : { bg: "bg-blue-100", text: "text-blue-700" };
}

function cadSenhaBadge(v: string | null) {
  if (!v || v === "-") return { bg: "bg-gray-100", text: "text-gray-400" };
  if (v.toUpperCase() === "OK") return { bg: "bg-green-100", text: "text-green-700" };
  if (v.toUpperCase() === "PENDENTE") return { bg: "bg-amber-100", text: "text-amber-700" };
  return { bg: "bg-gray-100", text: "text-gray-500" };
}

function SortIcon({ f, sortField, sortDir }: { f: "dataEntrada" | "cliente"; sortField: string; sortDir: string }) {
  if (sortField !== f) return <ChevronDown size={11} className="text-gray-300" />;
  return sortDir === "asc"
    ? <ChevronUp size={11} className="text-indigo-500" />
    : <ChevronDown size={11} className="text-indigo-500" />;
}

export default function FechamentosTable({
  entries,
  loading,
  sortField,
  sortDir,
  toggleSort,
  expandedId,
  setExpandedId,
  onEdit,
  onDelete,
  query,
  onClearQuery,
  onImport,
  total,
  limit,
  page,
  onPage,
  isAdmin = false,
}: FechamentosTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Cabeçalho */}
      <div className={`hidden lg:grid ${isAdmin ? TABLE_COLS_ADMIN : TABLE_COLS} gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200`}>
        <button
          onClick={() => toggleSort("dataEntrada")}
          className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-800 whitespace-nowrap"
        >
          Entrada <SortIcon f="dataEntrada" sortField={sortField} sortDir={sortDir} />
        </button>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Natureza</span>
        <button
          onClick={() => toggleSort("cliente")}
          className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-800"
        >
          Cliente <SortIcon f="cliente" sortField={sortField} sortDir={sortDir} />
        </button>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Área / Demanda</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Setor</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cad/Senha</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status atual</span>
        {isAdmin && <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Honorários</span>}
        <span />
      </div>

      {/* Corpo */}
      {loading ? (
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={`hidden lg:grid ${isAdmin ? TABLE_COLS_ADMIN : TABLE_COLS} gap-4 items-center px-5 py-3`}>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-14 rounded" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        query.trim() ? (
          <EmptySearch query={query} onClear={onClearQuery} />
        ) : (
          <EmptyState
            title="Nenhum registro encontrado"
            description="Importe uma planilha ou cadastre o primeiro registro operacional manualmente."
            action={{ label: "Importar planilha", onClick: onImport }}
          />
        )
      ) : (
        <div className="divide-y divide-gray-100">
          {entries.map((e) => {
            const nb = naturezaBadge(e.natureza);
            const csb = cadSenhaBadge(e.cadSenha);
            const expanded = expandedId === e.id;

            return (
              <div key={e.id} className="group">
                {/* ── Linha desktop ── */}
                <div className={`hidden lg:grid ${isAdmin ? TABLE_COLS_ADMIN : TABLE_COLS} gap-4 items-center px-5 py-3 hover:bg-gray-50 transition-colors`}>
                  <p className="text-xs font-medium text-gray-700 tabular-nums whitespace-nowrap">
                    {new Date(e.dataEntrada).toLocaleDateString("pt-BR")}
                  </p>
                  <div>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded font-semibold ${nb.bg} ${nb.text}`}>
                      {e.natureza}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate leading-snug">{e.cliente}</p>
                    {e.contato && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                        <Phone size={10} className="shrink-0" /> {e.contato}
                      </p>
                    )}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    {e.beneficioDemanda && (
                      <p className="text-xs text-gray-400 truncate">{e.beneficioDemanda}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate">{e.setor || <span className="text-gray-300">—</span>}</p>
                  <div>
                    {e.cadSenha && e.cadSenha !== "-" ? (
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${csb.bg} ${csb.text}`}>
                        {e.cadSenha}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {e.statusAtual || <span className="text-gray-300">—</span>}
                  </p>
                  {isAdmin && (
                    <p className="text-xs font-semibold text-emerald-700">
                      {e.honorarios
                        ? Number(e.honorarios).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                        : <span className="text-gray-300 font-normal">—</span>}
                    </p>
                  )}
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(e)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      title="Editar"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onDelete(e)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Excluir"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* ── Card mobile ── */}
                <div className="lg:hidden">
                  <div
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer"
                    onClick={() => setExpandedId(expanded ? null : e.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{e.cliente}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(e.dataEntrada).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${nb.bg} ${nb.text}`}>{e.natureza}</span>
                      {expanded
                        ? <ChevronUp size={14} className="text-gray-400" />
                        : <ChevronDown size={14} className="text-gray-400" />}
                    </div>
                  </div>
                  {expanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                      {e.contato          && <p><span className="text-gray-400 w-20 inline-block">Contato:</span> {e.contato}</p>}
                      {e.beneficioDemanda && <p><span className="text-gray-400 w-20 inline-block">Demanda:</span> {e.beneficioDemanda}</p>}
                      {e.setor            && <p><span className="text-gray-400 w-20 inline-block">Setor:</span> {e.setor}</p>}
                      {e.cadSenha         && <p><span className="text-gray-400 w-20 inline-block">Cad/Senha:</span> {e.cadSenha}</p>}
                      {e.statusAtual      && <p><span className="text-gray-400 w-20 inline-block">Status:</span> {e.statusAtual}</p>}
                      <div className="flex gap-3 pt-1">
                        <button onClick={() => onEdit(e)} className="flex items-center gap-1 text-indigo-600 hover:underline">
                          <Pencil size={11} /> Editar
                        </button>
                        <button onClick={() => onDelete(e)} className="flex items-center gap-1 text-red-600 hover:underline">
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

      {!loading && total > limit && (
        <div className="border-t border-gray-100 px-2">
          <Pagination page={page} total={total} limit={limit} onPage={onPage} />
        </div>
      )}
    </div>
  );
}
