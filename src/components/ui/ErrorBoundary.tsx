"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <h2 className="text-base font-semibold text-gray-900 mb-1">Algo deu errado</h2>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Ocorreu um erro inesperado ao carregar esta página. Tente novamente ou entre em contato com o suporte.
      </p>
      {error.digest && (
        <p className="text-xs text-gray-300 mb-4 font-mono">ref: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Tentar novamente
      </button>
    </div>
  );
}
