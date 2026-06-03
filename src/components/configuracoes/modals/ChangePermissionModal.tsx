"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "financeiro" | "padrao";
  isActive: boolean;
}

interface ChangePermissionModalProps {
  user: User;
  onClose: () => void;
  onSubmit: (data: { role: string }) => Promise<void>;
}

const ROLE_LABELS = {
  admin: "Administrador",
  financeiro: "Financeiro",
  padrao: "Padrão",
};

export function ChangePermissionModal({ user, onClose, onSubmit }: ChangePermissionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRole, setNewRole] = useState(user.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newRole === user.role) {
      setError("Selecione uma permissão diferente da atual");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        role: newRole,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alterar permissão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 w-full max-w-md shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Alterar Permissão</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20 flex gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Alterações de permissão entram em vigor imediatamente
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Usuário
            </label>
            <input
              type="text"
              value={user.name}
              disabled
              className="mt-1 w-full rounded border border-slate-300 bg-slate-100 px-3 py-2 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nova Permissão *
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="padrao">Padrão (Leads, Clientes, Operacional, Agenda, IA)</option>
              <option value="financeiro">Financeiro (Financeiro, Configurações)</option>
              <option value="admin">Administrador (Todos os menus)</option>
            </select>
          </div>

          <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-400">
              Permissão Atual: {ROLE_LABELS[user.role]}
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-500 mt-1">
              Nova Permissão: {ROLE_LABELS[newRole as keyof typeof ROLE_LABELS]}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading || newRole === user.role}
              className="flex-1 rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Confirmar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
