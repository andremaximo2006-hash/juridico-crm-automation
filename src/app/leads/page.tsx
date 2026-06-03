"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { KanbanBoard } from "@/components/leads/KanbanBoard";
import { NewLeadModal } from "@/components/leads/NewLeadModal";
import { LeadDetailDrawer } from "@/components/leads/LeadDetailDrawer";
import { KanbanSkeleton } from "@/components/ui/Skeleton";
import { Plus } from "lucide-react";
import { KeyboardShortcuts } from "@/components/ui/KeyboardShortcuts";

export default function LeadsPage() {
  const [showModal, setShowModal] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  async function loadLeads() {
    setLoading(true);
    const res = await fetch("/api/leads?limit=200");
    const json = await res.json();
    setLeads(json.data ?? json);
    setLoading(false);
  }

  useEffect(() => {
    loadLeads();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <KeyboardShortcuts onNewItem={() => setShowModal(true)} />
      <Header
        title="Funil de Leads"
        subtitle="Gerencie seus prospects e acompanhe o funil comercial"
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Lead
          </button>
        }
      />

      <div className="flex-1 p-6 overflow-auto min-h-0">
        {loading ? (
          <KanbanSkeleton />
        ) : (
          <KanbanBoard leads={leads} onLeadClick={setSelectedLeadId} />
        )}
      </div>

      {showModal && (
        <NewLeadModal
          onClose={() => {
            setShowModal(false);
            loadLeads();
          }}
        />
      )}

      {selectedLeadId && (
        <LeadDetailDrawer
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
        />
      )}
    </div>
  );
}
