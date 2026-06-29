'use client';

import React from 'react';
import { HistoricoConfigurador } from '@/types/configurador';

interface HistoricoPanelProps {
  historicos: HistoricoConfigurador[];
  loading?: boolean;
}

export function HistoricoPanel({
  historicos,
  loading = false,
}: HistoricoPanelProps) {
  const getAcaoEmoji = (acao: string) => {
    const emojis: Record<string, string> = {
      alterou_cores: '🎨',
      renomeou_coluna: '✏️',
      aplicou_preset: '💾',
      exportou: '📤',
      importou: '📥',
      restaurou_padrao: '🔄',
    };
    return emojis[acao] || '📝';
  };

  const getAcaoTexto = (acao: string) => {
    const textos: Record<string, string> = {
      alterou_cores: 'Alterou cores',
      renomeou_coluna: 'Renomeou coluna',
      aplicou_preset: 'Aplicou preset',
      exportou: 'Exportou config',
      importou: 'Importou config',
      restaurou_padrao: 'Restaurou padrão',
    };
    return textos[acao] || 'Modificação';
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        📋 Histórico de Mudanças
      </h3>

      <div className="max-h-96 space-y-2 overflow-y-auto">
        {historicos.length === 0 ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Nenhuma mudança registrada
          </p>
        ) : (
          historicos.map((hist) => (
            <div
              key={hist.id}
              className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getAcaoEmoji(hist.acao)}
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getAcaoTexto(hist.acao)}
                    </p>
                  </div>
                  {hist.descricao && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {hist.descricao}
                    </p>
                  )}
                  {hist.campoAlterado && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                      <strong>{hist.campoAlterado}</strong>: <br />
                      <span className="line-through">
                        {hist.valorAnterior}
                      </span>{' '}
                      → <span className="text-green-600">{hist.valorNovo}</span>
                    </p>
                  )}
                </div>
                <div className="ml-2 text-right">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {new Date(hist.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(hist.createdAt).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
