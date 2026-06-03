"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Phone, Mail, Briefcase, MessageCircle, Pencil,
  Plus, ChevronRight, Loader2, X, CheckCircle2, Clock, XCircle, AlertTriangle,
  UserPlus, FolderOpen, DollarSign, FolderCheck,
} from "lucide-react";
import ClienteFormModal from "@/components/clientes/ClienteFormModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CaseRef {
  id: string;
  title: string;
  legalArea: string | null;
  description: string | null;
  status: "active" | "suspended" | "closed_won" | "closed_lost";
  createdAt: string;
  transactions: TxRef[];
  feeAgreements: FeeRef[];
}

interface TxRef {
  id: string;
  amount: string;
  status: "pending" | "paid" | "overdue" | "installment";
  dueDate: string;
  type: "income" | "expense";
}

interface FeeRef {
  id: string;
  type: string;
  amount: string | null;
  totalInstallments: number;
}

interface ClientDetail {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string | null;
  profession: string | null;
  whatsappOptIn: boolean;
  createdAt: string;
  astreaClientId: string | null;
  leadId: string | null;
  cases: { id: string; title: string; status: string }[];
}

type Tab = "casos" | "financeiro" | "historico";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const LEGAL_AREA_LABELS: Record<string, string> = {
  familia: "Família",
  trabalhista: "Trabalhista",
  civil: "Civil",
  criminal: "Criminal",
  consumidor: "Consumidor",
  inventario: "Inventário",
  previdenciario: "Previdenciário",
  other: "Outro",
};

const LEGAL_AREAS = Object.entries(LEGAL_AREA_LABELS);

