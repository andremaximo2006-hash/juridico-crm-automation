'use client';

import React from 'react';
import Link from 'next/link';
import { ConfiguradorPainel } from '@/components/configurador/ConfiguradorPainel';

export default function ConfiguracoesPag() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header com Navegação */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/operacional"
                className="text-2xl hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-400"
              >
                ←
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                ⚙️ Configurações do Operacional
              </h1>
            </div>
            <a
              href="/operacional"
              className="rounded bg-gray-600 px-4 py-2 font-medium text-white hover:bg-gray-700"
            >
              Voltar ao Kanban
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ConfiguradorPainel />
      </div>
    </div>
  );
}
