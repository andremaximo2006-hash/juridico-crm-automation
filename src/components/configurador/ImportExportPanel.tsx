'use client';

import React, { useState, useRef } from 'react';

interface ImportExportPanelProps {
  config: any;
  onExport: () => void;
  onImport: (data: any) => void;
}

export function ImportExportPanel({
  config,
  onExport,
  onImport,
}: ImportExportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `config-operacional-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const content = await file.text();
      const data = JSON.parse(content);
      onImport(data);
    } catch (error) {
      alert('Erro ao importar arquivo. Certifique-se que é um JSON válido.');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        📤 Importar / Exportar
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleExport}
          className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-4 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800"
        >
          <span className="text-2xl">📥</span>
          <span className="text-sm font-medium text-blue-700 dark:text-blue-200">
            Exportar JSON
          </span>
          <span className="text-xs text-blue-600 dark:text-blue-300">
            Baixar config
          </span>
        </button>

        <button
          onClick={handleImportClick}
          disabled={importing}
          className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-4 hover:bg-green-100 disabled:opacity-50 dark:border-green-700 dark:bg-green-900 dark:hover:bg-green-800"
        >
          <span className="text-2xl">📤</span>
          <span className="text-sm font-medium text-green-700 dark:text-green-200">
            Importar JSON
          </span>
          <span className="text-xs text-green-600 dark:text-green-300">
            {importing ? 'Carregando...' : 'Upload file'}
          </span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelected}
        className="hidden"
      />

      <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900 dark:text-amber-200">
        <strong>💡 Dica:</strong> Use a função de exportar para fazer backup de suas configurações e compartilhá-las com o time
      </div>

      <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
          📋 Configuração Atual (Preview):
        </p>
        <pre className="max-h-40 overflow-y-auto rounded bg-white p-2 text-xs dark:bg-gray-800 dark:text-gray-200">
          {JSON.stringify(
            {
              ...config,
              id: '[omitido]',
              usuarioId: '[omitido]',
            },
            null,
            2
          ).substring(0, 500)}
          ...
        </pre>
      </div>
    </div>
  );
}