const CASE_STATUS_CONFIG = {
  active: { label: "Ativo", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  suspended: { label: "Suspenso", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  closed_won: { label: "Encerrado (Ganho)", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  closed_lost: { label: "Encerrado (Perdido)", icon: XCircle, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
};

const TX_STATUS_CONFIG = {
  pending: { label: "Pendente", color: "text-amber-700", bg: "bg-amber-50" },
  paid: { label: "Pago", color: "text-green-700", bg: "bg-green-50" },
  overdue: { label: "Vencido", color: "text-red-700", bg: "bg-red-50" },
  installment: { label: "Parcelado", color: "text-blue-700", bg: "bg-blue-50" },
};

const FEE_TYPE_LABELS: Record<string, string> = {
  pro_labore_entry: "Entrada (Pro Labore)",
  monthly_retainer: "Mensalidade",
  success_fee: "Honorário de Êxito",
};

function formatCpf(cpf: string) {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatBrl(v: string | number) {
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── New Case Modal ───────────────────────────────────────────────────────────

function NewCaseModal({ clientId, onClose, onCreated }: { clientId: string; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: "", legalArea: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Título obrigatório"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/clientes/${clientId}/cases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao criar caso"); return; }
      onCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Novo caso jurídico</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Título *</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Ação trabalhista — rescisão indireta"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Área do direito</label>
            <select
              value={form.legalArea}
              onChange={(e) => setForm((f) => ({ ...f, legalArea: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              {LEGAL_AREAS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Resumo do caso..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Criando...</> : "Criar caso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClienteDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [cases, setCases] = useState<CaseRef[]>([]);
  const [loadingClient, setLoadingClient] = useState(true);
  const [loadingCases, setLoadingCases] = useState(true);
  const [tab, setTab] = useState<Tab>("casos");
  const [showEditClient, setShowEditClient] = useState(false);
  const [showNewCase, setShowNewCase] = useState(false);

  const fetchClient = useCallback(async () => {
    const res = await fetch(`/api/clientes/${id}`);
    if (res.status === 404) { router.push("/clientes"); return; }
    setClient(await res.json());
    setLoadingClient(false);
  }, [id, router]);

  const fetchCases = useCallback(async () => {
    setLoadingCases(true);
    const res = await fetch(`/api/clientes/${id}/cases`);
    setCases(await res.json());
    setLoadingCases(false);
  }, [id]);

  useEffect(() => { fetchClient(); fetchCases(); }, [fetchClient, fetchCases]);

  // Sum financial data from cases
  const allTransactions = cases.flatMap((c) => c.transactions.map((t) => ({ ...t, caseTitle: c.title })));
  const totalReceita = allTransactions.filter((t) => t.type === "income" && t.status === "paid").reduce((s, t) => s + Number(t.amount), 0);
  const totalPendente = allTransactions.filter((t) => t.type === "income" && t.status === "pending").reduce((s, t) => s + Number(t.amount), 0);
  const totalVencido = allTransactions.filter((t) => t.type === "income" && t.status === "overdue").reduce((s, t) => s + Number(t.amount), 0);

  if (loadingClient) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 size={20} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!client) return null;

  const caseStatusCounts = {
    active: cases.filter((c) => c.status === "active").length,
    other: cases.filter((c) => c.status !== "active").length,
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back nav */}
      <Link href="/clientes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft size={15} /> Clientes
      </Link>

      {/* Client header card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl shrink-0">
            {client.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
                <p className="text-sm text-gray-400 mt-0.5">CPF: {formatCpf(client.cpf)}</p>
              </div>
              <button
                onClick={() => setShowEditClient(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <Pencil size={13} /> Editar
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
              {client.phone && (
                <a href={`https://wa.me/55${client.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-green-600">
                  {client.whatsappOptIn
                    ? <MessageCircle size={14} className="text-green-500" />
                    : <Phone size={14} />}
                  {client.phone}
                </a>
              )}
              {client.email && (
                <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 hover:text-blue-600">
                  <Mail size={14} /> {client.email}
                </a>
              )}
              {client.profession && (
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Briefcase size={14} /> {client.profession}
                </span>
              )}
            </div>

            {/* Stats row */}
            <div className="mt-4 flex gap-4 flex-wrap">
              <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{cases.length}</p>
                <p className="text-xs text-gray-400">casos</p>
              </div>
              <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                <p className="text-lg font-bold text-green-700">{formatBrl(totalReceita)}</p>
                <p className="text-xs text-gray-400">recebido</p>
              </div>
              {totalVencido > 0 && (
                <div className="text-center px-4 py-2 bg-red-50 rounded-lg">
                  <p className="text-lg font-bold text-red-600">{formatBrl(totalVencido)}</p>
                  <p className="text-xs text-gray-400">vencido</p>
                </div>
              )}
              {totalPendente > 0 && (
                <div className="text-center px-4 py-2 bg-amber-50 rounded-lg">
                  <p className="text-lg font-bold text-amber-600">{formatBrl(totalPendente)}</p>
                  <p className="text-xs text-gray-400">a receber</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {([
          { key: "casos",      label: `Casos (${cases.length})` },
          { key: "financeiro", label: "Financeiro" },
          { key: "historico",  label: "Histórico" },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Casos tab ── */}
      {tab === "casos" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {caseStatusCounts.active > 0 && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  {caseStatusCounts.active} ativo{caseStatusCounts.active > 1 ? "s" : ""}
                </span>
              )}
              {caseStatusCounts.other > 0 && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                  {caseStatusCounts.other} encerrado{caseStatusCounts.other > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowNewCase(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={14} /> Novo caso
            </button>
          </div>

          {loadingCases ? (
            <div className="py-8 flex justify-center"><Loader2 size={18} className="animate-spin text-gray-300" /></div>
          ) : cases.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
              <p className="text-gray-400 text-sm">Nenhum caso cadastrado</p>
              <button onClick={() => setShowNewCase(true)} className="mt-2 text-sm text-blue-600 hover:underline">
                Criar primeiro caso
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cases.map((c) => {
                const cfg = CASE_STATUS_CONFIG[c.status];
                const Icon = cfg.icon;
                const paidSum = c.transactions.filter((t) => t.status === "paid" && t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
                const overdueSum = c.transactions.filter((t) => t.status === "overdue" && t.type === "income").reduce((s, t) => s + Number(t.amount), 0);

                return (
                  <div key={c.id} className={`bg-white rounded-xl border ${cfg.border} p-4`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-7 h-7 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                        <Icon size={14} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{c.title}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg.bg} ${cfg.color}`}>
                                {cfg.label}
                              </span>
                              {c.legalArea && (
                                <span className="text-xs text-gray-400">
                                  {LEGAL_AREA_LABELS[c.legalArea] ?? c.legalArea}
                                </span>
                              )}
                              <span className="text-xs text-gray-300">
                                {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-gray-300 shrink-0 mt-0.5" />
                        </div>

                        {c.description && (
                          <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-2">{c.description}</p>
                        )}

                        {/* Fee agreements summary */}
                        {c.feeAgreements.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {c.feeAgreements.map((f) => (
                              <span key={f.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                {FEE_TYPE_LABELS[f.type] ?? f.type}
                                {f.amount ? ` — ${formatBrl(f.amount)}` : ""}
                                {f.totalInstallments > 1 ? ` (${f.totalInstallments}x)` : ""}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Financial summary for this case */}
                        {c.transactions.length > 0 && (
                          <div className="mt-2 flex gap-3 text-xs text-gray-500">
                            {paidSum > 0 && <span className="text-green-600 font-medium">{formatBrl(paidSum)} recebido</span>}
                            {overdueSum > 0 && <span className="text-red-600 font-medium flex items-center gap-0.5"><AlertTriangle size={10} /> {formatBrl(overdueSum)} vencido</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Financeiro tab ── */}
      {tab === "financeiro" && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Recebido</p>
              <p className="text-xl font-bold text-green-700">{formatBrl(totalReceita)}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">A receber</p>
              <p className="text-xl font-bold text-amber-600">{formatBrl(totalPendente)}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Vencido</p>
              <p className="text-xl font-bold text-red-600">{formatBrl(totalVencido)}</p>
            </div>
          </div>

          {/* Transactions list */}
          {allTransactions.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
              <p className="text-gray-400 text-sm">Nenhum lançamento financeiro</p>
              <p className="text-xs text-gray-300 mt-1">Os lançamentos aparecem automaticamente ao criar acordos de honorários nos casos</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 text-xs font-medium text-gray-500 grid grid-cols-[1fr_auto_auto_auto] gap-4">
                <span>Descrição / Caso</span>
                <span>Vencimento</span>
                <span>Valor</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-gray-50">
                {allTransactions
                  .filter((t) => t.type === "income")
                  .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                  .map((t) => {
                    const st = TX_STATUS_CONFIG[t.status];
                    return (
                      <div key={t.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3">
                        <p className="text-sm text-gray-700 truncate">{t.caseTitle}</p>
                        <p className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(t.dueDate).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-sm font-medium text-gray-900 whitespace-nowrap">{formatBrl(t.amount)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${st.bg} ${st.color}`}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Histórico tab ── */}
      {tab === "historico" && (() => {
        // Monta timeline a partir dos dados já carregados
        type TLEvent = { date: string; label: string; sub?: string; icon: React.ReactNode; color: string };
        const events: TLEvent[] = [];

        // Cliente cadastrado
        events.push({
          date: client.createdAt,
          label: "Cliente cadastrado",
          icon: <UserPlus size={14} />,
          color: "bg-blue-100 text-blue-600",
        });

        // Casos
        cases.forEach((c) => {
          events.push({
            date: c.createdAt,
            label: `Caso aberto: ${c.title}`,
            sub: c.legalArea ? LEGAL_AREA_LABELS[c.legalArea] : undefined,
            icon: <FolderOpen size={14} />,
            color: "bg-indigo-100 text-indigo-600",
          });

          if (c.status === "closed_won" || c.status === "closed_lost") {
            events.push({
              date: c.createdAt, // melhor aproximação disponível sem stageUpdatedAt no caso
              label: `Caso encerrado: ${c.title}`,
              sub: c.status === "closed_won" ? "Encerrado com êxito" : "Encerrado sem êxito",
              icon: <FolderCheck size={14} />,
              color: c.status === "closed_won" ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500",
            });
          }

          // Transações pagas
          c.transactions
            .filter((t) => t.status === "paid" && t.type === "income")
            .forEach((t) => {
              events.push({
                date: t.dueDate,
                label: `Pagamento recebido — ${formatBrl(t.amount)}`,
                sub: c.title,
                icon: <DollarSign size={14} />,
                color: "bg-green-100 text-green-600",
              });
            });

          // Transações vencidas
          c.transactions
            .filter((t) => t.status === "overdue" && t.type === "income")
            .forEach((t) => {
              events.push({
                date: t.dueDate,
                label: `Pagamento vencido — ${formatBrl(t.amount)}`,
                sub: c.title,
                icon: <AlertTriangle size={14} />,
                color: "bg-red-100 text-red-600",
              });
            });
        });

        events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return (
          <div className="relative pl-6">
            <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gray-100" />
            <div className="space-y-4">
              {events.map((ev, i) => (
                <div key={i} className="relative flex gap-3 items-start">
                  <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${ev.color}`}>
                    {ev.icon}
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <p className="text-sm font-medium text-gray-900">{ev.label}</p>
                    {ev.sub && <p className="text-xs text-gray-400 mt-0.5">{ev.sub}</p>}
                    <p className="text-xs text-gray-300 mt-0.5">
                      {new Date(ev.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-sm text-gray-400 py-4">Nenhum evento registrado</p>
              )}
            </div>
          </div>
        );
      })()}

      {/* Modals */}
      {showEditClient && (
        <ClienteFormModal
          client={{
            id: client.id,
            name: client.name,
            cpf: client.cpf,
            phone: client.phone,
            email: client.email,
            profession: client.profession,
            whatsappOptIn: client.whatsappOptIn,
          }}
          onClose={() => setShowEditClient(false)}
          onSaved={fetchClient}
        />
      )}

      {showNewCase && (
        <NewCaseModal
          clientId={client.id}
          onClose={() => setShowNewCase(false)}
          onCreated={fetchCases}
        />
      )}
    </div>
  );
}
