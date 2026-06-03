"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Search, UserPlus, Upload, Phone, Mail, Briefcase,
  Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, Filter, X, Eye,
} from "lucide-react";
import ImportModal from "@/components/clientes/ImportModal";
import ClienteFormModal from "@/components/clientes/ClienteFormModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, EmptySearch, Pagination } from "@/components/ui/EmptyState";
import { KeyboardShortcuts } from "@/components/ui/KeyboardShortcuts";

interface CaseRef { id: string; title: string; status: string; }
interface Client {
  id: string; name: string; cpf: string; phone: string;
  email: string | null; profession: string | null;
  whatsappOptIn: boolean; createdAt: string; cases: CaseRef[];
}

type SortField = "name" | "createdAt" | "cases";
type SortDir = "asc" | "desc";
type CasesFilter = "all" | "with" | "without";

function formatCpf(cpf: string) {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

function SortIcon({ field, current, dir }: { field: SortField; current: SortField; dir: SortDir }) {
  if (field !== current) return <ChevronsUpDown size={13} className="text-gray-300" />;
  return dir === "asc"
    ? <ChevronUp size={13} className="text-blue-500" />
    : <ChevronDown size={13} className="text-blue-500" />;
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 50;

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showImport, setShowImport] = useState(false);
  const [editClient, setEditClient] = useState<Client | null | undefined>(undefined);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [filterCases, setFilterCases] = useState<CasesFilter>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<Client | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // debounce da busca — reseta página ao trocar query
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
      const res = await fetch(`/api/clientes?${params}`);
      const json = await res.json();
      setClients(json.data ?? []);
      setTotal(json.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQuery]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // filtros client-side apenas para casos (não envolve query de texto)
  const filtered = useMemo(() => {
    let list = [...clients];
    if (filterCases === "with") list = list.filter((c) => c.cases.length > 0);
    if (filterCases === "without") list = list.filter((c) => c.cases.length === 0);
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name, "pt-BR");
      else if (sortField === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortField === "cases") cmp = a.cases.length - b.cases.length;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [clients, filterCases, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  }

  async function handleDelete(c: Client) {
    const res = await fetch(`/api/clientes/${c.id}`, { method: "DELETE" });
    if (res.status === 204) {
      setDeleteConfirm(null);
      fetchClients();
    } else {
      const data = await res.json();
      setDeleteError(data.error ?? "Erro ao excluir");
    }
  }

  const activeFilters = filterCases !== "all" ? 1 : 0;
  const isSearching = debouncedQuery.trim().length > 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <KeyboardShortcuts onNewItem={() => setEditClient(null)} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total > 0
              ? `${total} cadastrado${total !== 1 ? "s" : ""}`
              : loading ? "Carregando..." : "Nenhum cliente"}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            <Upload size={16} /> Importar planilha
          </button>
          <button
            onClick={() => setEditClient(null)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <UserPlus size={16} /> Novo cliente
          </button>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm border rounded-lg font-medium transition-colors ${
            showFilters || activeFilters > 0
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Filter size={15} />
          Filtros
          {activeFilters > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Casos jurídicos</label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm bg-white">
              {(["all", "with", "without"] as CasesFilter[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setFilterCases(v)}
                  className={`px-3 py-2 ${filterCases === v ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  {v === "all" ? "Todos" : v === "with" ? "Com casos" : "Sem casos"}
                </button>
              ))}
            </div>
          </div>

          {activeFilters > 0 && (
            <button
              onClick={() => setFilterCases("all")}
              className="text-sm text-red-600 hover:underline ml-auto"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">
          <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-gray-900 text-left">
            Nome <SortIcon field="name" current={sortField} dir={sortDir} />
          </button>
          <span>Contato</span>
          <span>Profissão</span>
          <button onClick={() => toggleSort("cases")} className="flex items-center gap-1 hover:text-gray-900">
            Casos <SortIcon field="cases" current={sortField} dir={sortDir} />
          </button>
          <button onClick={() => toggleSort("createdAt")} className="flex items-center gap-1 hover:text-gray-900">
            Cadastro <SortIcon field="createdAt" current={sortField} dir={sortDir} />
          </button>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-50">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto_auto_auto] gap-4 px-4 py-3 items-center">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          isSearching ? (
            <EmptySearch query={debouncedQuery} onClear={() => setQuery("")} />
          ) : (
            <EmptyState
              title="Nenhum cliente cadastrado"
              description="Importe uma planilha de contatos ou cadastre o primeiro cliente manualmente."
              action={{ label: "Importar planilha", onClick: () => setShowImport(true) }}
            />
          )
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <div key={c.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-gray-50 group">
                {/* Name + CPF */}
                <div className="min-w-0">
                  <Link href={`/clientes/${c.id}`} className="flex items-center gap-2 group/name">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate group-hover/name:text-blue-600">{c.name}</p>
                      <p className="text-xs text-gray-400">{formatCpf(c.cpf)}</p>
                    </div>
                  </Link>
                </div>

                {/* Contact */}
                <div className="text-xs text-gray-500 space-y-0.5 min-w-0">
                  {c.phone && (
                    <p className="flex items-center gap-1 truncate"><Phone size={11} /> {c.phone}</p>
                  )}
                  {c.email && (
                    <p className="flex items-center gap-1 truncate"><Mail size={11} /> {c.email}</p>
                  )}
                </div>

                {/* Profession */}
                <div className="text-xs text-gray-500 truncate">
                  {c.profession
                    ? <span className="flex items-center gap-1"><Briefcase size={11} /> {c.profession}</span>
                    : <span className="text-gray-300">—</span>}
                </div>

                {/* Cases */}
                <div>
                  {c.cases.length > 0 ? (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {c.cases.length} {c.cases.length === 1 ? "caso" : "casos"}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </div>

                {/* Actions + Date */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400 mr-2 hidden lg:block">
                    {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                  <Link
                    href={`/clientes/${c.id}`}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Ver detalhes"
                  >
                    <Eye size={14} />
                  </Link>
                  <button
                    onClick={() => setEditClient(c)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => { setDeleteConfirm(c); setDeleteError(""); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {!loading && total > limit && (
          <div className="border-t border-gray-100 px-2">
            <Pagination page={page} total={total} limit={limit} onPage={setPage} />
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Excluir cliente</h3>
            <p className="text-sm text-gray-500 mb-4">
              Tem certeza que deseja excluir <strong>{deleteConfirm.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            {deleteError && <p className="text-sm text-red-600 mb-3">{deleteError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
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

      {showImport && (
        <ImportModal onClose={() => setShowImport(false)} onSuccess={fetchClients} />
      )}

      {editClient !== undefined && (
        <ClienteFormModal
          client={editClient}
          onClose={() => setEditClient(undefined)}
          onSaved={fetchClients}
        />
      )}
    </div>
  );
}
