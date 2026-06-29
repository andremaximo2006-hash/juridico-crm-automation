'use client';

import React, { useState } from 'react';
import { PresetConfigurador, PRESETS_PADROES } from '@/types/configurador';

interface PresetsPanelProps {
  onLoadPreset: (config: any) => void;
  onSavePreset: (nome: string, descricao: string) => void;
  presets: PresetConfigurador[];
}

export function PresetsPanel({
  onLoadPreset,
  onSavePreset,
  presets,
}: PresetsPanelProps) {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [novoPresetNome, setNovoPresetNome] = useState('');
  const [novoPresetDesc, setNovoPresetDesc] = useState('');

  const todosPresets = [
    ...Object.entries(PRESETS_PADROES).map(([key, preset]) => ({
      id: key,
      ...preset,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    ...presets,
  ];

  const handleSalvarPreset = () => {
    if (!novoPresetNome.trim()) {
      alert('Nome do preset é obrigatório');
      return;
    }
    onSavePreset(novoPresetNome, novoPresetDesc);
    setNovoPresetNome('');
    setNovoPresetDesc('');
    setShowSaveForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          💾 Presets Salvos
        </h3>
        <button
          onClick={() => setShowSaveForm(!showSaveForm)}
          className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showSaveForm ? '✕' : '+ Novo'}
        </button>
      </div>

      {showSaveForm && (
        <div className="space-y-3 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
          <input
            type="text"
            placeholder="Nome do preset (ex: Meu Tema Escuro)"
            value={novoPresetNome}
            onChange={(e) => setNovoPresetNome(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <textarea
            placeholder="Descrição (opcional)"
            value={novoPresetDesc}
            onChange={(e) => setNovoPresetDesc(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSalvarPreset}
              className="flex-1 rounded bg-green-600 px-3 py-2 font-medium text-white hover:bg-green-700"
            >
              ✅ Salvar
            </button>
            <button
              onClick={() => setShowSaveForm(false)}
              className="flex-1 rounded border border-gray-300 px-3 py-2 font-medium text-gray-700 dark:border-gray-600 dark:text-gray-300"
            >
              ✕ Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {todosPresets.length === 0 ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Nenhum preset salvo
          </p>
        ) : (
          todosPresets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {preset.nome}
                </p>
                {preset.descricao && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {preset.descricao}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  Usado {preset.usosCount} vezes
                </p>
              </div>
              <button
                onClick={() => onLoadPreset(preset.configuracao)}
                className="ml-3 rounded bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Aplicar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
