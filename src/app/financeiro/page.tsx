"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { formatCurrency, formatDate, TRANSACTION_CATEGORIES } from "@/lib/utils";
import { Plus, TrendingUp, TrendingDown, DollarSign, CheckCircle, ChevronUp, ChevronDown, ChevronsUpDown, Filter, Download, X } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, Pagination } from "@/components/ui/EmptyState";

interface Transaction {
  id: string;
  type: string;
  category: string;
  description: string | null;
  amount: string;
  dueDate: string;
  paidDate: string | null;
  status: string;
  installmentNumber: number | null;
  totalInstallments: number | null;
  client: { name: string } | null;
}

interface Summary {
  totalIncome: number;
  totalExpense: number;
  totalOverdue: number;
}

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  overdue: "bg-red-100 text-red-700",
  installment: "bg-blue-100 text-blue-700",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Atrasado",
  installment: "Parcelado",
};

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;
  const [sortField, setSortField] = useState<"dueDate" | "amount" | "status" | "client">("dueDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<"all" | "month" | "quarter" | "year">("all");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTx, setNewTx] = useState({
    type: "income",
    category: "pro_labore_entry",
    description: "",
    amount: "",
    dueDate: "",
    status: "pending",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filter !== "all")   params.set("type", filter);
    if (filterPeriod !== "all") params.set("period", filterPeriod);
    if (filterCategory)     params.set("category", filterCategory);
    if (filterStatus)       params.set("status", filterStatus);
    const res = await fetch(`/api/financeiro?${params}`);
    const data = await res.json();
    setTransactions(data.transactions ?? []);
    setSummary(data.summary ?? null);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [filter, filterPeriod, filterCategory, filterStatus, page]);

  useEffect(() => { load(); }, [load]);

  // reset page when filters change
  useEffect(() => { setPage(1); }, [filter, filterPeriod, filterCategory, filterStatus]);

  const activeFilters = [filterPeriod !== "all" ? 1 : 0, filterCategory ? 1 : 0, filterStatus ? 1 : 0].reduce((a, b) => a + b, 0);

  function exportCSV() {
    const header = ["Status", "Vencimento", "Cliente", "Descrição", "Categoria", "Tipo", "Valor"];
    const rows = sorted.map((tx) => [
      STATUS_LABELS[tx.status] ?? tx.status,
      new Date(tx.dueDate).toLocaleDateString("pt-BR"),
      tx.client?.name ?? "",
      tx.description ?? "",
      TRANSACTION_CATEGORIES[tx.category as keyof typeof TRANSACTION_CATEGORIES] ?? tx.category,
      tx.type === "income" ? "Receita" : "Despesa",
      (tx.type === "expense" ? "-" : "") + Number(tx.amount).toFixed(2).replace(".", ","),
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financeiro_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  }

  const sorted = useMemo(() => {
    return [...transactions].sort((a, b) => {
      let cmp = 0;
      if (sortField === "dueDate") cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      else if (sortField === "amount") cmp = Number(a.amount) - Number(b.amount);
      else if (sortField === "status") cmp = a.status.localeCompare(b.status);
      else if (sortField === "client") cmp = (a.client?.name ?? a.description ?? "").localeCompare(b.client?.name ?? b.description ?? "", "pt-BR");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [transactions, sortField, sortDir]);

  async function markAsPaid(id: string) {
    await fetch(`/api/financeiro/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", paidDate: new Date().toISOString() }),
    });
    load();
  }

  async function createTransaction(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/financeiro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTx, amount: parseFloat(newTx.amount) }),
    });
    setShowNewModal(false);
    setNewTx({ type: "income", category: "pro_labore_entry", description: "", amount: "", dueDate: "", status: "pending" });
    load();
  }

  const incomeCategories = ["pro_labore_entry", "monthly_retainer", "success_fee", "other_income"];
  const expenseCategories = ["office_rent", "software", "marketing", "personnel", "utilities", "other_expense"];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Financeiro"
        subtitle="Controle de receitas, despesas e fluxo de caixa"
        action={
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Lançamento
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-slate-500">Receitas</span>
              </div>
              <p className="text-xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-xs text-slate-500">Despesas</span>
              </div>
              <p className="text-xl font-bold text-red-600">{formatCurrency(summary.totalExpense)}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-500">Líquido</span>
              </div>
              <p className={`text-xl font-bold ${summary.totalIncome - summary.totalExpense >= 0 ? "text-slate-900" : "text-red-600"}`}>
                {formatCurrency(summary.totalIncome - summary.totalExpense)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-slate-500">Em Atraso</span>
              </div>
              <p className="text-xl font-bold text-red-600">{formatCurrency(summary.totalOverdue)}</p>
            </div>
          </div>
        )}

        {/* Barra de filtros */}
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "income", "expense"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f === "all" ? "Todos" : f === "income" ? "Receitas" : "Despesas"}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg font-medium transition-colors ${
                showFilters || activeFilters > 0
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Filter size={14} />
              Filtros
              {activeFilters > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">{activeFilters}</span>
              )}
            </button>
            <button
              onClick={exportCSV}
              disabled={sorted.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={14} /> CSV
            </button>
          </div>
        </div>

        {/* Painel de filtros avançados */}
        {showFilters && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Período</label>
              <div className="flex rounded-lg border border-slate-300 overflow-hidden text-sm bg-white">
                {([
                  { v: "all",     l: "Todos" },
                  { v: "month",   l: "Este mês" },
                  { v: "quarter", l: "Trimestre" },
                  { v: "year",    l: "Este ano" },
                ] as { v: typeof filterPeriod; l: string }[]).map(({ v, l }) => (
                  <button
                    key={v}
                    onClick={() => setFilterPeriod(v)}
                    className={`px-3 py-2 ${filterPeriod === v ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Categoria</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
              >
                <option value="">Todas</option>
                {Object.entries(TRANSACTION_CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="paid">Pago</option>
                <option value="pending">Pendente</option>
                <option value="overdue">Atrasado</option>
                <option value="installment">Parcelado</option>
              </select>
            </div>

            {activeFilters > 0 && (
              <button
                onClick={() => { setFilterPeriod("all"); setFilterCategory(""); setFilterStatus(""); }}
                className="flex items-center gap-1 text-sm text-red-600 hover:underline ml-auto"
              >
                <X size={13} /> Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {([
                  { key: "status",  label: "Status",     align: "left"  },
                  { key: "dueDate", label: "Vencimento", align: "left"  },
                  { key: "client",  label: "Cliente",    align: "left"  },
                  { key: null,      label: "Descrição",  align: "left"  },
                  { key: null,      label: "Categoria",  align: "left"  },
                  { key: "amount",  label: "Valor",      align: "right" },
                  { key: null,      label: "Ações",      align: "right" },
                ] as { key: typeof sortField | null; label: string; align: string }[]).map(({ key, label, align }) => (
                  <th key={label} className={`px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide text-${align}`}>
                    {key ? (
                      <button
                        onClick={() => toggleSort(key)}
                        className="inline-flex items-center gap-1 hover:text-slate-800 transition-colors"
                      >
                        {label}
                        {sortField === key
                          ? sortDir === "asc"
                            ? <ChevronUp size={12} className="text-blue-500" />
                            : <ChevronDown size={12} className="text-blue-500" />
                          : <ChevronsUpDown size={12} className="text-slate-300" />}
                      </button>
                    ) : label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
                  <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                </tr>
              ))}
              {!loading && transactions.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="Nenhum lançamento encontrado"
                      description="Registre receitas e despesas para acompanhar o fluxo de caixa do escritório."
                      action={{ label: "Novo Lançamento", onClick: () => setShowNewModal(true) }}
                    />
                  </td>
                </tr>
              )}
              {sorted.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[tx.status]}`}>
                      {STATUS_LABELS[tx.status]}
                    </span>
                  </td>
                  {/* Vencimento */}
                  <td className="px-4 py-3 text-slate-600 text-sm whitespace-nowrap">{formatDate(tx.dueDate)}</td>
                  {/* Cliente */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 truncate max-w-[160px]">
                      {tx.client?.name ?? <span className="text-slate-400">—</span>}
                    </p>
                    {tx.installmentNumber && tx.totalInstallments && (
                      <span className="inline-block mt-0.5 text-xs bg-blue-50 text-blue-600 font-semibold px-1.5 py-0.5 rounded">
                        {tx.installmentNumber}/{tx.totalInstallments}
                      </span>
                    )}
                  </td>
                  {/* Descrição */}
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-600 truncate max-w-[200px]">
                      {tx.description ?? <span className="text-slate-300">—</span>}
                    </p>
                  </td>
                  {/* Categoria */}
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {TRANSACTION_CATEGORIES[tx.category as keyof typeof TRANSACTION_CATEGORIES] ?? tx.category}
                  </td>
                  {/* Valor */}
                  <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "expense" ? "- " : ""}{formatCurrency(tx.amount)}
                  </td>
                  {/* Ações */}
                  <td className="px-4 py-3 text-right">
                    {tx.status !== "paid" && tx.type === "income" && (
                      <button
                        onClick={() => markAsPaid(tx.id)}
                        className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium whitespace-nowrap"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Marcar Pago
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && total > limit && (
            <div className="border-t border-slate-100 px-2">
              <Pagination page={page} total={total} limit={limit} onPage={setPage} />
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Lançamento */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Novo Lançamento</h2>
              <button onClick={() => setShowNewModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                ✕
              </button>
            </div>
            <form onSubmit={createTransaction} className="px-6 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
                  <select
                    value={newTx.type}
                    onChange={(e) => setNewTx({ ...newTx, type: e.target.value, category: e.target.value === "income" ? "pro_labore_entry" : "office_rent" })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Categoria</label>
                  <select
                    value={newTx.category}
                    onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {(newTx.type === "income" ? incomeCategories : expenseCategories).map((c) => (
                      <option key={c} value={c}>
                        {TRANSACTION_CATEGORIES[c as keyof typeof TRANSACTION_CATEGORIES]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Descrição</label>
                <input
                  value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  placeholder="Ex: Honorários João Silva"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Valor (R$) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Vencimento *</label>
                  <input
                    required
                    type="date"
                    value={newTx.dueDate}
                    onChange={(e) => setNewTx({ ...newTx, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={newTx.status}
                  onChange={(e) => setNewTx({ ...newTx, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="installment">Parcelado</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
