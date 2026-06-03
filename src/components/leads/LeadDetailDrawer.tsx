"use client";

import { useEffect, useState } from "react";
import { X, Phone, MessageCircle, Clock, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

interface TimelineEvent {
  id: string;
  eventType: string;
  description: string;
  createdAt: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  cpf: string | null;
  email: string | null;
  profession: string | null;
  estimatedIncome: string | null;
  originChannel: string | null;
  legalArea: string | null;
  caseSummary: string | null;
  funnelStage: string;
  createdAt: string;
}

interface LeadDetailDrawerProps {
  leadId: string;
  onClose: () => void;
}

const STAGE_LABELS: Record<string, string> = {
  new_lead: "Novo Lead",
  initial_screening: "Triagem Inicial",
  meeting: "Reunião / Consulta",
  proposal_sent: "Proposta Enviada",
  contract_signed: "Contrato Assinado",
  lost: "Perdido",
  migrated_to_astrea: "Migrado Astrea",
};

const LEGAL_LABELS: Record<string, string> = {
  familia: "Família",
  trabalhista: "Trabalhista",
  civil: "Cível",
  criminal: "Criminal",
  consumidor: "Consumidor",
  inventario: "Inventário",
  previdenciario: "Previdenciário",
  other: "Outro",
};

const CHANNEL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  google: "Google",
  referral: "Indicação",
  direct: "Direto",
  other: "Outro",
};

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("55") && digits.length >= 12 ? digits.slice(2) : digits;
  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  return digits;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LeadDetailDrawer({ leadId, onClose }: LeadDetailDrawerProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [leadRes, timelineRes] = await Promise.all([
        fetch(`/api/leads/${leadId}`),
        fetch(`/api/leads/${leadId}/timeline`),
      ]);
      if (leadRes.ok) setLead(await leadRes.json());
      if (timelineRes.ok) setTimeline(await timelineRes.json());
      setLoading(false);
    }
    load();
  }, [leadId]);

  const waNumber = lead?.phone.replace(/\D/g, "") ?? "";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Detalhe do Lead</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ) : lead ? (
            <>
              {/* Main info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{lead.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  {STAGE_LABELS[lead.funnelStage] ?? lead.funnelStage}
                </span>
              </div>

              {/* Quick actions */}
              <div className="flex gap-3">
                <a
                  href={`tel:+${waNumber}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium text-slate-700"
                >
                  <Phone className="w-4 h-4" />
                  Ligar
                </a>
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors text-sm font-medium text-green-700"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>

              {/* Details */}
              <div className="bg-slate-50 rounded-xl divide-y divide-slate-100">
                {[
                  { label: "Telefone", value: formatPhone(lead.phone) },
                  { label: "Email", value: lead.email },
                  { label: "CPF", value: lead.cpf },
                  { label: "Profissão", value: lead.profession },
                  {
                    label: "Renda Est.",
                    value: lead.estimatedIncome
                      ? `R$ ${Number(lead.estimatedIncome).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : null,
                  },
                  {
                    label: "Canal",
                    value: lead.originChannel ? CHANNEL_LABELS[lead.originChannel] ?? lead.originChannel : null,
                  },
                  {
                    label: "Área Jurídica",
                    value: lead.legalArea ? LEGAL_LABELS[lead.legalArea] ?? lead.legalArea : null,
                  },
                  { label: "Criado em", value: formatDate(lead.createdAt) },
                ]
                  .filter((r) => r.value)
                  .map((row) => (
                    <div key={row.label} className="flex justify-between px-4 py-2.5 text-sm">
                      <span className="text-slate-500">{row.label}</span>
                      <span className="text-slate-900 font-medium text-right max-w-[60%]">{row.value}</span>
                    </div>
                  ))}
              </div>

              {/* Case summary */}
              {lead.caseSummary && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Resumo do caso</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl px-4 py-3">
                    {lead.caseSummary}
                  </p>
                </div>
              )}

              {/* Timeline */}
              {timeline.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Histórico
                  </p>
                  <div className="space-y-2">
                    {timeline.map((event, idx) => (
                      <div key={event.id} className="flex gap-3 text-sm">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          {idx < timeline.length - 1 && (
                            <div className="w-px flex-1 bg-slate-200 mt-1" />
                          )}
                        </div>
                        <div className="pb-3">
                          <p className="text-slate-700">{event.description}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{formatDate(event.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Lead não encontrado.</p>
          )}
        </div>
      </div>
    </>
  );
}
