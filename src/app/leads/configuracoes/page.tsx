"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Save, RotateCcw, Plus, X } from "lucide-react";

interface KanbanColumn {
  id: string;
  name: string;
  color: string;
  order: number;
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "novo-lead", name: "Novo Lead", color: "#ffffff", order: 1 },
  { id: "triagem", name: "Triagem Inicial", color: "#3b82f6", order: 2 },
  { id: "reuniao", name: "Reunião / Consulta", color: "#f59e0b", order: 3 },
  { id: "proposta", name: "Proposta Enviada", color: "#ec4899", order: 4 },
];

export default function LeadsConfigPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>(DEFAULT_COLUMNS);
  const [unsaved, setUnsaved] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("leads-kanban-config");
    if (saved) {
      try {
        setColumns(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar configurações", e);
      }
    }
  }, []);

  function handleColumnNameChange(id: string, newName: string) {
    setColumns(prev =>
      prev.map(col => col.id === id ? { ...col, name: newName } : col)
    );
    setUnsaved(true);
  }

  function handleColumnColorChange(id: string, newColor: string) {
    setColumns(prev =>
      prev.map(col => col.id === id ? { ...col, color: newColor } : col)
    );
    setUnsaved(true);
  }

  function handleAddColumn() {
    const newId = `custom-${Date.now()}`;
    const newColumn: KanbanColumn = {
      id: newId,
      name: "Nova Coluna",
      color: "#6366f1",
      order: Math.max(...columns.map(c => c.order)) + 1,
    };
    setColumns([...columns, newColumn]);
    setUnsaved(true);
  }

  function handleDeleteColumn(id: string) {
    if (columns.length <= 2) {
      alert("Você precisa manter pelo menos 2 colunas");
      return;
    }
    setColumns(prev => prev.filter(col => col.id !== id));
    setUnsaved(true);
  }

  function handleSave() {
    localStorage.setItem("leads-kanban-config", JSON.stringify(columns));
    setUnsaved(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    if (confirm("Deseja resetar as configurações para o padrão?")) {
      setColumns(DEFAULT_COLUMNS);
      localStorage.removeItem("leads-kanban-config");
      setUnsaved(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      <Header title="Configurações de Leads" subtitle="Personalize o funil de leads" />

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Colunas do Kanban */}
          <div className="bg-slate-900 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Colunas do Funil</h2>

            <div className="space-y-4">
              {columns.map((column) => (
                <div key={column.id} className="flex items-end gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nome da Coluna
                    </label>
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) => handleColumnNameChange(column.id, e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex-shrink-0">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Cor
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={column.color}
                        onChange={(e) => handleColumnColorChange(column.id, e.target.value)}
                        className="w-12 h-10 rounded-lg border-2 border-slate-600 cursor-pointer"
                      />
                      <code className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded">
                        {column.color}
                      </code>
                    </div>
                  </div>

                  {columns.length > 2 && (
                    <button
                      onClick={() => handleDeleteColumn(column.id)}
                      className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Deletar coluna"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Botão Adicionar Coluna */}
            <button
              onClick={handleAddColumn}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-slate-600 text-slate-400 hover:text-slate-300 hover:border-slate-500 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar Coluna
            </button>
          </div>

          {/* Visualização Prévia */}
          <div className="mt-8 bg-slate-900 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Visualização Prévia</h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {columns.map((column) => (
                <div
                  key={column.id}
                  style={{
                    borderTopColor: column.color,
                  }}
                  className="flex-shrink-0 w-56 bg-slate-800 rounded-lg border-t-4 overflow-hidden"
                >
                  <div
                    style={{
                      backgroundColor: column.color + "20",
                    }}
                    className="px-4 py-3"
                  >
                    <p className="font-semibold text-white text-sm">{column.name}</p>
                    <p className="text-xs text-slate-400">0 leads</p>
                  </div>
                  <div className="p-4 h-32 flex items-center justify-center text-slate-500">
                    <p className="text-xs">Nenhum lead</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="mt-8 flex gap-3 justify-end">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-300 border border-slate-600 hover:border-slate-500 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Resetar Padrão
            </button>
            <button
              onClick={handleSave}
              disabled={!unsaved}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-600 disabled:text-slate-400 transition-colors"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
          </div>

          {/* Mensagem de Sucesso */}
          {saved && (
            <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400 text-sm text-center">
              ✓ Configurações salvas com sucesso!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
