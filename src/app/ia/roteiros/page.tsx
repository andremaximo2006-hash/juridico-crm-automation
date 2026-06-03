"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Plus, Edit2, X, Save, RotateCcw } from "lucide-react";

interface Routine {
  id: string;
  legalArea: string;
  name: string;
  systemPrompt: string;
  tools: string[];
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export default function RoteirosPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [editingPrompt, setEditingPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    legalArea: "",
    name: "",
    systemPrompt: "",
  });

  // Buscar roteiros
  useEffect(() => {
    async function fetchRoutines() {
      try {
        const res = await fetch("/api/whatsapp/routines");
        const data = await res.json();
        setRoutines(data.data || []);
      } catch (error) {
        console.error("Erro ao buscar roteiros:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRoutines();
  }, []);

  const handleSelectRoutine = (routine: Routine) => {
    setSelectedRoutine(routine);
    setEditingPrompt(routine.systemPrompt);
  };

  const handleSavePrompt = async () => {
    if (!selectedRoutine) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/whatsapp/routines/${selectedRoutine.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt: editingPrompt }),
      });

      if (res.ok) {
        const updated = await res.json();
        setRoutines(
          routines.map((r) => (r.id === updated.data.id ? updated.data : r))
        );
        setSelectedRoutine(updated.data);
        alert("✓ Roteiro atualizado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("✗ Erro ao salvar roteiro");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRoutine = async () => {
    if (!newRoutine.legalArea || !newRoutine.systemPrompt) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    try {
      const res = await fetch("/api/whatsapp/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoutine),
      });

      if (res.ok) {
        const data = await res.json();
        setRoutines([...routines, data.data]);
        setNewRoutine({ legalArea: "", name: "", systemPrompt: "" });
        setShowNewForm(false);
        alert("✓ Roteiro criado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao criar:", error);
      alert("✗ Erro ao criar roteiro");
    }
  };

  const handleToggleActive = async (routine: Routine) => {
    try {
      const res = await fetch(`/api/whatsapp/routines/${routine.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !routine.active }),
      });

      if (res.ok) {
        const updated = await res.json();
        setRoutines(
          routines.map((r) => (r.id === updated.data.id ? updated.data : r))
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
        <Header title="Roteiros de IA" subtitle="Carregando..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-400">Carregando roteiros...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      <Header title="Roteiros de IA" subtitle="Configure os system prompts por área jurídica" />

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Botão Novo */}
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Roteiro
          </button>

          {/* Formulário Novo */}
          {showNewForm && (
            <div className="mb-6 bg-slate-900 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Criar Novo Roteiro</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Área Jurídica (ex: imobiliario)"
                  value={newRoutine.legalArea}
                  onChange={(e) =>
                    setNewRoutine({ ...newRoutine, legalArea: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Nome do Roteiro"
                  value={newRoutine.name}
                  onChange={(e) =>
                    setNewRoutine({ ...newRoutine, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <textarea
                  placeholder="System Prompt (como a IA deve se comportar)"
                  value={newRoutine.systemPrompt}
                  onChange={(e) =>
                    setNewRoutine({ ...newRoutine, systemPrompt: e.target.value })
                  }
                  rows={5}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowNewForm(false)}
                    className="px-4 py-2 border border-slate-600 text-slate-400 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateRoutine}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Criar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Grid de Roteiros */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Roteiros */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-700">
                <div className="px-6 py-4 border-b border-slate-700">
                  <h2 className="text-lg font-bold text-white">Roteiros</h2>
                </div>
                <div className="divide-y divide-slate-700">
                  {routines.map((routine) => (
                    <button
                      key={routine.id}
                      onClick={() => handleSelectRoutine(routine)}
                      className={`w-full text-left px-6 py-4 transition-colors ${
                        selectedRoutine?.id === routine.id
                          ? "bg-blue-600/20 border-l-4 border-blue-600"
                          : "hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white text-sm">
                            {routine.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {routine.legalArea}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            v{routine.version}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {routine.active ? (
                            <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">
                              Ativo
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs">
                              Inativo
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Editor */}
            {selectedRoutine && (
              <div className="lg:col-span-2">
                <div className="bg-slate-900 rounded-xl shadow-xl border border-slate-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {selectedRoutine.name}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          Área: {selectedRoutine.legalArea} | v{selectedRoutine.version}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleToggleActive(selectedRoutine)
                        }
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          selectedRoutine.active
                            ? "bg-green-900/30 text-green-400 hover:bg-green-900/50"
                            : "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                        }`}
                      >
                        {selectedRoutine.active ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        System Prompt
                      </label>
                      <textarea
                        value={editingPrompt}
                        onChange={(e) => setEditingPrompt(e.target.value)}
                        rows={12}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 font-mono"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Alterado: {new Date(selectedRoutine.updatedAt).toLocaleString("pt-BR")}
                      </p>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-4">
                      <p className="text-xs text-slate-400 mb-2">
                        <strong>ℹ️ Tools disponíveis:</strong>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedRoutine.tools.map((tool) => (
                          <span
                            key={tool}
                            className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                      <button
                        onClick={() => setEditingPrompt(selectedRoutine.systemPrompt)}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-600 text-slate-400 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reverter
                      </button>
                      <button
                        onClick={handleSavePrompt}
                        disabled={isSaving || editingPrompt === selectedRoutine.systemPrompt}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-600 disabled:text-slate-400 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? "Salvando..." : "Salvar"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sem seleção */}
          {!selectedRoutine && !showNewForm && (
            <div className="text-center py-12 text-slate-400">
              <p>Selecione um roteiro para editar ou crie um novo</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
