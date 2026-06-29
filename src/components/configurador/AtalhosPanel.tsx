'use client';

import React, { useState } from 'react';
import { TeclaPersonalizada, ATALHOS_PADRAO } from '@/types/configurador';

interface AtalhosPanelProps {
  atalhos: TeclaPersonalizada[];
  onSaveAtalho: (acao: string, teclaCombo: string) => void;
}

export function AtalhosPanel({
  atalhos,
  onSaveAtalho,
}: AtalhosPanelProps) {
  const [editandoAcao, setEditandoAcao] = useState<string | null>(null);
  const [novoCombo, setNovoCombo] = useState('');

  const descricoes: Record<string, string> = {
    salvar_config: 'Salvar configurações',
    exportar: 'Exportar como JSON',
    importar: 'Importar de JSON',
    restaurar_padrao: 'Restaurar padrão',
    abrir_filtros: 'Abrir filtros',
    nova_ficha: 'Criar nova ficha',
    busca: 'Abrir busca rápida',
  };

  const todosAtalhos = Object.entries(ATALHOS_PADRAO).map(([acao, combo]) => {
    const customizado = atalhos.find((a) => a.acao === acao);
    return {
      acao,
      combo: customizado?.teclaCombo || combo,
      descricao: descricoes[acao] || acao,
      ativo: customizado?.ativo !== false,
    };
  });

  const handleSalvar = () => {
    if (editandoAcao && novoCombo.trim()) {
      onSaveAtalho(editandoAcao, novoCombo);
      setEditandoAcao(null);
      setNovoCombo('');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        ⌨️ Atalhos de Teclado
      </h3>

      <div className="space-y-2">
        {todosAtalhos.map((atalho) => (
          <div
            key={atalho.acao}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {atalho.descricao}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {atalho.acao}
              </p>
            </div>

            {editandoAcao === atalho.acao ? (
              <div className="ml-3 flex items-center gap-2">
                <input
                  type="text"
                  value={novoCombo}
                  onChange={(e) => setNovoCombo(e.target.value)}
                  placeholder="Ex: Ctrl+S"
                  className="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                <button
                  onClick={handleSalvar}
                  className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
                >
                  ✅
                </button>
                <button
                  onClick={() => setEditandoAcao(null)}
                  className="rounded bg-gray-400 px-2 py-1 text-xs font-medium text-white hover:bg-gray-500"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="ml-3 flex items-center gap-2">
                <code className="rounded bg-gray-100 px-2 py-1 text-sm font-mono text-gray-900 dark:bg-gray-700 dark:text-gray-100">
                  {atalho.combo}
                </code>
                <button
                  onClick={() => {
                    setEditandoAcao(atalho.acao);
                    setNovoCombo(atalho.combo);
                  }}
                  className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Editar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-200">
        <strong>💡 Dica:</strong> Use formatos como Ctrl+S, Cmd+E, Alt+Shift+X
      </div>
    </div>
  );
}
