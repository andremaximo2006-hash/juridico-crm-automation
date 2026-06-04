import { useState } from "react";
import { X, Search } from "lucide-react";
import { AREAS_ATUACAO, RESPONSAVEIS } from "@/types/operacional";
import type { FilterState, AreaAtuacao, Responsavel } from "@/types/operacional";

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const [search, setSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const toggleArea = (area: AreaAtuacao) => {
    const current = filters.areas || [];
    const updated = current.includes(area) ? current.filter((a) => a !== area) : [...current, area];
    onFiltersChange({ ...filters, areas: updated.length > 0 ? updated : undefined });
  };

  const toggleNatureza = () => {
    onFiltersChange({ ...filters, natureza: filters.natureza ? undefined : "LEAD" });
  };

  const toggleUrgente = () => {
    onFiltersChange({ ...filters, prioridade: filters.prioridade === "urgente" ? undefined : "urgente" });
  };

  const togglePresets = (preset: "semRetorno" | "dppProxima") => {
    if (preset === "semRetorno") {
      onFiltersChange({ ...filters, semRetorno: !filters.semRetorno });
    } else {
      onFiltersChange({ ...filters, dppProxima: !filters.dppProxima });
    }
  };

  const clearFilters = () => {
    setSearch("");
    onFiltersChange({});
  };

  const hasFilters = Object.keys(filters).length > 0 || search;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
      {/* Search Bar */}
      <div className="px-4 py-3 flex gap-2">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, processo, benefício, responsável..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Filtros {showAdvanced ? "▼" : "▶"}
        </button>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-red-600 hover:bg-red-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {/* Areas */}
          <div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Áreas</p>
            <div className="flex flex-wrap gap-2">
              {AREAS_ATUACAO.map((area) => (
                <button
                  key={area}
                  onClick={() => toggleArea(area)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    filters.areas?.includes(area)
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Natureza */}
          <div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Natureza</p>
            <div className="flex gap-2">
              {["LEAD", "ORGÂNICO"].map((nat) => (
                <button
                  key={nat}
                  onClick={() => toggleNatureza()}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    filters.natureza === (nat === "ORGÂNICO" ? "ORGANICO" : nat)
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  }`}
                >
                  {nat}
                </button>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Presets</p>
            <div className="flex gap-2">
              <button
                onClick={() => toggleUrgente()}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  filters.prioridade === "urgente"
                    ? "bg-red-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                }`}
              >
                🔴 URGENTE
              </button>
              <button
                onClick={() => togglePresets("semRetorno")}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  filters.semRetorno
                    ? "bg-indigo-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                }`}
              >
                Sem retorno
              </button>
              <button
                onClick={() => togglePresets("dppProxima")}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  filters.dppProxima
                    ? "bg-yellow-500 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                }`}
              >
                DPP próxima
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
