'use client';

import React from 'react';
import { ConfiguradorOperacional } from '@/types/configurador';

interface PreviewCardProps {
  config: Partial<ConfiguradorOperacional>;
}

export function PreviewCard({ config }: PreviewCardProps) {
  const getSizeClass = () => {
    switch (config.tamanhoCard) {
      case 'small':
        return 'p-2 text-xs';
      case 'large':
        return 'p-6 text-base';
      default:
        return 'p-4 text-sm';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        📱 Preview
      </h3>

      {/* Preview de Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card Exemplo 1 */}
        <div
          className={`rounded-lg border-l-4 bg-white p-4 shadow dark:bg-gray-800 ${getSizeClass()}`}
          style={{ borderColor: config.corPrevidenciario || '#3B82F6' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                Cliente Exemplo
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Previdenciário • BPC/LOAS
              </p>
            </div>
            {config.mostrarAvatar && (
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: config.corPrevidenciario || '#3B82F6' }}
              >
                GN
              </div>
            )}
          </div>
        </div>

        {/* Card Exemplo 2 - Urgente */}
        <div
          className={`rounded-lg border-l-4 bg-white p-4 shadow dark:bg-gray-800 ${getSizeClass()}`}
          style={{ borderColor: config.corUrgente || '#EF4444' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 dark:text-white">
                  Outro Cliente
                </p>
                <span
                  className="rounded px-2 py-0.5 text-xs font-bold text-white"
                  style={{ backgroundColor: config.corUrgente || '#EF4444' }}
                >
                  🔴
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Trabalhista • Rescisão
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview de Colunas */}
      <div className="mt-6 space-y-2">
        <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
          Colunas do Kanban
        </p>
        <div className="flex gap-2">
          {[
            { label: config.labelNovo || 'Novo', cor: config.corNovoColuna },
            { label: config.labelTriagem || 'Triagem', cor: config.corTriagemColuna },
            { label: config.labelAndamento || 'Andamento', cor: config.corAndamentoColuna },
            { label: config.labelConcluido || 'Concluído', cor: config.corConcluidoColuna },
          ].map((col) => (
            <div
              key={col.label}
              className="flex-1 rounded px-3 py-2 text-center text-xs font-semibold text-white"
              style={{ backgroundColor: col.cor || '#6B7280' }}
            >
              {col.label}
            </div>
          ))}
        </div>
      </div>

      {/* Preview de Temas */}
      <div className="mt-6 space-y-2">
        <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
          Tema
        </p>
        <div className="rounded bg-gray-100 p-3 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
          Tema: <strong>{config.tema || 'light'}</strong> | Tamanho: <strong>{config.tamanhoCard || 'medium'}</strong>
        </div>
      </div>
    </div>
  );
}
