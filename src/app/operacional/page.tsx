"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatsBar } from "@/components/operacional/StatsBar";
import { FilterBar } from "@/components/operacional/FilterBar";
import { KanbanBoard } from "@/components/operacional/KanbanBoard";
import { FichaModal } from "@/components/operacional/FichaModal";
import type { FichaCard, FichaFormData, FilterState, KanbanColuna } from "@/types/operacional";

export default function OperacionalPage() {
  const [fichas, setFichas] = useState<FichaCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({});
  const [selectedFicha, setSelectedFicha] = useState<FichaCard | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statsRefresh, setStatsRefresh] = useState(0);

  // Fetch fichas
  const fetchFichas = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.areas?.length) params.append("area", filters.areas[0]);
      if (filters.natureza) params.append("natureza", filters.natureza);
      if (filters.prioridade) params.append("prioridade", filters.prioridade);
      if (filters.responsavel) params.append("responsavel", filters.responsavel);
      if (filters.semRetorno) params.append("semRetorno", "true");
      if (filters.dppProxima) params.append("dppProxima", "true");

      const res = await fetch(`/api/operacional?limit=500&${params.toString()}`);
      const json = await res.json();
      setFichas(json.data || []);
      setStatsRefresh((r) => r + 1);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFichas();
  }, [fetchFichas]);

  // Handle ficha move between columns
  const handleMove = async (id: string, novaColuna: KanbanColuna) => {
    try {
      const res = await fetch(`/api/operacional/${id}/coluna`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coluna: novaColuna }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Erro: ${error.error}`);
        return;
      }

      // Refresh fichas
      fetchFichas();
    } catch (err) {
      alert("Erro ao mover ficha");
    }
  };

  // Handle ficha save (create or update)
  const handleSave = async (data: FichaFormData) => {
    try {
      const url = selectedFicha ? `/api/operacional/${selectedFicha.id}` : "/api/operacional";
      const method = selectedFicha ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao salvar");
      }

      setSelectedFicha(null);
      setShowCreateModal(false);
      fetchFichas();
    } catch (err: any) {
      throw new Error(err.message || "Erro ao salvar ficha");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header title="Operacional" subtitle="Kanban de fichas e procedimentos jurídicos" />

      {/* Stats Bar */}
      <StatsBar refreshTrigger={statsRefresh} />

      {/* Filter Bar */}
      <FilterBar filters={filters} onFiltersChange={setFilters} />

      {/* Action Bar */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex gap-2">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={18} />
          Nova Ficha
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
        ) : (
          <KanbanBoard
            fichas={fichas}
            onMove={handleMove}
            onEdit={setSelectedFicha}
            loading={loading}
          />
        )}
      </div>

      {/* Modals */}
      {selectedFicha && (
        <FichaModal ficha={selectedFicha} onSave={handleSave} onClose={() => setSelectedFicha(null)} />
      )}

      {showCreateModal && <FichaModal ficha={null} onSave={handleSave} onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
