"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, MessageCircle, MoreHorizontal } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  legalArea: string | null;
  originChannel: string | null;
  estimatedIncome: string | null;
  funnelStage: string;
  caseSummary: string | null;
  createdAt: Date;
}

interface Column {
  key: string;
  label: string;
  color: string;
  dot: string;
  header: string;
}

const COLUMNS: Column[] = [
  { key: "new_lead",          label: "Novo Lead",          color: "border-t-slate-400",  dot: "bg-slate-400",  header: "bg-slate-50"  },
  { key: "initial_screening", label: "Triagem Inicial",    color: "border-t-blue-400",   dot: "bg-blue-400",   header: "bg-blue-50"   },
  { key: "meeting",           label: "Reunião / Consulta", color: "border-t-yellow-400", dot: "bg-yellow-400", header: "bg-yellow-50" },
  { key: "proposal_sent",     label: "Proposta Enviada",   color: "border-t-orange-400", dot: "bg-orange-400", header: "bg-orange-50" },
  { key: "contract_signed",   label: "Contrato Assinado",  color: "border-t-green-500",  dot: "bg-green-500",  header: "bg-green-50"  },
];

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

const NEXT_STAGE: Record<string, string> = {
  new_lead: "initial_screening",
  initial_screening: "meeting",
  meeting: "proposal_sent",
  proposal_sent: "contract_signed",
};

// Remove emojis and non-printable characters from display names
function cleanName(name: string): string {
  return name
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/[ -⯿]/g, "")
    .replace(/[\u{E000}-\u{F8FF}]/gu, "")
    .replace(/[^\x20-\x7EÀ-ɏḀ-ỿ]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim() || name.trim();
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Remove country code 55 if present and format as BR phone
  const local = digits.startsWith("55") && digits.length >= 12 ? digits.slice(2) : digits;
  if (local.length === 11) return `(${local.slice(0,2)}) ${local.slice(2,7)}-${local.slice(7)}`;
  if (local.length === 10) return `(${local.slice(0,2)}) ${local.slice(2,6)}-${local.slice(6)}`;
  return digits;
}

export function KanbanBoard({ leads, onLeadClick }: { leads: Lead[]; onLeadClick?: (id: string) => void }) {
  const router = useRouter();
  const [movingId, setMovingId] = useState<string | null>(null);

  async function moveToNext(leadId: string, currentStage: string) {
    const nextStage = NEXT_STAGE[currentStage];
    if (!nextStage) return;
    setMovingId(leadId);
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ funnelStage: nextStage }),
    });
    router.refresh();
    setMovingId(null);
  }

  async function markLost(leadId: string) {
    if (!confirm("Marcar este lead como perdido?")) return;
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ funnelStage: "lost" }),
    });
    router.refresh();
  }

  return (
    // Horizontal scroll container
    <div className="overflow-x-auto overflow-y-hidden pb-2">
      <div className="flex gap-4 min-w-max">
        {COLUMNS.map((col) => {
          const columnLeads = leads.filter((l) => l.funnelStage === col.key);
          return (
            <div key={col.key} className="flex flex-col w-64">
              {/* Column header — sticky */}
              <div className={`flex items-center gap-2 mb-3 px-1 py-2 rounded-lg ${col.header}`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${col.dot}`} />
                <span className="text-sm font-semibold text-slate-700 truncate">{col.label}</span>
                <span className="ml-auto text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                  {columnLeads.length}
                </span>
              </div>

              {/* Vertical scroll within each column */}
              <div className="overflow-y-auto max-h-[calc(100vh-220px)] pr-1 space-y-3">
                {columnLeads.map((lead) => {
                  const name = cleanName(lead.name);
                  const phone = formatPhone(lead.phone);
                  const waNumber = lead.phone.replace(/\D/g, "");

                  return (
                    <div
                      key={lead.id}
                      className={`bg-white rounded-xl border border-slate-200 border-t-4 ${col.color} p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                      onClick={() => onLeadClick?.(lead.id)}
                    >
                      {/* Primary info: name + menu */}
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <p className="font-semibold text-sm text-slate-900 leading-tight break-words min-w-0">
                          {name}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); markLost(lead.id); }}
                          className="shrink-0 p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                          title="Marcar como perdido"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Primary info: phone number visible */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 flex-1 truncate">
                          {phone}
                        </span>
                        <a
                          href={`tel:+${waNumber}`}
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                          title="Ligar"
                        >
                          <Phone className="w-3 h-3 text-slate-600" />
                        </a>
                        <a
                          href={`https://wa.me/${waNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 p-1.5 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3 text-green-600" />
                        </a>
                      </div>

                      {/* Secondary info */}
                      {lead.legalArea && (
                        <p className="text-xs text-slate-400 mb-1">
                          {LEGAL_LABELS[lead.legalArea] ?? lead.legalArea}
                        </p>
                      )}
                      {lead.caseSummary && (
                        <p className="text-xs text-slate-400 mb-2 line-clamp-2">{lead.caseSummary}</p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-end pt-1 border-t border-slate-100">
                        {NEXT_STAGE[lead.funnelStage] && (
                          <button
                            onClick={(e) => { e.stopPropagation(); moveToNext(lead.id, lead.funnelStage); }}
                            disabled={movingId === lead.id}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                          >
                            {movingId === lead.id ? "..." : "Avançar →"}
                          </button>
                        )}
                        {lead.funnelStage === "contract_signed" && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await fetch(`/api/leads/${lead.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ funnelStage: "migrated_to_astrea" }),
                              });
                              router.refresh();
                            }}
                            className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                          >
                            Migrar Astrea →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {columnLeads.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                    <p className="text-xs text-slate-400">Nenhum lead aqui</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
