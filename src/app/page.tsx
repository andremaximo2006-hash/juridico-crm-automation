import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, Users, AlertTriangle, ArrowRight, UserCheck, Target } from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const in3Days = new Date(today);
  in3Days.setDate(today.getDate() + 3);

  const [
    monthlyRevenue,
    activeLeads,
    overdueTransactions,
    upcomingTransactions,
    recentLeads,
    totalClients,
    leadsByStage,
    leadsByChannel,
    metaSetting,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: { type: "income", status: "paid", paidDate: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.lead.count({
      where: { funnelStage: { notIn: ["lost", "migrated_to_astrea"] } },
    }),
    prisma.transaction.findMany({
      where: { status: "overdue", type: "income" },
      include: { client: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.transaction.findMany({
      where: { status: "pending", type: "income", dueDate: { lte: in3Days, gte: today } },
      include: { client: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.client.count(),
    prisma.lead.groupBy({
      by: ["funnelStage"],
      where: { funnelStage: { notIn: ["lost", "migrated_to_astrea"] } },
      _count: true,
    }),
    prisma.lead.groupBy({
      by: ["originChannel"],
      where: { funnelStage: { notIn: ["lost", "migrated_to_astrea"] } },
      _count: true,
    }),
    prisma.appSetting.findUnique({ where: { key: "meta_mensal" } }),
  ]);

  const monthlyTarget = metaSetting ? Number(metaSetting.value) : 10000;
  const revenue = Number(monthlyRevenue._sum.amount ?? 0);

  return {
    monthlyRevenue: revenue,
    monthlyTarget,
    activeLeads,
    totalClients,
    overdueTransactions,
    upcomingTransactions,
    recentLeads,
    leadsByStage,
    leadsByChannel,
  };
}

// ─── Labels / cores ───────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  new_lead: "Novo Lead",
  initial_screening: "Triagem",
  meeting: "Reunião",
  proposal_sent: "Proposta",
  contract_signed: "Contrato",
};

const STAGE_COLORS: Record<string, string> = {
  new_lead: "bg-slate-100 text-slate-600",
  initial_screening: "bg-blue-100 text-blue-700",
  meeting: "bg-yellow-100 text-yellow-700",
  proposal_sent: "bg-orange-100 text-orange-700",
  contract_signed: "bg-green-100 text-green-700",
  migrated_to_astrea: "bg-purple-100 text-purple-700",
  lost: "bg-red-100 text-red-600",
};

const STAGE_BAR_COLORS: Record<string, string> = {
  new_lead: "bg-slate-400",
  initial_screening: "bg-blue-500",
  meeting: "bg-yellow-400",
  proposal_sent: "bg-orange-500",
  contract_signed: "bg-green-500",
};

const CHANNEL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  google: "Google",
  referral: "Indicação",
  direct: "Direto",
  other: "Outro",
};

const CHANNEL_BAR_COLORS: Record<string, string> = {
  instagram: "bg-pink-500",
  google: "bg-blue-500",
  referral: "bg-green-500",
  direct: "bg-indigo-500",
  other: "bg-slate-400",
};

// ─── Componentes de gráfico CSS ───────────────────────────────────────────────

function BarChart({
  items,
  labelMap,
  colorMap,
  total,
}: {
  items: { key: string; count: number }[];
  labelMap: Record<string, string>;
  colorMap: Record<string, string>;
  total: number;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400 py-4 text-center">Sem dados</p>;
  }
  return (
    <div className="space-y-3">
      {items.map(({ key, count }) => {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600 font-medium">{labelMap[key] ?? key}</span>
              <span className="text-xs text-slate-500">{count} ({pct}%)</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${colorMap[key] ?? "bg-slate-400"} transition-all`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetaProgress({ value, target }: { value: number; target: number }) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  const color =
    pct >= 100 ? "bg-green-500" : pct >= 70 ? "bg-blue-500" : pct >= 40 ? "bg-yellow-400" : "bg-red-400";

  return (
    <div className="mt-2">
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-400">Meta: {formatCurrency(target)}</span>
        <span className={`text-xs font-semibold ${pct >= 100 ? "text-green-600" : "text-slate-500"}`}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const data = await getDashboardData();

  const overdueTotal = data.overdueTransactions.reduce(
    (sum, t) => sum + Number(t.amount.toString()),
    0
  );

  // Funil ordenado por estágio
  const STAGE_ORDER = ["new_lead", "initial_screening", "meeting", "proposal_sent", "contract_signed"];
  const stageItems = STAGE_ORDER.map((stage) => ({
    key: stage,
    count: data.leadsByStage.find((s) => s.funnelStage === stage)?._count ?? 0,
  })).filter((s) => s.count > 0);

  // Canais ordenados por volume
  const channelItems = data.leadsByChannel
    .filter((c) => c.originChannel)
    .map((c) => ({ key: c.originChannel as string, count: c._count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        subtitle={`Hoje, ${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}`}
      />

      <div className="flex-1 p-6 space-y-5 overflow-auto">

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-4 gap-4">
          {/* Faturamento mensal */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Faturamento</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.monthlyRevenue)}</p>
            <MetaProgress value={data.monthlyRevenue} target={data.monthlyTarget} />
          </div>

          {/* Meta mensal */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">A Receber · Atrasado</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(overdueTotal)}</p>
            <p className="text-xs text-red-400 mt-1">
              {data.overdueTransactions.length} pagamento(s) em atraso
            </p>
          </div>

          {/* Leads ativos */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Leads Ativos</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{data.activeLeads}</p>
            <p className="text-xs text-slate-400 mt-1">No funil comercial</p>
          </div>

          {/* Clientes */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Clientes Cadastrados</span>
              <UserCheck className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{data.totalClients}</p>
            <p className="text-xs text-slate-400 mt-1">Base ativa</p>
          </div>
        </div>

        {/* ── Gráficos ── */}
        <div className="grid grid-cols-2 gap-4">

          {/* Funil de leads */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Funil de Leads</h2>
              <Link href="/leads" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                Ver funil <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <BarChart
              items={stageItems}
              labelMap={STAGE_LABELS}
              colorMap={STAGE_BAR_COLORS}
              total={data.activeLeads}
            />
            {stageItems.length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">Nenhum lead ativo</p>
            )}
          </div>

          {/* Leads por canal */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Leads por Canal</h2>
              <Target className="w-4 h-4 text-slate-300" />
            </div>
            <BarChart
              items={channelItems}
              labelMap={CHANNEL_LABELS}
              colorMap={CHANNEL_BAR_COLORS}
              total={data.activeLeads}
            />
            {channelItems.length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">Sem dados de canal</p>
            )}
          </div>

        </div>

        {/* ── Alertas + Leads recentes ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Alertas de pagamento */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-sm text-slate-900">Alertas de Pagamento</h2>
              <Link href="/financeiro" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {data.overdueTransactions.length === 0 && data.upcomingTransactions.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-slate-400">Nenhum alerta no momento</p>
              )}
              {data.overdueTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{t.client?.name ?? "—"}</p>
                      <p className="text-xs text-slate-500">Venceu em {formatDate(t.dueDate)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">{formatCurrency(t.amount)}</p>
                    <button className="text-xs text-blue-600 hover:underline">Cobrar via WhatsApp</button>
                  </div>
                </div>
              ))}
              {data.upcomingTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{t.client?.name ?? "—"}</p>
                      <p className="text-xs text-slate-500">Vence em {formatDate(t.dueDate)}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{formatCurrency(t.amount)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Leads recentes */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-sm text-slate-900">Leads Recentes</h2>
              <Link href="/leads" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                Ver funil <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {data.recentLeads.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-slate-400">Nenhum lead ainda</p>
              )}
              {data.recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0 mr-3">
                    <p className="text-sm font-medium text-slate-900 truncate">{lead.name}</p>
                    <p className="text-xs text-slate-500">
                      {lead.legalArea ?? "Área não informada"} · via {lead.originChannel ? CHANNEL_LABELS[lead.originChannel] : "—"}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${STAGE_COLORS[lead.funnelStage]}`}>
                    {STAGE_LABELS[lead.funnelStage] ?? lead.funnelStage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
